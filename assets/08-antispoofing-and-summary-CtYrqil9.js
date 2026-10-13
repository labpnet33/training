var e={id:`antispoofing`,h:{en:`Antispoofing, and summary and exam checklist`,hi:`Antispoofing, aur summary aur exam checklist`},body:{en:`
<p>The last topic of this module is a safety check that the engine runs on every packet: does this source address belong on this interface? We call it antispoofing. After it, you find the summary and exam checklist for the whole module.</p>

<h3>Analogy: the lane check at the gatehouse</h3>
<p>A visitor arrives at the Staff door and says "I live in the server building". The guard thinks: people from the server building use the server door, so this person is lying or lost. The guard stops the visitor. <b>Spoofing</b> means a sender uses a source address that is not really theirs, for example to hide, or to pretend to be a trusted machine. <b>Antispoofing</b> is the defensive control: the engine accepts a packet on an interface only if the source address is expected to be reachable through that interface.</p>

<h3>The reverse-path idea</h3>
<p>The engine asks a simple question for the source address: "If I had to send a reply to this source, which interface would I use?" If the answer is the interface where the packet arrived, the packet looks legitimate. If the answer is a different interface, or no route exists at all, the packet fails the check and is dropped. This is called a <b>reverse-path check</b>. In the NGFW the information comes from the routing configuration of the engine, so <b>your routes are also your antispoofing rules</b>. How exactly the engine builds its antispoofing view and what you can override depends on the NGFW version, so check the documentation for your version.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Reverse path check on the Staff interface">
<rect x="240" y="80" width="160" height="80" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="14">NK-PUNE-FW</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">routing table</text>
<rect x="20" y="95" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="116" text-anchor="middle" class="svg-ink" font-size="12">src 10.1.1.10</text><text x="95" y="133" text-anchor="middle" class="svg-muted" font-size="12">arrives on eth2: passes</text>
<line x1="170" y1="120" x2="240" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#fed7aa"/><text x="545" y="41" text-anchor="middle" class="svg-ink" font-size="12">src 10.1.1.10</text><text x="545" y="58" text-anchor="middle" class="svg-muted" font-size="12">arrives on eth1: dropped</text>
<line x1="470" y1="55" x2="390" y2="95" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<rect x="20" y="175" width="190" height="50" rx="8" fill="#fde68a"/><text x="115" y="196" text-anchor="middle" class="svg-ink" font-size="12">src 10.9.0.5 on eth2, no route</text><text x="115" y="213" text-anchor="middle" class="svg-muted" font-size="12">on that interface: dropped</text>
<line x1="210" y1="190" x2="260" y2="155" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">The route to the source decides which interface may receive it.</p></div>

<h3>Why legitimate traffic gets dropped</h3>
<p>Antispoofing is usually invisible, until you add a network behind a router without telling the engine. Network Kings Pune opens a new office wing 10.1.50.0/24 behind a router that connects to the Staff LAN 10.1.1.0/24. Staff packets from 10.1.50.20 arrive on eth2. If the engine has no route for 10.1.50.0/24 that points out of eth2, then for that source the reverse path is missing or points to the default route on eth1. The engine considers the source impossible on eth2 and drops it, even though the traffic is genuine. People then waste hours on access rules that were fine all along.</p>

<div class="eg"><p><b>Worked example.</b> New wing 10.1.50.0/24, router at 10.1.1.2 on the Staff LAN. Without a route, packets from 10.1.50.20 arrive on eth2 but the engine would reply via the default route on eth1, so the check fails. Add the static route destination 10.1.50.0/24, gateway 10.1.1.2 (inside the eth2 network 10.1.1.0/24, so it passes validation), install the policy, and the source is now expected on eth2. The same traffic passes, and rule matching in Logs shows the normal access rule.</p></div>

<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Where to look</th></tr>
<tr><td>Only a new subnet is dropped, others work</td><td>No route for it on the arrival interface</td><td>Routing view of the engine</td></tr>
<tr><td>Whole interface silent after a change</td><td>Interface address or route changed</td><td>Interface list, installed state</td></tr>
<tr><td>Traffic from the internet claims a private source</td><td>Spoofing or bad routing</td><td>Logs, ISP side</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Blaming the access rules first. Adding a rule for the new subnet when the real problem is the missing route. Disabling checks to get traffic working instead of fixing the route. Forgetting the return route on the other devices too.</p></div>
<div class="exam"><p><b>Exam trap.</b> Antispoofing is not a rule. It is a consequence of the routing information and the interface the packet arrives on. A dropped packet can be the correct behaviour. Also keep the difference: a discard by an access rule is logged with the rule number; an antispoofing drop is a different kind of event, so the log entry tells you which one you are looking at.</p></div>

<div class="scn"><h4>The new wing that could not reach the server</h4><p>A new wing was connected behind a router on the Staff LAN. Users could ping the router but not the web server in the DMZ. The access rule for Staff to DMZ was correct. The engineer looked at routing and found that the engine had no route for the wing subnet. After adding the static route towards the router and installing, the wing worked.</p><p><b>Lesson:</b> when only one subnet fails and rules look right, check whether the engine has a route for that subnet on the interface where the traffic arrives.</p></div>

<div class="iv"><p class="q">"What is antispoofing, and how can it block legitimate traffic?"</p><p>Antispoofing drops packets whose source address is not expected on the arrival interface, based on the routing information (a reverse-path check). It blocks genuine traffic when a network sits behind an interface without a matching route, so the engine thinks the source is impossible there. The fix is the route, not an access rule.</p></div>

<h3>Summary and exam checklist</h3>
<p><b>You should now be able to:</b></p>
<ul>
<li>Explain Interface ID versus port, control interface, NDI and CVI.</li>
<li>Configure interface addresses and prefix lengths, and install the policy.</li>
<li>Create dot1Q VLAN interfaces for Staff and Servers on a trunk and explain the gateway for each.</li>
<li>Write a default route and a static route with a gateway inside an interface network, and explain longest prefix match.</li>
<li>Use an alias with one value per engine, and say what happens when a value is missing.</li>
<li>Describe a cluster in standby mode, the CVI owner and what failover clears.</li>
<li>Explain contact addresses, Locations, and find a stale contact address after a renumber.</li>
<li>Describe DHCP relay (reference only) and antispoofing with the reverse-path idea.</li>
</ul>

<dl class="terms">
<dt>Engine</dt><dd>The firewall software that inspects and forwards traffic, configured from the SMC.</dd>
<dt>NDI</dt><dd>Node Dedicated IP address, belongs to one node.</dd>
<dt>CVI</dt><dd>Cluster Virtual IP address, shared by the cluster nodes.</dd>
<dt>Trunk / dot1Q</dt><dd>A link that carries several VLANs, each tagged with its VLAN ID.</dd>
<dt>Default route</dt><dd>0.0.0.0/0, used when no more specific route matches.</dd>
<dt>Alias</dt><dd>An element whose value is chosen per engine at install time.</dd>
<dt>Location</dt><dd>A group of SMC components that can reach each other on real addresses.</dd>
<dt>Contact address</dt><dd>The address another Location uses to reach a component.</dd>
<dt>Relay agent</dt><dd>Forwards DHCP broadcasts to a server as unicast.</dd>
<dt>Antispoofing</dt><dd>Dropping packets whose source does not fit the arrival interface.</dd>
</dl>

<div class="exam"><p><b>Most tested facts.</b> (1) Nothing reaches the engine before Install policy. (2) A failed install changes nothing. (3) A route gateway must be in an interface network. (4) A missing alias value blocks the install. (5) Cluster node addresses must be in the CVI network. (6) Different Location means contact address, order: Location-specific, default, untranslated. (7) Unknown status with working traffic points to management reachability. (8) Longest prefix wins. (9) DHCP relay and real clusters are not fully simulated here. (10) This course is independent training and does not claim certification coverage.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Antispoofing checks that the source address fits the arrival interface, using routing information.</li>
<li>A missing route for a real subnet can look like a firewall rule problem.</li>
<li>Fix routes first when one subnet fails and the rules are right.</li>
<li>The whole module follows one rule: edit in the SMC, validate, Install policy, then verify.</li>
<li>Next module: policies, rules and the first match.</li>
</ul></div>
`,hi:`
<p>Is module ka aakhri topic ek safety check hai jo engine har packet par chalata hai: kya yeh source address is interface par hona chahiye? Ise antispoofing kehte hain. Uske baad aapko poore module ka summary aur exam checklist milegi.</p>

<h3>Analogy: gatehouse par lane check</h3>
<p>Ek visitor Staff darwaze par aata hai aur kehta hai "main server building mein rehta hoon". Guard sochta hai: server building ke log server darwaze se aate hain, to yeh aadmi jhooth bol raha hai ya bhatak gaya hai. Guard use rok deta hai. <b>Spoofing</b> ka matlab hai sender aisa source address use kare jo asal mein uska nahi hai, jaise chhupne ke liye ya kisi trusted machine ka naam lene ke liye. <b>Antispoofing</b> defensive control hai: engine packet ko interface par tabhi accept karta hai jab source address us interface ke through reachable hone ki ummeed ho.</p>

<h3>Reverse-path ka idea</h3>
<p>Engine source address ke liye ek simple sawal poochta hai: "Agar mujhe is source ko reply bhejna ho, to main kaunsa interface use karunga?" Agar jawab wahi interface hai jahan packet aaya, to packet legitimate lagta hai. Agar jawab doosra interface hai, ya koi route hi nahi, to packet check fail karta hai aur drop hota hai. Isse <b>reverse-path check</b> kehte hain. NGFW mein yeh information engine ki routing configuration se aati hai, isliye <b>aapke routes hi aapke antispoofing rules bhi hain</b>. Engine apna antispoofing view kaise banata hai aur aap kya override kar sakte ho, yeh NGFW version par depend karta hai, isliye apne version ki documentation check karo.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Staff interface par reverse path check">
<rect x="240" y="80" width="160" height="80" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="14">NK-PUNE-FW</text><text x="320" y="138" text-anchor="middle" class="svg-muted" font-size="12">routing table</text>
<rect x="20" y="95" width="150" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="116" text-anchor="middle" class="svg-ink" font-size="12">src 10.1.1.10</text><text x="95" y="133" text-anchor="middle" class="svg-muted" font-size="12">eth2 par aaya: pass</text>
<line x1="170" y1="120" x2="240" y2="120" stroke="#64748b" stroke-width="2"/>
<rect x="470" y="20" width="150" height="50" rx="8" fill="#fed7aa"/><text x="545" y="41" text-anchor="middle" class="svg-ink" font-size="12">src 10.1.1.10</text><text x="545" y="58" text-anchor="middle" class="svg-muted" font-size="12">eth1 par aaya: drop</text>
<line x1="470" y1="55" x2="390" y2="95" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<rect x="20" y="175" width="190" height="50" rx="8" fill="#fde68a"/><text x="115" y="196" text-anchor="middle" class="svg-ink" font-size="12">src 10.9.0.5 eth2 par, route nahi</text><text x="115" y="213" text-anchor="middle" class="svg-muted" font-size="12">us interface par: drop</text>
<line x1="210" y1="190" x2="260" y2="155" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
</svg><p class="cap">Source tak ka route decide karta hai ki kaunsa interface use receive kar sakta hai.</p></div>

<h3>Legitimate traffic kyun drop hota hai</h3>
<p>Antispoofing aam taur par dikhta nahi, jab tak aap engine ko bataye bina router ke peeche naya network nahi jodte. Network Kings Pune office ka naya wing 10.1.50.0/24 kholta hai, jo Staff LAN 10.1.1.0/24 se jude router ke peeche hai. 10.1.50.20 ke Staff packets eth2 par aate hain. Agar engine ke paas 10.1.50.0/24 ka koi route nahi jo eth2 se bahar jaye, to us source ke liye reverse path ya to missing hai ya eth1 ke default route ki taraf jata hai. Engine maanta hai ki source eth2 par impossible hai aur use drop kar deta hai, chahe traffic asli ho. Phir log ghante access rules par barbaad karte hain jo pehle se theek the.</p>

<div class="eg"><p><b>Worked example.</b> Naya wing 10.1.50.0/24, router 10.1.1.2 par Staff LAN mein. Route ke bina 10.1.50.20 ke packets eth2 par aate hain lekin engine reply eth1 ke default route se bhejta, isliye check fail hota hai. Static route jodo: destination 10.1.50.0/24, gateway 10.1.1.2 (eth2 network 10.1.1.0/24 ke andar, to validation pass hoti hai), policy install karo, aur ab source eth2 par expected hai. Wahi traffic pass hota hai, aur Logs mein normal access rule match dikhta hai.</p></div>

<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Kahan dekhein</th></tr>
<tr><td>Sirf naya subnet drop ho raha hai, baaki chal rahe hain</td><td>Arrival interface par uska route nahi</td><td>Engine ka Routing view</td></tr>
<tr><td>Change ke baad poora interface chup</td><td>Interface address ya route badla</td><td>Interface list, installed state</td></tr>
<tr><td>Internet se aaya traffic private source batata hai</td><td>Spoofing ya kharab routing</td><td>Logs, ISP side</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> Sabse pehle access rules ko doshi thehrana. Naye subnet ke liye rule jodna jabki asli dikkat missing route hai. Traffic chalane ke liye checks disable kar dena, route fix karne ke bajay. Doosre devices par return route bhool jana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Antispoofing rule nahi hai. Yeh routing information aur packet ke arrival interface ka nateeja hai. Dropped packet sahi behaviour bhi ho sakta hai. Yeh fark bhi rakho: access rule ka discard rule number ke saath log hota hai; antispoofing drop alag kism ka event hai, isliye log entry batati hai ki aap kaunsa dekh rahe ho.</p></div>

<div class="scn"><h4>Naya wing jo server tak nahi pahunch pa raha tha</h4><p>Naya wing Staff LAN par ek router ke peeche jodha gaya. Users router ko ping kar pa rahe the lekin DMZ ke web server ko nahi. Staff to DMZ ka access rule sahi tha. Engineer ne routing dekhi aur paya ki engine ke paas wing subnet ka route nahi hai. Router ki taraf static route jodkar install karne ke baad wing chalne laga.</p><p><b>Lesson:</b> jab sirf ek subnet fail ho aur rules sahi dikhein, to check karo ki engine ke paas us subnet ka route us interface par hai ya nahi jahan traffic aata hai.</p></div>

<div class="iv"><p class="q">"Antispoofing kya hai, aur woh legitimate traffic ko kaise block kar sakta hai?"</p><p>Antispoofing un packets ko drop karta hai jinka source address arrival interface par expected nahi hai, routing information ke base par (reverse-path check). Yeh genuine traffic ko tab block karta hai jab koi network aise interface ke peeche ho jiske liye matching route na ho, to engine sochta hai ki source wahan impossible hai. Fix route hai, access rule nahi.</p></div>

<h3>Summary aur exam checklist</h3>
<p><b>Ab aap yeh kar sakte ho:</b></p>
<ul>
<li>Interface ID versus port, control interface, NDI aur CVI samjha sakte ho.</li>
<li>Interface addresses aur prefix lengths configure kar sakte ho, aur policy install kar sakte ho.</li>
<li>Trunk par Staff aur Servers ke liye dot1Q VLAN interfaces bana sakte ho aur har ka gateway samjha sakte ho.</li>
<li>Interface network ke andar ke gateway ke saath default route aur static route likh sakte ho, aur longest prefix match samjha sakte ho.</li>
<li>Har engine ki ek value wala alias use kar sakte ho, aur bata sakte ho value missing ho to kya hota hai.</li>
<li>Standby mode ka cluster, CVI owner aur failover kya clear karta hai, yeh describe kar sakte ho.</li>
<li>Contact addresses, Locations samjha sakte ho, aur renumber ke baad stale contact address dhundh sakte ho.</li>
<li>DHCP relay (sirf reference) aur reverse-path idea ke saath antispoofing describe kar sakte ho.</li>
</ul>

<dl class="terms">
<dt>Engine</dt><dd>Firewall software jo traffic inspect aur forward karta hai, SMC se configure hota hai.</dd>
<dt>NDI</dt><dd>Node Dedicated IP address, ek node ka.</dd>
<dt>CVI</dt><dd>Cluster Virtual IP address, cluster nodes share karte hain.</dd>
<dt>Trunk / dot1Q</dt><dd>Aisa link jo kai VLANs carry karta hai, har ek VLAN ID se tagged.</dd>
<dt>Default route</dt><dd>0.0.0.0/0, tab use hota hai jab koi specific route match na kare.</dd>
<dt>Alias</dt><dd>Aisa element jiski value install time par har engine ke liye chuni jati hai.</dd>
<dt>Location</dt><dd>SMC components ka group jo asli addresses par ek dusre tak pahunch sakte hain.</dd>
<dt>Contact address</dt><dd>Woh address jo doosra Location kisi component tak pahunchne ke liye use karta hai.</dd>
<dt>Relay agent</dt><dd>DHCP broadcasts ko server tak unicast ki tarah forward karta hai.</dd>
<dt>Antispoofing</dt><dd>Un packets ko drop karna jinka source arrival interface se match nahi karta.</dd>
</dl>

<div class="exam"><p><b>Sabse zyada poochhe jaane wale facts.</b> (1) Install policy se pehle engine tak kuch nahi pahunchta. (2) Failed install kuch nahi badalta. (3) Route gateway interface network mein hona chahiye. (4) Missing alias value install block karti hai. (5) Cluster node addresses CVI network mein hone chahiye. (6) Alag Location ka matlab contact address, order: Location-specific, default, untranslated. (7) Traffic chal raha ho aur status Unknown ho to management reachability dekho. (8) Longest prefix jeetta hai. (9) DHCP relay aur real clusters yahan poori tarah simulate nahi hote. (10) Yeh course independent training hai aur certification coverage ka claim nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Antispoofing routing information se check karta hai ki source address arrival interface se match karta hai.</li>
<li>Asli subnet ka missing route firewall rule ki problem jaisa dikh sakta hai.</li>
<li>Ek subnet fail ho aur rules sahi hon to pehle routes fix karo.</li>
<li>Poora module ek rule follow karta hai: SMC mein edit, validate, Install policy, phir verify.</li>
<li>Agla module: policies, rules aur first match.</li>
</ul></div>
`}};export{e as default};