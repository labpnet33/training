var e={id:`across-sites`,h:{en:`Multicast across sites: the WAN, tunnels and scoping`,hi:`Sites ke paar multicast: WAN, tunnels aur scoping`},body:{en:`
<p>Inside one building, multicast mostly works once PIM is on. Between cities it meets a new set of problems: the circuits belong to a provider, some circuits cannot carry multicast at all, and routing there changes more often. This chapter explains the multi-site picture used by the labs and where RPF breaks across a WAN.</p>

<h3>The multi-site picture used in this module</h3>
<p>In every multi-site lab you will see the same layout: <b>cities first</b>, each with its own <b>server room</b> (a switch and a server) and a router, joined by <b>labelled circuits</b> (MPLS, Internet, VPN). In the capstone, Deccan Broadcast has four cities. Mumbai holds the encoder and the RP. Pune, Delhi and Chennai have receivers. All four join a provider MPLS service that is multicast-enabled. Delhi and Chennai also have an Internet circuit through a router called INET, which carries unicast only.</p>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Four cities joined by MPLS and Internet circuits">
<rect x="10" y="20" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="70" y="45" text-anchor="middle" class="svg-ink" font-size="13">Mumbai</text><text x="70" y="64" text-anchor="middle" class="svg-muted" font-size="11">encoder + RP</text>
<rect x="10" y="200" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="225" text-anchor="middle" class="svg-ink" font-size="13">Pune</text><text x="70" y="244" text-anchor="middle" class="svg-muted" font-size="11">receiver</text>
<rect x="510" y="20" width="120" height="60" rx="10" fill="#bae6fd"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="13">Delhi</text><text x="570" y="64" text-anchor="middle" class="svg-muted" font-size="11">receiver</text>
<rect x="510" y="200" width="120" height="60" rx="10" fill="#bae6fd"/><text x="570" y="225" text-anchor="middle" class="svg-ink" font-size="13">Chennai</text><text x="570" y="244" text-anchor="middle" class="svg-muted" font-size="11">receiver</text>
<ellipse cx="320" cy="110" rx="110" ry="40" fill="#ddd6fe"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">MPLS (PIM on)</text>
<ellipse cx="320" cy="240" rx="110" ry="34" fill="#fed7aa"/><text x="320" y="245" text-anchor="middle" class="svg-ink" font-size="13">Internet (unicast only)</text>
<line x1="130" y1="50" x2="230" y2="100" stroke="#64748b" stroke-width="2"/><line x1="130" y1="225" x2="230" y2="125" stroke="#64748b" stroke-width="2"/><line x1="510" y1="50" x2="410" y2="100" stroke="#64748b" stroke-width="2"/><line x1="510" y1="225" x2="410" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="60" x2="420" y2="225" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><line x1="510" y1="235" x2="430" y2="245" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
</svg><p class="cap">Solid lines carry PIM. Dashed lines are Internet circuits where PIM must stay off.</p></div>

<h3>Why WAN circuits are different</h3>
<ul>
<li><b>The provider decides.</b> An MPLS service only carries multicast if the provider sells it (often called multicast VPN or mVPN). A plain IP VPN over the Internet carries unicast only.</li>
<li><b>Two networks, two metrics.</b> The Internet circuit is often cheaper in OSPF cost than a 50 Mbps MPLS circuit, so unicast can prefer it. Multicast then follows unicast onto a path with no PIM.</li>
<li><b>Backup links are traps.</b> A link built for resilience of unicast traffic was never PIM-enabled, yet it sits in the unicast table with a perfect metric.</li>
</ul>

<h3>Where RPF breaks across a WAN: four typical moments</h3>
<table class="cmp"><tr><th>Event</th><th>What happens to RPF</th></tr>
<tr><td>An OSPF cost is raised during maintenance and forgotten</td><td>Unicast moves to another circuit; RPF follows; PIM is missing there</td></tr>
<tr><td>A new Internet circuit is added with a low metric</td><td>Branch prefers the Internet toward the head end; multicast is dropped</td></tr>
<tr><td>A link fails and traffic fails over</td><td>RPF moves to the backup path; if it has no PIM the stream stops until the primary returns</td></tr>
<tr><td>Equal-cost circuits</td><td>Different routers choose different upstream neighbours</td></tr></table>
<p>The cure is design, not heroics: either enable PIM on every circuit that unicast might ever prefer, or pin the multicast path with <code>ip mroute</code> on the branch routers so that it does not depend on the unicast metric.</p>

<h3>Tunnels: multicast over a unicast-only circuit</h3>
<p>When the only path is unicast, the standard technique is a <b>GRE tunnel</b> between two routers with PIM enabled on the tunnel interface. The multicast packet is wrapped inside a unicast packet, crosses the Internet, and is unwrapped at the far end. The RPF interface is then the tunnel interface, so the routing toward the source must point at the tunnel (or a static multicast route must). This is a concept in this module: the simulator does not run multicast over tunnels, so the labs use circuits that can carry PIM. Remember the trade-off: tunnels add overhead and a second place to fail.</p>

<h3>TTL scoping and boundaries</h3>
<p>Two tools keep a stream inside the area where it belongs. <b>TTL scoping</b> (the application sets a small TTL) is crude: it counts router hops. A <b>multicast boundary</b> is precise: it blocks a group range at an interface. Companies use the administratively scoped range 239.0.0.0/8 and put a boundary at each site edge, so internal groups never leak to the provider. These are concepts here; the lab simulator carries the packets as long as the RPF check passes.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Enabling PIM on the Internet circuit "to make it work": the Internet cannot carry PIM between your routers without a tunnel, and the carrier backup belongs to another team. (2) Assuming the provider's MPLS carries multicast without checking the service description. (3) Raising an OSPF cost during maintenance without recording to restore it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Multicast routing does not choose the path by itself: it follows the unicast best path. "Preferring" the MPLS circuit for multicast therefore needs a change in unicast cost or a static multicast route.</p></div>

<div class="scn"><h4>The Internet circuit that was too good</h4><p>A broadcaster added a cheap Internet circuit at its Chennai office for backup of business traffic. OSPF considered it the best path to the head end because its cost was low. The same night the news channel stopped at Chennai only. <code>show ip rpf</code> on the branch router named the Internet interface and noted that PIM was off. Two static multicast routes through the MPLS neighbour restored the picture, and the engineer left a note in the change record.</p><p><b>Lesson:</b> every new circuit changes RPF. Add multicast to the checklist of every WAN change.</p></div>

<div class="iv"><p class="q">"Your branch has an MPLS circuit and an Internet backup. How do you make sure multicast uses MPLS?"</p><p>Explain that multicast follows unicast. Either make MPLS the unicast best path toward the head end and RP, or pin RPF with <code>ip mroute</code> toward the MPLS neighbour for the source and the RP, and keep PIM off the Internet unless it runs in a GRE tunnel.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multi-site labs: cities first, a server room per city, labelled circuits.</li>
<li>Circuits that cannot carry PIM are common: Internet, backups, unicast-only VPNs.</li>
<li>An OSPF cost change or a new circuit can move RPF onto a path without PIM.</li>
<li>Fix by design: PIM on every circuit that unicast may prefer, or <code>ip mroute</code> pins.</li>
<li>GRE tunnels with PIM carry multicast over unicast-only circuits; boundaries and TTL keep groups inside.</li>
</ul></div>
`,hi:`
<p>Ek building ke andar PIM on hote hi multicast zyadatar chal jaata hai. Cities ke beech use nayi problems milti hain: circuits provider ke hote hain, kuch circuits multicast le hi nahi jaa sakte, aur wahan routing zyada badalti hai. Yeh chapter labs mein use hone wali multi-site tasveer aur WAN ke paar RPF kahan tootta hai yeh samjhata hai.</p>

<h3>Is module mein use hone wali multi-site tasveer</h3>
<p>Har multi-site lab mein wahi layout dikhega: <b>pehle cities</b>, har ek ka apna <b>server room</b> (ek switch aur ek server) aur ek router, jo <b>labelled circuits</b> (MPLS, Internet, VPN) se jude hain. Capstone mein Deccan Broadcast ki chaar cities hain. Mumbai mein encoder aur RP hai. Pune, Delhi aur Chennai mein receivers hain. Chaaron ek provider MPLS service se jude hain jo multicast-enabled hai. Delhi aur Chennai ka INET naam ke router se Internet circuit bhi hai, jo sirf unicast le jaata hai.</p>
<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="MPLS aur Internet circuits se jude chaar cities">
<rect x="10" y="20" width="120" height="60" rx="10" fill="#bbf7d0"/><text x="70" y="45" text-anchor="middle" class="svg-ink" font-size="13">Mumbai</text><text x="70" y="64" text-anchor="middle" class="svg-muted" font-size="11">encoder + RP</text>
<rect x="10" y="200" width="120" height="60" rx="10" fill="#bae6fd"/><text x="70" y="225" text-anchor="middle" class="svg-ink" font-size="13">Pune</text><text x="70" y="244" text-anchor="middle" class="svg-muted" font-size="11">receiver</text>
<rect x="510" y="20" width="120" height="60" rx="10" fill="#bae6fd"/><text x="570" y="45" text-anchor="middle" class="svg-ink" font-size="13">Delhi</text><text x="570" y="64" text-anchor="middle" class="svg-muted" font-size="11">receiver</text>
<rect x="510" y="200" width="120" height="60" rx="10" fill="#bae6fd"/><text x="570" y="225" text-anchor="middle" class="svg-ink" font-size="13">Chennai</text><text x="570" y="244" text-anchor="middle" class="svg-muted" font-size="11">receiver</text>
<ellipse cx="320" cy="110" rx="110" ry="40" fill="#ddd6fe"/><text x="320" y="115" text-anchor="middle" class="svg-ink" font-size="13">MPLS (PIM on)</text>
<ellipse cx="320" cy="240" rx="110" ry="34" fill="#fed7aa"/><text x="320" y="245" text-anchor="middle" class="svg-ink" font-size="13">Internet (sirf unicast)</text>
<line x1="130" y1="50" x2="230" y2="100" stroke="#64748b" stroke-width="2"/><line x1="130" y1="225" x2="230" y2="125" stroke="#64748b" stroke-width="2"/><line x1="510" y1="50" x2="410" y2="100" stroke="#64748b" stroke-width="2"/><line x1="510" y1="225" x2="410" y2="125" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="60" x2="420" y2="225" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/><line x1="510" y1="235" x2="430" y2="245" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
</svg><p class="cap">Solid lines PIM le jaati hain. Dashed lines Internet circuits hain jahan PIM off rehna chahiye.</p></div>

<h3>WAN circuits alag kyun hain</h3>
<ul>
<li><b>Provider decide karta hai.</b> MPLS service multicast tabhi le jaati hai jab provider bechta hai (aksar multicast VPN ya mVPN kehte hain). Internet par plain IP VPN sirf unicast le jaata hai.</li>
<li><b>Do networks, do metrics.</b> Internet circuit ki OSPF cost aksar 50 Mbps MPLS circuit se kam hoti hai, isliye unicast use pasand kar sakta hai. Phir multicast unicast ko follow karke aise path par chala jaata hai jahan PIM nahi.</li>
<li><b>Backup links jaal hain.</b> Unicast traffic ki resilience ke liye bana link kabhi PIM-enabled nahi hua, par woh unicast table mein perfect metric ke saath baitha hai.</li>
</ul>

<h3>WAN ke paar RPF kahan tootta hai: chaar aam moments</h3>
<table class="cmp"><tr><th>Event</th><th>RPF ke saath kya hota hai</th></tr>
<tr><td>Maintenance mein OSPF cost badhayi aur bhool gaye</td><td>Unicast doosre circuit par chala jaata hai; RPF follow karta hai; wahan PIM nahi</td></tr>
<tr><td>Kam metric wala naya Internet circuit joda</td><td>Branch head end ki taraf Internet ko prefer karta hai; multicast drop</td></tr>
<tr><td>Link fail hua aur traffic failover hua</td><td>RPF backup path par chala jaata hai; wahan PIM nahi to primary wapas aane tak stream ruki</td></tr>
<tr><td>Equal-cost circuits</td><td>Alag routers alag upstream neighbours chunte hain</td></tr></table>
<p>Ilaaj design hai, hero-giri nahi: ya to har us circuit par PIM on karo jise unicast kabhi prefer kar sakta hai, ya branch routers par <code>ip mroute</code> se multicast path pin karo taaki woh unicast metric par nirbhar na rahe.</p>

<h3>Tunnels: unicast-only circuit par multicast</h3>
<p>Jab sirf unicast path ho, standard technique do routers ke beech <b>GRE tunnel</b> hai jisme tunnel interface par PIM on hota hai. Multicast packet unicast packet ke andar lapeta jaata hai, Internet paar karta hai, aur doosre end par kholta hai. Tab RPF interface tunnel interface hota hai, isliye source ki taraf routing tunnel ki taraf point honi chahiye (ya static multicast route). Is module mein yeh concept hai: simulator tunnels par multicast nahi chalata, isliye labs aise circuits use karte hain jo PIM le jaa sakte hain. Trade-off yaad rakho: tunnels overhead aur fail hone ki doosri jagah jodte hain.</p>

<h3>TTL scoping aur boundaries</h3>
<p>Do tools stream ko us area mein rakhte hain jahan use hona chahiye. <b>TTL scoping</b> (application chhota TTL set karti hai) mota tareeka hai: yeh router hops ginta hai. <b>Multicast boundary</b> precise hai: yeh interface par group range block karti hai. Companies administratively scoped range 239.0.0.0/8 use karti hain aur har site edge par boundary lagati hain, taaki internal groups provider tak leak na hon. Yahan yeh concepts hain; lab simulator packets le jaata hai jab tak RPF check pass ho.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) "Chalane ke liye" Internet circuit par PIM on karna: bina tunnel Internet aapke routers ke beech PIM nahi le jaa sakta, aur carrier backup doosri team ka hai. (2) Provider ka MPLS multicast le jaata hai yeh service description check kiye bina maan lena. (3) Maintenance mein OSPF cost badhana aur restore karna record na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Multicast routing path khud nahi chunta: woh unicast best path ko follow karta hai. Multicast ke liye MPLS circuit ko "prefer" karwane ke liye unicast cost badalni padti hai ya static multicast route.</p></div>

<div class="scn"><h4>Internet circuit jo bahut accha tha</h4><p>Ek broadcaster ne Chennai office mein business traffic ke backup ke liye sasta Internet circuit joda. OSPF ne use head end ka best path maana kyunki cost kam thi. Usi raat news channel sirf Chennai mein band ho gaya. Branch router par <code>show ip rpf</code> ne Internet interface ka naam liya aur note kiya ki PIM off hai. MPLS neighbour ke through do static multicast routes ne picture wapas la di, aur engineer ne change record mein note chhoda.</p><p><b>Lesson:</b> har naya circuit RPF badalta hai. Har WAN change ki checklist mein multicast jodo.</p></div>

<div class="iv"><p class="q">"Aapke branch ke paas MPLS circuit aur Internet backup hai. Multicast MPLS use kare yeh kaise sunishchit karoge?"</p><p>Samjhao ki multicast unicast ko follow karta hai. Ya to MPLS ko head end aur RP ki taraf unicast best path banao, ya source aur RP ke liye MPLS neighbour ki taraf <code>ip mroute</code> se RPF pin karo, aur Internet par PIM off rakho jab tak woh GRE tunnel mein na chale.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multi-site labs: pehle cities, har city mein server room, labelled circuits.</li>
<li>PIM na le jaane wale circuits aam hain: Internet, backups, unicast-only VPNs.</li>
<li>OSPF cost change ya naya circuit RPF ko aise path par le jaa sakta hai jahan PIM nahi.</li>
<li>Design se fix karo: unicast jise prefer kare us har circuit par PIM, ya <code>ip mroute</code> pins.</li>
<li>PIM wale GRE tunnels unicast-only circuits par multicast le jaate hain; boundaries aur TTL groups ko andar rakhte hain.</li>
</ul></div>
`}};export{e as default};