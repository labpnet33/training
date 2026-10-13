var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now understand how a Junos router chooses and uses routes. Review this page before the labs, interviews and the JN0-106 exam.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Decision order">
<rect x="20" y="20" width="170" height="70" rx="10" fill="#bae6fd"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">1. Longest prefix</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="11">picks the route set</text>
<rect x="235" y="20" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">2. Lowest preference</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">picks the active route</text>
<rect x="450" y="20" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">3. Lowest metric</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="11">only inside one protocol</text>
<line x1="190" y1="55" x2="235" y2="55" stroke="#64748b" stroke-width="2"/><line x1="405" y1="55" x2="450" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="115" width="400" height="55" rx="10" fill="#fde68a"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Active route goes to the forwarding table</text><text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="11">inactive routes wait as automatic backups</text>
</svg><p class="cap">The order of decisions. Memorise it.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can explain longest prefix match with an example and say what happens with no match.</li>
<li>I can distinguish the routing table (all routes, RE) from the forwarding table (active only, PFE).</li>
<li>I know inet.0 is IPv4 unicast and inet6.0 is IPv6 unicast.</li>
<li>I can read show route: asterisk, [Protocol/preference], next hop, header counts.</li>
<li>I know the default preferences: Direct 0, Static 5, OSPF 10, RIP 100, OSPF external 150, BGP 170.</li>
<li>I can configure static, default, discard, reject and floating static (qualified-next-hop) routes.</li>
<li>I can configure IPv6 static routes under rib inet6.0 and know ::/0.</li>
<li>I can explain resolve and equal-cost load balancing.</li>
<li>I can solve the three lab tickets and check forward and return paths.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Next hop</dt><dd>The neighbour address or interface to which the packet is passed.</dd>
<dt>Longest prefix match</dt><dd>The rule that the most specific matching prefix wins.</dd>
<dt>Active route</dt><dd>The one route, marked *, used for a prefix and installed in the forwarding table.</dd>
<dt>Route preference</dt><dd>Trust value per source; lower wins for the same prefix.</dd>
<dt>Floating static</dt><dd>A static with higher preference that acts as a backup.</dd>
<dt>Black hole</dt><dd>A discard or reject route that drops traffic on purpose.</dd>
<dt>Hidden route</dt><dd>A route that exists but cannot be used, such as an unresolvable next hop.</dd>
<dt>Gateway of last resort</dt><dd>The default route.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Static route preference</td><td>5</td></tr>
<tr><td>OSPF internal / external</td><td>10 / 150</td></tr>
<tr><td>BGP preference</td><td>170</td></tr>
<tr><td>Direct and Local</td><td>0</td></tr>
<tr><td>IPv6 unicast table</td><td>inet6.0</td></tr>
<tr><td>Which table has only active routes?</td><td>Forwarding table</td></tr>
<tr><td>discard vs reject</td><td>Silent drop vs drop plus ICMP unreachable</td></tr>
<tr><td>Distant static next hop</td><td>Add resolve</td></tr>
<tr><td>Floating static</td><td>Higher preference, e.g. qualified-next-hop with preference 20</td></tr>
<tr><td>IPv6 default route</td><td>::/0 under rib inet6.0 static</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">show route
show route 172.16.30.10
show route 192.168.0.0/16 longer
show route 172.16.30.0/24 detail
show route protocol static
show route table inet6.0
show route forwarding-table

set routing-options static route 0.0.0.0/0 next-hop 10.1.12.2
set routing-options static route 192.168.0.0/16 discard
set routing-options static route 10.200.0.0/16 reject
set routing-options static route 172.16.40.0/24 qualified-next-hop 10.2.12.2 preference 20
set routing-options static route 172.16.60.0/24 preference 200
set routing-options static route 203.0.113.0/24 next-hop 10.9.9.9 resolve
set routing-options rib inet6.0 static route ::/0 next-hop 2001:db8:12::2
commit confirmed 5</pre>
<div class="warn"><p><b>Common mistake.</b> Memorising preference values but forgetting that preference only matters for the same prefix. Longest match comes first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Words such as "same prefix", "most specific" and "active in the forwarding table" tell you which rule the question is testing. Underline them before you answer.</p></div>

