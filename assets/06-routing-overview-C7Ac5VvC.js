var e={id:`routing-overview`,h:{en:`Routing overview: static, dynamic and who wins`,hi:`Routing overview: static, dynamic aur kaun jeetta hai`},body:{en:`
<p>VLANs and trunks build the Layer 2 networks. Once an IRB or a routed interface joins those networks, the device needs a <b>routing table</b>: a list of destination prefixes and where to send packets for each. This chapter previews how that table is filled and how Junos decides between competing routes. The detail comes in later modules; here you build the mental model.</p>

<h3>Where routes come from</h3>
<ul>
<li><b>Direct and Local:</b> created automatically when an interface is up with an address. Direct is the connected subnet, Local is the interface address itself (a /32).</li>
<li><b>Static:</b> typed by an administrator. Simple and predictable, but it does not react to failures by itself.</li>
<li><b>Dynamic:</b> learned from neighbours by a routing protocol, which also reacts when links fail.</li>
</ul>

<h3>IGP and EGP</h3>
<p>An <b>IGP</b> (interior gateway protocol) runs inside one organisation: OSPF and IS-IS are link-state IGPs, and RIP is a distance-vector one. An <b>EGP</b> runs between organisations: that is BGP. BGP is also used inside large networks (IBGP) to carry external routes. In JNCIS-ENT, OSPF, IS-IS and BGP each get their own module.</p>

<h3>Route preference: who wins?</h3>
<p>When two sources offer a route to the same prefix, Junos compares the <b>route preference</b> (the administrative distance on other platforms). <b>Lower wins.</b> Defaults worth knowing:</p>
<table class="cmp"><tr><th>Source</th><th>Preference</th></tr>
<tr><td>Direct, Local</td><td>0</td></tr>
<tr><td>Static</td><td>5</td></tr>
<tr><td>OSPF internal</td><td>10</td></tr>
<tr><td>IS-IS Level 1 internal</td><td>15</td></tr>
<tr><td>IS-IS Level 2 internal</td><td>18</td></tr>
<tr><td>RIP</td><td>100</td></tr>
<tr><td>OSPF external</td><td>150</td></tr>
<tr><td>BGP</td><td>170</td></tr></table>
<p>The winning route becomes the <b>active route</b> and is marked with an asterisk in <code>show route</code>. Within one protocol, a metric breaks ties; preference only compares between sources.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Route selection">
<rect x="20" y="20" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Static 5</text>
<rect x="20" y="85" width="130" height="40" rx="8" fill="#fde68a"/><text x="85" y="110" text-anchor="middle" class="svg-ink" font-size="13">OSPF 10</text>
<rect x="20" y="150" width="130" height="40" rx="8" fill="#fed7aa"/><text x="85" y="175" text-anchor="middle" class="svg-ink" font-size="13">BGP 170</text>
<line x1="150" y1="40" x2="270" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="105" x2="270" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="170" x2="270" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="80" width="150" height="50" rx="10" fill="#bae6fd"/><text x="345" y="102" text-anchor="middle" class="svg-ink" font-size="13">Routing table</text><text x="345" y="120" text-anchor="middle" class="svg-ink" font-size="12">lowest preference</text>
<line x1="420" y1="105" x2="500" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="80" width="120" height="50" rx="10" fill="#ddd6fe"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="13">Active route *</text>
</svg><p class="cap">Same prefix from three sources: static (5) is active, the others stay as backups.</p></div>

<h3>Routing table and forwarding table</h3>
<p>The routing engine keeps all routes. It copies only the active ones into the <b>forwarding table</b>, which the packet forwarding engine uses for each packet. This control plane and forwarding plane split is why a busy CPU rarely slows forwarding on Junos.</p>

<h3>What comes after the basics</h3>
<ul>
<li><b>Routing instances</b> create separate routing tables on one device, for example a guest network that never mixes with the corporate table.</li>
<li><b>Aggregate and generated routes</b> summarise many prefixes or originate a default conditionally.</li>
<li><b>Tunnels</b> (GRE, IP-IP) carry traffic across a network that does not know the inner addresses.</li>
<li><b>Policy</b> controls which routes you import and export. You met policy in JNCIA; it matters a lot with OSPF and BGP.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A branch has a static default route (preference 5) toward the ISP and also learns a default through BGP (preference 170). Both are in the table, but only the static one is active. If an administrator removes the static route, the BGP default becomes active within the next routing update. To make the BGP route preferred instead, either lower its preference with policy or raise the static route preference (for example <code>set routing-options static route 0.0.0.0/0 next-hop 192.0.2.1 preference 200</code>).</p></div>

<div class="warn"><p><b>Common mistakes.</b> Thinking a higher preference value wins. Forgetting that the active route is chosen per prefix, so a more specific route (longer prefix) is used first regardless of preference. Mixing up preference (between protocols) and metric (inside one protocol).</p></div>
<div class="exam"><p><b>Exam trap.</b> The packet lookup uses the <b>longest match</b> first. Route preference is only compared among routes for the <b>same</b> prefix. A /24 learned by BGP beats a /16 learned by OSPF for an address inside the /24.</p></div>

<div class="scn"><h4>The backup that never took over</h4><p>An engineer added a floating static route with a preference of 5 as a backup for an OSPF route, expecting it to be used only when OSPF failed. But 5 is lower than the OSPF value of 10, so the static route became the active route immediately and the OSPF path sat unused.</p><p><b>Lesson:</b> a floating backup needs a preference higher than the primary, for example 200.</p></div>

<div class="iv"><p class="q">"Two protocols offer the same prefix. How does Junos choose?"</p><p>It compares route preference and the lower value wins, for example static 5 beats OSPF 10, which beats BGP 170. The winner is the active route and goes into the forwarding table. Metrics only break ties within a single protocol, and longest prefix match is applied first at lookup time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routes come from Direct and Local, static configuration and dynamic protocols.</li>
<li>IGPs (OSPF, IS-IS, RIP) run inside an organisation; BGP is the EGP.</li>
<li>Lower route preference wins: Direct 0, static 5, OSPF 10, IS-IS 15 and 18, RIP 100, BGP 170.</li>
<li>Only the active route enters the forwarding table.</li>
<li>Longest prefix match is used before preference at lookup time.</li>
</ul></div>
`,hi:`
<p>VLANs aur trunks Layer 2 networks banate hain. Jab IRB ya routed interface in networks ko jodta hai, to device ko <b>routing table</b> chahiye: destination prefixes ki list aur har ek ke liye packets kahan bhejne hain. Yeh chapter dikhata hai ki yeh table kaise bharta hai aur Junos competing routes ke beech kaise faisla karta hai. Detail baad ke modules mein hai; yahan aap mental model banate ho.</p>

<h3>Routes kahan se aate hain</h3>
<ul>
<li><b>Direct aur Local:</b> jab interface address ke saath up hota hai to apne aap ban jaate hain. Direct connected subnet hai, Local interface ka apna address (ek /32).</li>
<li><b>Static:</b> administrator type karta hai. Simple aur predictable, lekin failure par apne aap react nahi karta.</li>
<li><b>Dynamic:</b> routing protocol se neighbours se seekha jaata hai, aur links fail hone par react bhi karta hai.</li>
</ul>

<h3>IGP aur EGP</h3>
<p><b>IGP</b> (interior gateway protocol) ek organisation ke andar chalta hai: OSPF aur IS-IS link-state IGPs hain, aur RIP distance-vector hai. <b>EGP</b> organisations ke beech chalta hai: yaani BGP. BGP bade networks ke andar bhi (IBGP) external routes le jaane ke liye use hota hai. JNCIS-ENT mein OSPF, IS-IS aur BGP ka apna apna module hai.</p>

<h3>Route preference: kaun jeetta hai?</h3>
<p>Jab do sources same prefix ka route dete hain, Junos <b>route preference</b> compare karta hai (doosre platforms par administrative distance). <b>Kam wala jeetta hai.</b> Jaanne layak defaults:</p>
<table class="cmp"><tr><th>Source</th><th>Preference</th></tr>
<tr><td>Direct, Local</td><td>0</td></tr>
<tr><td>Static</td><td>5</td></tr>
<tr><td>OSPF internal</td><td>10</td></tr>
<tr><td>IS-IS Level 1 internal</td><td>15</td></tr>
<tr><td>IS-IS Level 2 internal</td><td>18</td></tr>
<tr><td>RIP</td><td>100</td></tr>
<tr><td>OSPF external</td><td>150</td></tr>
<tr><td>BGP</td><td>170</td></tr></table>
<p>Jeetne wala route <b>active route</b> ban jaata hai aur <code>show route</code> mein asterisk se mark hota hai. Ek hi protocol ke andar metric tie todta hai; preference sirf alag sources ke beech compare hoti hai.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Route selection">
<rect x="20" y="20" width="130" height="40" rx="8" fill="#bbf7d0"/><text x="85" y="45" text-anchor="middle" class="svg-ink" font-size="13">Static 5</text>
<rect x="20" y="85" width="130" height="40" rx="8" fill="#fde68a"/><text x="85" y="110" text-anchor="middle" class="svg-ink" font-size="13">OSPF 10</text>
<rect x="20" y="150" width="130" height="40" rx="8" fill="#fed7aa"/><text x="85" y="175" text-anchor="middle" class="svg-ink" font-size="13">BGP 170</text>
<line x1="150" y1="40" x2="270" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="105" x2="270" y2="105" stroke="#64748b" stroke-width="2"/>
<line x1="150" y1="170" x2="270" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="270" y="80" width="150" height="50" rx="10" fill="#bae6fd"/><text x="345" y="102" text-anchor="middle" class="svg-ink" font-size="13">Routing table</text><text x="345" y="120" text-anchor="middle" class="svg-ink" font-size="12">lowest preference</text>
<line x1="420" y1="105" x2="500" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="500" y="80" width="120" height="50" rx="10" fill="#ddd6fe"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="13">Active route *</text>
</svg><p class="cap">Teen sources se same prefix: static (5) active hai, baaki backup rehte hain.</p></div>

<h3>Routing table aur forwarding table</h3>
<p>Routing engine saare routes rakhta hai. Woh sirf active routes ko <b>forwarding table</b> mein copy karta hai, jise packet forwarding engine har packet ke liye use karta hai. Control plane aur forwarding plane ka yeh batwara isi liye hai ki busy CPU Junos par forwarding ko shayad hi slow karta hai.</p>

<h3>Basics ke baad kya aata hai</h3>
<ul>
<li><b>Routing instances</b> ek device par alag routing tables banate hain, jaise guest network jo corporate table se kabhi mix nahi hota.</li>
<li><b>Aggregate aur generated routes</b> kai prefixes ko summarise karte hain ya shart ke saath default originate karte hain.</li>
<li><b>Tunnels</b> (GRE, IP-IP) aise network ke paar traffic le jaate hain jo inner addresses nahi jaanta.</li>
<li><b>Policy</b> tay karti hai ki kaunse routes import aur export hon. Aap ne JNCIA mein policy dekhi thi; OSPF aur BGP ke saath yeh bahut matter karti hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ek branch ke paas ISP ki taraf static default route (preference 5) hai aur BGP se bhi default seekhta hai (preference 170). Dono table mein hain, lekin sirf static active hai. Agar administrator static route hata de to agle routing update mein BGP default active ho jaata hai. BGP route ko preferred banane ke liye policy se uski preference kam karo ya static route ki preference badhao (jaise <code>set routing-options static route 0.0.0.0/0 next-hop 192.0.2.1 preference 200</code>).</p></div>

<div class="warn"><p><b>Common mistakes.</b> Yeh sochna ki zyada preference value jeetti hai. Yeh bhoolna ki active route har prefix ke liye chuna jaata hai, isliye zyada specific route (lamba prefix) preference se qata nazar pehle use hota hai. Preference (protocols ke beech) aur metric (ek protocol ke andar) ko mix karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Packet lookup pehle <b>longest match</b> use karta hai. Route preference sirf <b>same</b> prefix ke routes ke beech compare hoti hai. /24 jo BGP se seekha gaya, woh /24 ke andar ke address ke liye OSPF ke /16 ko haraata hai.</p></div>

<div class="scn"><h4>Backup jo kabhi takeover nahi hua</h4><p>Ek engineer ne OSPF route ke backup ke roop mein preference 5 wala floating static route daala, yeh sochkar ki sirf OSPF fail hone par use hoga. Lekin 5, OSPF ke 10 se kam hai, isliye static route turant active ho gaya aur OSPF path unused pada raha.</p><p><b>Lesson:</b> floating backup ki preference primary se zyada honi chahiye, jaise 200.</p></div>

<div class="iv"><p class="q">"Do protocols same prefix dete hain. Junos kaise chunta hai?"</p><p>Woh route preference compare karta hai aur kam value jeetti hai, jaise static 5, OSPF 10 ko aur OSPF, BGP 170 ko haraata hai. Winner active route banta hai aur forwarding table mein jaata hai. Metrics sirf ek protocol ke andar tie todte hain, aur lookup ke samay longest prefix match pehle lagta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Routes Direct aur Local, static configuration aur dynamic protocols se aate hain.</li>
<li>IGPs (OSPF, IS-IS, RIP) organisation ke andar chalte hain; BGP EGP hai.</li>
<li>Kam route preference jeetti hai: Direct 0, static 5, OSPF 10, IS-IS 15 aur 18, RIP 100, BGP 170.</li>
<li>Sirf active route forwarding table mein jaata hai.</li>
<li>Lookup par preference se pehle longest prefix match lagta hai.</li>
</ul></div>
`}};export{e as default};