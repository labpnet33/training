var e=`<svg viewBox="0 0 640 230" role="img" aria-label="Two flow log records: request accepted, reply rejected">
<g font-size="12" class="svg-ink">
<rect x="10" y="10" width="620" height="30" fill="#e2e8f0" stroke="#64748b"/>
<text x="20" y="30">srcaddr</text><text x="140" y="30">srcport</text><text x="215" y="30">dstaddr</text><text x="345" y="30">dstport</text><text x="425" y="30">protocol</text><text x="515" y="30">action</text>
<rect x="10" y="40" width="620" height="34" fill="#f8fafc" stroke="#64748b"/>
<text x="20" y="62">10.91.2.20</text><text x="140" y="62">49152</text><text x="215" y="62">10.91.3.30</text><text x="345" y="62">5432</text><text x="425" y="62">6 (TCP)</text><rect x="505" y="46" width="115" height="22" rx="4" fill="#bbf7d0"/><text x="515" y="62">ACCEPT</text>
<rect x="10" y="74" width="620" height="34" fill="#f8fafc" stroke="#64748b"/>
<text x="20" y="96">10.91.3.30</text><text x="140" y="96">5432</text><text x="215" y="96">10.91.2.20</text><text x="345" y="96">49152</text><text x="425" y="96">6 (TCP)</text><rect x="505" y="80" width="115" height="22" rx="4" fill="#fed7aa"/><text x="515" y="96">REJECT</text>
</g>
<text x="20" y="135" class="svg-accent" font-size="12">Row 1: the request app to db, accepted.</text>
<text x="20" y="155" class="svg-accent" font-size="12">Row 2: the reply db to app, same ENI, rejected.</text>
<text x="20" y="185" class="svg-ink" font-size="12">A security group would never reject the reply of an accepted request.</text>
<text x="20" y="205" class="svg-ink" font-size="12">Accepted request plus rejected reply points at a stateless NACL.</text>
</svg>`,t={id:`flow-logs`,h:{en:`VPC Flow Logs: the black-box recorder of your network`,hi:`VPC Flow Logs: aapke network ka black-box recorder`},body:{en:`
<p>When a flight has a problem, investigators open the black box. They do not guess; they read what the plane recorded. <b>VPC Flow Logs</b> is the black box for your network: a record of who tried to talk to whom, on which port, and whether the network accepted or rejected the attempt. Reachability Analyzer predicts from configuration; flow logs show what actually happened.</p>

<h3>What a flow log is</h3>
<p>A flow log captures IP traffic information for network interfaces and writes <b>records</b> to a destination. You can create a flow log at three levels:</p>
<ul>
<li><b>VPC</b>: every interface in the VPC.</li>
<li><b>Subnet</b>: every interface in that subnet.</li>
<li><b>Network interface</b>: just one ENI, the cheapest way to investigate one server.</li>
</ul>
<p>Destinations: Amazon CloudWatch Logs (good for quick searching), Amazon S3 (good for long storage and Athena queries), or Kinesis Data Firehose. You choose to capture <code>ACCEPT</code>, <code>REJECT</code> or <code>ALL</code> traffic.</p>
<pre class="code">aws ec2 create-flow-logs --resource-type VPC --resource-ids $VPC --traffic-type ALL \\
  --log-destination-type s3 --log-destination arn:aws:s3:::example-flow-bucket/vpc-logs/ \\
  --max-aggregation-interval 60</pre>
<p>It captures metadata only, never packet contents. Records are <b>aggregated</b> over an interval (10 minutes by default, or 1 minute if you ask) and delivered after that, so flow logs are not real time.</p>

<h3>Reading a record</h3>
<p>The default record has 14 space-separated fields, in this order: <code>version account-id interface-id srcaddr dstaddr srcport dstport protocol packets bytes start end action log-status</code>.</p>
<p><b>Illustrative output</b> (two records seen at the database interface):</p>
<pre class="out">2 111122223333 eni-0a1b2c3d4e5f6a7b8 10.91.2.20 10.91.3.30 49152 5432 6 12 960 1700000000 1700000060 <span class="hl">ACCEPT</span> OK
2 111122223333 eni-0a1b2c3d4e5f6a7b8 10.91.3.30 10.91.2.20 5432 49152 6 12 840 1700000000 1700000060 <span class="hl">REJECT</span> OK</pre>
<p>Protocol is the IANA number: 6 is TCP, 17 is UDP, 1 is ICMP. Ports 49152 and 5432 reveal which side is the client (ephemeral port) and which is the server.</p>

<div class="dia">`+e+`<p class="cap">The same flow seen twice, once in each direction. The pair of actions is the clue.</p></div>

<h3>Turning records into a diagnosis</h3>
<table class="cmp"><tr><th>You see</th><th>Likely cause</th></tr>
<tr><td>Request REJECT at the destination ENI</td><td>Inbound security group or NACL denies it</td></tr>
<tr><td>Request ACCEPT, no reply record at all</td><td>Nothing answered: host firewall, service not listening, or the host is down</td></tr>
<tr><td>Request ACCEPT, reply REJECT</td><td>A stateless NACL blocks the reply (security groups always allow replies of accepted requests)</td></tr>
<tr><td>No record at the destination, but ACCEPT at the source</td><td>Dropped between: route, blackhole, transit gateway, peering</td></tr>
<tr><td>Nothing anywhere</td><td>The sender never sent it: DNS, application, wrong IP</td></tr></table>

<h3>Searching the logs</h3>
<p>With CloudWatch Logs Insights you can query default-format records by field names. A starter query for rejected traffic to the database port (<b>illustrative</b>):</p>
<pre class="code">fields @timestamp, srcAddr, dstAddr, dstPort, action
| filter action = "REJECT" and (dstPort = 5432 or srcPort = 5432)
| sort @timestamp desc
| limit 20</pre>
<p>With S3 you can create an Athena table over the files and run SQL. For a first investigation, a flow log on a single ENI plus <code>grep REJECT</code> on a downloaded file is enough.</p>

<h3>What flow logs do not capture</h3>
<ul>
<li>Traffic to the Amazon-provided DNS resolver (chapter 6).</li>
<li>DHCP traffic, instance metadata (169.254.169.254), the Amazon Time Sync address, and Windows licence activation.</li>
<li>Traffic to the reserved address of the default VPC router.</li>
<li>Packet payloads. For those you need traffic mirroring or on-host capture.</li>
</ul>

<h3>Cost</h3>
<p>Flow logs are billed as vended log delivery: you pay for data published to the destination (and for CloudWatch Logs or S3 storage, and any query tool such as Athena). A busy VPC at ALL traffic can generate gigabytes a day. Rates differ by Region and destination, so check the Amazon CloudWatch and Amazon VPC pricing pages. As an assumed illustration only: 50 GB of log data a month at an assumed $0.50 per GB is $25. For troubleshooting, enable flow logs on one ENI or subnet, set the traffic type to REJECT if that is all you need, and turn them off afterwards.</p>

<div class="eg"><p><b>Worked example.</b> Clients time out on the database. Flow logs on the db ENI show 40 records in the last 10 minutes: every request from 10.91.2.20 to port 5432 is ACCEPT, and every reply from port 5432 back to 10.91.2.20 is REJECT. You need no analyzer: the pair says "inbound fine, outbound denied by something stateless". You open the db-sn NACL and find no outbound allow. One rule fixes it, and the next window of logs shows the reply as ACCEPT.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Expecting real-time data (there is an aggregation delay). Forgetting that REJECT at the destination does not say whether it was the security group or the NACL (look for the reply pattern or check both). Leaving ALL traffic on a busy VPC for weeks. Misreading which of the two addresses is the client.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Flow logs capture packet contents and DNS queries to the VPC resolver." Neither is true: metadata only, and resolver traffic is excluded.</p></div>

<div class="scn"><h4>The port scan that was only a health check</h4><p>A security alert showed hundreds of REJECT records from one address to many ports on an application subnet. Flow logs at the ENI level showed the source was the company's own vulnerability scanner running on its weekly schedule from a new range that the NACL did not allow. The team allowed the scanner range for the scan window and documented it, rather than weakening the NACL.</p><p><b>Lesson:</b> REJECT records tell you what the network blocked; you still decide whether blocking was right.</p></div>

<div class="iv"><p class="q">"Request accepted, reply rejected in flow logs. What does it mean?"</p><p>It points at a stateless NACL denying the reply, because a security group automatically allows the reply of an accepted request. Fix the NACL's outbound rule for the client's ephemeral port range, then confirm the reply turns to ACCEPT in the next aggregation window.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow logs record accepted and rejected flows per ENI, subnet or VPC, metadata only.</li>
<li>Default record: 14 fields; protocol 6 is TCP; action is ACCEPT or REJECT.</li>
<li>Records are aggregated and delayed, not real time.</li>
<li>ACCEPT request plus REJECT reply means a stateless NACL.</li>
<li>DNS resolver, DHCP and metadata traffic are not logged; enable narrowly and turn off after use.</li>
</ul></div>
`,hi:`
<p>Flight mein problem ho to investigators black box kholte hain. Woh andaza nahi lagate; plane ne jo record kiya woh padhte hain. <b>VPC Flow Logs</b> aapke network ka black box hai: kisne kisse, kis port par baat karne ki koshish ki, aur network ne use accept kiya ya reject, iska record. Reachability Analyzer configuration se predict karta hai; flow logs dikhate hain ki asal mein kya hua.</p>

<h3>Flow log kya hai</h3>
<p>Flow log network interfaces ki IP traffic information capture karta hai aur <b>records</b> ek destination par likhta hai. Aap teen levels par flow log bana sakte ho:</p>
<ul>
<li><b>VPC</b>: VPC ka har interface.</li>
<li><b>Subnet</b>: us subnet ka har interface.</li>
<li><b>Network interface</b>: sirf ek ENI, ek server investigate karne ka sabse sasta tareeka.</li>
</ul>
<p>Destinations: Amazon CloudWatch Logs (jaldi search ke liye achha), Amazon S3 (lambi storage aur Athena queries ke liye achha), ya Kinesis Data Firehose. Aap <code>ACCEPT</code>, <code>REJECT</code> ya <code>ALL</code> traffic capture karna chunte ho.</p>
<pre class="code">aws ec2 create-flow-logs --resource-type VPC --resource-ids $VPC --traffic-type ALL \\
  --log-destination-type s3 --log-destination arn:aws:s3:::example-flow-bucket/vpc-logs/ \\
  --max-aggregation-interval 60</pre>
<p>Yeh sirf metadata capture karta hai, packet contents kabhi nahi. Records ek interval par <b>aggregate</b> hote hain (default 10 minute, ya maango to 1 minute) aur uske baad deliver hote hain, isliye flow logs real time nahi hain.</p>

<h3>Record padhna</h3>
<p>Default record mein 14 space-separated fields hote hain, is order mein: <code>version account-id interface-id srcaddr dstaddr srcport dstport protocol packets bytes start end action log-status</code>.</p>
<p><b>Illustrative output</b> (database interface par dikhe do records):</p>
<pre class="out">2 111122223333 eni-0a1b2c3d4e5f6a7b8 10.91.2.20 10.91.3.30 49152 5432 6 12 960 1700000000 1700000060 <span class="hl">ACCEPT</span> OK
2 111122223333 eni-0a1b2c3d4e5f6a7b8 10.91.3.30 10.91.2.20 5432 49152 6 12 840 1700000000 1700000060 <span class="hl">REJECT</span> OK</pre>
<p>Protocol IANA number hai: 6 TCP, 17 UDP, 1 ICMP. Ports 49152 aur 5432 batate hain ki client kaunsa hai (ephemeral port) aur server kaunsa.</p>

<div class="dia">`+e+`<p class="cap">Wahi flow do baar dikha, har direction mein ek baar. Actions ki jodi clue hai.</p></div>

<h3>Records se diagnosis</h3>
<table class="cmp"><tr><th>Aap kya dekhte ho</th><th>Likely cause</th></tr>
<tr><td>Destination ENI par request REJECT</td><td>Inbound security group ya NACL deny karta hai</td></tr>
<tr><td>Request ACCEPT, reply ka koi record nahi</td><td>Kisi ne jawab nahi diya: host firewall, service listen nahi kar rahi, ya host down</td></tr>
<tr><td>Request ACCEPT, reply REJECT</td><td>Stateless NACL reply block karta hai (security groups accepted request ka reply hamesha allow karte hain)</td></tr>
<tr><td>Destination par record nahi, par source par ACCEPT</td><td>Beech mein drop: route, blackhole, transit gateway, peering</td></tr>
<tr><td>Kahin kuch nahi</td><td>Sender ne bheja hi nahi: DNS, application, galat IP</td></tr></table>

<h3>Logs mein search karna</h3>
<p>CloudWatch Logs Insights se default-format records ko field names se query kar sakte ho. Database port ke rejected traffic ke liye starter query (<b>illustrative</b>):</p>
<pre class="code">fields @timestamp, srcAddr, dstAddr, dstPort, action
| filter action = "REJECT" and (dstPort = 5432 or srcPort = 5432)
| sort @timestamp desc
| limit 20</pre>
<p>S3 ke saath files par Athena table bana kar SQL chala sakte ho. Pehli investigation ke liye ek ENI par flow log aur download ki hui file par <code>grep REJECT</code> kaafi hai.</p>

<h3>Flow logs kya capture nahi karte</h3>
<ul>
<li>Amazon-provided DNS resolver ka traffic (chapter 6).</li>
<li>DHCP traffic, instance metadata (169.254.169.254), Amazon Time Sync address, aur Windows licence activation.</li>
<li>Default VPC router ke reserved address ka traffic.</li>
<li>Packet payloads. Unke liye traffic mirroring ya on-host capture chahiye.</li>
</ul>

<h3>Cost</h3>
<p>Flow logs vended log delivery ke taur par bill hote hain: destination par publish hua data (aur CloudWatch Logs ya S3 storage, aur Athena jaise query tool) ka paisa lagta hai. ALL traffic par busy VPC din mein gigabytes bana sakta hai. Rates Region aur destination ke hisaab se alag hain, isliye Amazon CloudWatch aur Amazon VPC pricing pages dekho. Sirf assumed illustration: mahine mein 50 GB log data, assumed $0.50 per GB par, $25 hai. Troubleshooting ke liye ek ENI ya subnet par flow logs enable karo, sirf REJECT chahiye to traffic type REJECT rakho, aur baad mein band kar do.</p>

<div class="eg"><p><b>Worked example.</b> Clients database par timeout karte hain. db ENI par flow logs pichhle 10 minute ke 40 records dikhate hain: 10.91.2.20 se port 5432 ki har request ACCEPT hai, aur port 5432 se 10.91.2.20 ko har reply REJECT. Analyzer ki zaroorat nahi: jodi kehti hai "inbound theek, outbound kisi stateless cheez ne deny kiya". Aap db-sn NACL kholte ho aur outbound allow nahi milta. Ek rule fix kar deta hai, aur logs ki agli window reply ko ACCEPT dikhati hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Real-time data ki ummeed (aggregation delay hai). Yeh bhoolna ki destination par REJECT yeh nahi batata ki security group tha ya NACL (reply pattern dekho ya dono check karo). Busy VPC par hafton ALL traffic chhodna. Do addresses mein se client kaun hai yeh ulta padhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Flow logs packet contents aur VPC resolver ko DNS queries capture karte hain." Dono sach nahi: sirf metadata, aur resolver traffic exclude hai.</p></div>

<div class="scn"><h4>Port scan jo sirf health check nikla</h4><p>Security alert mein ek address se application subnet ke kai ports par saikdon REJECT records dikhe. ENI-level flow logs ne dikhaya ki source company ka apna vulnerability scanner tha jo hafte ki schedule par naye range se chal raha tha jise NACL allow nahi karta tha. Team ne NACL ko kamzor karne ki jagah scan window ke liye scanner range allow ki aur document kiya.</p><p><b>Seekh:</b> REJECT records batate hain network ne kya roka; roka sahi tha ya nahi yeh aap tay karte ho.</p></div>

<div class="iv"><p class="q">"Flow logs mein request accepted, reply rejected. Iska matlab?"</p><p>Yeh stateless NACL ki taraf ishara karta hai jo reply deny karta hai, kyunki security group accepted request ka reply apne aap allow karta hai. NACL ka client ke ephemeral port range ka outbound rule theek karo, phir agli aggregation window mein reply ke ACCEPT hone se confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow logs ENI, subnet ya VPC ke accepted aur rejected flows record karte hain, sirf metadata.</li>
<li>Default record: 14 fields; protocol 6 TCP; action ACCEPT ya REJECT.</li>
<li>Records aggregate aur delayed hote hain, real time nahi.</li>
<li>ACCEPT request plus REJECT reply = stateless NACL.</li>
<li>DNS resolver, DHCP aur metadata traffic log nahi hota; narrowly enable karo aur use ke baad band karo.</li>
</ul></div>
`}};export{t as default};