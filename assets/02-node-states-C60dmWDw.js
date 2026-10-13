var e={id:`node-states`,h:{en:`Node states and the sg-cluster options`,hi:`Node states aur sg-cluster options`},body:{en:`
<p>A cluster node is never just "up" or "down". Each node has a <b>state</b> that tells the cluster what that node may do. Reading states correctly is the first skill of a cluster operator, and it is the heart of lab fp-ops-1: form a two-node cluster, then fail a node and watch what happens.</p>

<h3>Analogy: shift duty roster</h3>
<p>At the Pune branch gate, the roster says: one guard is on duty, one is resting but ready, one is sent home. Sometimes the manager writes "this guard must stay on duty, nobody changes it" or "this guard must stay home, nobody calls him back". Those locked entries are for maintenance, when you do not want the cluster to move things by itself.</p>

<h3>The five states you will use</h3>
<table class="cmp"><tr><th>State</th><th>Meaning</th></tr>
<tr><td><b>Online</b></td><td>The node is active and may forward traffic. The first online node owns the CVI.</td></tr>
<tr><td><b>Standby</b></td><td>The node is healthy and waiting. In a standby cluster it does not forward; it takes over if the online node goes away.</td></tr>
<tr><td><b>Offline</b></td><td>The node does not process traffic. It may be put back online later.</td></tr>
<tr><td><b>Locked online</b></td><td>The node is online and the state is pinned: ordinary commands cannot take it offline or standby. It still counts as the CVI owner.</td></tr>
<tr><td><b>Locked offline</b></td><td>The node is offline and pinned: an ordinary online command is refused until you unlock it.</td></tr>
</table>
<p>The console also knows other statuses outside the cluster logic: <b>Unknown</b> (the SMC has no status or timed out), <b>Not monitored</b>, and "No Policy Installed" before the first install. An engine that is shown as Unknown is usually a contact problem, not a cluster problem, so look at contact first (chapter 6).</p>

<h3>The sg-cluster command and the console buttons</h3>
<p>On the engine command line the tool <code>sg-cluster</code> exists with these options: <code>status</code>, <code>online</code>, <code>lock-online</code>, <code>offline</code>, <code>lock-offline</code>, <code>standby</code>, <code>safe-offline</code>, <code>force-online</code>. On the Engines page of the console, the same node commands are available per node. Exact option behaviour can differ between versions, so check the documentation for your NGFW version. In the simulator they behave like this:</p>
<ul>
<li><code>online</code>: make the node online. Refused if the node is locked offline.</li>
<li><code>offline</code>: take the node offline. Refused if it is locked online.</li>
<li><code>standby</code>: put the node in standby. Refused if locked online.</li>
<li><code>lock-online</code> and <code>lock-offline</code>: pin the node in that state.</li>
<li><code>safe-offline</code>: go offline only if another node is online; otherwise refused, so you cannot switch off the last working node by mistake.</li>
<li><code>force-online</code>: make this node online and push the peers offline. A strong option, to be used knowingly.</li>
</ul>
<p>Every accepted state change moves the CVI owner if needed, clears connections and flushes ARP caches.</p>

<pre class="out">FW1A$ sg-cluster safe-offline
Node FW1A is now Offline.
FW1A$ sg-cluster status
Cluster NK-PUNE-FW (standby mode)
  FW1A (this node): <span class="hl">Offline</span>
  FW1B: <span class="hl">Standby</span>
</pre>
<p>Look carefully: FW1A is offline and FW1B still shows Standby. In the lab, the CVI owner is the first node that is online or locked online. A node showing Standby is not counted, so here nobody owns the CVI and clients lose the gateway until a node is brought online. Nodes start Online in the simulator, so the usual failover is simply: the first online node goes offline and the next online node becomes the owner. This example shows why a state table must be read as a whole.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Node state changes">
<rect x="30" y="30" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="60" text-anchor="middle" class="svg-ink" font-size="14">Online</text>
<rect x="255" y="30" width="130" height="50" rx="8" fill="#fde68a"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="14">Standby</text>
<rect x="480" y="30" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="545" y="60" text-anchor="middle" class="svg-ink" font-size="14">Offline</text>
<rect x="30" y="140" width="130" height="50" rx="8" fill="#bae6fd"/><text x="95" y="170" text-anchor="middle" class="svg-ink" font-size="14">Locked online</text>
<rect x="480" y="140" width="130" height="50" rx="8" fill="#fed7aa"/><text x="545" y="170" text-anchor="middle" class="svg-ink" font-size="14">Locked offline</text>
<line x1="160" y1="55" x2="255" y2="55" stroke="#64748b" stroke-width="2"/><line x1="385" y1="55" x2="480" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="95" y1="80" x2="95" y2="140" stroke="#64748b" stroke-width="2"/><line x1="545" y1="80" x2="545" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">lock commands pin a state</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">unlock by moving the other way</text>
</svg><p class="cap">Normal states in the top row; locked states are pinned versions for maintenance.</p></div>

<div class="eg"><p><b>Worked example (fp-ops-1).</b> Both nodes are installed and show Online, so FW1A (first in the list) owns the CVI. Step 1: read the status. Step 2: take FW1A offline with the node command. Step 3: confirm FW1B is now Online and answers for the CVI. Step 4: ping the gateway from STAFF-PC at 10.1.1.10 to prove traffic still works; connections that existed before are gone. Step 5: bring FW1A back and read the states again. As always in this track, the lab passes only after Install policy has made the cluster real.</p></div>

<h3>Locks in practice</h3>
<p>Suppose FW1A must stay the active node during a change window. You use lock-online. Later, someone tries <code>offline</code> on it and gets "The node is locked online; use lock-offline." That is not a bug: the lock did its job. The risk is forgetting the lock. A node locked offline after maintenance will not return even after the engineer says "online" until it is unlocked; many "why will it not come back" tickets are just this.</p>

<div class="warn"><p><b>Common mistake.</b> Using force-online as a first step. It pushes the peers offline, so you can cause an outage. Prefer online, check the status, and keep force-online for a node that cannot rejoin by normal means.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Standby" and "Offline" are different. Standby is healthy and ready; offline is not processing at all. Locked states resist the normal commands.</p></div>

<div class="scn"><h4>Night maintenance, morning complaint</h4><p>An engineer locked FW1B offline for a hardware check and left. At 9 am FW1A had an interface fault and went offline. With FW1B locked offline, nothing could take over and the branch lost its gateway. The status showed Offline and Locked offline. The engineer used lock-online on a healthy node after clearing the fault.</p><p><b>Lesson:</b> every lock needs an owner and a follow-up. Check states before leaving a change window.</p></div>

<div class="iv"><p class="q">"Difference between offline and locked offline?"</p><p>Strong answer: offline is a normal state the cluster may change; locked offline is pinned and resists ordinary online commands until unlocked. Mention that locks are for maintenance and that forgetting them is a classic cause of lost redundancy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States: Online, Standby, Offline, Locked online, Locked offline; the console also shows Unknown and Not monitored.</li>
<li>The sg-cluster options are status, online, lock-online, offline, lock-offline, standby, safe-offline and force-online.</li>
<li>safe-offline refuses if no other node is online; force-online pushes peers offline.</li>
<li>The CVI belongs to the first online or locked online node.</li>
<li>Read the whole state table, and remember every change clears connections.</li>
</ul></div>
`,hi:`
<p>Cluster node kabhi sirf "up" ya "down" nahi hota. Har node ka ek <b>state</b> hota hai jo cluster ko batata hai ki woh node kya kar sakta hai. States sahi padhna cluster operator ki pehli skill hai, aur yahi lab fp-ops-1 ka dil hai: do-node cluster banao, phir ek node fail karo aur dekho kya hota hai.</p>

<h3>Analogy: shift duty roster</h3>
<p>Pune branch ke gate par roster kehta hai: ek guard duty par hai, ek aaram kar raha hai lekin ready hai, ek ghar bhej diya gaya. Kabhi manager likh deta hai "yeh guard duty par hi rahega, koi badlega nahi" ya "yeh guard ghar par hi rahega, koi use wapas na bulaye". Yeh locked entries maintenance ke liye hain, jab aap nahi chahte ki cluster khud cheezein hilaye.</p>

<h3>Paanch states jo aap use karoge</h3>
<table class="cmp"><tr><th>State</th><th>Matlab</th></tr>
<tr><td><b>Online</b></td><td>Node active hai aur traffic forward kar sakta hai. Pehla online node CVI ka owner hota hai.</td></tr>
<tr><td><b>Standby</b></td><td>Node healthy hai aur wait kar raha hai. Standby cluster mein woh forward nahi karta; online node jaane par takeover karta hai.</td></tr>
<tr><td><b>Offline</b></td><td>Node traffic process nahi karta. Baad mein dobara online kiya ja sakta hai.</td></tr>
<tr><td><b>Locked online</b></td><td>Node online hai aur state pin hai: normal commands use offline ya standby nahi kar sakte. Phir bhi woh CVI owner ginta hai.</td></tr>
<tr><td><b>Locked offline</b></td><td>Node offline hai aur pin hai: normal online command refuse hota hai jab tak aap unlock na karo.</td></tr>
</table>
<p>Console cluster logic ke bahar ke statuses bhi jaanta hai: <b>Unknown</b> (SMC ke paas status nahi ya timeout), <b>Not monitored</b>, aur pehle install se pehle "No Policy Installed". Jo engine Unknown dikhe woh aam taur par contact problem hai, cluster problem nahi, isliye pehle contact dekho (chapter 6).</p>

<h3>sg-cluster command aur console buttons</h3>
<p>Engine command line par <code>sg-cluster</code> tool in options ke saath hai: <code>status</code>, <code>online</code>, <code>lock-online</code>, <code>offline</code>, <code>lock-offline</code>, <code>standby</code>, <code>safe-offline</code>, <code>force-online</code>. Console ke Engines page par wahi node commands har node ke liye milte hain. Exact option behaviour versions ke beech alag ho sakta hai, isliye apne NGFW version ki documentation check karo. Simulator mein yeh aise behave karte hain:</p>
<ul>
<li><code>online</code>: node ko online karo. Locked offline ho to refuse.</li>
<li><code>offline</code>: node ko offline karo. Locked online ho to refuse.</li>
<li><code>standby</code>: node ko standby mein daalo. Locked online ho to refuse.</li>
<li><code>lock-online</code> aur <code>lock-offline</code>: node ko us state mein pin karo.</li>
<li><code>safe-offline</code>: tabhi offline jab koi aur node online ho; warna refuse, taaki aap galti se aakhri working node band na kar do.</li>
<li><code>force-online</code>: is node ko online karo aur peers ko offline dhakel do. Strong option hai, soch samajh kar use karo.</li>
</ul>
<p>Har accepted state change zaroorat par CVI owner badalta hai, connections clear karta hai aur ARP caches flush karta hai.</p>

<pre class="out">FW1A$ sg-cluster safe-offline
Node FW1A is now Offline.
FW1A$ sg-cluster status
Cluster NK-PUNE-FW (standby mode)
  FW1A (this node): <span class="hl">Offline</span>
  FW1B: <span class="hl">Standby</span>
</pre>
<p>Dhyan se dekho: FW1A offline hai aur FW1B abhi bhi Standby dikha raha hai. Lab mein CVI owner pehla node hai jo online ya locked online ho. Standby dikhane wala node count nahi hota, isliye yahan CVI ka koi owner nahi hai aur node online hone tak clients ka gateway chala jata hai. Simulator mein nodes Online start hote hain, isliye usual failover simple hai: pehla online node offline hota hai aur agla online node owner ban jata hai. Yeh example batata hai ki state table ko poora padhna chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Node state changes">
<rect x="30" y="30" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="95" y="60" text-anchor="middle" class="svg-ink" font-size="14">Online</text>
<rect x="255" y="30" width="130" height="50" rx="8" fill="#fde68a"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="14">Standby</text>
<rect x="480" y="30" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="545" y="60" text-anchor="middle" class="svg-ink" font-size="14">Offline</text>
<rect x="30" y="140" width="130" height="50" rx="8" fill="#bae6fd"/><text x="95" y="170" text-anchor="middle" class="svg-ink" font-size="14">Locked online</text>
<rect x="480" y="140" width="130" height="50" rx="8" fill="#fed7aa"/><text x="545" y="170" text-anchor="middle" class="svg-ink" font-size="14">Locked offline</text>
<line x1="160" y1="55" x2="255" y2="55" stroke="#64748b" stroke-width="2"/><line x1="385" y1="55" x2="480" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="95" y1="80" x2="95" y2="140" stroke="#64748b" stroke-width="2"/><line x1="545" y1="80" x2="545" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">lock commands state pin karte hain</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">unlock: doosri taraf move karo</text>
</svg><p class="cap">Upar ki row mein normal states; locked states maintenance ke liye pinned versions hain.</p></div>

<div class="eg"><p><b>Worked example (fp-ops-1).</b> Dono nodes installed hain aur Online dikhate hain, isliye FW1A (list mein pehla) CVI ka owner hai. Step 1: status padho. Step 2: node command se FW1A ko offline karo. Step 3: confirm karo ki FW1B ab Online hai aur CVI ka jawab deta hai. Step 4: 10.1.1.10 wale STAFF-PC se gateway ko ping karo taaki saabit ho ki traffic chal raha hai; pehle ke connections chale gaye. Step 5: FW1A ko wapas laao aur states dobara padho. Is track ki tarah lab tabhi pass hota hai jab Install policy cluster ko real bana de.</p></div>

<h3>Locks practice mein</h3>
<p>Maano change window mein FW1A active node rehna chahiye. Aap lock-online use karte ho. Baad mein koi us par <code>offline</code> try karta hai aur "The node is locked online; use lock-offline." milta hai. Yeh bug nahi hai: lock ne apna kaam kiya. Risk lock bhool jaane ka hai. Maintenance ke baad locked offline node, engineer "online" bolne ke baad bhi, unlock hone tak wapas nahi aata; bahut saare "wapas kyun nahi aa raha" tickets yahi hote hain.</p>

<div class="warn"><p><b>Common galti.</b> force-online ko pehle step ke roop mein use karna. Yeh peers ko offline dhakelta hai, isliye outage ho sakta hai. Pehle online use karo, status check karo, aur force-online us node ke liye rakho jo normal tareeke se rejoin na kar sake.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Standby" aur "Offline" alag hain. Standby healthy aur ready hai; offline bilkul process nahi kar raha. Locked states normal commands ka virodh karte hain.</p></div>

<div class="scn"><h4>Raat ka maintenance, subah ki complaint</h4><p>Ek engineer ne hardware check ke liye FW1B ko locked offline kiya aur chala gaya. Subah 9 baje FW1A mein interface fault aaya aur woh offline ho gaya. FW1B locked offline hone se koi takeover nahi kar saka aur branch ka gateway chala gaya. Status mein Offline aur Locked offline dikha. Engineer ne fault clear karne ke baad healthy node par lock-online use kiya.</p><p><b>Seekh:</b> har lock ka ek owner aur follow-up hona chahiye. Change window chhodne se pehle states check karo.</p></div>

<div class="iv"><p class="q">"Offline aur locked offline mein farak?"</p><p>Strong answer: offline normal state hai jise cluster badal sakta hai; locked offline pinned hai aur unlock hone tak normal online commands ka virodh karta hai. Batao ki locks maintenance ke liye hain aur unhe bhool jaana redundancy khone ka classic reason hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States: Online, Standby, Offline, Locked online, Locked offline; console Unknown aur Not monitored bhi dikhata hai.</li>
<li>sg-cluster options: status, online, lock-online, offline, lock-offline, standby, safe-offline aur force-online.</li>
<li>safe-offline tab refuse karta hai jab koi aur node online na ho; force-online peers ko offline dhakelta hai.</li>
<li>CVI pehle online ya locked online node ka hota hai.</li>
<li>Poori state table padho, aur yaad rakho har change connections clear karta hai.</li>
</ul></div>
`}};export{e as default};