<div class="scn"><h4>A day in the life</h4><p>On Monday morning a branch lost its server. The engineer checked the next hop with ping, ran show route for the destination and found nothing, because a replacement router lacked the static route. She added it, tested both directions, and then noticed the backup static on another router was using default preference and sending traffic over the slow link. She raised it to 200, confirmed OSPF was active again, and added a discard route for unused address space so stray traffic would stop at the core.</p><p><b>Lesson:</b> longest match, preference, and static routes are one toolkit.</p></div>

<div class="iv"><p class="q">"Explain in two minutes how Junos picks the route used for a packet."</p><p>Longest prefix match chooses among matching prefixes. If several sources offer the same prefix, the lowest preference becomes active (static 5, OSPF 10, BGP 170); within one protocol the lowest metric wins. Only the active route is copied to the forwarding table in the PFE; inactive ones remain as backups in inet.0 and take over automatically. Add an example with a floating static.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Longest prefix, then lowest preference, then metric inside one protocol.</li>
<li>Routing table keeps everything; forwarding table keeps only active routes.</li>
<li>Static routes: next-hop, default, discard, reject, qualified-next-hop, resolve, IPv6 under inet6.0.</li>
<li>Always check forward and return paths with show route, ping and traceroute.</li>
<li>Next module: jncia-ospf replaces hand-typed routes with a dynamic protocol.</li>
</ul></div>
`,hi:`
<p>Ab aap samajhte ho ki Junos router routes kaise chunta aur use karta hai. Labs, interviews aur JN0-106 exam se pehle yeh page review karo.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Decision order">
<rect x="20" y="20" width="170" height="70" rx="10" fill="#bae6fd"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">1. Longest prefix</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="11">route set chunta hai</text>
<rect x="235" y="20" width="170" height="70" rx="10" fill="#ddd6fe"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="13">2. Lowest preference</text><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="11">active route chunti hai</text>
<rect x="450" y="20" width="170" height="70" rx="10" fill="#bbf7d0"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">3. Lowest metric</text><text x="535" y="68" text-anchor="middle" class="svg-muted" font-size="11">sirf ek protocol ke andar</text>
<line x1="190" y1="55" x2="235" y2="55" stroke="#64748b" stroke-width="2"/><line x1="405" y1="55" x2="450" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="120" y="115" width="400" height="55" rx="10" fill="#fde68a"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Active route forwarding table mein jaata hai</text><text x="320" y="158" text-anchor="middle" class="svg-muted" font-size="11">inactive routes automatic backup ke roop mein intezaar karte hain</text>
</svg><p class="cap">Faislon ka order. Ratt lo.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main longest prefix match example ke saath samjha sakta hoon aur batata hoon match na ho to kya hota hai.</li>
<li>Main routing table (saare routes, RE) aur forwarding table (sirf active, PFE) mein fark kar sakta hoon.</li>
<li>Mujhe pata hai inet.0 IPv4 unicast hai aur inet6.0 IPv6 unicast.</li>
<li>Main show route padh sakta hoon: asterisk, [Protocol/preference], next hop, header counts.</li>
<li>Mujhe default preferences pata hain: Direct 0, Static 5, OSPF 10, RIP 100, OSPF external 150, BGP 170.</li>
<li>Main static, default, discard, reject aur floating static (qualified-next-hop) routes configure kar sakta hoon.</li>
<li>Main rib inet6.0 ke neeche IPv6 static routes configure kar sakta hoon aur ::/0 jaanta hoon.</li>
<li>Main resolve aur equal-cost load balancing samjha sakta hoon.</li>
<li>Main teeno lab tickets solve kar sakta hoon aur forward aur return paths check karta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Next hop</dt><dd>Padosi ka address ya interface jise packet pass kiya jaata hai.</dd>
<dt>Longest prefix match</dt><dd>Rule ki sabse specific matching prefix jeetta hai.</dd>
<dt>Active route</dt><dd>Prefix ke liye use hone wala ek route, * se marked, forwarding table mein installed.</dd>
<dt>Route preference</dt><dd>Har source ki trust value; same prefix ke liye kam jeetta hai.</dd>
<dt>Floating static</dt><dd>Zyada preference wala static jo backup ka kaam karta hai.</dd>
<dt>Black hole</dt><dd>Discard ya reject route jo jaan boojh kar traffic drop karta hai.</dd>
<dt>Hidden route</dt><dd>Aisa route jo hai lekin use nahi ho sakta, jaise unresolvable next hop.</dd>
<dt>Gateway of last resort</dt><dd>Default route.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>Static route preference</td><td>5</td></tr>
<tr><td>OSPF internal / external</td><td>10 / 150</td></tr>
<tr><td>BGP preference</td><td>170</td></tr>
<tr><td>Direct aur Local</td><td>0</td></tr>
<tr><td>IPv6 unicast table</td><td>inet6.0</td></tr>
<tr><td>Kaunsi table mein sirf active routes?</td><td>Forwarding table</td></tr>
<tr><td>discard vs reject</td><td>Chup drop vs drop plus ICMP unreachable</td></tr>
<tr><td>Door ka static next hop</td><td>resolve lagao</td></tr>
<tr><td>Floating static</td><td>Zyada preference, jaise qualified-next-hop preference 20 ke saath</td></tr>
<tr><td>IPv6 default route</td><td>rib inet6.0 static ke neeche ::/0</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">show route
show route 172.16.30.10
show route 192.168.0.0/16 longer
show route 172.16.30.0/24 detail
show route protocol static
show route table inet6.0
show route forwarding-table

