var e={id:`secure-workload`,h:{en:`Workload protection and microsegmentation with Cisco Secure Workload`,hi:`Cisco Secure Workload se workload protection aur microsegmentation`},body:{en:`
<p>A hotel used to give every guest a key that opened every room on the same floor. If one guest was a thief, the whole floor was at risk. Modern hotels give each guest a card that opens only their own room, the gym and the lift. <b>Microsegmentation</b> is the modern key card for workloads: each server may talk only to the exact peers and ports it needs, no matter which VLAN, subnet or cloud it lives in.</p>

<h3>Why perimeter firewalls are not enough</h3>
<p>Most attacks that start with one compromised server spread <b>east-west</b>: from the web server to the database, from a developer VM to a domain controller. A perimeter firewall only sees north-south traffic, and a flat /16 network per site lets any host reach any other host. Re-addressing everything into hundreds of VLANs is not realistic. Microsegmentation moves the enforcement point onto the workload itself, so the policy follows the workload whether it sits on bare metal, VMware or a public cloud.</p>

<h3>Cisco Secure Workload in one paragraph</h3>
<p><b>Cisco Secure Workload</b> (formerly <b>Tetration</b>) is available as SaaS or as an on-premises cluster. It collects telemetry, builds a map of how applications really talk, turns that map into an allow-list policy, simulates it, and enforces it on every workload. It also keeps a software inventory of each host with known CVEs and watches process behaviour for anomalies.</p>

<h3>Where the data comes from</h3>
<ul>
<li><b>Software agents</b> on Linux and Windows (and some other operating systems) report every flow plus the process and user behind it. Enforcement agents can also program the host firewall.</li>
<li><b>Agentless connectors</b>: cloud flow logs (AWS, Azure, GCP), NetFlow/IPFIX, ERSPAN, load balancers, ASA flow events, vCenter and Kubernetes orchestrators, and ISE for user and endpoint context.</li>
<li><b>Labels and annotations</b> from CMDBs, cloud tags and orchestrators, so you can write policy with names such as <code>app=payments, tier=db</code> instead of IP addresses.</li>
</ul>

<h3>From visibility to enforcement: the five steps</h3>
<ol>
<li><b>Scope</b>: organise workloads into a hierarchy (Company &gt; Prod &gt; Payments) built from labels.</li>
<li><b>Discover</b>: <b>Application Dependency Mapping (ADM)</b>, also called automatic policy discovery, groups workloads into clusters that behave alike and lists the flows between them.</li>
<li><b>Review</b>: application owners approve or edit the discovered policy (WEB to APP tcp 8443, APP to DB tcp 5432) and add a catch-all deny.</li>
<li><b>Simulate</b>: <b>policy analysis</b> replays live flows against the draft policy and classifies each one as permitted, rejected or <b>escaped</b> (a flow the policy would block that is currently allowed). Escaped flows are the ones that would break the application tomorrow.</li>
<li><b>Enforce</b>: the agent programs the native host firewall (iptables/nftables on Linux, Windows Filtering Platform on Windows), or the policy is pushed to cloud security groups. Enforcement keeps running even if the host loses contact with the cluster.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Microsegmentation of a three tier app">
<rect x="20" y="70" width="150" height="60" rx="8" fill="#bae6fd"/><text x="95" y="96" text-anchor="middle" class="svg-ink" font-size="13">WEB tier</text><text x="95" y="115" text-anchor="middle" class="svg-muted" font-size="12">VMware</text>
<rect x="245" y="70" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">APP tier</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">public cloud</text>
<rect x="470" y="70" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="96" text-anchor="middle" class="svg-ink" font-size="13">DB tier</text><text x="545" y="115" text-anchor="middle" class="svg-muted" font-size="12">bare metal</text>
<line x1="170" y1="100" x2="245" y2="100" stroke="#64748b" stroke-width="2"/><text x="207" y="90" text-anchor="middle" class="svg-accent" font-size="12">8443</text>
<line x1="395" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/><text x="432" y="90" text-anchor="middle" class="svg-accent" font-size="12">5432</text>
<path d="M95 130 Q320 200 545 130" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">WEB to DB: denied on each host</text>
</svg><p class="cap">The policy is enforced on every workload, so it works across VMware, cloud and bare metal.</p></div>

<div class="eg"><p><b>Worked example.</b> A payment application has 24 VMs on VMware and 60 cloud instances on flat /16 networks. ADM over two weeks discovers 7 clusters and 19 distinct flows. The draft policy has 19 allow rules plus a catch-all deny. Policy analysis shows 18,400 permitted flows, 0 rejected and <b>312 escaped</b>; all 312 are a monthly backup job from a backup server on tcp 10000 that ADM had not yet seen. The owner adds that rule, simulation shows 0 escaped for a week, and enforcement is switched on with no outage.</p></div>

<pre class="out">Policy analysis: Payments (last 7 days)
Permitted   18,400
Rejected         0
<span class="hl">Escaped        312   backup-01 -&gt; db cluster tcp/10000 (no matching allow)</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Enforcing straight after discovery without a simulation period that covers monthly jobs (backups, patching, reporting). Writing rules with IP addresses instead of labels. Forgetting infrastructure flows that every host needs: DNS, NTP, the patch server, the monitoring agent and the Secure Workload cluster itself.</p></div>
<div class="exam"><p><b>Exam traps.</b> Secure Workload enforces policy <b>on the workload</b> (host firewall) or in cloud security groups, independent of the network topology. ADM builds the policy from real flows. Always simulate before you enforce. Tetration is the old name.</p></div>

<div class="scn"><h4>The lateral movement that stopped at one host</h4><p>Attackers compromised a public web server through an unpatched plug-in and tried to scan the internal network for databases and file shares. The company had enforced Secure Workload policy six months earlier: the web cluster could reach only the APP cluster on tcp 8443, DNS and the patch server. Every scan packet was dropped by the host firewall on the web server itself, and the rejected flows appeared as an alert in the SIEM within minutes. The SOC isolated the web server, rebuilt it from a clean image and the incident stayed at one host.</p><p><b>Lesson:</b> microsegmentation does not prevent the first compromise, but it turns a network-wide breach into a single-host incident.</p></div>

<div class="iv"><p class="q">"How would you segment a payments application across VMware and two public clouds without changing VLANs?"</p><p>Explain workload-based microsegmentation: install Secure Workload agents (or use cloud connectors), label workloads, run ADM to discover the real flows, review the allow-list with the application owner, simulate with policy analysis until there are no escaped flows, then enforce through the host firewall or cloud security groups. Mention infrastructure flows, a catch-all deny, and that the policy follows the workload.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Microsegmentation stops east-west lateral movement; enforcement moves onto the workload.</li>
<li>Secure Workload (formerly Tetration): agents and agentless connectors, labels, scopes.</li>
<li>ADM discovers flows; owners review; policy analysis simulates; then enforce.</li>
<li>Escaped flows in simulation are what would break when you enforce.</li>
<li>Enforcement uses iptables/nftables, Windows Filtering Platform or cloud security groups.</li>
</ul></div>
`,hi:`
<p>Pehle hotel har guest ko aisi chaabi dete the jo usi floor ka har room khol deti thi. Agar ek guest chor nikla, to poora floor risk mein. Modern hotels har guest ko aisa card dete hain jo sirf uska room, gym aur lift kholta hai. <b>Microsegmentation</b> workloads ke liye yahi modern key card hai: har server sirf unhi peers aur ports se baat kar sakta hai jinki use zaroorat hai, chahe woh kisi bhi VLAN, subnet ya cloud mein ho.</p>

<h3>Perimeter firewalls kaafi kyun nahi hain</h3>
<p>Zyada tar attacks jo ek compromised server se shuru hote hain woh <b>east-west</b> failte hain: web server se database tak, developer VM se domain controller tak. Perimeter firewall sirf north-south traffic dekhta hai, aur har site par flat /16 network kisi bhi host ko kisi bhi host tak pahunchne deta hai. Sab kuch sainkdon VLANs mein re-address karna realistic nahi hai. Microsegmentation enforcement point ko workload par hi le aata hai, isliye policy workload ke saath chalti hai chahe woh bare metal, VMware ya public cloud par ho.</p>

<h3>Ek paragraph mein Cisco Secure Workload</h3>
<p><b>Cisco Secure Workload</b> (pehle <b>Tetration</b>) SaaS ya on-premises cluster ke roop mein milta hai. Yeh telemetry collect karta hai, applications asal mein kaise baat karti hain uska map banata hai, us map ko allow-list policy mein badalta hai, use simulate karta hai, aur har workload par enforce karta hai. Yeh har host ki software inventory known CVEs ke saath rakhta hai aur anomalies ke liye process behaviour dekhta hai.</p>

<h3>Data kahan se aata hai</h3>
<ul>
<li>Linux aur Windows (aur kuch aur operating systems) par <b>software agents</b> har flow aur uske peeche ka process aur user report karte hain. Enforcement agents host firewall bhi program kar sakte hain.</li>
<li><b>Agentless connectors</b>: cloud flow logs (AWS, Azure, GCP), NetFlow/IPFIX, ERSPAN, load balancers, ASA flow events, vCenter aur Kubernetes orchestrators, aur user aur endpoint context ke liye ISE.</li>
<li>CMDBs, cloud tags aur orchestrators se <b>labels aur annotations</b>, taaki aap IP addresses ki jagah <code>app=payments, tier=db</code> jaise naamon se policy likh sako.</li>
</ul>

<h3>Visibility se enforcement tak: paanch steps</h3>
<ol>
<li><b>Scope</b>: workloads ko labels se bani hierarchy mein organise karo (Company &gt; Prod &gt; Payments).</li>
<li><b>Discover</b>: <b>Application Dependency Mapping (ADM)</b>, jise automatic policy discovery bhi kehte hain, ek jaisa behave karne wale workloads ko clusters mein group karta hai aur unke beech ke flows list karta hai.</li>
<li><b>Review</b>: application owners discovered policy approve ya edit karte hain (WEB se APP tcp 8443, APP se DB tcp 5432) aur catch-all deny jodte hain.</li>
<li><b>Simulate</b>: <b>policy analysis</b> live flows ko draft policy ke against replay karta hai aur har flow ko permitted, rejected ya <b>escaped</b> classify karta hai (aisa flow jise policy block karegi lekin abhi allowed hai). Escaped flows wahi hain jo kal application tod denge.</li>
<li><b>Enforce</b>: agent native host firewall program karta hai (Linux par iptables/nftables, Windows par Windows Filtering Platform), ya policy cloud security groups ko push hoti hai. Host ka cluster se contact toot jaye tab bhi enforcement chalta rehta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Three tier app ka microsegmentation">
<rect x="20" y="70" width="150" height="60" rx="8" fill="#bae6fd"/><text x="95" y="96" text-anchor="middle" class="svg-ink" font-size="13">WEB tier</text><text x="95" y="115" text-anchor="middle" class="svg-muted" font-size="12">VMware</text>
<rect x="245" y="70" width="150" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="96" text-anchor="middle" class="svg-ink" font-size="13">APP tier</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">public cloud</text>
<rect x="470" y="70" width="150" height="60" rx="8" fill="#bbf7d0"/><text x="545" y="96" text-anchor="middle" class="svg-ink" font-size="13">DB tier</text><text x="545" y="115" text-anchor="middle" class="svg-muted" font-size="12">bare metal</text>
<line x1="170" y1="100" x2="245" y2="100" stroke="#64748b" stroke-width="2"/><text x="207" y="90" text-anchor="middle" class="svg-accent" font-size="12">8443</text>
<line x1="395" y1="100" x2="470" y2="100" stroke="#64748b" stroke-width="2"/><text x="432" y="90" text-anchor="middle" class="svg-accent" font-size="12">5432</text>
<path d="M95 130 Q320 200 545 130" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="320" y="190" text-anchor="middle" class="svg-muted" font-size="12">WEB se DB: har host par denied</text>
</svg><p class="cap">Policy har workload par enforce hoti hai, isliye VMware, cloud aur bare metal ke across kaam karti hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek payment application ke VMware par 24 VMs aur flat /16 networks par 60 cloud instances hain. Do hafton ka ADM 7 clusters aur 19 distinct flows discover karta hai. Draft policy mein 19 allow rules plus catch-all deny hai. Policy analysis 18,400 permitted flows, 0 rejected aur <b>312 escaped</b> dikhata hai; saare 312 ek backup server se tcp 10000 par monthly backup job hain jo ADM ne abhi tak nahi dekha tha. Owner woh rule jodta hai, simulation ek hafte tak 0 escaped dikhata hai, aur bina outage ke enforcement on ho jaata hai.</p></div>

<pre class="out">Policy analysis: Payments (last 7 days)
Permitted   18,400
Rejected         0
<span class="hl">Escaped        312   backup-01 -&gt; db cluster tcp/10000 (no matching allow)</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> Discovery ke turant baad enforce kar dena, bina aise simulation period ke jo monthly jobs (backups, patching, reporting) cover kare. Labels ki jagah IP addresses se rules likhna. Woh infrastructure flows bhool jaana jo har host ko chahiye: DNS, NTP, patch server, monitoring agent aur khud Secure Workload cluster.</p></div>
<div class="exam"><p><b>Exam traps.</b> Secure Workload policy <b>workload par</b> (host firewall) ya cloud security groups mein enforce karta hai, network topology se independent. ADM asli flows se policy banata hai. Enforce karne se pehle hamesha simulate karo. Tetration purana naam hai.</p></div>

<div class="scn"><h4>Lateral movement jo ek host par ruk gaya</h4><p>Attackers ne ek unpatched plug-in ke through public web server compromise kiya aur databases aur file shares ke liye internal network scan karne ki koshish ki. Company ne chhe mahine pehle Secure Workload policy enforce ki thi: web cluster sirf APP cluster tak tcp 8443 par, DNS aur patch server tak ja sakta tha. Har scan packet web server ke apne host firewall ne drop kiya, aur rejected flows minutes mein SIEM mein alert ke roop mein dikhe. SOC ne web server isolate kiya, clean image se rebuild kiya aur incident ek host tak hi raha.</p><p><b>Seekh:</b> microsegmentation pehla compromise nahi rokta, lekin network-wide breach ko single-host incident bana deta hai.</p></div>

<div class="iv"><p class="q">"VLANs badle bina VMware aur do public clouds ke across payments application ko kaise segment karoge?"</p><p>Workload-based microsegmentation samjhao: Secure Workload agents install karo (ya cloud connectors use karo), workloads label karo, asli flows discover karne ke liye ADM chalao, application owner ke saath allow-list review karo, policy analysis se tab tak simulate karo jab tak koi escaped flow na rahe, phir host firewall ya cloud security groups se enforce karo. Infrastructure flows, catch-all deny, aur yeh ki policy workload ke saath chalti hai, mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Microsegmentation east-west lateral movement rokta hai; enforcement workload par aa jaata hai.</li>
<li>Secure Workload (pehle Tetration): agents aur agentless connectors, labels, scopes.</li>
<li>ADM flows discover karta hai; owners review karte hain; policy analysis simulate karta hai; phir enforce.</li>
<li>Simulation mein escaped flows woh hain jo enforce karne par tootenge.</li>
<li>Enforcement iptables/nftables, Windows Filtering Platform ya cloud security groups use karta hai.</li>
</ul></div>
`}};export{e as default};