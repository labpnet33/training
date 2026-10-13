var e={id:`cluster`,h:{en:`Single versus cluster firewalls`,hi:`Single versus cluster firewalls`},body:{en:`
<p>One firewall is a single point of failure. If its power supply dies, the branch is offline. A <b>cluster</b> puts two or more engine nodes behind the same addresses, so the network survives the loss of a node. This chapter explains how the engine element is built for a cluster, which address belongs to whom, and what happens in a failover. Operating clusters (forming one and failing a node) is the later operations module; here we build the mental model.</p>

<h3>Analogy: two guards sharing one phone number</h3>
<p>The Pune gatehouse publishes one phone number to all the staff: the <i>gatehouse number</i>. Two guards sit in the room. Only the guard on duty picks up the phone. If he falls sick, the second guard takes over, and from the outside nothing changes: same phone number. But each guard also has a personal mobile number, used by the head office to reach exactly that guard. The gatehouse number is a <b>CVI</b>. The personal numbers are <b>NDIs</b>.</p>

<h3>Single firewall versus cluster</h3>
<table class="cmp"><tr><th>Item</th><th>Single firewall</th><th>Cluster</th></tr>
<tr><td>Nodes</td><td>One</td><td>Two or more</td></tr>
<tr><td>Address used by hosts as gateway</td><td>The node address (NDI)</td><td>The shared cluster address (CVI)</td></tr>
<tr><td>Address used by the SMC</td><td>The node address</td><td>The NDI of each node</td></tr>
<tr><td>If hardware fails</td><td>Outage</td><td>Another node takes over</td></tr>
<tr><td>Complexity</td><td>Low</td><td>Higher: more addresses to plan</td></tr></table>

<h3>CVI and NDI in practice</h3>
<p>For every interface that carries traffic in a cluster, you plan <b>one CVI plus one NDI per node</b>, all inside the same IP network. Hosts and neighbours talk to the CVI. The SMC and administrators use the NDIs to reach each node on its own. For the Staff LAN 10.1.1.0/24 the plan can be: CVI 10.1.1.1, node 1 NDI 10.1.1.2, node 2 NDI 10.1.1.3. The usual rule: the engine validation requires <b>every node address to be inside the network of the CVI</b>. If node 2 gets 10.1.2.3 while the CVI is 10.1.1.1/24, the install is blocked.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Two-node cluster with CVI and NDI">
<rect x="30" y="20" width="170" height="70" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="115" y="48" text-anchor="middle" class="svg-ink" font-size="13">Node 1 (online)</text><text x="115" y="68" text-anchor="middle" class="svg-muted" font-size="12">NDI 10.1.1.2</text>
<rect x="440" y="20" width="170" height="70" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="525" y="48" text-anchor="middle" class="svg-ink" font-size="13">Node 2 (standby)</text><text x="525" y="68" text-anchor="middle" class="svg-muted" font-size="12">NDI 10.1.1.3</text>
<rect x="230" y="110" width="180" height="50" rx="25" fill="#fde68a" stroke="#64748b"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">CVI 10.1.1.1</text><text x="320" y="149" text-anchor="middle" class="svg-muted" font-size="12">answered by node 1</text>
<line x1="150" y1="90" x2="270" y2="112" stroke="#64748b" stroke-width="3"/>
<line x1="490" y1="90" x2="370" y2="112" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<rect x="250" y="200" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="226" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC gw 10.1.1.1</text>
<line x1="320" y1="160" x2="320" y2="200" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The PC always uses the CVI. In standby mode only the online node answers for it; the dashed line is the idle node.</p></div>

<h3>Which node owns the CVI?</h3>
<p>In the standby behaviour that the simulator models, the <b>first node that is online (or locked online)</b> owns the CVI and answers ARP requests for it. The other nodes stay in standby and do not forward traffic. When the owner goes offline, the next node takes over, and the network sees a short interruption. In this simplified model a failover <b>clears existing connections</b> (there is no state synchronization) and flushes ARP caches, so users may need to reconnect their sessions. Real products can synchronize state and support other cluster modes; check the documentation for your NGFW version for what your cluster does.</p>

<div class="eg"><p><b>Worked example.</b> Pune gets a second node. Plan for eth2: CVI 10.1.1.1/24, node A NDI 10.1.1.2, node B NDI 10.1.1.3. STAFF-PC (10.1.1.10) uses 10.1.1.1 as gateway. While node A is Online it owns the CVI. You switch node A offline for maintenance. Node B moves to Online and answers for 10.1.1.1. STAFF-PC needs its ARP entry refreshed; a download in progress breaks and has to be restarted, but new web pages load without any change on the PC. Meanwhile the SMC still reaches node A at 10.1.1.2 only if it is up, which is why each node needs its own NDI.</p></div>

<h3>States you will see</h3>
<pre class="out">NK-PUNE-FW   cluster standby mode
  node 1   <span class="hl">Online</span>   owns CVI 10.1.1.1
  node 2   Standby
after node 1 goes offline:
  node 1   Offline
  node 2   <span class="hl">Online</span>   owns CVI 10.1.1.1</pre>
<p>Typical node states are Online, Standby, Offline, Locked online, Locked offline and Unknown. A locked state means an administrator is preventing automatic changes, for example during maintenance.</p>

<div class="warn"><p><b>Common mistakes.</b> Using a node NDI as the gateway for hosts, so a failover breaks them. Giving a node an address outside the CVI network. Forgetting that the SMC needs a reachable address for every node. Testing failover during working hours without telling users that sessions can drop.</p></div>
<div class="exam"><p><b>Exam trap.</b> CVI is the address for traffic, NDI is the address for management and for one node. Do not mix them. Also, a cluster does not remove the need for an Install policy: both nodes receive the same compiled policy only when you install.</p></div>

<div class="scn"><h4>Staff gateway pointed at a node</h4><p>A branch had a two-node cluster, but the DHCP server gave Staff PCs the gateway 10.1.1.2, the NDI of node 1. Everything worked until node 1 was rebooted for an upgrade and all internet access stopped, even though node 2 had taken over. The fix was to give out the CVI 10.1.1.1 as gateway.</p><p><b>Lesson:</b> hosts use the CVI. Only the SMC and administrators use NDIs.</p></div>

<div class="iv"><p class="q">"What is the difference between a CVI and an NDI?"</p><p>A CVI is a virtual IP address shared by the cluster nodes, used by hosts and neighbours as the gateway, so a failover is invisible to them. An NDI belongs to a single node and is used for management and node-specific communication. Add that all node addresses must be in the same network as the CVI.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A cluster has several nodes behind a shared virtual address.</li>
<li>Plan one CVI and one NDI per node on each interface, in the same network.</li>
<li>The first online node owns the CVI in standby mode; the others stay in standby.</li>
<li>Failover in this model clears connections and flushes ARP; check your version for state sync.</li>
<li>Hosts use the CVI; the SMC uses NDIs.</li>
</ul></div>
`,hi:`
<p>Ek firewall single point of failure hai. Uska power supply mar jaye to branch offline ho jata hai. <b>Cluster</b> do ya zyada engine nodes ko same addresses ke peeche rakhta hai, taaki ek node ke jaane par bhi network chalta rahe. Yeh chapter samjhata hai ki cluster ke liye engine element kaise bante hain, kaunsa address kiska hai, aur failover mein kya hota hai. Clusters ko operate karna (banana aur node fail karna) baad ke operations module mein hai; yahan hum mental model banate hain.</p>

<h3>Analogy: do guards, ek phone number</h3>
<p>Pune gatehouse saare staff ko ek phone number deta hai: <i>gatehouse number</i>. Room mein do guards baithte hain. Sirf duty wala guard phone uthata hai. Woh bimar ho jaye to doosra guard sambhal leta hai, aur bahar se kuch nahi badalta: same phone number. Lekin har guard ka apna personal mobile number bhi hai, jisse head office exactly us guard ko pakadta hai. Gatehouse number <b>CVI</b> hai. Personal numbers <b>NDIs</b> hain.</p>

<h3>Single firewall versus cluster</h3>
<table class="cmp"><tr><th>Item</th><th>Single firewall</th><th>Cluster</th></tr>
<tr><td>Nodes</td><td>Ek</td><td>Do ya zyada</td></tr>
<tr><td>Hosts ka gateway address</td><td>Node address (NDI)</td><td>Shared cluster address (CVI)</td></tr>
<tr><td>SMC ka use kiya address</td><td>Node address</td><td>Har node ka NDI</td></tr>
<tr><td>Hardware fail ho to</td><td>Outage</td><td>Doosra node sambhal leta hai</td></tr>
<tr><td>Complexity</td><td>Kam</td><td>Zyada: plan karne ke liye zyada addresses</td></tr></table>

<h3>CVI aur NDI practice mein</h3>
<p>Cluster mein traffic carry karne wale har interface ke liye aap <b>ek CVI plus har node ka ek NDI</b> plan karte ho, sab ek hi IP network mein. Hosts aur neighbours CVI se baat karte hain. SMC aur administrators NDIs se har node tak alag alag pahunchte hain. Staff LAN 10.1.1.0/24 ke liye plan yeh ho sakta hai: CVI 10.1.1.1, node 1 NDI 10.1.1.2, node 2 NDI 10.1.1.3. Aam rule: engine validation maangti hai ki <b>har node address CVI ke network ke andar ho</b>. Agar CVI 10.1.1.1/24 hai aur node 2 ko 10.1.2.3 diya, to install block ho jata hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="CVI aur NDI ke saath do-node cluster">
<rect x="30" y="20" width="170" height="70" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="115" y="48" text-anchor="middle" class="svg-ink" font-size="13">Node 1 (online)</text><text x="115" y="68" text-anchor="middle" class="svg-muted" font-size="12">NDI 10.1.1.2</text>
<rect x="440" y="20" width="170" height="70" rx="10" fill="#e2e8f0" stroke="#64748b"/><text x="525" y="48" text-anchor="middle" class="svg-ink" font-size="13">Node 2 (standby)</text><text x="525" y="68" text-anchor="middle" class="svg-muted" font-size="12">NDI 10.1.1.3</text>
<rect x="230" y="110" width="180" height="50" rx="25" fill="#fde68a" stroke="#64748b"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="13">CVI 10.1.1.1</text><text x="320" y="149" text-anchor="middle" class="svg-muted" font-size="12">node 1 jawab deta hai</text>
<line x1="150" y1="90" x2="270" y2="112" stroke="#64748b" stroke-width="3"/>
<line x1="490" y1="90" x2="370" y2="112" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<rect x="250" y="200" width="140" height="44" rx="8" fill="#bae6fd"/><text x="320" y="226" text-anchor="middle" class="svg-ink" font-size="13">STAFF-PC gw 10.1.1.1</text>
<line x1="320" y1="160" x2="320" y2="200" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">PC hamesha CVI use karta hai. Standby mode mein sirf online node uske liye jawab deta hai; dashed line idle node hai.</p></div>

<h3>CVI ka owner kaunsa node hai?</h3>
<p>Simulator jis standby behaviour ko model karta hai, usmein <b>pehla node jo online (ya locked online) hai</b> CVI ka owner hota hai aur uske ARP requests ka jawab deta hai. Baaki nodes standby mein rehte hain aur traffic forward nahi karte. Owner offline ho jaye to agla node sambhal leta hai, aur network ko chhota sa interruption dikhta hai. Is simplified model mein failover <b>existing connections clear kar deta hai</b> (state synchronization nahi hai) aur ARP caches flush karta hai, isliye users ko apne sessions dobara connect karne pad sakte hain. Real products state synchronize kar sakte hain aur doosre cluster modes support karte hain; aapka cluster kya karta hai, iske liye apne NGFW version ki documentation check karo.</p>

<div class="eg"><p><b>Worked example.</b> Pune ko doosra node milta hai. eth2 ke liye plan: CVI 10.1.1.1/24, node A NDI 10.1.1.2, node B NDI 10.1.1.3. STAFF-PC (10.1.1.10) gateway 10.1.1.1 use karta hai. Node A Online hai to CVI ka owner wahi hai. Aap maintenance ke liye node A ko offline karte ho. Node B Online ho jata hai aur 10.1.1.1 ke liye jawab deta hai. STAFF-PC ko apni ARP entry refresh karni padti hai; chalta hua download toot jata hai aur dobara shuru karna padta hai, lekin naye web pages PC par kuch badle bina khul jate hain. Is beech SMC node A tak 10.1.1.2 par tabhi pahunchta hai jab woh up ho, isliye har node ka apna NDI chahiye.</p></div>

<h3>Jo states aap dekhoge</h3>
<pre class="out">NK-PUNE-FW   cluster standby mode
  node 1   <span class="hl">Online</span>   owns CVI 10.1.1.1
  node 2   Standby
after node 1 goes offline:
  node 1   Offline
  node 2   <span class="hl">Online</span>   owns CVI 10.1.1.1</pre>
<p>Typical node states hain Online, Standby, Offline, Locked online, Locked offline aur Unknown. Locked state ka matlab hai ki administrator automatic changes ko rok raha hai, jaise maintenance ke dauran.</p>

<div class="warn"><p><b>Common mistakes.</b> Hosts ke gateway ke roop mein node NDI use karna, jisse failover par woh toot jate hain. Node ko CVI network ke bahar ka address dena. Yeh bhoolna ki SMC ko har node ke liye reachable address chahiye. Users ko bataye bina working hours mein failover test karna jabki sessions drop ho sakte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> CVI traffic ka address hai, NDI management aur ek node ka address hai. Inhe mix mat karo. Aur cluster se Install policy ki zaroorat khatam nahi hoti: dono nodes ko same compiled policy tabhi milti hai jab aap install karte ho.</p></div>

<div class="scn"><h4>Staff ka gateway node par tha</h4><p>Ek branch mein two-node cluster tha, lekin DHCP server Staff PCs ko gateway 10.1.1.2 de raha tha, jo node 1 ka NDI hai. Sab kuch chalta raha jab tak node 1 upgrade ke liye reboot nahi hua; tab saara internet access ruk gaya, jabki node 2 ne sambhal liya tha. Fix yeh tha ki gateway ke roop mein CVI 10.1.1.1 diya jaye.</p><p><b>Lesson:</b> hosts CVI use karte hain. NDIs sirf SMC aur administrators ke liye hain.</p></div>

<div class="iv"><p class="q">"CVI aur NDI mein kya fark hai?"</p><p>CVI ek virtual IP address hai jo cluster nodes share karte hain, aur hosts aur neighbours use gateway ki tarah use karte hain, isliye failover unhe dikhta nahi. NDI ek single node ka hota hai aur management aur node-specific communication ke liye use hota hai. Yeh jodo ki saare node addresses CVI ke same network mein hone chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cluster mein kai nodes ek shared virtual address ke peeche hote hain.</li>
<li>Har interface par ek CVI aur har node ka ek NDI plan karo, same network mein.</li>
<li>Standby mode mein pehla online node CVI own karta hai; baaki standby mein rehte hain.</li>
<li>Is model mein failover connections clear karta hai aur ARP flush karta hai; state sync ke liye apna version check karo.</li>
<li>Hosts CVI use karte hain; SMC NDIs use karta hai.</li>
</ul></div>
`}};export{e as default};