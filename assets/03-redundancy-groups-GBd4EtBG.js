var e={id:`redundancy-groups`,h:{en:`Redundancy groups: RG0 and RG1+, priority, preempt and hold-down`,hi:`Redundancy groups: RG0 aur RG1+, priority, preempt aur hold-down`},body:{en:`<p><b>Analogy.</b> A building has two night managers. For each job (keys, alarms, visitors) one is "in charge" tonight; the one with higher rank wins, and if the senior comes back from a break they may take over again, but only after waiting a moment so that handovers do not flip every second.</p>
<h3>Redundancy groups</h3>
<p>A <b>redundancy group (RG)</b> is a unit of failover: it has a primary node and a secondary node. <b>RG0</b> is the control plane (the Routing Engine): it decides which node's Junos answers management and runs routing. <b>RG1 and higher</b> own the data plane: reth interfaces and the traffic they carry. Several RGs can have different primaries (active/active) or all the same primary (active/passive).</p>
<h3>Priority, preempt and hold-down</h3>
<ul><li><b>Priority</b> (1 to 254, higher wins) per node, per RG.</li><li><b>Preempt</b>: allows a higher-priority node to take the primary role back after it recovers. Without preempt the current primary stays primary, which avoids needless switches.</li><li><b>Hold-down interval</b>: how long the higher-priority node must be healthy before it preempts. A short or missing hold-down with preempt can cause a failover loop when a link flaps.</li></ul>
<pre class="code">set chassis cluster reth-count 2
set chassis cluster redundancy-group 0 node 0 priority 200
set chassis cluster redundancy-group 0 node 1 priority 100
set chassis cluster redundancy-group 1 node 0 priority 200
set chassis cluster redundancy-group 1 node 1 priority 100
set chassis cluster redundancy-group 1 preempt
set chassis cluster redundancy-group 1 hold-down-interval 10</pre>
<pre class="out">user@SRX&gt; show chassis cluster status
Cluster ID: 1
Node   Priority Status               Preempt Manual   Monitor-failures

Redundancy group: 1 , Failover count: 0
node0  200      <span class="hl">primary</span>              yes     no       None
node1  100      secondary            yes     no       None</pre>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="RG0 control plane, RG1 data plane"><rect x="10" y="15" width="300" height="50" rx="10" fill="#ddd6fe"/><text x="160" y="45" text-anchor="middle" class="svg-ink" font-size="13">RG0: control plane (Routing Engine)</text><rect x="330" y="15" width="300" height="50" rx="10" fill="#bbf7d0"/><text x="480" y="45" text-anchor="middle" class="svg-ink" font-size="13">RG1+: reth interfaces and traffic</text><rect x="10" y="80" width="620" height="45" rx="10" fill="#e2e8f0"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">each RG: node priorities, preempt, hold-down, monitoring</text></svg><p class="cap">Each RG elects its own primary.</p></div>
<div class="eg"><p><b>Worked example.</b> Node 0 fails and recovers. With preempt and a hold-down of 10 seconds, node 0 waits 10 healthy seconds and then takes RG1 back. Without preempt, node 1 simply stays primary.</p></div>
<div class="warn"><p><b>Common mistake.</b> Enabling preempt with no hold-down on a flaky link: the primary role bounces repeatedly (a failover loop). Also: assuming RG0 and RG1 always share a primary.</p></div>
<div class="exam"><p><b>Exam trap.</b> Higher priority wins. RG0 is the control plane; RG1 and above are the data plane. Preempt is off by default; the hold-down interval delays a preempt.</p></div>
<div class="scn"><h4>The failover loop</h4><p>A link with intermittent errors made node 0 flip between healthy and unhealthy. With preempt and a very short hold-down RG1 changed primary every few seconds and users saw drops. A longer hold-down and a fix of the link stopped the loop.</p><p><b>Lesson:</b> preempt needs a hold-down.</p></div>
<div class="iv"><p class="q">"Explain redundancy groups."</p><p>RG0 handles the control plane; RG1 and above handle the data plane. Each has node priorities (higher wins), optional preempt with a hold-down, and monitoring that can make a node ineligible.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>RG0 control plane; RG1+ data plane.</li><li>Higher priority is primary.</li><li>Preempt needs a sensible hold-down.</li></ul></div>`,hi:`<p><b>Analogy.</b> Building mein do night managers hain. Har kaam (chabiyan, alarms, visitors) ke liye aaj raat ek "in charge" hai; ooncha rank jeet-ta hai, aur senior break se wapas aaye to dobara sambhal sakta hai, lekin thodi der ruk kar taaki handover har second flip na ho.</p>
<h3>Redundancy groups</h3>
<p><b>Redundancy group (RG)</b> failover ki ek unit hai: iska ek primary node aur ek secondary node hota hai. <b>RG0</b> control plane (Routing Engine) hai: yeh tay karta hai ki kiske Junos management ka jawab dete hain aur routing chalate hain. <b>RG1 aur upar</b> data plane ke maalik hain: reth interfaces aur unka traffic. Kai RGs ke alag primaries ho sakte hain (active/active) ya sab ka wahi primary (active/passive).</p>
<h3>Priority, preempt aur hold-down</h3>
<ul><li>Har node, har RG ke liye <b>Priority</b> (1 se 254, zyada jeet-ta hai).</li><li><b>Preempt</b>: recover hone ke baad higher-priority node ko primary role wapas lene deta hai. Preempt ke bina maujooda primary primary hi rehta hai, jisse faltu switches bachte hain.</li><li><b>Hold-down interval</b>: higher-priority node ko preempt karne se pehle kitni der healthy rehna hai. Preempt ke saath chhota ya na ke barabar hold-down link flap hone par failover loop kar sakta hai.</li></ul>
<pre class="code">set chassis cluster reth-count 2
set chassis cluster redundancy-group 0 node 0 priority 200
set chassis cluster redundancy-group 0 node 1 priority 100
set chassis cluster redundancy-group 1 node 0 priority 200
set chassis cluster redundancy-group 1 node 1 priority 100
set chassis cluster redundancy-group 1 preempt
set chassis cluster redundancy-group 1 hold-down-interval 10</pre>
<pre class="out">user@SRX&gt; show chassis cluster status
Cluster ID: 1
Node   Priority Status               Preempt Manual   Monitor-failures

Redundancy group: 1 , Failover count: 0
node0  200      <span class="hl">primary</span>              yes     no       None
node1  100      secondary            yes     no       None</pre>
<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="RG0 control plane, RG1 data plane"><rect x="10" y="15" width="300" height="50" rx="10" fill="#ddd6fe"/><text x="160" y="45" text-anchor="middle" class="svg-ink" font-size="13">RG0: control plane (Routing Engine)</text><rect x="330" y="15" width="300" height="50" rx="10" fill="#bbf7d0"/><text x="480" y="45" text-anchor="middle" class="svg-ink" font-size="13">RG1+: reth interfaces aur traffic</text><rect x="10" y="80" width="620" height="45" rx="10" fill="#e2e8f0"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="13">har RG: node priorities, preempt, hold-down, monitoring</text></svg><p class="cap">Har RG apna primary chunta hai.</p></div>
<div class="eg"><p><b>Worked example.</b> Node 0 fail hokar recover hota hai. Preempt aur 10 second hold-down ke saath node 0 10 healthy second intezaar karke RG1 wapas leta hai. Preempt ke bina node 1 primary hi rehta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Flaky link par bina hold-down ke preempt on karna: primary role baar baar uchhalta hai (failover loop). Aur: maan lena ki RG0 aur RG1 ka primary hamesha same hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Higher priority jeet-ta hai. RG0 control plane hai; RG1 aur upar data plane. Preempt default mein off hai; hold-down interval preempt ko deri se karta hai.</p></div>
<div class="scn"><h4>Failover loop</h4><p>Intermittent errors wale link se node 0 healthy aur unhealthy ke beech flip karta tha. Preempt aur bahut chhote hold-down ke saath RG1 har kuch second mein primary badalta tha aur users ko drops dikhe. Lambe hold-down aur link fix se loop ruka.</p><p><b>Lesson:</b> preempt ko hold-down chahiye.</p></div>
<div class="iv"><p class="q">"Redundancy groups samjhao."</p><p>RG0 control plane sambhalta hai; RG1 aur upar data plane. Har ek ki node priorities (zyada jeet-ta hai), hold-down ke saath optional preempt, aur monitoring hai jo node ko ineligible bana sakti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>RG0 control plane; RG1+ data plane.</li><li>Higher priority primary hota hai.</li><li>Preempt ko sahi hold-down chahiye.</li></ul></div>`}};export{e as default};