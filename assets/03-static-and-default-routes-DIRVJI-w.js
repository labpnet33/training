var e={id:`routing`,h:{en:`Routing: static routes and the default route`,hi:`Routing: static routes aur default route`},body:{en:`
<p>Interfaces tell the engine which networks are directly connected. Everything else needs a <b>route</b>. In this chapter you will build the routing table of the Pune branch: a default route to the ISP, a static route to a remote office, and a picture of what happens with two ISPs.</p>

<h3>Analogy: signboards at the gatehouse</h3>
<p>The guard at the Pune gatehouse knows every lane inside the compound, because the gatehouse has a door to each of them. For anything outside, the guard needs signboards: "for the Mumbai office, give the packet to the courier at door 2", "for everything else, give it to the ISP at door 1". The signboards are <b>routes</b>. The last signboard, the one that says "everything else", is the <b>default route</b>.</p>

<h3>What a route contains</h3>
<p>A static route has three parts: the <b>destination network</b> (an address and a prefix length), the <b>gateway</b> (the next router, called the next hop), and the <b>interface</b> that reaches the gateway. In the SMC you add the route on the interface or network that leads to the gateway. The default route is the destination 0.0.0.0/0, which matches every address, and it loses against any more specific route. This is the <b>longest prefix match</b> rule: the route with the longest matching prefix wins.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Routing table of the Pune engine">
<rect x="20" y="20" width="270" height="200" rx="10" fill="#e2e8f0" stroke="#64748b"/>
<text x="155" y="44" text-anchor="middle" class="svg-ink" font-size="14">Routing table NK-PUNE-FW</text>
<text x="34" y="74" class="svg-ink" font-size="12">10.1.1.0/24   via eth2 (connected)</text>
<text x="34" y="98" class="svg-ink" font-size="12">172.16.20.0/24 via eth3 (connected)</text>
<text x="34" y="122" class="svg-ink" font-size="12">203.0.113.0/30 via eth1 (connected)</text>
<text x="34" y="150" class="svg-accent" font-size="12">198.51.100.0/30 gw 203.0.113.1</text>
<text x="34" y="190" class="svg-accent" font-size="12">0.0.0.0/0  gw 203.0.113.1 (default)</text>
<rect x="400" y="30" width="220" height="60" rx="10" fill="#fed7aa"/><text x="510" y="56" text-anchor="middle" class="svg-ink" font-size="14">ISP router</text><text x="510" y="76" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<rect x="400" y="140" width="220" height="60" rx="10" fill="#bbf7d0"/><text x="510" y="166" text-anchor="middle" class="svg-ink" font-size="14">Internet / HQ side</text><text x="510" y="186" text-anchor="middle" class="svg-muted" font-size="12">other networks</text>
<line x1="290" y1="150" x2="400" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="190" x2="400" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="90" x2="510" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Connected networks come from the interfaces. Static routes and the default route use the ISP gateway, which sits on the WAN network.</p></div>

<h3>The rule that validation enforces</h3>
<p>A route gateway must be reachable directly, so <b>the gateway address must lie inside one of the engine interface networks</b>. For eth1 203.0.113.2/30 the network is 203.0.113.0/30, usable hosts .1 and .2. So the gateway 203.0.113.1 is valid, but 203.0.113.9 is not. If you save a route with a gateway outside every interface network, the Install step reports a validation error and nothing is installed. The failed install changes nothing; the old routing stays in use.</p>

<div class="eg"><p><b>Worked example.</b> MyPnetLab Pune needs to reach HQ's network 198.51.100.0/30, which is a transit network behind the ISP, and everything else on the internet. Engine eth1 is 203.0.113.2/30, gateway 203.0.113.1. Routes: (1) destination 0.0.0.0/0, gateway 203.0.113.1; (2) an optional specific route for HQ, destination 198.51.100.0/30, gateway 203.0.113.1. A packet to 198.51.100.2 matches both routes. The /30 is longer than /0, so route (2) wins, though both use the same gateway here. A packet to 8.8.8.8 matches only the default route.</p></div>

<h3>Two ISPs: the concept</h3>
<p>Many branches buy two internet circuits for resilience. Suppose a second link arrives on another interface, for example 192.0.2.2/30 with ISP B gateway 192.0.2.1 (documentation addresses used as an example). Now you could write two default routes, one per gateway. A plain routing table cannot decide in a smart way between two equal default routes. It does not know that ISP A is broken. In this module you only learn the routing side: two gateways, two routes, which one is chosen, and why you must stay careful about asymmetric paths. <b>Multi-Link</b>, which probes links and fails over, is a later module (VPN and SD-WAN). Do not rely on plain routes for automatic failover.</p>

<table class="cmp"><tr><th>Question</th><th>Answer in this module</th></tr>
<tr><td>Where is the route configured?</td><td>In the engine element in the SMC, in the routing of the interface that reaches the gateway</td></tr>
<tr><td>Does the route work immediately?</td><td>No. It takes effect only after Install policy</td></tr>
<tr><td>Can the gateway be anywhere?</td><td>No. It must be inside an interface network of the engine</td></tr>
<tr><td>Which route wins?</td><td>The longest prefix match</td></tr></table>

<h3>Verify</h3>
<pre class="code">ip route
ping 203.0.113.1</pre>
<pre class="out">198.51.100.0/30 via 203.0.113.1 dev eth1
203.0.113.0/30 dev eth1 proto kernel scope link src 203.0.113.2
10.1.1.0/24 dev eth2 proto kernel scope link src 10.1.1.1
172.16.20.0/24 dev eth3 proto kernel scope link src 172.16.20.1
<span class="hl">default via 203.0.113.1 dev eth1</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Gateway typed from the wrong subnet. A typo in the prefix length of a destination. A default route installed on the wrong interface. Forgetting that the remote side also needs a route back to your networks. Assuming two default routes give automatic failover.</p></div>
<div class="exam"><p><b>Exam trap.</b> Validation compares the gateway with the interface networks of the engine configuration being installed. If you removed or renumbered an interface in the same change, a route that was fine yesterday can now make the install fail. Another trap: a ping to an internet address that fails does not always mean the route is missing; the policy may discard it, so check Logs.</p></div>

<div class="scn"><h4>The route that blocked the install</h4><p>A network engineer renumbered the WAN link of a branch from 203.0.113.2/30 to 203.0.113.6/30 but left the default route gateway 203.0.113.1 in place. Install policy refused with a validation error: the gateway is not inside any interface network. The engineer changed the gateway to 203.0.113.5, installed again and the branch could reach the internet.</p><p><b>Lesson:</b> when you renumber an interface, review the routes that depend on it in the same change.</p></div>

<div class="iv"><p class="q">"A packet matches two routes. Which one does the firewall use?"</p><p>The most specific one, which means the longest prefix length. The default route 0.0.0.0/0 is the least specific and is used only when nothing else matches. Mention that a route lookup is separate from the access rules: the packet must also be allowed by policy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interfaces create connected routes. Static routes reach everything else.</li>
<li>The default route is 0.0.0.0/0 and is the last resort.</li>
<li>A gateway must be inside an interface network or validation blocks the install.</li>
<li>Longest prefix match decides between several routes.</li>
<li>Two default routes are not smart failover; Multi-Link comes later. Routes apply after Install policy.</li>
</ul></div>
`,hi:`
<p>Interfaces engine ko batate hain ki kaunse networks directly connected hain. Baaki sab ke liye <b>route</b> chahiye. Is chapter mein aap Pune branch ki routing table banaoge: ISP tak default route, remote office tak static route, aur do ISPs ho to kya hota hai uski picture.</p>

<h3>Analogy: gatehouse par signboards</h3>
<p>Pune gatehouse ka guard compound ki har lane jaanta hai, kyunki gatehouse ka har lane ki taraf darwaza hai. Bahar ki cheezon ke liye guard ko signboards chahiye: "Mumbai office ke liye packet darwaza 2 ke courier ko do", "baaki sab ke liye ISP ko do jo darwaza 1 par hai". Yeh signboards <b>routes</b> hain. Aakhri signboard, jo kehta hai "baaki sab", <b>default route</b> hai.</p>

<h3>Route mein kya hota hai</h3>
<p>Static route ke teen parts hote hain: <b>destination network</b> (address aur prefix length), <b>gateway</b> (agla router, jise next hop kehte hain), aur woh <b>interface</b> jo gateway tak pahunchta hai. SMC mein aap route us interface ya network par jodte ho jo gateway tak le jata hai. Default route destination 0.0.0.0/0 hai, jo har address se match hota hai, aur kisi bhi zyada specific route ke saamne haar jata hai. Isse <b>longest prefix match</b> kehte hain: jis route ka matching prefix sabse lamba ho, wahi jeetta hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Pune engine ki routing table">
<rect x="20" y="20" width="270" height="200" rx="10" fill="#e2e8f0" stroke="#64748b"/>
<text x="155" y="44" text-anchor="middle" class="svg-ink" font-size="14">Routing table NK-PUNE-FW</text>
<text x="34" y="74" class="svg-ink" font-size="12">10.1.1.0/24   via eth2 (connected)</text>
<text x="34" y="98" class="svg-ink" font-size="12">172.16.20.0/24 via eth3 (connected)</text>
<text x="34" y="122" class="svg-ink" font-size="12">203.0.113.0/30 via eth1 (connected)</text>
<text x="34" y="150" class="svg-accent" font-size="12">198.51.100.0/30 gw 203.0.113.1</text>
<text x="34" y="190" class="svg-accent" font-size="12">0.0.0.0/0  gw 203.0.113.1 (default)</text>
<rect x="400" y="30" width="220" height="60" rx="10" fill="#fed7aa"/><text x="510" y="56" text-anchor="middle" class="svg-ink" font-size="14">ISP router</text><text x="510" y="76" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.1</text>
<rect x="400" y="140" width="220" height="60" rx="10" fill="#bbf7d0"/><text x="510" y="166" text-anchor="middle" class="svg-ink" font-size="14">Internet / HQ side</text><text x="510" y="186" text-anchor="middle" class="svg-muted" font-size="12">baaki networks</text>
<line x1="290" y1="150" x2="400" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="290" y1="190" x2="400" y2="62" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="90" x2="510" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Connected networks interfaces se aate hain. Static routes aur default route ISP gateway use karte hain, jo WAN network par hai.</p></div>

<h3>Woh rule jo validation enforce karti hai</h3>
<p>Route gateway directly reachable hona chahiye, isliye <b>gateway address engine ke kisi interface network ke andar hona chahiye</b>. eth1 203.0.113.2/30 ke liye network 203.0.113.0/30 hai, usable hosts .1 aur .2. To gateway 203.0.113.1 valid hai, lekin 203.0.113.9 nahi. Agar aap aisa route save karte ho jiska gateway kisi interface network ke bahar hai, to Install step validation error deta hai aur kuch install nahi hota. Failed install kuch nahi badalta; purani routing chalti rehti hai.</p>

<div class="eg"><p><b>Worked example.</b> MyPnetLab Pune ko HQ ka network 198.51.100.0/30 chahiye, jo ISP ke peeche ek transit network hai, aur baaki poora internet. Engine eth1 203.0.113.2/30 hai, gateway 203.0.113.1. Routes: (1) destination 0.0.0.0/0, gateway 203.0.113.1; (2) optional specific route HQ ke liye, destination 198.51.100.0/30, gateway 203.0.113.1. 198.51.100.2 ka packet dono routes se match karta hai. /30, /0 se lamba hai, isliye route (2) jeetta hai, halanki yahan dono ka gateway same hai. 8.8.8.8 ka packet sirf default route se match karta hai.</p></div>

<h3>Do ISPs: concept</h3>
<p>Kai branches resilience ke liye do internet circuits lete hain. Maan lo doosra link kisi aur interface par aata hai, jaise 192.0.2.2/30, ISP B gateway 192.0.2.1 (example ke liye documentation addresses). Ab aap har gateway ke liye ek default route, yaani do default routes likh sakte ho. Plain routing table do barabar default routes ke beech smart faisla nahi kar sakti. Use pata nahi hota ki ISP A toota hua hai. Is module mein aap sirf routing side seekhte ho: do gateways, do routes, kaunsa chuna jata hai, aur asymmetric paths se kyun savdhan rehna hai. <b>Multi-Link</b>, jo links ko probe karta hai aur failover karta hai, baad ka module hai (VPN aur SD-WAN). Automatic failover ke liye plain routes par bharosa mat karo.</p>

<table class="cmp"><tr><th>Sawal</th><th>Is module mein jawab</th></tr>
<tr><td>Route kahan configure hota hai?</td><td>SMC mein engine element mein, us interface ki routing mein jo gateway tak pahunchta hai</td></tr>
<tr><td>Kya route turant kaam karta hai?</td><td>Nahi. Install policy ke baad hi effect hota hai</td></tr>
<tr><td>Kya gateway kahin bhi ho sakta hai?</td><td>Nahi. Engine ke interface network ke andar hona chahiye</td></tr>
<tr><td>Kaunsa route jeetta hai?</td><td>Longest prefix match</td></tr></table>

<h3>Verify</h3>
<pre class="code">ip route
ping 203.0.113.1</pre>
<pre class="out">198.51.100.0/30 via 203.0.113.1 dev eth1
203.0.113.0/30 dev eth1 proto kernel scope link src 203.0.113.2
10.1.1.0/24 dev eth2 proto kernel scope link src 10.1.1.1
172.16.20.0/24 dev eth3 proto kernel scope link src 172.16.20.1
<span class="hl">default via 203.0.113.1 dev eth1</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Gateway galat subnet se type karna. Destination ke prefix length mein typo. Default route galat interface par install karna. Yeh bhoolna ki remote side ko bhi aapke networks tak wapas route chahiye. Do default routes ko automatic failover maan lena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Validation gateway ko us engine configuration ke interface networks se compare karti hai jo install ho rahi hai. Agar usi change mein aapne interface hataya ya renumber kiya, to kal tak theek route aaj install fail kara sakta hai. Ek aur trap: internet address ka ping fail hone ka matlab hamesha route missing nahi; policy bhi discard kar sakti hai, isliye Logs dekho.</p></div>

<div class="scn"><h4>Route jisne install roka</h4><p>Ek network engineer ne branch ka WAN link 203.0.113.2/30 se 203.0.113.6/30 kar diya lekin default route ka gateway 203.0.113.1 wahi chhod diya. Install policy ne validation error se mana kar diya: gateway kisi interface network ke andar nahi hai. Engineer ne gateway 203.0.113.5 kiya, dobara install kiya aur branch internet tak pahunchne laga.</p><p><b>Lesson:</b> interface renumber karo to usi change mein us par depend karne wale routes bhi review karo.</p></div>

<div class="iv"><p class="q">"Ek packet do routes se match karta hai. Firewall kaunsa use karta hai?"</p><p>Sabse specific wala, yaani sabse lamba prefix length. Default route 0.0.0.0/0 sabse kam specific hai aur tabhi use hota hai jab kuch aur match na kare. Yeh bhi bolo ki route lookup access rules se alag hai: packet ko policy se bhi allow hona padta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interfaces connected routes banate hain. Static routes baaki sab tak pahunchate hain.</li>
<li>Default route 0.0.0.0/0 hai aur aakhri sahara hai.</li>
<li>Gateway interface network ke andar hona chahiye warna validation install block karti hai.</li>
<li>Kai routes mein se longest prefix match faisla karta hai.</li>
<li>Do default routes smart failover nahi hain; Multi-Link baad mein aata hai. Routes Install policy ke baad apply hote hain.</li>
</ul></div>
`}};export{e as default};