set routing-options static route 0.0.0.0/0 next-hop 10.1.12.2
set routing-options static route 192.168.0.0/16 discard
set routing-options static route 10.200.0.0/16 reject
set routing-options static route 172.16.40.0/24 qualified-next-hop 10.2.12.2 preference 20
set routing-options static route 172.16.60.0/24 preference 200
set routing-options static route 203.0.113.0/24 next-hop 10.9.9.9 resolve
set routing-options rib inet6.0 static route ::/0 next-hop 2001:db8:12::2
commit confirmed 5</pre>
<div class="warn"><p><b>Common mistake.</b> Preference values ratt lena lekin yeh bhool jaana ki preference sirf same prefix ke liye matter karti hai. Longest match pehle aata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Same prefix", "most specific" aur "active in the forwarding table" jaise shabd batate hain ki sawaal kaunsa rule test kar raha hai. Jawab dene se pehle unhe underline karo.</p></div>

<div class="scn"><h4>Ek din ki kahani</h4><p>Monday subah ek branch ka server chala gaya. Engineer ne next hop ping se check kiya, destination ka show route chalaya aur kuch nahi mila, kyunki replacement router ke paas static route nahi tha. Usne lagaya, dono directions test kiye, phir dekha ki doosre router ka backup static default preference par tha aur traffic slow link par bhej raha tha. Usne use 200 kiya, confirm kiya ki OSPF phir active hai, aur unused address space ke liye discard route lagaya taaki stray traffic core par ruk jaaye.</p><p><b>Lesson:</b> longest match, preference aur static routes ek hi toolkit hain.</p></div>

<div class="iv"><p class="q">"Do minute mein samjhao Junos packet ke liye route kaise chunta hai."</p><p>Longest prefix match matching prefixes mein chunta hai. Kai sources same prefix dein to lowest preference active hoti hai (static 5, OSPF 10, BGP 170); ek protocol ke andar lowest metric jeetta hai. Sirf active route PFE ki forwarding table mein copy hota hai; inactive inet.0 mein backup rehte hain aur automatically le lete hain. Floating static ka example jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Longest prefix, phir lowest preference, phir ek protocol ke andar metric.</li>
<li>Routing table sab rakhti hai; forwarding table sirf active routes.</li>
<li>Static routes: next-hop, default, discard, reject, qualified-next-hop, resolve, IPv6 inet6.0 ke neeche.</li>
<li>Hamesha show route, ping aur traceroute se forward aur return paths check karo.</li>
<li>Agla module: jncia-ospf haath se type kiye routes ko dynamic protocol se badalta hai.</li>
</ul></div>
`}};export{e as default};