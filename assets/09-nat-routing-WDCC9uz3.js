var e={id:`nat-routing`,h:{en:`NAT and routing faults`,hi:`NAT aur routing faults`},body:{en:`
<p>Most "the firewall blocks it" tickets after a migration are not access control problems at all. They are address problems: a packet that is translated to the wrong address, not translated at all, or sent out of the wrong interface. A postman with a perfect security badge still fails if the house number on the envelope is wrong. This chapter is a catalogue of NAT and routing faults on Threat Defense, each with the symptom you will see and the command that proves it.</p>

<h3>How NAT and routing interact</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="NAT divert versus route lookup">
<rect x="10" y="80" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="13">dst 203.0.113.3</text>
<rect x="210" y="80" width="140" height="50" rx="8" fill="#bae6fd"/><text x="280" y="102" text-anchor="middle" class="svg-ink" font-size="13">Static NAT</text><text x="280" y="120" text-anchor="middle" class="svg-muted" font-size="12">matches?</text>
<rect x="420" y="20" width="210" height="50" rx="8" fill="#bbf7d0"/><text x="525" y="42" text-anchor="middle" class="svg-ink" font-size="13">Yes: UN-NAT to 10.0.2.10</text><text x="525" y="60" text-anchor="middle" class="svg-muted" font-size="12">NAT divert to dmz</text>
<rect x="420" y="140" width="210" height="50" rx="8" fill="#fed7aa"/><text x="525" y="162" text-anchor="middle" class="svg-ink" font-size="13">No: route lookup</text><text x="525" y="180" text-anchor="middle" class="svg-muted" font-size="12">connected: back out outside</text>
<line x1="150" y1="105" x2="210" y2="105" stroke="#64748b" stroke-width="2"/><line x1="350" y1="95" x2="420" y2="45" stroke="#64748b" stroke-width="2"/><line x1="350" y1="115" x2="420" y2="165" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">For inbound traffic to a published address, static NAT chooses the egress interface. Without a matching NAT rule, the routing table decides, often wrongly.</p></div>
<p>For an inbound flow to a published server, UN-NAT happens first and also <b>diverts</b> the packet to the real interface (dmz). Only traffic without a NAT divert uses the normal route lookup. That is why, in the broken lab, the destination 203.0.113.3 inside the outside subnet 203.0.113.0/29 was routed straight back out of outside, and the access control check saw OUTSIDE to OUTSIDE.</p>

<h3>NAT fault catalogue</h3>
<table class="cmp"><tr><th>Fault</th><th>Symptom</th><th>Proof</th></tr>
<tr><td>Wrong mapped address (our lab: .5 instead of .3)</td><td>No UN-NAT phase; default action drop</td><td><code>show nat</code>: untranslate_hits 0; <code>show xlate</code></td></tr>
<tr><td>Access rule uses the mapped address (our lab: Portal-In to 203.0.113.3)</td><td>UN-NAT works, then ACCESS-LIST drop</td><td><code>show access-control-config</code>: Rule Hits 0</td></tr>
<tr><td>Rule order: a broader manual NAT in Section 1 matches first</td><td>Translated to an unexpected address</td><td><code>show nat detail</code>, packet-tracer NAT phase names the rule</td></tr>
<tr><td>Proxy ARP disabled ("Do not proxy ARP on Destination Interface")</td><td>Zero packets in the outside capture</td><td>Upstream router has no ARP entry for the mapped IP</td></tr>
<tr><td>Mapped address already used by another device</td><td>Intermittent, ARP flapping</td><td><code>show arp</code>, duplicate address logs</td></tr>
<tr><td>PAT pool exhausted or wrong</td><td>New outbound connections fail</td><td>asp drop nat-no-xlate-to-pat-pool</td></tr>
</table>

<h3>Routing fault catalogue</h3>
<table class="cmp"><tr><th>Fault</th><th>Symptom</th><th>Proof</th></tr>
<tr><td>No route to the destination</td><td>packet-tracer ROUTE-LOOKUP drop</td><td><code>show route</code>; asp drop no-route</td></tr>
<tr><td>Default route to a wrong gateway</td><td>Outbound SYN leaves, nothing returns</td><td>Egress capture; <code>show route 0.0.0.0</code></td></tr>
<tr><td>Asymmetric routing</td><td>Return packets dropped as first packet not SYN</td><td>asp drop tcp-not-syn</td></tr>
<tr><td>uRPF on an interface with a missing route back</td><td>Drops of valid sources</td><td>asp drop rpf-violated</td></tr>
<tr><td>Server's own default gateway is not the firewall</td><td>SYN reaches server, SYN-ACK never returns</td><td>dmz capture shows SYN only</td></tr>
</table>
<pre class="out">&gt; show route

Codes: L - local, C - connected, S - static, ...
Gateway of last resort is 203.0.113.1 to network 0.0.0.0

<span class="hl">S*       0.0.0.0 0.0.0.0 [1/0] via 203.0.113.1, outside</span>
C        10.0.1.0 255.255.255.0 is directly connected, inside
L        10.0.1.1 255.255.255.255 is directly connected, inside
C        10.0.2.0 255.255.255.0 is directly connected, dmz
L        10.0.2.1 255.255.255.255 is directly connected, dmz
C        203.0.113.0 255.255.255.248 is directly connected, outside
L        203.0.113.2 255.255.255.255 is directly connected, outside</pre>
<p>Routes on Threat Defense are configured in the Management Center (Devices → Device Management → edit device → Routing) and deployed; <code>show route</code> on the device shows the result.</p>

<div class="eg"><p><b>Worked example: fixing the lab's two faults.</b> In Devices → NAT (the Policies → NAT tab in the lab), edit the static rule for WEB: Translated Source changes from 203.0.113.5 to <b>203.0.113.3</b>. In the access control policy, edit Portal-In: Destination Networks changes from the literal 203.0.113.3 to the object <b>WEB</b> (10.0.2.10). Deploy. Now packet-tracer shows UN-NAT 203.0.113.3 to 10.0.2.10 and "L7 RULE: Portal-In"; <code>show nat</code> shows untranslate_hits rising; Portal-In's Rule Hits rise.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing only one of two faults and declaring "still broken". Writing access rules with the public address because "that is what the partner uses". Adding a static route to fix a NAT problem. Forgetting the server side: if WEB's default gateway is not 10.0.2.1, the SYN arrives but the reply goes elsewhere.</p></div>

<div class="exam"><p><b>Exam trap.</b> On FTD, as on ASA 8.3 and later, access control rules use <b>real</b> addresses. Static NAT divert chooses the egress interface for inbound traffic. Manual NAT Section 1 is checked before auto NAT (Section 2), then Section 3. tcp-not-syn usually means asymmetric routing.</p></div>

<div class="scn"><h4>The published server that answered the wrong way</h4><p>After publishing a new DMZ server, captures on outside showed SYNs arriving and on dmz showed them leaving to the server, but no SYN-ACK ever came back. The server team had built it with its default gateway set to an old router in the DMZ. The server answered through that router, which had no path back. Setting the server's gateway to the firewall's dmz address (10.0.2.1) fixed it.</p><p><b>Lesson:</b> when the firewall forwards correctly and nothing returns, check the server's routing as well as the firewall's.</p></div>

<div class="iv"><p class="q">"A published server is unreachable from the internet after migration. Walk me through NAT checks."</p><p>packet-tracer from outside to the public IP: is there an UN-NAT phase and does it divert to the right interface? <code>show nat</code>: is the mapped address correct and do untranslate_hits rise? Is the access rule using the real address? Is proxy ARP working (outside capture sees packets)? Is a manual NAT in Section 1 overriding it? Then check the server's default gateway with a dmz capture.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static NAT divert, not routing, picks the egress interface for inbound published traffic.</li>
<li>No UN-NAT phase = no NAT rule matches the destination; check the mapped address.</li>
<li>Access rules use real addresses; a rule to the mapped address never hits.</li>
<li>Routing faults show up as no-route, tcp-not-syn and rpf-violated drops.</li>
<li>Always check the return path, including the server's own default gateway.</li>
</ul></div>
`,hi:`
<p>Migration ke baad zyada tar "firewall block karta hai" tickets access control problems hote hi nahi. Woh address problems hote hain: packet galat address par translate hua, bilkul translate nahi hua, ya galat interface se bheja gaya. Perfect security badge wala postman bhi fail hota hai agar envelope par ghar ka number galat ho. Yeh chapter Threat Defense par NAT aur routing faults ka catalogue hai, har ek ke saath woh symptom jo aap dekhoge aur woh command jo use prove karta hai.</p>

<h3>NAT aur routing kaise interact karte hain</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="NAT divert vs route lookup">
<rect x="10" y="80" width="140" height="50" rx="8" fill="#e2e8f0"/><text x="80" y="110" text-anchor="middle" class="svg-ink" font-size="13">dst 203.0.113.3</text>
<rect x="210" y="80" width="140" height="50" rx="8" fill="#bae6fd"/><text x="280" y="102" text-anchor="middle" class="svg-ink" font-size="13">Static NAT</text><text x="280" y="120" text-anchor="middle" class="svg-muted" font-size="12">match hota hai?</text>
<rect x="420" y="20" width="210" height="50" rx="8" fill="#bbf7d0"/><text x="525" y="42" text-anchor="middle" class="svg-ink" font-size="13">Haan: UN-NAT 10.0.2.10</text><text x="525" y="60" text-anchor="middle" class="svg-muted" font-size="12">dmz par NAT divert</text>
<rect x="420" y="140" width="210" height="50" rx="8" fill="#fed7aa"/><text x="525" y="162" text-anchor="middle" class="svg-ink" font-size="13">Nahi: route lookup</text><text x="525" y="180" text-anchor="middle" class="svg-muted" font-size="12">connected: wapas outside</text>
<line x1="150" y1="105" x2="210" y2="105" stroke="#64748b" stroke-width="2"/><line x1="350" y1="95" x2="420" y2="45" stroke="#64748b" stroke-width="2"/><line x1="350" y1="115" x2="420" y2="165" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Published address ke inbound traffic ke liye static NAT egress interface chunta hai. Matching NAT rule ke bina routing table decide karti hai, aksar galat.</p></div>
<p>Published server ke inbound flow ke liye UN-NAT pehle hota hai aur packet ko real interface (dmz) par <b>divert</b> bhi karta hai. Sirf bina NAT divert wala traffic normal route lookup use karta hai. Isiliye tooti lab mein destination 203.0.113.3, jo outside subnet 203.0.113.0/29 ke andar hai, seedha wapas outside se route hua, aur access control check ne OUTSIDE se OUTSIDE dekha.</p>

<h3>NAT fault catalogue</h3>
<table class="cmp"><tr><th>Fault</th><th>Symptom</th><th>Saboot</th></tr>
<tr><td>Galat mapped address (hamari lab: .3 ki jagah .5)</td><td>UN-NAT phase nahi; default action drop</td><td><code>show nat</code>: untranslate_hits 0; <code>show xlate</code></td></tr>
<tr><td>Access rule mapped address use karti hai (hamari lab: Portal-In 203.0.113.3 par)</td><td>UN-NAT chalta hai, phir ACCESS-LIST drop</td><td><code>show access-control-config</code>: Rule Hits 0</td></tr>
<tr><td>Rule order: Section 1 ka broader manual NAT pehle match hota hai</td><td>Unexpected address par translate</td><td><code>show nat detail</code>, packet-tracer NAT phase rule ka naam batata hai</td></tr>
<tr><td>Proxy ARP disabled ("Do not proxy ARP on Destination Interface")</td><td>Outside capture mein zero packets</td><td>Upstream router ke paas mapped IP ki ARP entry nahi</td></tr>
<tr><td>Mapped address pehle se kisi aur device ka</td><td>Intermittent, ARP flapping</td><td><code>show arp</code>, duplicate address logs</td></tr>
<tr><td>PAT pool khatam ya galat</td><td>Naye outbound connections fail</td><td>asp drop nat-no-xlate-to-pat-pool</td></tr>
</table>

<h3>Routing fault catalogue</h3>
<table class="cmp"><tr><th>Fault</th><th>Symptom</th><th>Saboot</th></tr>
<tr><td>Destination ka route nahi</td><td>packet-tracer ROUTE-LOOKUP drop</td><td><code>show route</code>; asp drop no-route</td></tr>
<tr><td>Default route galat gateway par</td><td>Outbound SYN nikalta hai, kuch wapas nahi aata</td><td>Egress capture; <code>show route 0.0.0.0</code></td></tr>
<tr><td>Asymmetric routing</td><td>Return packets first packet not SYN maankar drop</td><td>asp drop tcp-not-syn</td></tr>
<tr><td>Missing route back wale interface par uRPF</td><td>Valid sources ke drops</td><td>asp drop rpf-violated</td></tr>
<tr><td>Server ka apna default gateway firewall nahi</td><td>SYN server tak pahunchta hai, SYN-ACK kabhi wapas nahi aata</td><td>dmz capture sirf SYN dikhata hai</td></tr>
</table>
<pre class="out">&gt; show route

Codes: L - local, C - connected, S - static, ...
Gateway of last resort is 203.0.113.1 to network 0.0.0.0

<span class="hl">S*       0.0.0.0 0.0.0.0 [1/0] via 203.0.113.1, outside</span>
C        10.0.1.0 255.255.255.0 is directly connected, inside
L        10.0.1.1 255.255.255.255 is directly connected, inside
C        10.0.2.0 255.255.255.0 is directly connected, dmz
L        10.0.2.1 255.255.255.255 is directly connected, dmz
C        203.0.113.0 255.255.255.248 is directly connected, outside
L        203.0.113.2 255.255.255.255 is directly connected, outside</pre>
<p>Threat Defense par routes Management Center mein configure hote hain (Devices → Device Management → edit device → Routing) aur deploy hote hain; device par <code>show route</code> result dikhata hai.</p>

<div class="eg"><p><b>Worked example: lab ke do faults theek karna.</b> Devices → NAT (lab mein Policies → NAT tab) mein WEB ki static rule edit karo: Translated Source 203.0.113.5 se <b>203.0.113.3</b> ho jaata hai. Access control policy mein Portal-In edit karo: Destination Networks literal 203.0.113.3 se object <b>WEB</b> (10.0.2.10) ho jaata hai. Deploy. Ab packet-tracer UN-NAT 203.0.113.3 se 10.0.2.10 aur "L7 RULE: Portal-In" dikhata hai; <code>show nat</code> untranslate_hits badhte dikhata hai; Portal-In ke Rule Hits badhte hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Do mein se sirf ek fault theek karke "ab bhi toota hai" declare kar dena. Access rules public address se likhna kyunki "partner wahi use karta hai". NAT problem theek karne ke liye static route jodna. Server side bhoolna: agar WEB ka default gateway 10.0.2.1 nahi hai, to SYN aata hai par reply kahin aur jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> FTD par, ASA 8.3 aur baad ki tarah, access control rules <b>real</b> addresses use karti hain. Inbound traffic ke liye static NAT divert egress interface chunta hai. Manual NAT Section 1 auto NAT (Section 2) se pehle check hota hai, phir Section 3. tcp-not-syn ka matlab aam taur par asymmetric routing hai.</p></div>

<div class="scn"><h4>Woh published server jo galat raaste se jawab deta tha</h4><p>Naya DMZ server publish karne ke baad outside ke captures mein SYN aate dikhe aur dmz par server ki taraf jaate dikhe, par koi SYN-ACK kabhi wapas nahi aaya. Server team ne use DMZ ke ek purane router ko default gateway banakar build kiya tha. Server us router ke through jawab deta tha, jiske paas wapas ka raasta nahi tha. Server ka gateway firewall ke dmz address (10.0.2.1) par set karne se theek ho gaya.</p><p><b>Seekh:</b> jab firewall sahi forward kare aur kuch wapas na aaye, to firewall ke saath server ki routing bhi check karo.</p></div>

<div class="iv"><p class="q">"Migration ke baad published server internet se unreachable hai. Mujhe NAT checks samjhao."</p><p>Outside se public IP tak packet-tracer: kya UN-NAT phase hai aur kya woh sahi interface par divert karta hai? <code>show nat</code>: kya mapped address sahi hai aur kya untranslate_hits badhte hain? Kya access rule real address use karti hai? Kya proxy ARP kaam kar raha hai (outside capture packets dekhta hai)? Kya Section 1 ka koi manual NAT ise override kar raha hai? Phir dmz capture se server ka default gateway check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inbound published traffic ke liye egress interface static NAT divert chunta hai, routing nahi.</li>
<li>UN-NAT phase nahi = koi NAT rule destination se match nahi karti; mapped address check karo.</li>
<li>Access rules real addresses use karti hain; mapped address wali rule kabhi hit nahi hoti.</li>
<li>Routing faults no-route, tcp-not-syn aur rpf-violated drops ke roop mein dikhte hain.</li>
<li>Hamesha return path check karo, server ke apne default gateway samet.</li>
</ul></div>
`}};export{e as default};