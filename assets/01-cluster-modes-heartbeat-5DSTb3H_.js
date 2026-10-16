var e={id:`cluster-heartbeat`,h:{en:`Cluster modes and the heartbeat`,hi:`Cluster modes aur heartbeat`},body:{en:`
<p><b>What you will learn in this module.</b> You will form a two-node firewall cluster, read and change node states, browse and filter logs, set up alerts, understand snapshots and rollback, and follow a fixed troubleshooting order. This is independent training based on published documentation; it does not claim to cover any certification. The tagline of the console is simple: click-ops, but you understand what each click does.</p>
<p><b>Prerequisites.</b> You should have finished the earlier modules of this track: first contact between the Security Management Center (SMC) and an engine, interfaces and routes, access rules and install, NAT, inspection and VPN. If you know that nothing reaches the engine until you press Install policy, you are ready.</p>

<h3>Start with an analogy: two guards on one gate</h3>
<p>Imagine the MyPnetLab Pune branch has one gate. A single guard is a risk: if he falls ill, the gate is unmanned. So the company posts two guards, FW1A and FW1B. Both stand ready, but visitors always speak to the guard whose name is on the gate board. If that guard leaves, the other steps forward and takes the same board. Visitors do not need to learn a new name. That shared name is the idea behind a firewall <b>cluster</b>.</p>

<h3>The pieces of a cluster</h3>
<ul>
<li><b>Node:</b> one physical or virtual engine inside the cluster. Here: FW1A and FW1B.</li>
<li><b>CVI (cluster virtual IP address):</b> the address that clients and neighbours use, for example the default gateway of the Staff LAN. It belongs to the cluster, not to one box. The node that owns it answers ARP for it.</li>
<li><b>NDI (node dedicated IP address):</b> a unique address of each node on the same network, used for management and for talking to one specific node.</li>
<li><b>Heartbeat link:</b> a private link between the nodes. They use it to tell each other "I am alive". When the heartbeat stops, the survivor takes over.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Two-node cluster with CVI, NDIs and heartbeat">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="14">NK-SMC</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.0.0.10</text>
<rect x="110" y="140" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="185" y="168" text-anchor="middle" class="svg-ink" font-size="14">FW1A (online)</text><text x="185" y="190" text-anchor="middle" class="svg-muted" font-size="12">owns the CVI</text>
<rect x="380" y="140" width="150" height="70" rx="8" fill="#fde68a"/><text x="455" y="168" text-anchor="middle" class="svg-ink" font-size="14">FW1B (standby)</text><text x="455" y="190" text-anchor="middle" class="svg-muted" font-size="12">waits, does not forward</text>
<line x1="260" y1="175" x2="380" y2="175" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">heartbeat</text>
<line x1="185" y1="80" x2="185" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="400" y="20" width="220" height="60" rx="8" fill="#ddd6fe"/><text x="510" y="46" text-anchor="middle" class="svg-ink" font-size="13">Staff LAN 10.1.1.0/24</text><text x="510" y="66" text-anchor="middle" class="svg-muted" font-size="12">gateway = CVI</text>
<line x1="455" y1="80" x2="455" y2="140" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
</svg><p class="cap">Clients talk to the CVI. Only the node that is online owns it. The heartbeat tells the nodes whether the partner is alive.</p></div>

<h3>Two cluster modes</h3>
<table class="cmp"><tr><th>Mode</th><th>How nodes behave</th><th>When to choose</th></tr>
<tr><td><b>Standby</b></td><td>One node is online and handles all traffic. The other waits in standby and takes over on failure.</td><td>Simple, predictable, easy to troubleshoot. Good for a branch.</td></tr>
<tr><td><b>Balancing</b></td><td>All online nodes share the traffic load. If one fails, the rest carry on.</td><td>When one node cannot carry the load and you want to use both.</td></tr>
</table>
<p>The cluster mode is set on the engine element in the SMC and becomes real only after Install policy. In this lab we use standby mode so that the owner of the CVI is always easy to name: the first node that is online.</p>

<div class="eg"><p><b>Worked example.</b> NK-PUNE-FW becomes a cluster. The Staff LAN CVI is 10.1.1.1/24, the gateway all PCs already use. FW1A gets NDI 10.1.1.2 and FW1B gets NDI 10.1.1.3 (use the addresses your lab shows). FW1A is online, so it answers ARP for 10.1.1.1. STAFF-PC at 10.1.1.10 notices nothing different except that the box behind the gateway is now one of two.</p></div>

<h3>What a failover really does</h3>
<p>When FW1A fails or is taken offline, FW1B (online, or brought online with the node command) becomes the owner and answers ARP for the CVI. Two consequences matter, and the simulator teaches both exactly:</p>
<ul>
<li><b>No connection state sync in the lab.</b> The nodes do not copy their connection tables to each other. The new owner knows nothing about connections the old owner tracked.</li>
<li><b>Failover clears connections and flushes ARP caches.</b> A user in the middle of a download must start again. After the change the neighbours learn the CVI again.</li>
</ul>
<p>Real products may offer state synchronisation, and real heartbeat timers and detection times exist. Those are not modelled here. For real timing and options, check the documentation for your NGFW version.</p>

<pre class="out">FW1A$ sg-cluster status
Cluster NK-PUNE-FW (standby mode)
  FW1A (this node): <span class="hl">Online</span>
  FW1B: <span class="hl">Standby</span></pre>

<div class="warn"><p><b>Common mistake.</b> Giving a node address outside the CVI network. The install is blocked by validation: a cluster node address must sit in the CVI network. Also, pointing PCs at an NDI instead of the CVI means traffic dies when that node fails.</p></div>

<div class="exam"><p><b>Exam trap.</b> The node dedicated IP is for reaching one node; the CVI is for everyone else. Mixing them up is the most common wrong answer.</p></div>

<div class="scn"><h4>The gateway that survived a power cut</h4><p>A branch engine lost power during a storm. Staff saw a short pause, then web access worked again, though open downloads restarted. The engineer opened the cluster view: FW1A offline, FW1B online. Because the PCs used the CVI as gateway, no PC settings changed. Because there is no connection sync, the old sessions were gone.</p><p><b>Lesson:</b> a cluster hides which box is working, not the fact that connections restart.</p></div>

<div class="iv"><p class="q">"What is the difference between CVI and NDI?"</p><p>Strong answer: the CVI is the shared cluster address that clients use as gateway and that the active node answers for. An NDI is the unique address of one node, used for management and node-specific traffic. Add that failover moves the CVI and clears connections when there is no state sync.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A cluster is two or more nodes acting as one gateway through the CVI.</li>
<li>Each node also has its own NDI; the heartbeat link carries the "I am alive" signal.</li>
<li>Standby: one node works. Balancing: online nodes share load.</li>
<li>The first online node owns the CVI; in standby mode the others do not forward.</li>
<li>In the lab, failover clears connections and ARP caches; there is no state sync.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap do-node firewall cluster banaoge, node states padhoge aur badloge, logs browse aur filter karoge, alerts set karoge, snapshots aur rollback samjhoge, aur ek fixed troubleshooting order follow karoge. Yeh independent training hai jo published documentation par based hai; yeh kisi certification ko cover karne ka claim nahi karti. Console ki tagline simple hai: click-ops, but you understand what each click does.</p>
<p><b>Prerequisites.</b> Is track ke pichle modules aap complete kar chuke hone chahiye: Security Management Center (SMC) aur engine ka first contact, interfaces aur routes, access rules aur install, NAT, inspection aur VPN. Agar aapko pata hai ki Install policy dabane tak engine tak kuch nahi pahunchta, to aap ready ho.</p>

<h3>Analogy se shuru karo: ek gate par do guards</h3>
<p>Socho MyPnetLab Pune branch ka ek hi gate hai. Ek hi guard risk hai: woh bimar pade to gate khaali. Isliye company do guards lagati hai, FW1A aur FW1B. Dono ready khade hain, lekin visitors hamesha us guard se baat karte hain jiska naam gate board par hai. Woh guard chala jaye to dusra aage aata hai aur wahi board le leta hai. Visitors ko naya naam seekhna nahi padta. Yeh shared naam hi firewall <b>cluster</b> ka idea hai.</p>

<h3>Cluster ke hisse</h3>
<ul>
<li><b>Node:</b> cluster ke andar ek physical ya virtual engine. Yahan: FW1A aur FW1B.</li>
<li><b>CVI (cluster virtual IP address):</b> woh address jo clients aur neighbours use karte hain, jaise Staff LAN ka default gateway. Yeh cluster ka hai, ek box ka nahi. Jis node ke paas yeh hai woh iske liye ARP ka jawab deta hai.</li>
<li><b>NDI (node dedicated IP address):</b> har node ka unique address usi network par, management aur kisi ek specific node se baat karne ke liye.</li>
<li><b>Heartbeat link:</b> nodes ke beech private link. Nodes ek dusre ko "main zinda hoon" batate hain. Heartbeat ruk jaye to bacha hua node takeover karta hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="CVI, NDI aur heartbeat ke saath do-node cluster">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="14">NK-SMC</text><text x="105" y="68" text-anchor="middle" class="svg-muted" font-size="12">10.0.0.10</text>
<rect x="110" y="140" width="150" height="70" rx="8" fill="#bbf7d0"/><text x="185" y="168" text-anchor="middle" class="svg-ink" font-size="14">FW1A (online)</text><text x="185" y="190" text-anchor="middle" class="svg-muted" font-size="12">CVI ka owner</text>
<rect x="380" y="140" width="150" height="70" rx="8" fill="#fde68a"/><text x="455" y="168" text-anchor="middle" class="svg-ink" font-size="14">FW1B (standby)</text><text x="455" y="190" text-anchor="middle" class="svg-muted" font-size="12">wait karta hai, forward nahi</text>
<line x1="260" y1="175" x2="380" y2="175" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="165" text-anchor="middle" class="svg-accent" font-size="12">heartbeat</text>
<line x1="185" y1="80" x2="185" y2="140" stroke="#64748b" stroke-width="2"/>
<rect x="400" y="20" width="220" height="60" rx="8" fill="#ddd6fe"/><text x="510" y="46" text-anchor="middle" class="svg-ink" font-size="13">Staff LAN 10.1.1.0/24</text><text x="510" y="66" text-anchor="middle" class="svg-muted" font-size="12">gateway = CVI</text>
<line x1="455" y1="80" x2="455" y2="140" stroke="#64748b" stroke-width="1" stroke-dasharray="3 3"/>
</svg><p class="cap">Clients CVI se baat karte hain. Sirf online node ke paas CVI hota hai. Heartbeat nodes ko batata hai ki partner zinda hai ya nahi.</p></div>

<h3>Do cluster modes</h3>
<table class="cmp"><tr><th>Mode</th><th>Nodes kaise behave karte hain</th><th>Kab chunen</th></tr>
<tr><td><b>Standby</b></td><td>Ek node online hai aur saara traffic sambhalta hai. Dusra standby mein wait karta hai aur failure par takeover karta hai.</td><td>Simple, predictable, troubleshoot karna aasan. Branch ke liye accha.</td></tr>
<tr><td><b>Balancing</b></td><td>Saare online nodes load share karte hain. Ek fail ho to baaki chalte rehte hain.</td><td>Jab ek node akela load na utha paye aur aap dono use karna chahein.</td></tr>
</table>
<p>Cluster mode SMC mein engine element par set hota hai aur Install policy ke baad hi real hota hai. Is lab mein hum standby mode use karte hain taaki CVI ka owner hamesha aasani se bataya ja sake: pehla node jo online hai.</p>

<div class="eg"><p><b>Worked example.</b> NK-PUNE-FW cluster ban jata hai. Staff LAN ka CVI 10.1.1.1/24 hai, wahi gateway jo saare PCs pehle se use karte hain. FW1A ko NDI 10.1.1.2 aur FW1B ko NDI 10.1.1.3 milta hai (apne lab mein dikhe addresses use karo). FW1A online hai, isliye 10.1.1.1 ke liye ARP ka jawab woh deta hai. 10.1.1.10 wala STAFF-PC kuch alag mehsoos nahi karta, bas gateway ke peeche ab do mein se ek box hai.</p></div>

<h3>Failover asal mein kya karta hai</h3>
<p>FW1A fail ho jaye ya offline kar diya jaye to FW1B (online, ya node command se online kiya hua) owner ban jata hai aur CVI ke liye ARP ka jawab deta hai. Do consequences important hain, aur simulator dono bilkul sahi sikhata hai:</p>
<ul>
<li><b>Lab mein connection state sync nahi hai.</b> Nodes apni connection tables ek dusre ko copy nahi karte. Naya owner un connections ke baare mein kuch nahi jaanta jo purana owner track kar raha tha.</li>
<li><b>Failover connections clear karta hai aur ARP caches flush karta hai.</b> Download ke beech wale user ko dobara shuru karna padta hai. Change ke baad neighbours CVI dobara seekhte hain.</li>
</ul>
<p>Real products state synchronisation offer kar sakte hain, aur real heartbeat timers aur detection times hote hain. Yeh yahan model nahi kiye gaye. Real timing aur options ke liye apne NGFW version ki documentation check karo.</p>

<pre class="out">FW1A$ sg-cluster status
Cluster NK-PUNE-FW (standby mode)
  FW1A (this node): <span class="hl">Online</span>
  FW1B: <span class="hl">Standby</span></pre>

<div class="warn"><p><b>Common galti.</b> Node address ko CVI network ke bahar dena. Validation install block kar deta hai: cluster node address CVI network mein hona chahiye. Aur PCs ko CVI ki jagah NDI par point karne se, us node ke fail hote hi traffic mar jata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Node dedicated IP ek node tak pahunchne ke liye hai; CVI baaki sabke liye. Inhe mix karna sabse common galat jawab hai.</p></div>

<div class="scn"><h4>Power cut mein bacha hua gateway</h4><p>Toofan ke dauraan ek branch engine ki power chali gayi. Staff ne chhota pause dekha, phir web access wapas chalne laga, magar khule downloads dobara shuru hue. Engineer ne cluster view kholi: FW1A offline, FW1B online. PCs gateway ke roop mein CVI use kar rahe the, isliye kisi PC ki setting nahi badli. Connection sync nahi hai, isliye purane sessions chale gaye.</p><p><b>Seekh:</b> cluster yeh chhupata hai ki kaunsa box kaam kar raha hai, yeh nahi ki connections dobara shuru hote hain.</p></div>

<div class="iv"><p class="q">"CVI aur NDI mein kya farak hai?"</p><p>Strong answer: CVI shared cluster address hai jo clients gateway ke roop mein use karte hain aur jiske liye active node jawab deta hai. NDI ek node ka unique address hai, management aur node-specific traffic ke liye. Yeh bhi bolo ki state sync na ho to failover CVI ko move karta hai aur connections clear karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cluster do ya zyada nodes ka group hai jo CVI ke through ek gateway ki tarah kaam karta hai.</li>
<li>Har node ka apna NDI bhi hota hai; heartbeat link "main zinda hoon" signal le jata hai.</li>
<li>Standby: ek node kaam karta hai. Balancing: online nodes load share karte hain.</li>
<li>Pehla online node CVI ka owner hota hai; standby mode mein baaki forward nahi karte.</li>
<li>Lab mein failover connections aur ARP caches clear karta hai; state sync nahi hai.</li>
</ul></div>
`}};export{e as default};