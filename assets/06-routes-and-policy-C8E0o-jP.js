var e={id:`routes-and-policy`,h:{en:`How routes interact with zones, NAT, PBF and security policy`,hi:`Routes zones, NAT, PBF aur security policy se kaise interact karte hain`},body:{en:`
<p>A Palo Alto firewall is zone based, and zones are bound to interfaces. The routing table is therefore not just a path finder: it is how the firewall learns the <b>destination zone</b>, and every NAT and security rule is written with zones.</p>
<h3>The order of decisions for a new session</h3>
<p>1. The packet arrives on an interface; its zone is the <b>source zone</b>.</p>
<p>2. If a policy-based forwarding (PBF) rule matches, it can choose the egress interface and next hop and skip the normal route.</p>
<p>3. Otherwise the firewall does a <b>route lookup</b> on the destination address in the virtual router of the ingress interface. The egress interface of the best route gives the <b>destination zone</b>.</p>
<p>4. NAT policy is matched using the original addresses and these zones.</p>
<p>5. Security policy is matched using the original (pre-NAT) addresses and the destination zone found after NAT rules are considered.</p>
<p>6. If allowed, the session is created, with both directions recorded, and the packet is forwarded.</p>
<p>Existing sessions skip the policy steps and follow the recorded path, which is why a route change may not move existing flows until they end.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="The route lookup supplies the destination zone that NAT and security rules match against."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="14">Ingress zone</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="76" text-anchor="middle" class="svg-ink" font-size="14">Route lookup</text><text x="194" y="98" text-anchor="middle" class="svg-muted" font-size="12">egress zone</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="14">NAT policy</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="86" text-anchor="middle" class="svg-ink" font-size="14">Security policy</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="86" text-anchor="middle" class="svg-ink" font-size="14">Forward</text></svg><p class="cap">The route lookup supplies the destination zone that NAT and security rules match against.</p></div>
<h3>What goes wrong</h3>
<ul>
<li><b>No route:</b> the packet is dropped because it has no egress. Logs may be empty, since no session is built. Counters such as <code>flow_fwd_l3_noroute</code> show it.</li>
<li><b>Route points to a wrong zone:</b> the packet is allowed by a rule for the wrong zone pair or is denied by the default interzone deny.</li>
<li><b>No ARP for the next hop:</b> the counter <code>flow_fwd_l3_noarp</code> grows; the next hop is down or in a different VLAN.</li>
<li><b>Asymmetric routing:</b> the reply returns by a different firewall or interface. With the default TCP session checks the firewall drops non-SYN packets of unknown sessions. Fix the routing rather than disabling checks.</li>
<li><b>Two zones, one route:</b> a branch with two uplinks in different zones needs the right route per direction.</li>
</ul>
<h3>Commands that answer these questions</h3>
<pre class="code">test routing fib-lookup virtual-router default ip 10.50.1.10
test security-policy-match source 10.10.1.20 destination 10.50.1.10 destination-port 443 protocol 6
show routing route
show session all filter destination 10.50.1.10
show counter global filter delta yes severity drop</pre>
<p>The first command shows which route and interface the firewall would use and the second shows the rule it would hit. Use them before reading logs.</p>
<h3>PBF versus routes</h3>
<p>Policy-based forwarding overrides the route table for matching traffic, for example to send a SaaS application out of a specific ISP. PBF can include a monitor with an action when the next hop fails; without it, failed PBF traffic may keep using a dead path. PBF is evaluated before the route lookup, so a route cannot save traffic that PBF sends the wrong way.</p>
<h3>NAT and routing</h3>
<p>Destination NAT changes the address that the route lookup will use after translation, but the destination zone for NAT and security matching comes from the route lookup of the original destination address. When you publish a server with a public address, the public address must resolve through the route table to the zone where the client comes from (usually untrust), and the security rule must name the pre-NAT address and the post-NAT zone. If this is new, revise pan-nat first.</p>
<pre class="code">set zone UNTRUST network layer3 ethernet1/1
set zone DMZ network layer3 ethernet1/3
set network virtual-router default interface [ ethernet1/1 ethernet1/3 ]</pre>
<p>These lines show only that zone interfaces and the virtual router are separate objects: both must exist for the traffic to pass.</p>
<h3>Security of the routing plane</h3>
<p>Treat routing sessions as sensitive. Limit management access, authenticate OSPF and BGP, filter what you accept and what you advertise, and apply zone protection on the interfaces that face other organisations. Logs of route changes should go to your central logging.</p>
<div class="eg"><p><b>Worked example.</b> A client at 10.10.1.20 (zone LAN) reaches a server at 10.50.1.10. The route lookup returns interface ethernet1/2, which is in zone DC. The rule that must exist is LAN to DC. If a floating route later moves traffic to ethernet1/4 in zone BACKUP, the same rule no longer matches and traffic is denied.</p></div>
<div class="warn"><p><b>Common mistake.</b> Adding a new route and expecting existing rules to apply. A new egress interface can mean a new zone and therefore a new rule.</p></div>
<div class="exam"><p><b>Exam trap.</b> The destination zone is derived from the route lookup, not from the rule. PBF is evaluated before the route lookup. Asymmetric routing causes non-SYN drops.</p></div>
<div class="scn"><h4>The backup path had no policy</h4><p>A failover to the secondary data centre switched the route to an interface in a different zone. Users complained of timeouts. Logs showed an interzone deny for a flow that had worked an hour earlier. The engineer used a route lookup and a policy match test, saw the new zone, and added the missing rule to the rulebase and to the change template.</p><p><b>Lesson:</b> a route change can change the zone pair, and with it the rule that applies.</p></div>
<div class="iv"><p class="q">"Which comes first on a Palo Alto firewall, route lookup or security policy?"</p><p>For a new session, the firewall finds the destination zone through the route lookup (after PBF if one matches), then evaluates NAT and security policy. This is why a wrong or missing route gives a drop or the wrong rule, and why you test with a fib lookup and a security-policy match.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>The route lookup provides the destination zone for NAT and security rules.</li><li>PBF is checked before the route table and can override it.</li><li>No route or no ARP shows as noroute and noarp counters.</li><li>Asymmetric routing leads to non-SYN drops; fix the path.</li><li>Test with test routing fib-lookup and test security-policy-match.</li></ul></div>
`,hi:`
<p>Palo Alto firewall zone-based hai, aur zones interfaces se bandhe hote hain. Isliye routing table sirf path nahi dhoondhta: isi se firewall <b>destination zone</b> seekhta hai, aur har NAT aur security rule zones ke saath likhi jaati hai.</p>
<h3>Naye session ke liye decisions ka order</h3>
<p>1. Packet interface par aata hai; uska zone <b>source zone</b> hai.</p>
<p>2. Policy-based forwarding (PBF) rule match kare to woh egress interface aur next hop chun sakta hai aur normal route skip ho jaata hai.</p>
<p>3. Nahi to firewall ingress interface ke virtual router mein destination address par <b>route lookup</b> karta hai. Best route ka egress interface <b>destination zone</b> deta hai.</p>
<p>4. NAT policy original addresses aur in zones se match hoti hai.</p>
<p>5. Security policy original (pre-NAT) addresses aur NAT rules ke baad mili destination zone se match hoti hai.</p>
<p>6. Allowed ho to session banta hai, dono directions record hoti hain, aur packet forward hota hai.</p>
<p>Existing sessions policy steps skip karke recorded path follow karte hain, isliye route change existing flows ko tab tak nahi hilata jab tak woh khatam na ho.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Route lookup destination zone deta hai jis par NAT aur security rules match karte hain."><rect x="20" y="40" width="100" height="80" rx="10" fill="#bae6fd"/><text x="70" y="86" text-anchor="middle" class="svg-ink" font-size="14">Ingress zone</text><line x1="120" y1="80" x2="144" y2="80" stroke="#64748b" stroke-width="2"/><rect x="144" y="40" width="100" height="80" rx="10" fill="#bbf7d0"/><text x="194" y="76" text-anchor="middle" class="svg-ink" font-size="14">Route lookup</text><text x="194" y="98" text-anchor="middle" class="svg-muted" font-size="12">egress zone</text><line x1="244" y1="80" x2="268" y2="80" stroke="#64748b" stroke-width="2"/><rect x="268" y="40" width="100" height="80" rx="10" fill="#ddd6fe"/><text x="318" y="86" text-anchor="middle" class="svg-ink" font-size="14">NAT policy</text><line x1="368" y1="80" x2="392" y2="80" stroke="#64748b" stroke-width="2"/><rect x="392" y="40" width="100" height="80" rx="10" fill="#fde68a"/><text x="442" y="86" text-anchor="middle" class="svg-ink" font-size="14">Security policy</text><line x1="492" y1="80" x2="516" y2="80" stroke="#64748b" stroke-width="2"/><rect x="516" y="40" width="100" height="80" rx="10" fill="#fed7aa"/><text x="566" y="86" text-anchor="middle" class="svg-ink" font-size="14">Forward</text></svg><p class="cap">Route lookup destination zone deta hai jis par NAT aur security rules match karte hain.</p></div>
<h3>Kya galat hota hai</h3>
<ul>
<li><b>No route:</b> egress na hone se packet drop hota hai. Session nahi bannne se logs khaali ho sakte hain. <code>flow_fwd_l3_noroute</code> jaise counters yeh dikhate hain.</li>
<li><b>Route galat zone ki taraf:</b> packet galat zone pair ki rule se allow hota hai ya default interzone deny se deny.</li>
<li><b>Next hop ka ARP nahi:</b> <code>flow_fwd_l3_noarp</code> counter badhta hai; next hop down hai ya doosre VLAN mein.</li>
<li><b>Asymmetric routing:</b> reply doosre firewall ya interface se aata hai. Default TCP session checks ke saath firewall unknown sessions ke non-SYN packets drop karta hai. Checks disable karne ke bajay routing theek karo.</li>
<li><b>Do zones, ek route:</b> do uplinks wale branch ko har direction ke liye sahi route chahiye.</li>
</ul>
<h3>Jo commands in sawalon ka jawab dete hain</h3>
<pre class="code">test routing fib-lookup virtual-router default ip 10.50.1.10
test security-policy-match source 10.10.1.20 destination 10.50.1.10 destination-port 443 protocol 6
show routing route
show session all filter destination 10.50.1.10
show counter global filter delta yes severity drop</pre>
<p>Pehla command batata hai firewall kaunsa route aur interface use karega, aur doosra batata hai kaunsi rule hit hogi. Logs padhne se pehle inhe use karo.</p>
<h3>PBF versus routes</h3>
<p>Policy-based forwarding matching traffic ke liye route table override karta hai, jaise kisi SaaS application ko khaas ISP se bhejna. PBF mein monitor aur next hop fail hone par action ho sakta hai; uske bina failed PBF traffic dead path use karta reh sakta hai. PBF route lookup se pehle evaluate hota hai, isliye route us traffic ko nahi bacha sakta jise PBF galat taraf bhejta hai.</p>
<h3>NAT aur routing</h3>
<p>Destination NAT translation ke baad route lookup ka address badalta hai, lekin NAT aur security matching ki destination zone original destination address ke route lookup se aati hai. Public address wala server publish karte ho to public address route table se us zone tak resolve hona chahiye jahan se client aata hai (aam taur par untrust), aur security rule pre-NAT address aur post-NAT zone ka naam le. Naya lage to pehle pan-nat dobara dekho.</p>
<pre class="code">set zone UNTRUST network layer3 ethernet1/1
set zone DMZ network layer3 ethernet1/3
set network virtual-router default interface [ ethernet1/1 ethernet1/3 ]</pre>
<p>Yeh lines sirf dikhati hain ki zone interfaces aur virtual router alag objects hain: traffic pass karne ke liye dono hone chahiye.</p>
<h3>Routing plane ki security</h3>
<p>Routing sessions ko sensitive maano. Management access limit karo, OSPF aur BGP authenticate karo, jo accept aur advertise karte ho use filter karo, aur dusre organisations ki taraf wale interfaces par zone protection lagao. Route changes ke logs central logging mein jaane chahiye.</p>
<div class="eg"><p><b>Worked example.</b> Client 10.10.1.20 (zone LAN) server 10.50.1.10 tak jaata hai. Route lookup interface ethernet1/2 deta hai jo zone DC mein hai. Zaroori rule LAN to DC hai. Baad mein floating route traffic ko ethernet1/4 (zone BACKUP) par le jaaye to wahi rule match nahi karti aur traffic deny hota hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Naya route add karke maan lena ki existing rules lagu hongi. Naya egress interface matlab naya zone ho sakta hai, aur isliye nayi rule.</p></div>
<div class="exam"><p><b>Exam trap.</b> Destination zone route lookup se aati hai, rule se nahi. PBF route lookup se pehle evaluate hota hai. Asymmetric routing se non-SYN drops hote hain.</p></div>
<div class="scn"><h4>Backup path ke liye policy nahi thi</h4><p>Secondary data centre ko failover ne route ko alag zone ke interface par shift kar diya. Users ne timeouts bataye. Logs mein ek ghante pehle chalte flow ke liye interzone deny dikha. Engineer ne route lookup aur policy match test chalaya, naya zone dekha, aur missing rule rulebase aur change template mein jodi.</p><p><b>Lesson:</b> route change zone pair badal sakta hai, aur uske saath lagne wali rule bhi.</p></div>
<div class="iv"><p class="q">"Palo Alto firewall par pehle kya aata hai, route lookup ya security policy?"</p><p>Naye session ke liye firewall pehle (agar PBF match na kare to) route lookup se destination zone dhoondhta hai, phir NAT aur security policy evaluate karta hai. Isliye galat ya missing route drop ya galat rule deta hai, aur isliye fib lookup aur security-policy match se test karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Route lookup NAT aur security rules ke liye destination zone deta hai.</li><li>PBF route table se pehle check hota hai aur use override kar sakta hai.</li><li>No route ya no ARP noroute aur noarp counters mein dikhta hai.</li><li>Asymmetric routing non-SYN drops deta hai; path theek karo.</li><li>test routing fib-lookup aur test security-policy-match se test karo.</li></ul></div>
`}};export{e as default};