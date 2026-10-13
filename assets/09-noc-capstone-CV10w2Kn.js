var e=`<svg viewBox="0 0 640 290" role="img" aria-label="noc-vpc with web, app and db subnets and the three faults of ticket NK-6502">
<defs><marker id="r9" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
<rect x="150" y="10" width="480" height="270" rx="12" fill="#f8fafc" stroke="#64748b"/><text x="165" y="32" class="svg-ink" font-size="13">noc-vpc 10.91.0.0/16</text>
<rect x="10" y="40" width="110" height="50" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="65" y="62" text-anchor="middle" class="svg-ink" font-size="13">Internet</text><text x="65" y="78" text-anchor="middle" class="svg-muted" font-size="11">customers</text>
<rect x="170" y="50" width="130" height="50" rx="8" fill="#fde68a" stroke="#64748b"/><text x="235" y="72" text-anchor="middle" class="svg-ink" font-size="13">noc-igw</text><text x="235" y="88" text-anchor="middle" class="svg-muted" font-size="11">public-rt 0.0.0.0/0</text>
<rect x="330" y="50" width="130" height="70" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="395" y="72" text-anchor="middle" class="svg-ink" font-size="13">web-sn 10.91.1.0/24</text><text x="395" y="90" text-anchor="middle" class="svg-muted" font-size="11">web-1 + web-sg</text>
<rect x="330" y="140" width="130" height="70" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="395" y="162" text-anchor="middle" class="svg-ink" font-size="13">app-sn 10.91.2.0/24</text><text x="395" y="180" text-anchor="middle" class="svg-muted" font-size="11">app-1, app-rt</text>
<rect x="490" y="140" width="130" height="70" rx="8" fill="#e2e8f0" stroke="#64748b"/><text x="555" y="162" text-anchor="middle" class="svg-ink" font-size="13">db-sn 10.91.3.0/24</text><text x="555" y="180" text-anchor="middle" class="svg-muted" font-size="11">db-1, db-acl, db-sg</text>
<rect x="490" y="50" width="130" height="50" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="555" y="72" text-anchor="middle" class="svg-ink" font-size="13">Amazon S3</text><text x="555" y="88" text-anchor="middle" class="svg-muted" font-size="11">artifact pulls</text>
<g stroke="#64748b" stroke-width="2" marker-end="url(#r9)"><line x1="120" y1="65" x2="168" y2="75"/><line x1="300" y1="75" x2="328" y2="80"/><line x1="395" y1="120" x2="395" y2="138"/><line x1="460" y1="175" x2="488" y2="175"/><line x1="460" y1="155" x2="540" y2="102"/></g>
<g fill="#b91c1c"><circle cx="318" cy="105" r="11"/><circle cx="475" cy="198" r="11"/><circle cx="495" cy="112" r="11"/></g>
<g fill="#ffffff" font-size="13" text-anchor="middle"><text x="318" y="110">1</text><text x="475" y="203">2</text><text x="495" y="117">3</text></g>
<text x="170" y="246" class="svg-ink" font-size="12">1  customers cannot open the website (web-sg)</text>
<text x="170" y="264" class="svg-ink" font-size="12">2  app cannot write to db, analyzer is green (db-acl)</text>
<text x="400" y="246" class="svg-ink" font-size="12"> </text>
<text x="170" y="282" class="svg-ink" font-size="12">3  the NAT bill is huge: S3 pulls need an endpoint</text>
</svg>`,t={id:`noc-capstone`,h:{en:`NOC capstone: three faults in one VPC`,hi:`NOC capstone: ek VPC mein teen faults`},body:{en:`
<p>A Network Operations Centre (NOC) engineer is a calm person in a noisy room. Tickets arrive with several complaints at once, each from a different team, each marked urgent. The skill is not knowing every command; it is <b>ordering the work, isolating one fault at a time, proving each fix, and leaving a clean note for the next shift</b>. This capstone brings the whole module together in one realistic ticket.</p>

<h3>The ticket</h3>
<p><b>NK-6502.</b> "(1) Customers cannot open the website on web-1. (2) The app cannot write to the database db-1, even though the analyzer says the path is fine. (3) Finance asks why the NAT bill is so high: app servers pull a lot from S3." All three live in <code>noc-vpc</code> (10.91.0.0/16).</p>
<div class="dia">`+e+`<p class="cap">The VPC of the capstone and the location of each fault. Fault 1 is at the front door, fault 2 on the data path, fault 3 is a cost problem on the exit path.</p></div>

<h3>Triage: order by impact</h3>
<table class="cmp"><tr><th>Fault</th><th>Who feels it</th><th>Priority</th></tr>
<tr><td>1. Website down</td><td>Customers, revenue</td><td>First</td></tr>
<tr><td>2. Database writes fail</td><td>Application, data integrity</td><td>Second (or first if data is being lost)</td></tr>
<tr><td>3. High NAT bill</td><td>Finance, money, no outage</td><td>Third; change carefully, no urgency</td></tr></table>
<p>The method for each fault is the one from chapter 1: write the flow, read the error, test, fix the <b>first</b> blocker only, retest in both directions, then record.</p>

<h3>Fault 1: customers cannot open the website</h3>
<p><b>Flow:</b> internet to web-1 (10.91.1.10), TCP 443, the customer starts it. <b>Symptom:</b> timeout, which says "silent drop": route, NACL or security group.</p>
<ol>
<li><b>Front door checks:</b> noc-igw is attached to the VPC; public-rt has <code>0.0.0.0/0</code> to noc-igw and is associated with web-sn; web-1 has a public IPv4 address. All fine.</li>
<li><b>NACL:</b> web-sn uses the default NACL, which allows everything. Fine.</li>
<li><b>Security group:</b> web-sg has no inbound rule for TCP 443. First failing rung.</li>
</ol>
<pre class="code">nk-probe internet web-1 443           <span class="c"># emulator: reports the blocking component</span>
aws ec2 describe-security-groups --filters Name=tag:Name,Values=web-sg --query 'SecurityGroups[0].IpPermissions'
aws ec2 authorize-security-group-ingress --group-id $WEB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0
nk-probe internet web-1 443           <span class="c"># must connect now</span></pre>
<p>Answer for the lab question: the blocking component is the <b>security group</b>. A public website legitimately accepts 443 from anywhere; this is not the place to open SSH or database ports. After the fix, check that the application really answers (a real HTTPS request), because "connects" only proves the network.</p>

<h3>Fault 2: the app cannot write to the database</h3>
<p><b>Flow:</b> app-1 (10.91.2.20) to db-1 (10.91.3.30), TCP 5432, app starts it. A previous engineer already ran Reachability Analyzer and got <code>NetworkPathFound true</code>.</p>
<ol>
<li><b>Do not trust one tool.</b> The analyzer examined the forward path. Test the real round trip with a probe: <code>nk-probe app-1 db-1 5432</code>. The answer to the lab question: the <b>reply</b> half fails.</li>
<li><b>Which layer drops only replies?</b> A security group is stateful, so it cannot. A stateless filter can. db-sn uses a custom NACL, <code>db-acl</code>, with an inbound allow for TCP 5432 from 10.91.2.0/24 and <b>no outbound rule</b>.</li>
<li><b>Fix:</b> outbound rule 100 allowing TCP 1024 to 65535 to 10.91.2.0/24.</li>
</ol>
<pre class="code">aws ec2 create-network-acl-entry --network-acl-id $DB_ACL --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --cidr-block 10.91.2.0/24 --rule-action allow
nk-probe app-1 db-1 5432              <span class="c"># run it again: it must connect</span></pre>
<p><b>Evidence on a real account</b> would be a flow log pair on the db ENI: request ACCEPT, reply REJECT (chapter 5, and the guided lab of chapter 8 reproduces exactly this).</p>

<h3>Fault 3: the NAT bill</h3>
<p><b>Observation:</b> app servers pull large volumes from S3; with only a default route to a NAT gateway, every byte is billed per GB at the NAT. <b>Fix:</b> an S3 <b>gateway endpoint</b> attached to <code>app-rt</code>. This is a configuration change with no outage and no application change.</p>
<pre class="code">aws ec2 create-vpc-endpoint --vpc-id $VPC --vpc-endpoint-type Gateway --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $APP_RT
aws ec2 describe-route-tables --route-table-ids $APP_RT --query 'RouteTables[0].Routes'</pre>
<p>Check that <code>app-rt</code> now has a prefix-list route to the endpoint. Remember the limits: it covers S3 in the same Region (and DynamoDB with its own endpoint), not other internet destinations. Measure the effect after a billing cycle by comparing the NAT gateway bytes metric before and after.</p>

<h3>The handover note</h3>
<p>The ticket is not finished until the next shift can understand it. A good note is short and factual:</p>
<pre class="out">NK-6502 update
1. web-1: web-sg had no inbound TCP 443. Added 443 from 0.0.0.0/0. Verified: connect OK.
2. db write: db-acl had no outbound rule (stateless; replies dropped). Added egress rule 100, TCP 1024-65535 to 10.91.2.0/24. Verified: app-1 to db-1 5432 connects.
3. NAT cost: added S3 gateway endpoint on app-rt. Verified: prefix-list route present. Follow-up: compare NAT bytes next week.
Open: none. Rollback: delete the added rules / endpoint.</pre>

<h3>Practise it</h3>
<ul>
<li>In the in-app emulator, run <b>Lab 2: NOC ticket</b>. Each task above is one lab step.</li>
<li>On your own account, chapter 8 reproduces fault 2 with real flow logs; chapter 7 lets you practise the analyzer on fault-1-style security group problems. Fault 3 is mostly about reading a bill, so rehearse it in the emulator.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Fixing fault 2 by opening the NACL to everything instead of the ephemeral range to the app subnet only. Using 0.0.0.0/0 where one subnet is enough. Declaring victory when the analyzer is green. Doing the cost change first because it is easy while customers are down.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Reachability Analyzer shows the path is reachable, yet the TCP handshake fails." The answer to look for is a stateless NACL (or return route) blocking the reply, not a bug in the analyzer.</p></div>

<div class="scn"><h4>Three tickets, one afternoon</h4><p>On a quiet afternoon three tickets arrived within ten minutes: a site timeout, a database write failure, and a cost question. The new NOC engineer worked them in impact order, wrote the flow for each in the ticket, fixed one rule per ticket, and attached the probe output as proof. The lead later said the proof lines mattered more than the speed.</p><p><b>Lesson:</b> order, isolate, prove, record.</p></div>

<div class="iv"><p class="q">"You get three unrelated complaints at once. How do you handle them?"</p><p>Triage by impact (customer-facing outage first), isolate each flow, work the ladder for the first blocker only, fix and retest in both directions, and record evidence and rollback in the ticket. Say that cost items are scheduled, not rushed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Triage by impact, then run the ladder for each fault separately.</li>
<li>Fault 1: timeout to a public web server often means a missing security group rule on 443.</li>
<li>Fault 2: analyzer green plus failing connection means look at the reply: a stateless NACL or return route.</li>
<li>Fault 3: S3 gateway endpoint on the route table removes S3 traffic from the NAT per-GB bill.</li>
<li>Always leave a handover note with evidence and rollback.</li>
</ul></div>
`,hi:`
<p>Network Operations Centre (NOC) engineer shor wale kamre mein shant insaan hota hai. Tickets mein ek saath kai complaints aate hain, har ek alag team se, har ek urgent. Skill har command jaanna nahi hai; skill hai <b>kaam ko order dena, ek waqt mein ek fault isolate karna, har fix saabit karna, aur agli shift ke liye saaf note chhodna</b>. Yeh capstone poore module ko ek realistic ticket mein jodta hai.</p>

<h3>Ticket</h3>
<p><b>NK-6502.</b> "(1) Customers web-1 par website nahi khol pa rahe. (2) App database db-1 mein likh nahi pa raha, jabki analyzer kehta hai path theek hai. (3) Finance puch rahi hai NAT bill itna zyada kyun: app servers S3 se bahut kuch kheenchte hain." Teeno <code>noc-vpc</code> (10.91.0.0/16) mein hain.</p>
<div class="dia">`+e+`<p class="cap">Capstone ka VPC aur har fault ki jagah. Fault 1 front door par hai, fault 2 data path par, fault 3 exit path par cost problem hai.</p></div>

<h3>Triage: impact ke hisaab se order</h3>
<table class="cmp"><tr><th>Fault</th><th>Kise mehsoos hota hai</th><th>Priority</th></tr>
<tr><td>1. Website down</td><td>Customers, revenue</td><td>Pehla</td></tr>
<tr><td>2. Database writes fail</td><td>Application, data integrity</td><td>Doosra (ya data kho raha ho to pehla)</td></tr>
<tr><td>3. High NAT bill</td><td>Finance, paisa, outage nahi</td><td>Teesra; dhyan se badlo, jaldi nahi</td></tr></table>
<p>Har fault ka method chapter 1 wala hai: flow likho, error padho, test karo, sirf <b>pehla</b> blocker theek karo, dono directions mein retest karo, phir record karo.</p>

<h3>Fault 1: customers website nahi khol pa rahe</h3>
<p><b>Flow:</b> internet se web-1 (10.91.1.10), TCP 443, customer shuru karta hai. <b>Symptom:</b> timeout, jo kehta hai "silent drop": route, NACL ya security group.</p>
<ol>
<li><b>Front door checks:</b> noc-igw VPC se attached hai; public-rt mein <code>0.0.0.0/0</code> noc-igw ko hai aur web-sn se associated hai; web-1 ke paas public IPv4 address hai. Sab theek.</li>
<li><b>NACL:</b> web-sn default NACL use karta hai, jo sab kuch allow karta hai. Theek.</li>
<li><b>Security group:</b> web-sg mein TCP 443 ka inbound rule nahi. Pehli failing rung.</li>
</ol>
<pre class="code">nk-probe internet web-1 443           <span class="c"># emulator: blocking component batata hai</span>
aws ec2 describe-security-groups --filters Name=tag:Name,Values=web-sg --query 'SecurityGroups[0].IpPermissions'
aws ec2 authorize-security-group-ingress --group-id $WEB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0
nk-probe internet web-1 443           <span class="c"># ab connect hona chahiye</span></pre>
<p>Lab sawal ka jawab: blocking component <b>security group</b> hai. Public website jaayaz taur par 443 har jagah se accept karti hai; yeh SSH ya database ports kholne ki jagah nahi. Fix ke baad check karo ki application sach mein jawab deti hai (asli HTTPS request), kyunki "connects" sirf network saabit karta hai.</p>

<h3>Fault 2: app database mein nahi likh pa raha</h3>
<p><b>Flow:</b> app-1 (10.91.2.20) se db-1 (10.91.3.30), TCP 5432, app shuru karta hai. Pehle ke engineer ne Reachability Analyzer chalaya aur <code>NetworkPathFound true</code> mila.</p>
<ol>
<li><b>Ek tool par bharosa mat karo.</b> Analyzer ne forward path dekha. Asli round trip probe se test karo: <code>nk-probe app-1 db-1 5432</code>. Lab sawal ka jawab: <b>reply</b> half fail hota hai.</li>
<li><b>Kaunsi layer sirf replies drop karti hai?</b> Security group stateful hai, woh nahi kar sakta. Stateless filter kar sakta hai. db-sn custom NACL <code>db-acl</code> use karta hai jisme 10.91.2.0/24 se TCP 5432 ka inbound allow hai aur <b>koi outbound rule nahi</b>.</li>
<li><b>Fix:</b> outbound rule 100, 10.91.2.0/24 ko TCP 1024 se 65535 allow.</li>
</ol>
<pre class="code">aws ec2 create-network-acl-entry --network-acl-id $DB_ACL --egress --rule-number 100 --protocol tcp --port-range From=1024,To=65535 --cidr-block 10.91.2.0/24 --rule-action allow
nk-probe app-1 db-1 5432              <span class="c"># dobara chalao: connect hona chahiye</span></pre>
<p>Asli account par <b>saboot</b> db ENI par flow log ki jodi hogi: request ACCEPT, reply REJECT (chapter 5, aur chapter 8 ka guided lab bilkul yahi reproduce karta hai).</p>

<h3>Fault 3: NAT bill</h3>
<p><b>Observation:</b> app servers S3 se bade volumes khinchte hain; sirf NAT gateway ke default route ke saath har byte NAT par per GB bill hota hai. <b>Fix:</b> <code>app-rt</code> se attached S3 <b>gateway endpoint</b>. Yeh configuration change hai, na outage na application change.</p>
<pre class="code">aws ec2 create-vpc-endpoint --vpc-id $VPC --vpc-endpoint-type Gateway --service-name com.amazonaws.ap-south-1.s3 --route-table-ids $APP_RT
aws ec2 describe-route-tables --route-table-ids $APP_RT --query 'RouteTables[0].Routes'</pre>
<p>Check karo ki <code>app-rt</code> mein ab endpoint ki taraf prefix-list route hai. Limits yaad rakho: yeh same Region ka S3 cover karta hai (aur DynamoDB apne endpoint ke saath), doosri internet destinations ko nahi. Effect ek billing cycle ke baad NAT gateway bytes metric before aur after compare karke naapo.</p>

<h3>Handover note</h3>
<p>Ticket tab tak khatam nahi jab tak agli shift use samajh na sake. Achha note chhota aur tathyaparak hota hai:</p>
<pre class="out">NK-6502 update
1. web-1: web-sg mein inbound TCP 443 nahi tha. 0.0.0.0/0 se 443 jodi. Verified: connect OK.
2. db write: db-acl mein outbound rule nahi tha (stateless; replies drop). Egress rule 100, TCP 1024-65535 to 10.91.2.0/24 jodi. Verified: app-1 to db-1 5432 connect.
3. NAT cost: app-rt par S3 gateway endpoint joda. Verified: prefix-list route maujood. Follow-up: agle hafte NAT bytes compare karna.
Open: koi nahi. Rollback: jodi hui rules / endpoint delete karo.</pre>

<h3>Practise karo</h3>
<ul>
<li>In-app emulator mein <b>Lab 2: NOC ticket</b> chalao. Upar ka har task ek lab step hai.</li>
<li>Apne account par chapter 8 asli flow logs ke saath fault 2 reproduce karta hai; chapter 7 fault-1-jaisi security group problems par analyzer practise karwata hai. Fault 3 zyada tar bill padhne ke baare mein hai, isliye emulator mein rehearse karo.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Fault 2 ko sirf app subnet ko ephemeral range allow karne ki jagah NACL ko sab ke liye khol kar theek karna. Jahan ek subnet kaafi hai wahan 0.0.0.0/0 use karna. Analyzer green dekhkar jeet ghoshit kar dena. Customers down hon aur cost change pehle karna kyunki woh aasaan hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Reachability Analyzer path reachable batata hai, phir bhi TCP handshake fail hota hai." Jawab stateless NACL (ya return route) hai jo reply block karta hai, analyzer ka bug nahi.</p></div>

<div class="scn"><h4>Teen tickets, ek dopahar</h4><p>Shant dopahar mein das minute ke andar teen tickets aaye: site timeout, database write failure, aur ek cost sawal. Naye NOC engineer ne unhe impact order mein chalaya, har ticket mein flow likhi, har ticket mein ek rule theek kiya, aur saboot ke taur par probe output attach kiya. Lead ne baad mein kaha ki saboot ki lines speed se zyada matter karti thi.</p><p><b>Seekh:</b> order, isolate, prove, record.</p></div>

<div class="iv"><p class="q">"Aapko ek saath teen alag complaints milti hain. Kaise sambhaloge?"</p><p>Impact se triage (customer-facing outage pehle), har flow isolate karo, sirf pehle blocker ke liye ladder chalao, dono directions mein fix aur retest karo, aur ticket mein evidence aur rollback record karo. Batao ki cost items schedule hote hain, rush nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Impact se triage karo, phir har fault ke liye alag ladder chalao.</li>
<li>Fault 1: public web server ko timeout aksar 443 par security group rule ka missing hona hota hai.</li>
<li>Fault 2: analyzer green plus connection fail = reply dekho: stateless NACL ya return route.</li>
<li>Fault 3: route table par S3 gateway endpoint S3 traffic ko NAT ke per-GB bill se hata deta hai.</li>
<li>Hamesha evidence aur rollback ke saath handover note chhodo.</li>
</ul></div>
`}};export{t as default};