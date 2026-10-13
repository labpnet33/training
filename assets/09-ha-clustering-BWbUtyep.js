var e={id:`ha-clustering`,h:{en:`High availability: redundant controllers, Manager clusters and disaster recovery`,hi:`High availability: redundant controllers, Manager clusters aur disaster recovery`},body:{en:`
<p>An airport has more than one runway, more than one fuel supplier and a backup control tower. Not because the first ones fail often, but because the cost of failure is very high. The SD-WAN controllers deserve the same thinking. The data plane keeps carrying traffic for a while if the controllers fail, but no new site can join, no routes can change and no one can see or manage anything. High availability (HA) is how you make sure a single failure never reaches that point.</p>

<h3>One HA method per controller type</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="High availability per controller type">
<rect x="10" y="15" width="200" height="150" rx="12" fill="#ddd6fe"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">Validator</text><text x="110" y="62" text-anchor="middle" class="svg-muted" font-size="11">Two or more instances</text><text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="11">One DNS name,</text><text x="110" y="98" text-anchor="middle" class="svg-muted" font-size="11">many addresses</text><text x="110" y="116" text-anchor="middle" class="svg-muted" font-size="11">Edges try each</text><text x="110" y="145" text-anchor="middle" class="svg-ink" font-size="11">Active-active</text>
<rect x="225" y="15" width="200" height="150" rx="12" fill="#bae6fd"/><text x="325" y="38" text-anchor="middle" class="svg-ink" font-size="14">Controller</text><text x="325" y="62" text-anchor="middle" class="svg-muted" font-size="11">Two or more instances</text><text x="325" y="80" text-anchor="middle" class="svg-muted" font-size="11">Each edge connects</text><text x="325" y="98" text-anchor="middle" class="svg-muted" font-size="11">to several at once</text><text x="325" y="116" text-anchor="middle" class="svg-muted" font-size="11">Controller groups</text><text x="325" y="145" text-anchor="middle" class="svg-ink" font-size="11">Active-active</text>
<rect x="440" y="15" width="190" height="150" rx="12" fill="#fde68a"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="14">Manager</text><text x="535" y="62" text-anchor="middle" class="svg-muted" font-size="11">Cluster of nodes</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="11">for scale and local HA</text><text x="535" y="98" text-anchor="middle" class="svg-muted" font-size="11">Standby cluster for</text><text x="535" y="116" text-anchor="middle" class="svg-muted" font-size="11">disaster recovery</text><text x="535" y="145" text-anchor="middle" class="svg-ink" font-size="11">Active-standby DR</text>
<rect x="30" y="185" width="580" height="60" rx="10" fill="#f1f5f9"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">Spread the instances across at least two sites or availability zones.</text><text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="11">Redundancy in one rack protects against a failed VM, not against a failed site.</text>
</svg><p class="cap">Validators and Controllers are active-active. The Manager is clustered and has a standby for disaster recovery.</p></div>

<h3>Redundant Validators</h3>
<p>Run at least two Validators. Give edges one DNS name that resolves to the addresses of all the Validators. An edge tries the addresses returned. If one Validator is down, it tries the next. Each Validator is its own device, with its own system IP, certificate and the same organization name. Because Validators are stateless in their work (they authenticate and refer), they have no data to synchronise.</p>

<h3>Redundant Controllers</h3>
<p>Run at least two Controllers. Each edge connects to up to the number set by <code>max-control-connections</code> (default 2) per transport, so with two Controllers it is connected to both and has two OMP sessions. Both hold the same view of routes and policy because they receive the same OMP information and the same centralized policy from the Manager. If one fails, the edge still has the other, and the data plane is not touched. Use controller groups (chapter 3) to assign the edges to the Controllers in different data centres so that the load is shared in normal times.</p>

<h3>What happens while the controllers are away</h3>
<p>If all Controllers become unreachable, edges keep the last OMP state they have for a <b>graceful restart</b> period. This timer is long, hours by default. During this time the existing IPsec tunnels, BFD sessions and routes continue to work. After the timer expires, the routes learned from the Controllers are removed. Therefore a short outage hurts only changes, while a long one hurts traffic. The goal of HA is that the short outage never becomes a long one.</p>

<h3>The Manager cluster</h3>
<p>For a larger fabric, the Manager is not a single VM but a <b>cluster</b> of nodes, commonly three. A cluster provides scale and local redundancy. The nodes run different services: the application server, the statistics database, the configuration database, the messaging service and others. A node can have a persona that decides which services it runs, for example a node that runs everything, a node for computing, or a node that only stores data. The nodes talk to each other on a dedicated cluster interface, which should be on a private network with low delay.</p>
<table class="cmp"><tr><th>Point</th><th>Detail</th></tr>
<tr><td>Cluster size</td><td>Commonly three nodes for a mid-size fabric, more for the largest</td></tr>
<tr><td>Cluster interface</td><td>A separate interface, reachable only by the nodes themselves</td></tr>
<tr><td>Versions</td><td>All nodes must run the same software version</td></tr>
<tr><td>Edges</td><td>Each edge keeps one Manager connection, to one of the nodes</td></tr>
<tr><td>Loss of a node</td><td>The cluster continues, with reduced capacity and less redundancy</td></tr></table>

<h3>Disaster recovery for the Manager</h3>
<p>A cluster lives in one location. To survive the loss of a whole data centre, the Manager uses <b>disaster recovery</b>: a second, standby cluster in another location. The configuration data is replicated from the active cluster to the standby on a schedule. If the primary site fails, an administrator performs a switchover and the standby becomes active, and the controllers and edges reconnect to it. Ask for the exact automation options of your release, since they have changed over time.</p>

<div class="eg"><p><b>A design on one page.</b> Two data centres, Mumbai (site 1) and Delhi (site 2). Two Validators, one in each, behind a single DNS name. Two Controllers, one in each, as controller groups 1 and 2. A three-node Manager cluster in Mumbai and a standby cluster in Delhi for disaster recovery. Each Mumbai failure removes one of each pair, and Delhi carries on. Total controller instances: 2 Validators, 2 Controllers, 3 Manager nodes, 3 standby Manager nodes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Putting both Controllers on one hypervisor host or one site; forgetting to update certificates on the second Validator; running different software versions on cluster nodes; treating a cluster as disaster recovery (it is not, if it is all in one place); never testing a switchover.</p></div>

<div class="exam"><p><b>Exam traps.</b> Validators and Controllers are made redundant by adding instances; the Manager is made redundant by a cluster and disaster recovery. A Manager cluster does not protect against the loss of a whole site. Edges keep running on the old OMP state during a controller outage.</p></div>

<div class="scn"><h4>The planned test that found a gap</h4><p>A bank tested its disaster recovery by switching off the primary Manager cluster. The standby took over, but edges did not reconnect to it for twenty minutes. The reason was that the standby's Manager address was not in the firewall rules at the branches. After the test, the rules were updated and the switchover repeated in under three minutes. The test cost an hour; a real failure without it would have cost a day.</p><p><b>Lesson:</b> test the recovery path, including the network, before you need it.</p></div>

<div class="iv"><p class="q">"How would you make the SD-WAN control plane highly available?"</p><p>Strong answer: two or more Validators behind one DNS name, two or more Controllers with controller groups, a Manager cluster plus a disaster-recovery standby in another site. Spread everything over at least two locations, size for the loss of one, and test the failover. Mention that data-plane traffic continues during a controller outage for the graceful-restart period.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Validators and Controllers: add instances, spread across sites.</li>
<li>Manager: a cluster for scale, a standby cluster for disaster recovery.</li>
<li>One DNS name for several Validators lets edges try each.</li>
<li>During a controller outage the data plane continues for the graceful-restart period.</li>
<li>Test the switchover, including firewall rules.</li>
</ul></div>
`,hi:`
<p>Airport ke paas ek se zyada runway, ek se zyada fuel supplier aur backup control tower hota hai. Isliye nahi ki pehle wale aksar fail hote hain, balki isliye ki failure ki keemat bahut zyada hai. SD-WAN controllers ko bhi yahi soch chahiye. Agar controllers fail ho jayein to data plane kuch der traffic carry karta rehta hai, par koi nayi site join nahi kar sakti, koi route badal nahi sakta aur koi kuch dekh ya manage nahi kar sakta. High availability (HA) wo tareeka hai jisse ek akela failure kabhi us point tak nahi pahunchta.</p>

<h3>Har controller type ke liye ek HA tareeka</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Har controller type ke liye high availability">
<rect x="10" y="15" width="200" height="150" rx="12" fill="#ddd6fe"/><text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">Validator</text><text x="110" y="62" text-anchor="middle" class="svg-muted" font-size="11">Do ya zyada instances</text><text x="110" y="80" text-anchor="middle" class="svg-muted" font-size="11">Ek DNS name,</text><text x="110" y="98" text-anchor="middle" class="svg-muted" font-size="11">kai addresses</text><text x="110" y="116" text-anchor="middle" class="svg-muted" font-size="11">Edges har ek try karte hain</text><text x="110" y="145" text-anchor="middle" class="svg-ink" font-size="11">Active-active</text>
<rect x="225" y="15" width="200" height="150" rx="12" fill="#bae6fd"/><text x="325" y="38" text-anchor="middle" class="svg-ink" font-size="14">Controller</text><text x="325" y="62" text-anchor="middle" class="svg-muted" font-size="11">Do ya zyada instances</text><text x="325" y="80" text-anchor="middle" class="svg-muted" font-size="11">Har edge ek saath kai se</text><text x="325" y="98" text-anchor="middle" class="svg-muted" font-size="11">connect hota hai</text><text x="325" y="116" text-anchor="middle" class="svg-muted" font-size="11">Controller groups</text><text x="325" y="145" text-anchor="middle" class="svg-ink" font-size="11">Active-active</text>
<rect x="440" y="15" width="190" height="150" rx="12" fill="#fde68a"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="14">Manager</text><text x="535" y="62" text-anchor="middle" class="svg-muted" font-size="11">Nodes ka cluster</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="11">scale aur local HA ke liye</text><text x="535" y="98" text-anchor="middle" class="svg-muted" font-size="11">Disaster recovery ke liye</text><text x="535" y="116" text-anchor="middle" class="svg-muted" font-size="11">standby cluster</text><text x="535" y="145" text-anchor="middle" class="svg-ink" font-size="11">Active-standby DR</text>
<rect x="30" y="185" width="580" height="60" rx="10" fill="#f1f5f9"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">Instances ko kam se kam do sites ya availability zones mein failao.</text><text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="11">Ek rack mein redundancy kharab VM se bachati hai, kharab site se nahi.</text>
</svg><p class="cap">Validators aur Controllers active-active hain. Manager clustered hai aur disaster recovery ke liye standby rakhta hai.</p></div>

<h3>Redundant Validators</h3>
<p>Kam se kam do Validators chalao. Edges ko ek DNS name do jo saare Validators ke addresses par resolve ho. Edge lautaye gaye addresses try karta hai. Agar ek Validator down hai to woh agla try karta hai. Har Validator apna alag device hai, apne system IP, certificate aur same organization name ke saath. Kyunki Validators apne kaam mein stateless hain (woh authenticate karte aur refer karte hain), unme synchronise karne ke liye data nahi hota.</p>

<h3>Redundant Controllers</h3>
<p>Kam se kam do Controllers chalao. Har edge per transport <code>max-control-connections</code> (default 2) tak connect hota hai, isliye do Controllers ke saath woh dono se connected hota hai aur uske do OMP sessions hote hain. Dono ke paas routes aur policy ka same view hota hai kyunki unhe same OMP information aur Manager se same centralized policy milti hai. Agar ek fail ho to edge ke paas doosra rehta hai, aur data plane ko chhua nahi jaata. Controller groups (chapter 3) se edges ko alag data centres ke Controllers mein assign karo taaki normal samay mein load baanta rahe.</p>

<h3>Jab controllers door hon</h3>
<p>Agar saare Controllers unreachable ho jayein to edges apne paas ki last OMP state ek <b>graceful restart</b> period tak rakhte hain. Yeh timer lamba hota hai, default roop se ghante. Is dauran maujooda IPsec tunnels, BFD sessions aur routes chalte rehte hain. Timer khatam hone ke baad Controllers se seekhe routes hata diye jaate hain. Isliye chhota outage sirf changes ko chot pahunchata hai, jabki lamba outage traffic ko. HA ka lakshya yeh hai ki chhota outage kabhi lamba na ban jaye.</p>

<h3>Manager cluster</h3>
<p>Bade fabric ke liye Manager ek VM nahi balki nodes ka <b>cluster</b> hota hai, aam taur par teen. Cluster scale aur local redundancy deta hai. Nodes alag services chalate hain: application server, statistics database, configuration database, messaging service aur doosri. Node ka ek persona hota hai jo tay karta hai ki woh kaunsi services chalaye, jaise sab kuch chalane wala node, computing ke liye node, ya sirf data store karne wala node. Nodes ek dedicated cluster interface par aapas mein baat karte hain, jo kam delay wale private network par hona chahiye.</p>
<table class="cmp"><tr><th>Point</th><th>Detail</th></tr>
<tr><td>Cluster size</td><td>Madhyam fabric ke liye aam taur par teen nodes, sabse bade ke liye zyada</td></tr>
<tr><td>Cluster interface</td><td>Alag interface, sirf nodes ke liye reachable</td></tr>
<tr><td>Versions</td><td>Saare nodes same software version chalayein</td></tr>
<tr><td>Edges</td><td>Har edge ek Manager connection rakhta hai, kisi ek node se</td></tr>
<tr><td>Node ka khona</td><td>Cluster chalta rehta hai, kam capacity aur kam redundancy ke saath</td></tr></table>

<h3>Manager ke liye disaster recovery</h3>
<p>Cluster ek location mein rehta hai. Poore data centre ke khone se bachne ke liye Manager <b>disaster recovery</b> use karta hai: doosri location mein doosra, standby cluster. Configuration data active cluster se standby tak schedule par replicate hota hai. Agar primary site fail ho, administrator switchover karta hai aur standby active ho jaata hai, aur controllers aur edges uske saath reconnect karte hain. Apni release ke exact automation options pooch lo, kyunki woh samay ke saath badle hain.</p>

<div class="eg"><p><b>Ek page par design.</b> Do data centres, Mumbai (site 1) aur Delhi (site 2). Do Validators, har ek mein ek, ek DNS name ke peeche. Do Controllers, har ek mein ek, controller groups 1 aur 2 ke roop mein. Mumbai mein teen-node Manager cluster aur Delhi mein disaster recovery ke liye standby cluster. Mumbai ka har failure har jodi se ek hata deta hai, aur Delhi chalta rehta hai. Total controller instances: 2 Validators, 2 Controllers, 3 Manager nodes, 3 standby Manager nodes.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Dono Controllers ko ek hypervisor host ya ek site par rakhna; doosre Validator par certificates update karna bhoolna; cluster nodes par alag software versions chalana; cluster ko disaster recovery samajhna (agar sab ek hi jagah hai to woh nahi hai); switchover ko kabhi test na karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Validators aur Controllers instances jodkar redundant bante hain; Manager cluster aur disaster recovery se. Manager cluster poori site ke khone se nahi bachata. Controller outage mein edges purani OMP state par chalte rehte hain.</p></div>

<div class="scn"><h4>Planned test jisne gap dhoondha</h4><p>Ek bank ne primary Manager cluster band karke apni disaster recovery test ki. Standby ne kaam sambhala, par edges bees minute tak usse reconnect nahi hue. Wajah yeh thi ki standby ka Manager address branches ke firewall rules mein nahi tha. Test ke baad rules update kiye gaye aur switchover teen minute se kam mein dohraya gaya. Test mein ek ghanta laga; uske bina asli failure mein ek din lagta.</p><p><b>Seekh:</b> recovery path ko, network samet, zaroorat se pehle test karo.</p></div>

<div class="iv"><p class="q">"SD-WAN control plane ko highly available kaise banaoge?"</p><p>Strong answer: ek DNS name ke peeche do ya zyada Validators, controller groups ke saath do ya zyada Controllers, Manager cluster aur doosri site mein disaster-recovery standby. Sab kuch kam se kam do locations mein failao, ek ke khone ke liye size karo, aur failover test karo. Kaho ki controller outage mein data-plane traffic graceful-restart period tak chalta rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Validators aur Controllers: instances jodo, sites mein failao.</li>
<li>Manager: scale ke liye cluster, disaster recovery ke liye standby cluster.</li>
<li>Kai Validators ke liye ek DNS name edges ko har ek try karne deta hai.</li>
<li>Controller outage mein data plane graceful-restart period tak chalta hai.</li>
<li>Switchover test karo, firewall rules samet.</li>
</ul></div>
`}};export{e as default};