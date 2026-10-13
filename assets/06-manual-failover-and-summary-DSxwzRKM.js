var e={id:`manual-failover-summary`,h:{en:`Manual failover, session continuity, summary and exam checklist`,hi:`Manual failover, session continuity, summary aur exam checklist`},body:{en:`<p><b>Analogy.</b> Before maintenance on the night manager's office you ask the other manager to take charge on purpose. When the work is done you hand the role back. A <b>manual failover</b> is that planned handover.</p>
<h3>Manual failover</h3>
<pre class="code">request chassis cluster failover redundancy-group 1 node 1
request chassis cluster failover reset redundancy-group 1</pre>
<ul><li>The first command makes node 1 primary for RG1. The status shows <code>Manual: yes</code> and priority <b>255</b> for that node, so preempt cannot undo it.</li><li>A node that is <b>ineligible</b> (priority 0 because of monitoring) cannot be made primary by hand.</li><li>The <b>reset</b> command clears the manual flag so normal priorities and preempt apply again. Always reset after maintenance, or the node stays pinned.</li></ul>
<pre class="out">user@SRX&gt; request chassis cluster failover redundancy-group 1 node 1
Initiated manual failover for redundancy group 1
user@SRX&gt; show chassis cluster status
Redundancy group: 1 , Failover count: 2
node0  200      secondary            yes     <span class="hl">no</span>       None
node1  <span class="hl">255</span>      primary              yes     <span class="hl">yes</span>      None</pre>
<h3>What happens to users</h3>
<p>Sessions are kept in the shared session table (synchronised over the fabric link on a real cluster), so a TCP connection that was open before the failover usually continues, and new connections are accepted by the new primary at once. A few packets can be lost during the switch. Real clusters also advertise the new location with gratuitous ARP.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Manual failover then reset"><rect x="10" y="40" width="130" height="50" rx="8" fill="#fed7aa"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="12">node 0 primary</text><rect x="190" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="255" y="62" text-anchor="middle" class="svg-ink" font-size="12">request</text><text x="255" y="78" text-anchor="middle" class="svg-ink" font-size="12">failover node 1</text><rect x="370" y="40" width="130" height="50" rx="8" fill="#fed7aa"/><text x="435" y="70" text-anchor="middle" class="svg-ink" font-size="12">node 1 primary (255)</text><rect x="545" y="40" width="85" height="50" rx="8" fill="#bbf7d0"/><text x="587" y="70" text-anchor="middle" class="svg-ink" font-size="12">reset</text><path d="M140 65H190M320 65H370M500 65H545" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Fail over, do the work, reset.</p></div>
<div class="eg"><p><b>Worked example.</b> Upgrade night: fail RG1 to node 1, upgrade node 0, reset the failover, check status, then repeat in the other direction. Users keep browsing throughout.</p></div>
<div class="warn"><p><b>Common mistake.</b> Forgetting to reset a manual failover: the node keeps priority 255 and will not give up the primary role even after you repair the other node.</p></div>
<div class="exam"><p><b>Exam trap.</b> Manual failover sets priority 255 and shows Manual yes. It is cleared with <code>failover reset</code>. Preempt cannot override a manual failover.</p></div>
<div class="scn"><h4>The node that would not give way</h4><p>After a maintenance window the repaired node 0 never regained primary although preempt was on. The earlier manual failover had never been reset, so node 1 kept priority 255. A reset let normal priorities take over.</p><p><b>Lesson:</b> every manual failover ends with a reset.</p></div>
<div class="iv"><p class="q">"How do you do maintenance on a cluster without downtime?"</p><p>Manually fail the RGs to the other node, work on the first node, reset the manual failover, verify status and sessions, and repeat. Sessions continue because they are synchronised.</p></div>
<h3>Summary and exam checklist</h3>
<ul><li>Two identical SRX nodes, one cluster-id, control and fabric links, fxp0 per node.</li><li>RG0 control plane, RG1+ data plane; higher priority is primary; preempt needs a hold-down.</li><li>reth = logical interface with a member port per node, zones use the reth.</li><li>Interface monitoring: threshold 255 minus weights; 0 means ineligible.</li><li>Manual failover: priority 255, Manual yes; always reset.</li></ul>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>show chassis cluster status</code></td><td>Primary per RG, priorities, failures</td></tr>
<tr><td><code>show chassis cluster interfaces</code></td><td>reth status</td></tr>
<tr><td><code>request chassis cluster failover redundancy-group N node M</code></td><td>Planned failover</td></tr>
<tr><td><code>request chassis cluster failover reset redundancy-group N</code></td><td>Clear manual failover</td></tr></table>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Plan failovers; reset them after.</li><li>Monitor links that must trigger failover.</li><li>Cluster = availability, not capacity.</li></ul></div>`,hi:`<p><b>Analogy.</b> Night manager ke office par maintenance se pehle aap doosre manager se jaan-boojhkar charge lene ko kehte ho. Kaam khatam hone par role wapas dete ho. <b>Manual failover</b> wahi planned handover hai.</p>
<h3>Manual failover</h3>
<pre class="code">request chassis cluster failover redundancy-group 1 node 1
request chassis cluster failover reset redundancy-group 1</pre>
<ul><li>Pehla command node 1 ko RG1 ke liye primary banata hai. Status us node ke liye <code>Manual: yes</code> aur priority <b>255</b> dikhata hai, isliye preempt ise undo nahi kar sakta.</li><li><b>Ineligible</b> node (monitoring ki wajah se priority 0) ko haath se primary nahi banaya ja sakta.</li><li><b>reset</b> command manual flag hata deta hai taaki normal priorities aur preempt phir lagein. Maintenance ke baad hamesha reset karo, nahi to node pinned rehta hai.</li></ul>
<pre class="out">user@SRX&gt; request chassis cluster failover redundancy-group 1 node 1
Initiated manual failover for redundancy group 1
user@SRX&gt; show chassis cluster status
Redundancy group: 1 , Failover count: 2
node0  200      secondary            yes     <span class="hl">no</span>       None
node1  <span class="hl">255</span>      primary              yes     <span class="hl">yes</span>      None</pre>
<h3>Users ke saath kya hota hai</h3>
<p>Sessions shared session table mein rakhe jaate hain (real cluster mein fabric link se synchronise), isliye failover se pehle khula TCP connection aam taur par chalta rehta hai, aur naye connections naya primary turant accept karta hai. Switch ke dauran kuch packets kho sakte hain. Real clusters naye location ko gratuitous ARP se bhi announce karte hain.</p>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Manual failover phir reset"><rect x="10" y="40" width="130" height="50" rx="8" fill="#fed7aa"/><text x="75" y="70" text-anchor="middle" class="svg-ink" font-size="12">node 0 primary</text><rect x="190" y="40" width="130" height="50" rx="8" fill="#fde68a"/><text x="255" y="62" text-anchor="middle" class="svg-ink" font-size="12">request</text><text x="255" y="78" text-anchor="middle" class="svg-ink" font-size="12">failover node 1</text><rect x="370" y="40" width="130" height="50" rx="8" fill="#fed7aa"/><text x="435" y="70" text-anchor="middle" class="svg-ink" font-size="12">node 1 primary (255)</text><rect x="545" y="40" width="85" height="50" rx="8" fill="#bbf7d0"/><text x="587" y="70" text-anchor="middle" class="svg-ink" font-size="12">reset</text><path d="M140 65H190M320 65H370M500 65H545" stroke="#64748b" stroke-width="2"/></svg><p class="cap">Failover karo, kaam karo, reset karo.</p></div>
<div class="eg"><p><b>Worked example.</b> Upgrade ki raat: RG1 ko node 1 par failover karo, node 0 upgrade karo, failover reset karo, status check karo, phir doosri taraf dohrao. Users poore samay browse karte rehte hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> Manual failover reset karna bhool jana: node priority 255 rakhta hai aur doosra node theek karne ke baad bhi primary role nahi chhodta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Manual failover priority 255 set karta hai aur Manual yes dikhata hai. Ise <code>failover reset</code> se clear karte hain. Preempt manual failover ko override nahi kar sakta.</p></div>
<div class="scn"><h4>Node jo jagah nahi chhodta tha</h4><p>Maintenance window ke baad theek hua node 0 preempt on hone par bhi primary wapas nahi le paya. Pichhla manual failover kabhi reset nahi hua tha, isliye node 1 priority 255 rakhta raha. Reset se normal priorities lagi.</p><p><b>Lesson:</b> har manual failover reset par khatam hota hai.</p></div>
<div class="iv"><p class="q">"Cluster par bina downtime ke maintenance kaise karte ho?"</p><p>RGs ko manually doosre node par failover karta hoon, pehle node par kaam karta hoon, manual failover reset karta hoon, status aur sessions verify karta hoon, aur dohrata hoon. Sessions chalte rehte hain kyunki woh synchronised hain.</p></div>
<h3>Summary aur exam checklist</h3>
<ul><li>Do identical SRX nodes, ek cluster-id, control aur fabric links, har node ka fxp0.</li><li>RG0 control plane, RG1+ data plane; higher priority primary; preempt ko hold-down chahiye.</li><li>reth = har node ka member port wala logical interface, zones reth use karte hain.</li><li>Interface monitoring: threshold 255 minus weights; 0 matlab ineligible.</li><li>Manual failover: priority 255, Manual yes; hamesha reset.</li></ul>
<table class="cmp"><tr><th>Command</th><th>Use</th></tr>
<tr><td><code>show chassis cluster status</code></td><td>Har RG ka primary, priorities, failures</td></tr>
<tr><td><code>show chassis cluster interfaces</code></td><td>reth status</td></tr>
<tr><td><code>request chassis cluster failover redundancy-group N node M</code></td><td>Planned failover</td></tr>
<tr><td><code>request chassis cluster failover reset redundancy-group N</code></td><td>Manual failover clear karo</td></tr></table>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Failovers plan karo; baad mein reset karo.</li><li>Woh links monitor karo jinse failover trigger hona chahiye.</li><li>Cluster = availability, capacity nahi.</li></ul></div>`}};export{e as default};