var e={id:`cluster`,h:{en:`Clustering: publisher and subscribers (concept)`,hi:`Clustering: publisher aur subscribers (concept)`},body:{en:`
<div class="note"><p><b>Not simulated in the lab.</b> The lab has one ClearPass-style server (CPPM). The publisher/subscriber cluster, replication and failover in this chapter are real ClearPass behaviour that you must understand for interviews and for production, but you cannot practise them in the lab.</p></div>

<p>A company head office has one master rulebook. Regional branches keep a photocopy so they can serve customers even if the line to head office is down, but only head office may edit the rulebook. New pages reach the branches by regular copying. That is a ClearPass <b>cluster</b>.</p>

<h3>Why you would cluster</h3>
<p>One ClearPass server is a single point of failure for every login in the company, and it has a capacity limit. Clustering gives you <b>availability</b> (another node answers when one fails), <b>capacity</b> (more nodes share authentications), and <b>locality</b> (a node in each region, so a WAN failure does not stop local logins). A cluster is a group of ClearPass nodes that share the same configuration database.</p>

<h3>Publisher and subscribers</h3>
<dl class="terms">
<dt>Publisher</dt><dd>The one node that holds the master copy of the configuration. All administration (services, policies, network devices, users) is done on the publisher through its GUI. There is one active publisher at a time.</dd>
<dt>Subscriber</dt><dd>Every other node. It receives the configuration from the publisher by replication and handles RADIUS, TACACS+ and web (guest, Onboard) requests using that local copy.</dd>
<dt>Standby publisher</dt><dd>A subscriber designated to take over the publisher role if the publisher fails. The takeover is configured and then triggered by an administrator or by the failover feature; it needs planning, and you should test it in a lab.</dd>
<dt>Insight</dt><dd>The reporting database. It runs on one chosen node of the cluster, typically with its own sizing considerations.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Cluster layout">
<rect x="230" y="20" width="180" height="56" rx="10" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">Publisher</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">edit configuration here</text>
<rect x="40" y="150" width="170" height="56" rx="10" fill="#bae6fd"/><text x="125" y="174" text-anchor="middle" class="svg-ink" font-size="14">Subscriber 1</text><text x="125" y="192" text-anchor="middle" class="svg-muted" font-size="12">Mumbai HQ</text>
<rect x="235" y="150" width="170" height="56" rx="10" fill="#bae6fd"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="14">Subscriber 2</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">standby publisher</text>
<rect x="430" y="150" width="170" height="56" rx="10" fill="#bae6fd"/><text x="515" y="174" text-anchor="middle" class="svg-ink" font-size="14">Subscriber 3</text><text x="515" y="192" text-anchor="middle" class="svg-muted" font-size="12">branch site</text>
<line x1="290" y1="76" x2="150" y2="150" stroke="#64748b" stroke-width="2"/><line x1="320" y1="76" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><line x1="350" y1="76" x2="480" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">configuration replication</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Switches point at several nodes: primary and secondary RADIUS server</text>
</svg><p class="cap">Configuration flows from the publisher to the subscribers. RADIUS requests are served by whichever node the NAD points to.</p></div>

<h3>What happens when the publisher fails</h3>
<p>The cluster does not stop authenticating. Subscribers keep their last replicated copy and continue to answer RADIUS requests. What you lose until the publisher returns or a standby is promoted:</p>
<ul>
<li>You cannot change configuration (services, policies, devices) from a subscriber GUI.</li>
<li>Some functions that write to the central database are limited or delayed, for example some guest account creation and Onboard enrolment (details depend on version and features; check the documentation for your release).</li>
<li>Replication of new data stops, so subscribers drift out of date.</li>
</ul>
<p>When a subscriber fails, the publisher stays up but the NADs that point to that subscriber need a second server in their configuration, or they will lose authentication. This is the point most people miss: <b>a cluster does not by itself redirect NADs.</b> The NAD decides where to send requests.</p>

<h3>The NAD side of high availability</h3>
<p>A switch should list at least two RADIUS servers: a primary and a secondary on different nodes. On AOS-CX you define several <code>radius-server host</code> lines and put them in the server group in the order of preference. The ClearPass network device entry for the switch is replicated to all nodes, so each node knows the switch; but the secret and the source IP must be right for every node. Test both paths. The lab concept you can practise is the reverse case, <b>critical-role</b> on a port in <code>cp-critical-role</code>: if all servers are unreachable, the switch can put the client in a continuity role.</p>
<pre class="code"><span class="c">! AOS-CX style, representative: two servers in one group</span>
radius-server host 10.20.60.10 key plaintext ArubaNK1
radius-server host 10.20.60.11 key plaintext ArubaNK1
aaa group server radius CPPM
  server 10.20.60.10
  server 10.20.60.11
  exit</pre>
<p>10.20.60.11 is an invented subscriber address for illustration; the lab has only 10.20.60.10.</p>

<h3>Joining a node: what to know</h3>
<p>Adding a node means making it a subscriber of the publisher. This is the step that surprises people: <b>Make Subscriber</b> on a node that already has its own configuration replaces that configuration with the publisher's copy, and application licenses on that node are removed, so licensing for the cluster is planned centrally. Before you join, check the following in a lab or maintenance window:</p>
<ol>
<li>Both nodes run the <b>same software version</b>.</li>
<li>DNS and time (NTP) are correct on both; clock difference breaks trust and certificate checks.</li>
<li>The nodes can reach each other across the network and firewalls (the cluster needs several ports between nodes; use the documented list).</li>
<li>The node you add is a new or disposable node, not a production standalone server with data you need.</li>
<li>You have a recent backup of the publisher.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A company has a publisher in Mumbai and a subscriber in a branch. Each switch has primary = Mumbai and secondary = branch. During a WAN outage the branch switches still authenticate against the local subscriber with the last replicated policy. An engineer creates a new service on the publisher during the outage; the subscriber will not know it until the link returns and replication catches up. So a service change should not be made as an emergency measure without remembering this delay.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Assuming a healthy cluster protects every login: if the NAD lists only one node, it does not. (2) Editing configuration on a subscriber. (3) Clicking Make Subscriber on a standalone production node. (4) Forgetting that every node needs to be a registered, correct-secret path for each NAD.</p></div>

<div class="exam"><p><b>Exam trap.</b> Configuration is changed on the publisher only; authentication runs on all nodes. A cluster has one publisher at a time. Replication health does not prove that the NAD can fail over; you must test the NAD path.</p></div>

<div class="scn"><h4>Two nodes, one untested path</h4><p>The cluster dashboard was green, with both nodes in sync. The branch switch was configured with only the first node as RADIUS server. When that node was rebooted for patching, the whole branch lost network login for 20 minutes. The secondary server had never been tested from the switch.</p><p><b>Lesson:</b> synchronisation evidence is not NAD failover evidence. Configure both servers on the switch and test by taking one node out during a window.</p></div>

<div class="iv"><p class="q">"What happens to authentication if the publisher goes down?"</p><p>Strong answer: subscribers continue to authenticate with their replicated configuration, so existing policy keeps working. Administration and some central-database functions are unavailable until the publisher returns or a standby publisher is promoted. I would also mention that NADs must have a second server configured, because the cluster does not redirect them.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A cluster has one publisher (the master of the configuration) and subscribers that replicate from it.</li>
<li>Configuration is edited on the publisher only; all nodes can authenticate.</li>
<li>If the publisher fails, authentication continues but you cannot change configuration until it returns or a standby is promoted.</li>
<li>NADs must list several RADIUS servers; a healthy cluster does not redirect them.</li>
<li>Make Subscriber replaces the node's configuration and removes its application licenses; check version, time and DNS first.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Lab mein simulate nahi hota.</b> Lab mein ek ClearPass-style server (CPPM) hai. Is chapter ka publisher/subscriber cluster, replication aur failover real ClearPass behaviour hai jo aapko interviews aur production ke liye samajhna zaroori hai, par aap lab mein inki practice nahi kar sakte.</p></div>

<p>Ek company ke head office ke paas ek master rulebook hai. Regional branches uski photocopy rakhti hain taaki head office ki line down ho tab bhi customers ko serve kar sakein, par rulebook sirf head office edit kar sakta hai. Naye pages regular copying se branches tak pahunchte hain. Yahi ClearPass <b>cluster</b> hai.</p>

<h3>Cluster kyun banate hain</h3>
<p>Ek ClearPass server company ke har login ke liye single point of failure hai, aur uski capacity limit hoti hai. Clustering deti hai <b>availability</b> (ek fail ho to doosra node jawab de), <b>capacity</b> (zyada nodes authentications baantte hain), aur <b>locality</b> (har region mein ek node, taaki WAN failure local logins na roke). Cluster ClearPass nodes ka group hai jo same configuration database share karte hain.</p>

<h3>Publisher aur subscribers</h3>
<dl class="terms">
<dt>Publisher</dt><dd>Woh ek node jiske paas configuration ki master copy hoti hai. Saari administration (services, policies, network devices, users) publisher ke GUI se hoti hai. Ek samay mein ek active publisher hota hai.</dd>
<dt>Subscriber</dt><dd>Baaki har node. Woh publisher se replication se configuration leta hai aur us local copy se RADIUS, TACACS+ aur web (guest, Onboard) requests handle karta hai.</dd>
<dt>Standby publisher</dt><dd>Aisa subscriber jo publisher fail hone par publisher ka role sambhalne ke liye designate kiya gaya ho. Takeover configure hota hai aur phir administrator ya failover feature se trigger hota hai; ise planning chahiye, aur lab mein test karna chahiye.</dd>
<dt>Insight</dt><dd>Reporting database. Yeh cluster ke ek chune hue node par chalta hai, aur uske apne sizing considerations hote hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Cluster layout">
<rect x="230" y="20" width="180" height="56" rx="10" fill="#bbf7d0"/><text x="320" y="44" text-anchor="middle" class="svg-ink" font-size="14">Publisher</text><text x="320" y="62" text-anchor="middle" class="svg-muted" font-size="12">configuration yahan edit</text>
<rect x="40" y="150" width="170" height="56" rx="10" fill="#bae6fd"/><text x="125" y="174" text-anchor="middle" class="svg-ink" font-size="14">Subscriber 1</text><text x="125" y="192" text-anchor="middle" class="svg-muted" font-size="12">Mumbai HQ</text>
<rect x="235" y="150" width="170" height="56" rx="10" fill="#bae6fd"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="14">Subscriber 2</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">standby publisher</text>
<rect x="430" y="150" width="170" height="56" rx="10" fill="#bae6fd"/><text x="515" y="174" text-anchor="middle" class="svg-ink" font-size="14">Subscriber 3</text><text x="515" y="192" text-anchor="middle" class="svg-muted" font-size="12">branch site</text>
<line x1="290" y1="76" x2="150" y2="150" stroke="#64748b" stroke-width="2"/><line x1="320" y1="76" x2="320" y2="150" stroke="#64748b" stroke-width="2"/><line x1="350" y1="76" x2="480" y2="150" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">configuration replication</text>
<text x="320" y="240" text-anchor="middle" class="svg-muted" font-size="12">Switches kai nodes ko point karte hain: primary aur secondary RADIUS server</text>
</svg><p class="cap">Configuration publisher se subscribers ko jaati hai. RADIUS requests wahi node serve karta hai jise NAD point karta hai.</p></div>

<h3>Publisher fail ho to kya hota hai</h3>
<p>Cluster authenticate karna band nahi karta. Subscribers apni last replicated copy rakhte hain aur RADIUS requests ka jawab dete rehte hain. Publisher ke wapas aane ya standby promote hone tak aap kya kho dete ho:</p>
<ul>
<li>Subscriber ke GUI se configuration (services, policies, devices) nahi badal sakte.</li>
<li>Central database mein likhne wale kuch functions limited ya delayed ho jaate hain, jaise kuch guest account creation aur Onboard enrolment (details version aur features par depend karti hain; apni release ki documentation dekho).</li>
<li>Naye data ki replication ruk jaati hai, isliye subscribers out of date ho jaate hain.</li>
</ul>
<p>Jab koi subscriber fail ho, publisher up rehta hai par jo NADs us subscriber ko point karte hain unhe apni configuration mein doosra server chahiye, nahi to authentication kho dete hain. Yeh woh point hai jo log sabse zyada miss karte hain: <b>cluster khud NADs ko redirect nahi karta.</b> NAD decide karta hai ki requests kahan bhejni hain.</p>

<h3>High availability ka NAD side</h3>
<p>Switch ko kam se kam do RADIUS servers list karne chahiye: alag nodes par primary aur secondary. AOS-CX par aap kai <code>radius-server host</code> lines define karte ho aur unhe preference ke order mein server group mein daalte ho. Switch ka ClearPass network device entry saare nodes par replicate hota hai, isliye har node switch ko jaanta hai; par secret aur source IP har node ke liye sahi hone chahiye. Dono paths test karo. Lab ka jo concept aap practise kar sakte ho woh ulta case hai, <code>cp-critical-role</code> mein port par <b>critical-role</b>: agar saare servers unreachable hon, to switch client ko continuity role mein daal sakta hai.</p>
<pre class="code"><span class="c">! AOS-CX style, representative: ek group mein do servers</span>
radius-server host 10.20.60.10 key plaintext ArubaNK1
radius-server host 10.20.60.11 key plaintext ArubaNK1
aaa group server radius CPPM
  server 10.20.60.10
  server 10.20.60.11
  exit</pre>
<p>10.20.60.11 illustration ke liye banaya hua subscriber address hai; lab mein sirf 10.20.60.10 hai.</p>

<h3>Node join karna: kya pata hona chahiye</h3>
<p>Node add karne ka matlab use publisher ka subscriber banana hai. Yeh woh step hai jo logon ko chaunkata hai: jis node ke paas pehle se apni configuration ho us par <b>Make Subscriber</b> uski configuration ko publisher ki copy se replace kar deta hai, aur us node ke application licenses hata diye jaate hain, isliye cluster ki licensing central roop se plan hoti hai. Join karne se pehle lab ya maintenance window mein yeh check karo:</p>
<ol>
<li>Dono nodes ka <b>same software version</b> ho.</li>
<li>Dono par DNS aur time (NTP) sahi ho; clock difference trust aur certificate checks tod deta hai.</li>
<li>Nodes network aur firewalls ke across ek doosre tak pahunch sakein (cluster ko nodes ke beech kai ports chahiye; documented list use karo).</li>
<li>Jo node add kar rahe ho woh naya ya disposable ho, aisa production standalone server nahi jiska data chahiye.</li>
<li>Publisher ka recent backup ho.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ek company ka publisher Mumbai mein hai aur ek subscriber branch mein. Har switch par primary = Mumbai aur secondary = branch hai. WAN outage ke dauran branch switches local subscriber se last replicated policy ke saath authenticate karte rehte hain. Engineer outage mein publisher par naya service banata hai; link wapas aane aur replication catch up hone tak subscriber use nahi jaanega. Isliye service change ko emergency measure ki tarah is delay ko yaad rakhe bina nahi karna chahiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Maan lena ki healthy cluster har login protect karta hai: agar NAD sirf ek node list karta hai, to nahi karta. (2) Subscriber par configuration edit karna. (3) Standalone production node par Make Subscriber dabana. (4) Bhool jaana ki har NAD ke liye har node ek registered, sahi-secret wala path hona chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Configuration sirf publisher par badli jaati hai; authentication saare nodes par chalta hai. Cluster mein ek samay mein ek publisher hota hai. Replication health yeh prove nahi karti ki NAD failover kar sakta hai; aapko NAD path test karna padega.</p></div>

<div class="scn"><h4>Do nodes, ek untested path</h4><p>Cluster dashboard green tha, dono nodes sync mein the. Branch switch mein sirf pehla node RADIUS server ke roop mein configure tha. Jab patching ke liye us node ko reboot kiya gaya, poori branch ne 20 minute network login kho diya. Secondary server switch se kabhi test hi nahi hua tha.</p><p><b>Seekh:</b> synchronisation ka evidence NAD failover ka evidence nahi hai. Switch par dono servers configure karo aur window mein ek node ko hata kar test karo.</p></div>

<div class="iv"><p class="q">"Publisher down ho jaye to authentication ka kya hota hai?"</p><p>Strong answer: subscribers apni replicated configuration se authenticate karte rehte hain, isliye maujooda policy kaam karti rehti hai. Administration aur kuch central-database functions publisher ke wapas aane ya standby publisher ke promote hone tak unavailable rehte hain. Main yeh bhi bataunga ki NADs ko doosra server configured hona chahiye, kyunki cluster unhe redirect nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cluster mein ek publisher (configuration ka master) aur usse replicate karne wale subscribers hote hain.</li>
<li>Configuration sirf publisher par edit hoti hai; saare nodes authenticate kar sakte hain.</li>
<li>Publisher fail ho to authentication chalta rehta hai par wapas aane ya standby promote hone tak configuration nahi badal sakte.</li>
<li>NADs ko kai RADIUS servers list karne chahiye; healthy cluster unhe redirect nahi karta.</li>
<li>Make Subscriber node ki configuration replace karta hai aur uske application licenses hata deta hai; pehle version, time aur DNS check karo.</li>
</ul></div>
`}};export{e as default};