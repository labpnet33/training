var e=`<svg viewBox="0 0 640 300" role="img" aria-label="Cloud troubleshooting ladder from DNS to the application with the typical error message at each layer">
<g font-size="13" class="svg-ink">
<rect x="20" y="10" width="330" height="36" rx="6" fill="#bae6fd"/><text x="34" y="33">1  DNS: does the name resolve?</text>
<rect x="20" y="52" width="330" height="36" rx="6" fill="#bbf7d0"/><text x="34" y="75">2  Route table: is there a path out and back?</text>
<rect x="20" y="94" width="330" height="36" rx="6" fill="#bae6fd"/><text x="34" y="117">3  Network ACL: stateless, both directions</text>
<rect x="20" y="136" width="330" height="36" rx="6" fill="#bbf7d0"/><text x="34" y="159">4  Security group: stateful, allow only</text>
<rect x="20" y="178" width="330" height="36" rx="6" fill="#fde68a"/><text x="34" y="201">5  Host: OS firewall, listening port</text>
<rect x="20" y="220" width="330" height="36" rx="6" fill="#fed7aa"/><text x="34" y="243">6  Application: logs, config, health</text>
</g>
<g font-size="12" class="svg-muted">
<text x="370" y="33">Name or service not known</text>
<text x="370" y="75">Timeout, or network unreachable</text>
<text x="370" y="117">Timeout (silent drop)</text>
<text x="370" y="159">Timeout (silent drop)</text>
<text x="370" y="201">Connection refused</text>
<text x="370" y="243">Connects, then errors or hangs</text>
</g>
<text x="320" y="285" text-anchor="middle" class="svg-ink" font-size="12">Work top to bottom. The error message already tells you which rung you are on.</text>
</svg>`,t={id:`troubleshooting-ladder`,h:{en:`Troubleshooting in the cloud: reading configuration, not packets`,hi:`Cloud mein troubleshooting: packets nahi, configuration padhna`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>Why cloud troubleshooting is a reading skill: you cannot plug a sniffer into someone else's router.</li>
<li>A six-rung ladder (DNS, route, NACL, security group, host, application) and what each error message tells you.</li>
<li>How <b>Reachability Analyzer</b>, <b>VPC Flow Logs</b> and DNS checks fit into that ladder (chapters 2 to 6).</li>
<li>Two guided labs on your own AWS account with honest costs, then a NOC-style capstone with three faults in one VPC.</li>
</ul>
<p><b>Prerequisites.</b> VPCs, subnets, route tables, internet and NAT gateways, security groups and NACLs from the earlier modules of this track, and the idea of a Transit Gateway from the previous module.</p>

<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish. The in-app emulator labs of this module (Reachability Analyzer and the NOC ticket with three faults) are extra practice with the same ideas.</p></div>

<h3>The doctor analogy</h3>
<p>A good doctor does not order every test for every patient. They listen to the symptom, think of the usual suspects in a sensible order, test the cheapest one, and move on only when it is cleared. A cloud engineer does the same with a failing connection. The "symptom" is the error the client prints; the "tests" are looks at configuration and logs; the "order" is the ladder below.</p>

<h3>Why the cloud is different</h3>
<p>In a data center you can span a port, run <code>tcpdump</code> on a switch, or walk to the rack. In AWS you do not own the routers, switches or hypervisors. What you do have is complete, queryable <b>configuration</b> (route tables, security groups, NACLs, attachments) and <b>telemetry</b> (flow logs, metrics). So troubleshooting becomes: write down the flow, read every layer's configuration that the flow touches, and use logs to confirm what really happened. Traceroute is of little use inside a VPC because the virtual router does not answer like a normal hop.</p>

<div class="dia">`+e+`<p class="cap">The ladder and the typical client-side message for each rung.</p></div>

<h3>Start by writing the flow</h3>
<p>Before you open the console, write one line: <b>source</b> (IP or instance), <b>destination</b>, <b>protocol</b>, <b>port</b>, and which side starts the connection. Example: "web-1 (10.91.1.10) to app-1 (10.91.2.20), TCP 8080, web starts it." This line decides which security groups, which route tables and which NACLs you must read, and in which direction.</p>

<h3>The error message is your first clue</h3>
<table class="cmp"><tr><th>What the client shows</th><th>What it usually means</th><th>Rungs to check</th></tr>
<tr><td><code>Name or service not known</code></td><td>The name did not resolve</td><td>1 (DNS)</td></tr>
<tr><td>Connection timed out (no reply at all)</td><td>A packet or its reply was dropped silently</td><td>2, 3, 4</td></tr>
<tr><td><code>Connection refused</code></td><td>The packet reached the host; nothing listens there, or the host firewall rejects</td><td>5, 6 (the network is fine)</td></tr>
<tr><td>Connects, then HTTP 5xx or hangs</td><td>The network is fine; the application has a problem</td><td>6</td></tr>
<tr><td><code>Network is unreachable</code></td><td>The sender has no route at all (often a missing default route or interface)</td><td>2 on the sender</td></tr></table>
<p>Notice the big divide: <b>refused</b> means the network delivered your packet, so stop editing security groups. <b>Timeout</b> means something dropped it silently, which is exactly what security groups, NACLs and missing routes do.</p>

<div class="eg"><p><b>Worked example.</b> web-1 runs <code>curl -m 5 app-1.internal.example:8080</code> and prints "Connection timed out". DNS clearly worked (it tried to connect), so rung 1 is cleared. Timeout points to rungs 2, 3 or 4. The route table of web-sn has a local route for the whole 10.91.0.0/16, so rung 2 is fine. The NACLs on the default setting allow everything, so rung 3 is cleared. The security group app-sg has no inbound rule for 8080 from web: rung 4 is the first failing rung. Add the rule and retest.</p></div>

<h3>Three habits that save hours</h3>
<ol>
<li><b>Read the first blocker only.</b> A ticket can hide several faults in layers. Fix one, retest, and the next one appears.</li>
<li><b>Check both directions.</b> Security groups remember replies, NACLs do not, and routes must exist on both sides.</li>
<li><b>Prove, do not guess.</b> Use Reachability Analyzer and flow logs to confirm the layer before changing anything.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Opening a security group to 0.0.0.0/0 "just to test" and forgetting to close it. Editing three things at once. Treating "name resolves" as "port reachable". Blaming AWS when the real cause is a missing return route.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Connection refused" is not a security group symptom. A blocked security group or NACL produces a timeout, not a refusal.</p></div>

<div class="scn"><h4>The 2 a.m. page</h4><p>An on-call engineer was paged: "checkout API timing out". Instead of restarting servers, they wrote the flow (ALB to app, TCP 8080), saw a timeout rather than a refusal, and checked rung 4 first: a change that evening had removed the ALB security group from the app security group's inbound rule. Re-adding it fixed the issue in four minutes, with no restarts.</p><p><b>Lesson:</b> timeout plus a recent change points to a rule, not to a server.</p></div>

<div class="iv"><p class="q">"A connection from server A to server B in the same VPC fails. How do you troubleshoot?"</p><p>State the flow, then use the error: timeout versus refused. For a timeout, walk route tables, NACLs and security groups in both directions, using Reachability Analyzer to find the first blocker and flow logs to confirm. For a refusal, check the listener and host firewall. Mention that you change one thing at a time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cloud troubleshooting reads configuration and logs; you cannot capture packets on AWS routers.</li>
<li>Write the flow first: source, destination, protocol, port, direction.</li>
<li>Timeout means a silent drop (route, NACL, security group); refused means the host answered.</li>
<li>Work the ladder top to bottom and fix only the first failing rung.</li>
<li>Always check the return direction.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<ul>
<li>Cloud troubleshooting padhne ka skill kyun hai: doosre ke router mein sniffer nahi lagaya ja sakta.</li>
<li>Chhe-rung ladder (DNS, route, NACL, security group, host, application) aur har error message kya batata hai.</li>
<li><b>Reachability Analyzer</b>, <b>VPC Flow Logs</b> aur DNS checks is ladder mein kaise fit hote hain (chapters 2 se 6).</li>
<li>Apne AWS account par imaandar costs ke saath do guided labs, phir ek VPC mein teen faults wala NOC-style capstone.</li>
</ul>
<p><b>Prerequisites.</b> Is track ke pichhle modules se VPCs, subnets, route tables, internet aur NAT gateways, security groups aur NACLs, aur pichhle module se Transit Gateway ka idea.</p>

<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish. Is module ke in-app emulator labs (Reachability Analyzer aur teen faults wala NOC ticket) wahi ideas ki extra practice hain.</p></div>

<h3>Doctor ka analogy</h3>
<p>Achha doctor har patient ke saare tests nahi karwata. Woh symptom sunta hai, sensible order mein usual suspects sochta hai, sabse sasta test karta hai, aur jab woh clear ho tabhi aage badhta hai. Cloud engineer bhi fail hote connection ke saath aisa hi karta hai. "Symptom" woh error hai jo client print karta hai; "tests" configuration aur logs ko dekhna hain; "order" neeche ki ladder hai.</p>

<h3>Cloud alag kyun hai</h3>
<p>Data center mein aap port span kar sakte ho, switch par <code>tcpdump</code> chala sakte ho, ya rack tak chal ke ja sakte ho. AWS mein routers, switches ya hypervisors aapke nahi hote. Jo aapke paas hai woh poori, query ki ja sakne wali <b>configuration</b> (route tables, security groups, NACLs, attachments) aur <b>telemetry</b> (flow logs, metrics) hai. Isliye troubleshooting ban jaata hai: flow likho, us flow ko chhune wali har layer ki configuration padho, aur logs se confirm karo ki asal mein kya hua. VPC ke andar traceroute kaam ka kam hai kyunki virtual router normal hop ki tarah jawab nahi deta.</p>

<div class="dia">`+e+`<p class="cap">Ladder aur har rung ke liye typical client-side message.</p></div>

<h3>Pehle flow likho</h3>
<p>Console kholne se pehle ek line likho: <b>source</b> (IP ya instance), <b>destination</b>, <b>protocol</b>, <b>port</b>, aur connection kaun shuru karta hai. Example: "web-1 (10.91.1.10) se app-1 (10.91.2.20), TCP 8080, web shuru karta hai." Yeh line tay karti hai ki kaunse security groups, route tables aur NACLs padhne hain, aur kis direction mein.</p>

<h3>Error message pehla clue hai</h3>
<table class="cmp"><tr><th>Client kya dikhata hai</th><th>Aam taur par matlab</th><th>Kaunsi rungs check karein</th></tr>
<tr><td><code>Name or service not known</code></td><td>Naam resolve nahi hua</td><td>1 (DNS)</td></tr>
<tr><td>Connection timed out (koi reply nahi)</td><td>Packet ya uska reply chupchaap drop hua</td><td>2, 3, 4</td></tr>
<tr><td><code>Connection refused</code></td><td>Packet host tak pahunchi; wahan kuch listen nahi kar raha, ya host firewall reject karta hai</td><td>5, 6 (network theek hai)</td></tr>
<tr><td>Connect hota hai, phir HTTP 5xx ya hang</td><td>Network theek hai; application ki problem hai</td><td>6</td></tr>
<tr><td><code>Network is unreachable</code></td><td>Sender ke paas koi route hi nahi (aksar default route ya interface missing)</td><td>Sender par 2</td></tr></table>
<p>Bada fark dekho: <b>refused</b> ka matlab network ne aapka packet deliver kar diya, isliye security groups edit karna band karo. <b>Timeout</b> ka matlab kisi ne chupchaap drop kiya, jo bilkul security groups, NACLs aur missing routes karte hain.</p>

<div class="eg"><p><b>Worked example.</b> web-1 par <code>curl -m 5 app-1.internal.example:8080</code> "Connection timed out" print karta hai. DNS saaf chala (connect karne ki koshish hui), isliye rung 1 clear. Timeout rungs 2, 3 ya 4 ki taraf ishara karta hai. web-sn ki route table mein poore 10.91.0.0/16 ka local route hai, isliye rung 2 theek. Default NACLs sab kuch allow karte hain, isliye rung 3 clear. app-sg security group mein web se 8080 ka inbound rule nahi: rung 4 pehli failing rung hai. Rule jodo aur retest karo.</p></div>

<h3>Teen aadatein jo ghante bachati hain</h3>
<ol>
<li><b>Sirf pehla blocker padho.</b> Ticket kai faults ko layers mein chhupa sakta hai. Ek theek karo, retest karo, agla dikhega.</li>
<li><b>Dono directions check karo.</b> Security groups replies yaad rakhte hain, NACLs nahi, aur routes dono sides par chahiye.</li>
<li><b>Guess nahi, saabit karo.</b> Kuch badalne se pehle Reachability Analyzer aur flow logs se layer confirm karo.</li>
</ol>

<div class="warn"><p><b>Common galtiyan.</b> "Bas test ke liye" security group ko 0.0.0.0/0 par khol dena aur band karna bhool jaana. Ek saath teen cheezein badalna. "Naam resolve hota hai" ko "port reachable hai" maan lena. Asal wajah missing return route ho tab AWS ko doshi thehrana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Connection refused" security group ka symptom nahi hai. Blocked security group ya NACL timeout deta hai, refusal nahi.</p></div>

<div class="scn"><h4>Raat ke 2 baje ka page</h4><p>On-call engineer ko page aaya: "checkout API timeout ho raha hai". Servers restart karne ki jagah unhone flow likha (ALB se app, TCP 8080), refusal ki jagah timeout dekha, aur rung 4 pehle check ki: shaam ke ek change ne app security group ke inbound rule se ALB security group hata diya tha. Dobara jodne se chaar minute mein issue fix hua, bina restart ke.</p><p><b>Seekh:</b> timeout plus recent change rule ki taraf ishara karta hai, server ki taraf nahi.</p></div>

<div class="iv"><p class="q">"Same VPC mein server A se server B ka connection fail ho raha hai. Troubleshoot kaise karoge?"</p><p>Flow batao, phir error use karo: timeout versus refused. Timeout ke liye dono directions mein route tables, NACLs aur security groups chalo, pehla blocker dhundne ke liye Reachability Analyzer aur confirm karne ke liye flow logs use karo. Refusal ke liye listener aur host firewall check karo. Batao ki ek waqt mein ek cheez badalte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Cloud troubleshooting configuration aur logs padhta hai; AWS routers par packets capture nahi hote.</li>
<li>Pehle flow likho: source, destination, protocol, port, direction.</li>
<li>Timeout = silent drop (route, NACL, security group); refused = host ne jawab diya.</li>
<li>Ladder upar se neeche chalo aur sirf pehli failing rung theek karo.</li>
<li>Return direction hamesha check karo.</li>
</ul></div>
`}};export{t as default};