var e={id:`routing-refresher`,h:{en:`Routing refresher for SD-WAN engineers`,hi:`SD-WAN engineers ke liye routing refresher`},body:{en:`
<p>Think of a router as a taxi dispatcher with a notebook. For every destination the notebook says "send it that way". The notebook is the <b>routing table</b>. Everything in this module is about getting the right lines into the right notebooks. Before the SD-WAN specifics, let us refresh the rules every router follows, on Versa as on any vendor.</p>

<h3>Where routes come from</h3>
<dl class="terms">
<dt>Connected route</dt><dd>Created automatically when an interface is up and has an address. Interface vni-0/3 with 10.1.2.1/24 creates the connected route 10.1.2.0/24. No address or interface down means no route. This is exactly why vs-lan-advertise fails when vni-0/3 is unconfigured.</dd>
<dt>Static route</dt><dd>Typed by an engineer: prefix plus next hop. Simple and predictable, but it never reacts to failures by itself.</dd>
<dt>Dynamic route</dt><dd>Learned from a routing protocol such as OSPF or BGP. It adapts when the network changes, at the cost of more moving parts.</dd>
</dl>

<h3>Longest-prefix match</h3>
<p>When a packet arrives, the router finds <b>all</b> routes that contain the destination and picks the one with the <b>longest mask</b>, the most specific. A /24 beats a /16, and a /16 beats the default route 0.0.0.0/0. Mask length is checked before anything else.</p>
<div class="eg"><p><b>Worked example.</b> The Branch1 transport VRs hold 0.0.0.0/0 via 203.0.113.5 (Internet) and, in the MPLS VR, 172.31.0.0/16 via 172.31.1.1. Destination 172.31.100.2 (Controller MPLS address) matches only the /16 in the MPLS VR. Destination 198.51.100.20 matches the default route in the Internet VR. Different VRs, different tables, and each lookup uses the longest match inside its own table.</p></div>

<h3>Administrative distance: choosing between sources</h3>
<p>If two <b>different sources</b> offer the <b>same prefix</b>, the router trusts the source with the lower <b>administrative distance</b> (AD). Typical Cisco-style values: connected 0, static 1, eBGP 20, OSPF 110, iBGP 200. Versa uses a similar idea, usually called route <b>preference</b>, and exact defaults differ per protocol and release, so check the documentation of your version. The ordering is the part to remember: mask length first, then source trust, then protocol metric.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Route selection order">
<rect x="20" y="40" width="170" height="70" rx="8" fill="#bae6fd"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="14">1. Longest prefix</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">/24 beats /16</text>
<rect x="235" y="40" width="170" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="14">2. Lowest AD</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">static beats OSPF</text>
<rect x="450" y="40" width="170" height="70" rx="8" fill="#fde68a"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="14">3. Lowest metric</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">inside one protocol</text>
<line x1="190" y1="75" x2="235" y2="75" stroke="#64748b" stroke-width="2"/><line x1="405" y1="75" x2="450" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Same order on every router, in every VRF</text>
</svg><p class="cap">The route selection order you apply before reading any table.</p></div>

<h3>Next hop and recursive lookup</h3>
<p>A route is only useful if its <b>next hop is reachable</b>. The router must find a connected or other route that covers the next-hop address, and it must resolve the Layer 2 address (ARP). A static route pointing at an address nobody owns installs, but packets die. Remember this for vs-mpls-route.</p>
<p>The same logic exists inside the SD-WAN. An overlay route learned through MP-BGP names a remote site, and the packet then needs a working tunnel to that site. If the tunnel is gone, the route is useless even though it is in the table.</p>

<h3>Reading a route table</h3>
<pre class="out">admin@Branch1-cli&gt; show route routing-instance MPLS-Transport-VR
Codes: C - connected, S - static
<span class="hl">S    172.31.0.0/16  via 172.31.1.1</span>
C    172.31.1.0/30  is directly connected, vni-0/1</pre>
<p>The output above is illustrative. The real VOS table has more columns (instance, protocol, preference, age) but the same ideas. The static /16 covers every MPLS address, including the Controller MPLS address 172.31.100.2, and the connected /30 lets the branch reach the PE at 172.31.1.1.</p>

<h3>Why this matters in SD-WAN</h3>
<p>An SD-WAN branch runs several routing tables at the same time (one per VR). The most common faults are not exotic: a missing connected route, a wrong next hop, a missing prefix, or a lookup in the wrong table. A calm engineer asks the three questions in order: <b>Is there a route? Is it the best route? Can the next hop be reached?</b></p>

<div class="warn"><p><b>Common mistake.</b> Comparing administrative distance between different prefixes. AD only breaks ties for the <b>same prefix</b>. A /24 OSPF route beats a /16 static route because the mask length wins first.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which route is used for 10.1.2.50: 10.1.0.0/16 static (AD 1) or 10.1.2.0/24 OSPF (AD 110)?" Answer: the /24, because longest prefix match comes before AD.</p></div>

<div class="scn"><h4>The route that existed but did not work</h4><p>A branch engineer added a static route for the provider network. It showed in the table, yet the circuit stayed unusable. The next hop was typed with a typo, one subnet away from the PE. The route installed, but ARP never resolved and packets were dropped. Changing the next hop to the PE address fixed it.</p><p><b>Lesson:</b> "route is in the table" and "next hop is reachable" are two separate checks.</p></div>
<div class="iv"><p class="q">"How does a router choose between two routes to the same destination?"</p><p>Longest prefix match first, then lowest administrative distance among different sources, then lowest metric within the same protocol. Add that equal-cost paths can be load shared, and that in SD-WAN the next hop must also be resolvable in the right VR.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connected routes need an up interface with an address; static routes are manual; dynamic routes are learned.</li>
<li>Longest prefix wins before administrative distance is looked at.</li>
<li>AD only compares sources for the same prefix.</li>
<li>A route is useful only if the next hop is reachable.</li>
<li>Ask: is there a route, is it best, is the next hop reachable?</li>
</ul></div>
`,hi:`
<p>Router ko ek taxi dispatcher ki tarah socho jiske paas ek notebook hai. Har destination ke liye notebook kehti hai "us taraf bhejo". Yeh notebook <b>routing table</b> hai. Is module ka sab kuch sahi lines ko sahi notebooks mein pahunchane ke baare mein hai. SD-WAN specifics se pehle woh rules refresh karte hain jo har router follow karta hai, Versa par bhi aur kisi bhi vendor par bhi.</p>

<h3>Routes kahan se aate hain</h3>
<dl class="terms">
<dt>Connected route</dt><dd>Jab interface up ho aur uska address ho tab automatic ban jaata hai. vni-0/3 par 10.1.2.1/24 se connected route 10.1.2.0/24 banta hai. Address nahi ya interface down to route nahi. Yahi wajah hai ki vni-0/3 unconfigured ho to vs-lan-advertise fail hota hai.</dd>
<dt>Static route</dt><dd>Engineer type karta hai: prefix plus next hop. Simple aur predictable, par failure par khud react nahi karta.</dd>
<dt>Dynamic route</dt><dd>OSPF ya BGP jaise routing protocol se seekha hua. Network badalne par adapt karta hai, lekin zyada moving parts ke saath.</dd>
</dl>

<h3>Longest-prefix match</h3>
<p>Packet aane par router woh <b>saare</b> routes dhundta hai jinme destination aata hai aur sabse <b>lamba mask</b> wala, yaani sabse specific, chunta hai. /24 /16 ko harata hai, aur /16 default route 0.0.0.0/0 ko. Mask length sabse pehle dekhi jaati hai.</p>
<div class="eg"><p><b>Worked example.</b> Branch1 ke transport VRs mein 0.0.0.0/0 via 203.0.113.5 (Internet) hai aur MPLS VR mein 172.31.0.0/16 via 172.31.1.1. Destination 172.31.100.2 (Controller MPLS address) sirf MPLS VR ke /16 se match hota hai. Destination 198.51.100.20 Internet VR ki default route se match hota hai. Alag VRs, alag tables, aur har lookup apni table ke andar longest match use karta hai.</p></div>

<h3>Administrative distance: sources ke beech chunav</h3>
<p>Agar do <b>alag sources</b> <b>same prefix</b> offer karein, to router us source par bharosa karta hai jiski <b>administrative distance</b> (AD) kam ho. Cisco-style typical values: connected 0, static 1, eBGP 20, OSPF 110, iBGP 200. Versa mein aisa hi idea hota hai, jise aam taur par route <b>preference</b> kehte hain, aur exact defaults protocol aur release ke hisaab se alag hote hain, isliye apne version ka documentation dekho. Yaad rakhne wala order: pehle mask length, phir source trust, phir protocol metric.</p>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Route selection order">
<rect x="20" y="40" width="170" height="70" rx="8" fill="#bae6fd"/><text x="105" y="68" text-anchor="middle" class="svg-ink" font-size="14">1. Longest prefix</text><text x="105" y="90" text-anchor="middle" class="svg-muted" font-size="12">/24 /16 ko harata hai</text>
<rect x="235" y="40" width="170" height="70" rx="8" fill="#bbf7d0"/><text x="320" y="68" text-anchor="middle" class="svg-ink" font-size="14">2. Lowest AD</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="12">static OSPF ko harata hai</text>
<rect x="450" y="40" width="170" height="70" rx="8" fill="#fde68a"/><text x="535" y="68" text-anchor="middle" class="svg-ink" font-size="14">3. Lowest metric</text><text x="535" y="90" text-anchor="middle" class="svg-muted" font-size="12">ek protocol ke andar</text>
<line x1="190" y1="75" x2="235" y2="75" stroke="#64748b" stroke-width="2"/><line x1="405" y1="75" x2="450" y2="75" stroke="#64748b" stroke-width="2"/>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Har router, har VRF mein same order</text>
</svg><p class="cap">Route selection order jo aap kisi bhi table ko padhne se pehle apply karte ho.</p></div>

<h3>Next hop aur recursive lookup</h3>
<p>Route tabhi useful hai jab uska <b>next hop reachable</b> ho. Router ko aisa connected ya doosra route milna chahiye jo next-hop address ko cover kare, aur Layer 2 address (ARP) resolve hona chahiye. Jo static route aise address ki taraf point kare jiska koi owner nahi, woh install ho jaata hai par packets mar jaate hain. vs-mpls-route ke liye yaad rakho.</p>
<p>Yahi logic SD-WAN ke andar bhi hai. MP-BGP se seekha overlay route ek remote site ka naam leta hai, aur packet ko us site tak working tunnel chahiye. Tunnel gaya to route table mein hote hue bhi bekaar hai.</p>

<h3>Route table padhna</h3>
<pre class="out">admin@Branch1-cli&gt; show route routing-instance MPLS-Transport-VR
Codes: C - connected, S - static
<span class="hl">S    172.31.0.0/16  via 172.31.1.1</span>
C    172.31.1.0/30  is directly connected, vni-0/1</pre>
<p>Upar ka output illustrative hai. Real VOS table mein zyada columns (instance, protocol, preference, age) hote hain, par ideas wahi hain. Static /16 har MPLS address ko cover karta hai, Controller MPLS address 172.31.100.2 bhi, aur connected /30 branch ko PE 172.31.1.1 tak pahunchne deta hai.</p>

<h3>SD-WAN mein yeh kyun zaroori hai</h3>
<p>SD-WAN branch kai routing tables ek saath chalata hai (har VR ke liye ek). Sabse common faults exotic nahi hote: connected route missing, galat next hop, prefix missing, ya galat table mein lookup. Shaant engineer teen sawaal order mein puchta hai: <b>Route hai? Kya woh best route hai? Kya next hop reachable hai?</b></p>

<div class="warn"><p><b>Common galti.</b> Alag prefixes ke beech administrative distance compare karna. AD sirf <b>same prefix</b> ke tie ko todti hai. /24 OSPF route /16 static route ko harata hai kyunki mask length pehle jeetti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "10.1.2.50 ke liye kaunsa route use hoga: 10.1.0.0/16 static (AD 1) ya 10.1.2.0/24 OSPF (AD 110)?" Jawab: /24, kyunki longest prefix match AD se pehle aata hai.</p></div>

<div class="scn"><h4>Route jo thi par chali nahi</h4><p>Ek branch engineer ne provider network ke liye static route add kiya. Table mein dikha, phir bhi circuit use nahi hua. Next hop typo se PE se ek subnet door tha. Route install hui par ARP resolve nahi hua aur packets drop hue. Next hop ko PE address karne se fix hua.</p><p><b>Seekh:</b> "route table mein hai" aur "next hop reachable hai" do alag checks hain.</p></div>
<div class="iv"><p class="q">"Router same destination ke do routes mein se kaise chunta hai?"</p><p>Pehle longest prefix match, phir alag sources ke beech lowest administrative distance, phir ek hi protocol ke andar lowest metric. Jodo ki equal-cost paths load share ho sakte hain, aur SD-WAN mein next hop sahi VR mein resolve bhi hona chahiye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Connected routes ke liye address wala up interface chahiye; static manual hai; dynamic seekha jaata hai.</li>
<li>Longest prefix administrative distance se pehle jeet-ta hai.</li>
<li>AD sirf same prefix ke sources compare karti hai.</li>
<li>Route tabhi useful hai jab next hop reachable ho.</li>
<li>Poochho: route hai, best hai, next hop reachable hai?</li>
</ul></div>
`}};export{e as default};