var e={id:`troubleshooting`,h:{en:`Troubleshooting workflow: nobody can reach the web server (ticket NK-6201)`,hi:`Troubleshooting workflow: web server koi reach nahi kar pata (ticket NK-6201)`},body:{en:`
<p>The most common AWS networking ticket is "the server has a public IP but it times out". It feels mysterious because the symptom is always the same, whichever piece is missing. A good engineer does not poke randomly. She walks the path of the packet from the outside in, the way you would check a parcel delivery: is the road open, is the gate attached, does the address exist, is the guard letting it through, is anyone home?</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Seven-step reachability checklist">
<rect x="10" y="15" width="145" height="62" rx="8" fill="#bae6fd"/><text x="82" y="38" text-anchor="middle" class="svg-ink" font-size="12">1. IGW attached?</text><text x="82" y="56" text-anchor="middle" class="svg-muted" font-size="11">describe-internet-</text><text x="82" y="69" text-anchor="middle" class="svg-muted" font-size="11">gateways</text>
<rect x="175" y="15" width="145" height="62" rx="8" fill="#bbf7d0"/><text x="247" y="38" text-anchor="middle" class="svg-ink" font-size="12">2. Route to IGW?</text><text x="247" y="56" text-anchor="middle" class="svg-muted" font-size="11">in the subnet's</text><text x="247" y="69" text-anchor="middle" class="svg-muted" font-size="11">own table</text>
<rect x="340" y="15" width="145" height="62" rx="8" fill="#fde68a"/><text x="412" y="38" text-anchor="middle" class="svg-ink" font-size="12">3. Public IP?</text><text x="412" y="56" text-anchor="middle" class="svg-muted" font-size="11">on the instance</text><text x="412" y="69" text-anchor="middle" class="svg-muted" font-size="11">interface</text>
<rect x="505" y="15" width="125" height="62" rx="8" fill="#fed7aa"/><text x="567" y="38" text-anchor="middle" class="svg-ink" font-size="12">4. Security group</text><text x="567" y="56" text-anchor="middle" class="svg-muted" font-size="11">right port,</text><text x="567" y="69" text-anchor="middle" class="svg-muted" font-size="11">right source</text>
<rect x="90" y="110" width="145" height="62" rx="8" fill="#ddd6fe"/><text x="162" y="133" text-anchor="middle" class="svg-ink" font-size="12">5. Network ACL</text><text x="162" y="151" text-anchor="middle" class="svg-muted" font-size="11">both directions,</text><text x="162" y="164" text-anchor="middle" class="svg-muted" font-size="11">ephemeral ports</text>
<rect x="255" y="110" width="145" height="62" rx="8" fill="#e2e8f0"/><text x="327" y="133" text-anchor="middle" class="svg-ink" font-size="12">6. Instance state</text><text x="327" y="151" text-anchor="middle" class="svg-muted" font-size="11">running, status</text><text x="327" y="164" text-anchor="middle" class="svg-muted" font-size="11">checks passed</text>
<rect x="420" y="110" width="145" height="62" rx="8" fill="#e2e8f0"/><text x="492" y="133" text-anchor="middle" class="svg-ink" font-size="12">7. Service and OS</text><text x="492" y="151" text-anchor="middle" class="svg-muted" font-size="11">listening, host</text><text x="492" y="164" text-anchor="middle" class="svg-muted" font-size="11">firewall</text>
<line x1="155" y1="46" x2="175" y2="46" stroke="#64748b" stroke-width="2"/><line x1="320" y1="46" x2="340" y2="46" stroke="#64748b" stroke-width="2"/><line x1="485" y1="46" x2="505" y2="46" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">Steps 1 to 5 are AWS configuration: Reachability Analyzer can test them.</text>
<text x="320" y="238" text-anchor="middle" class="svg-ink" font-size="13">Steps 6 and 7 live inside the instance: logs and console output.</text>
<text x="320" y="268" text-anchor="middle" class="svg-accent" font-size="12">Fix one thing, re-test, move on. Never change three things at once.</text>
</svg><p class="cap">Follow the packet. Every step has a one-line check.</p></div>

<h3>The ticket</h3>
<p>Ticket NK-6201: "The new <code>shop-vpc</code> web server <code>web-1</code> has a public IP but SSH times out from the office. The VPC was built by a colleague who left." This is exactly the second emulator lab, where the tool <code>nk-probe</code> tells you whether the request or the reply is blocked. On a real account use the commands below.</p>

<h3>Step 1: is the internet gateway attached?</h3>
<pre class="code">aws ec2 describe-internet-gateways --filters Name=tag:Name,Values=shop-igw --query 'InternetGateways[].[InternetGatewayId,Attachments]' --output json</pre>
<pre class="out"><span class="c"># Illustrative output</span>
[
    [
        "igw-0123456789abcdef0",
        <span class="hl">[]</span>
    ]
]</pre>
<p>An empty attachments list means the gateway exists but is attached to no VPC. <b>Fault 1.</b> Fix: <code>aws ec2 attach-internet-gateway --internet-gateway-id igw-0123456789abcdef0 --vpc-id vpc-0a1b2c3d4e5f60718</code>. Re-test.</p>

<h3>Step 2: does the subnet's own route table point to the IGW?</h3>
<pre class="code">aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$SUBNET --query 'RouteTables[].Routes[].[DestinationCidrBlock,GatewayId,State]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
10.30.0.0/16    local   active</pre>
<p>Only the local route. If this query returns <i>nothing</i>, the subnet has no explicit association and uses the main table: query the main table instead (<code>Name=association.main,Values=true</code> with the VPC id). Here there is no default route: <b>Fault 2.</b> Fix: <code>aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW</code>.</p>

<h3>Step 3: does the instance have a public address?</h3>
<pre class="code">aws ec2 describe-instances --instance-ids $INST --query 'Reservations[0].Instances[0].[State.Name,PrivateIpAddress,PublicIpAddress]' --output text</pre>
<p>A <code>None</code> means no public IP (<b>Fault 3</b> in other tickets). The fix is to associate an Elastic IP, or to relaunch with auto-assign enabled. The lab ticket's instance has one, so we move on.</p>

<h3>Step 4: does the security group allow the port from your source?</h3>
<pre class="code">aws ec2 describe-security-groups --filters Name=group-name,Values=shop-web-sg --query 'SecurityGroups[0].IpPermissions[].[IpProtocol,FromPort,ToPort,IpRanges[].CidrIp]' --output json</pre>
<pre class="out"><span class="c"># Illustrative output</span>
[ [ "tcp", <span class="hl">2222</span>, 2222, [ "0.0.0.0/0" ] ] ]</pre>
<p>The group allows TCP <b>2222</b>, but SSH uses TCP <b>22</b>. <b>Fault 4.</b> Fix: <code>aws ec2 authorize-security-group-ingress --group-id $SG --protocol tcp --port 22 --cidr 203.0.113.0/24</code> using your office range rather than the whole internet. (The emulator ticket accepts 0.0.0.0/0 because it is a simulation; in real life restrict SSH.)</p>

<h3>Step 5: network ACL; Steps 6 and 7: the instance</h3>
<p>Check the subnet's ACL in both directions (next module). Then look at the instance: <code>aws ec2 describe-instance-status --instance-ids $INST</code> for status checks, <code>aws ec2 get-console-output --instance-id $INST</code> for boot errors, and, once logged in, <code>ss -ltn</code> to see that the service listens.</p>

<h3>The tool that does steps 1 to 5 for you</h3>
<p>VPC Reachability Analyzer (USD 0.10 per analysis) takes a source and a destination and names the first component that blocks the path. It is excellent for a ticket like this: one run, one explanation. It cannot see inside the instance, so steps 6 and 7 remain manual.</p>

<div class="eg"><p><b>Worked example.</b> After Fault 1 is fixed the probe still fails. After Fault 2 is fixed it fails <i>differently</i>: the request seems to arrive but nothing returns, which in the emulator is reported as a blocked reply. After Fault 4 it connects. Three faults, three single changes, and a re-test after each: that discipline is what makes the diagnosis trustworthy and the ticket reviewable.</p></div>

<div class="warn"><p><b>Common mistake.</b> Opening the security group to 0.0.0.0/0 on every port as the first reaction. It hides the real fault (a missing route or attachment) and leaves a hole. Walk the checklist first; open only the single port from the single source.</p></div>

<div class="exam"><p><b>Exam trap.</b> "The instance times out" is a network-path problem. "Connection refused" means the packet <i>arrived</i> and nothing listens on that port: look at steps 6 and 7, not at gateways. Questions often give both symptoms to see if you can tell them apart.</p></div>

<div class="scn"><h4>Fault found in the second step</h4><p>A team rebuilt their staging VPC from a template. SSH timed out. The engineer checked the gateway (attached), then the route table of the subnet (empty except local). The template had created the route in the main table, but the subnets were explicitly associated with a different table. She added the default route to the right table and SSH worked. Total time: six minutes.</p><p><b>Lesson:</b> query the table associated with the <i>subnet</i>, not "the route table".</p></div>

<div class="iv"><p class="q">"A user says the web server in a public subnet times out. What do you check, in order?"</p><p>Internet gateway attached to the VPC; the subnet's route table has 0.0.0.0/0 to it; the instance has a public or Elastic IP; the security group allows the port from the user's address; the network ACL allows both directions; the instance is running and the service listens. Mention Reachability Analyzer and that you change one thing at a time.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Follow the packet: IGW attachment, route, public IP, security group, network ACL, instance, service.</li>
<li>Timeout means the path is broken; refused means the service is not listening.</li>
<li>Check the route table associated with the subnet, not just any table.</li>
<li>Fix one fault at a time and re-test after each.</li>
<li>Reachability Analyzer explains steps 1 to 5 for USD 0.10 per run.</li>
</ul></div>
`,hi:`
<p>Sabse aam AWS networking ticket hai "server ka public IP hai par timeout hota hai". Yeh rahasyamayi lagta hai kyunki jo bhi piece missing ho, symptom hamesha ek hi hota hai. Achha engineer idhar-udhar haath nahi marta. Woh packet ke raaste par bahar se andar chalti hai, jaise parcel delivery check karte ho: sadak khuli hai, gate attached hai, address maujood hai, guard jaane de raha hai, ghar mein koi hai?</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Saat-step reachability checklist">
<rect x="10" y="15" width="145" height="62" rx="8" fill="#bae6fd"/><text x="82" y="38" text-anchor="middle" class="svg-ink" font-size="12">1. IGW attached?</text><text x="82" y="56" text-anchor="middle" class="svg-muted" font-size="11">describe-internet-</text><text x="82" y="69" text-anchor="middle" class="svg-muted" font-size="11">gateways</text>
<rect x="175" y="15" width="145" height="62" rx="8" fill="#bbf7d0"/><text x="247" y="38" text-anchor="middle" class="svg-ink" font-size="12">2. IGW ka route?</text><text x="247" y="56" text-anchor="middle" class="svg-muted" font-size="11">subnet ki apni</text><text x="247" y="69" text-anchor="middle" class="svg-muted" font-size="11">table mein</text>
<rect x="340" y="15" width="145" height="62" rx="8" fill="#fde68a"/><text x="412" y="38" text-anchor="middle" class="svg-ink" font-size="12">3. Public IP?</text><text x="412" y="56" text-anchor="middle" class="svg-muted" font-size="11">instance interface</text><text x="412" y="69" text-anchor="middle" class="svg-muted" font-size="11">par</text>
<rect x="505" y="15" width="125" height="62" rx="8" fill="#fed7aa"/><text x="567" y="38" text-anchor="middle" class="svg-ink" font-size="12">4. Security group</text><text x="567" y="56" text-anchor="middle" class="svg-muted" font-size="11">sahi port,</text><text x="567" y="69" text-anchor="middle" class="svg-muted" font-size="11">sahi source</text>
<rect x="90" y="110" width="145" height="62" rx="8" fill="#ddd6fe"/><text x="162" y="133" text-anchor="middle" class="svg-ink" font-size="12">5. Network ACL</text><text x="162" y="151" text-anchor="middle" class="svg-muted" font-size="11">dono directions,</text><text x="162" y="164" text-anchor="middle" class="svg-muted" font-size="11">ephemeral ports</text>
<rect x="255" y="110" width="145" height="62" rx="8" fill="#e2e8f0"/><text x="327" y="133" text-anchor="middle" class="svg-ink" font-size="12">6. Instance state</text><text x="327" y="151" text-anchor="middle" class="svg-muted" font-size="11">running, status</text><text x="327" y="164" text-anchor="middle" class="svg-muted" font-size="11">checks passed</text>
<rect x="420" y="110" width="145" height="62" rx="8" fill="#e2e8f0"/><text x="492" y="133" text-anchor="middle" class="svg-ink" font-size="12">7. Service aur OS</text><text x="492" y="151" text-anchor="middle" class="svg-muted" font-size="11">listening, host</text><text x="492" y="164" text-anchor="middle" class="svg-muted" font-size="11">firewall</text>
<line x1="155" y1="46" x2="175" y2="46" stroke="#64748b" stroke-width="2"/><line x1="320" y1="46" x2="340" y2="46" stroke="#64748b" stroke-width="2"/><line x1="485" y1="46" x2="505" y2="46" stroke="#64748b" stroke-width="2"/>
<text x="320" y="215" text-anchor="middle" class="svg-ink" font-size="13">Steps 1 se 5 AWS configuration hain: Reachability Analyzer inhe test kar sakta hai.</text>
<text x="320" y="238" text-anchor="middle" class="svg-ink" font-size="13">Steps 6 aur 7 instance ke andar hain: logs aur console output.</text>
<text x="320" y="268" text-anchor="middle" class="svg-accent" font-size="12">Ek cheez fix karo, re-test karo, aage badho. Ek saath teen cheezein kabhi nahi badalna.</text>
</svg><p class="cap">Packet ke peeche chalo. Har step ka ek-line check hai.</p></div>

<h3>Ticket</h3>
<p>Ticket NK-6201: "Naye <code>shop-vpc</code> ke web server <code>web-1</code> ka public IP hai par office se SSH timeout hota hai. VPC ek colleague ne banaya tha jo chala gaya." Yeh bilkul doosra emulator lab hai, jisme tool <code>nk-probe</code> batata hai ki request block hai ya reply. Real account par neeche ke commands use karo.</p>

<h3>Step 1: internet gateway attached hai?</h3>
<pre class="code">aws ec2 describe-internet-gateways --filters Name=tag:Name,Values=shop-igw --query 'InternetGateways[].[InternetGatewayId,Attachments]' --output json</pre>
<pre class="out"><span class="c"># Illustrative output</span>
[
    [
        "igw-0123456789abcdef0",
        <span class="hl">[]</span>
    ]
]</pre>
<p>Khali attachments list ka matlab gateway maujood hai par kisi VPC se attached nahi. <b>Fault 1.</b> Fix: <code>aws ec2 attach-internet-gateway --internet-gateway-id igw-0123456789abcdef0 --vpc-id vpc-0a1b2c3d4e5f60718</code>. Re-test.</p>

<h3>Step 2: subnet ki apni route table IGW ko point karti hai?</h3>
<pre class="code">aws ec2 describe-route-tables --filters Name=association.subnet-id,Values=$SUBNET --query 'RouteTables[].Routes[].[DestinationCidrBlock,GatewayId,State]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
10.30.0.0/16    local   active</pre>
<p>Sirf local route. Yeh query <i>kuch bhi</i> na de, to subnet ka explicit association nahi hai aur woh main table use karta hai: uski jagah main table query karo (VPC id ke saath <code>Name=association.main,Values=true</code>). Yahan default route nahi hai: <b>Fault 2.</b> Fix: <code>aws ec2 create-route --route-table-id $RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW</code>.</p>

<h3>Step 3: instance ke paas public address hai?</h3>
<pre class="code">aws ec2 describe-instances --instance-ids $INST --query 'Reservations[0].Instances[0].[State.Name,PrivateIpAddress,PublicIpAddress]' --output text</pre>
<p><code>None</code> ka matlab public IP nahi (doosre tickets mein <b>Fault 3</b>). Fix: Elastic IP associate karo, ya auto-assign enable karke dobara launch karo. Lab ticket ke instance ke paas hai, to aage badhte hain.</p>

<h3>Step 4: security group aapke source se port allow karta hai?</h3>
<pre class="code">aws ec2 describe-security-groups --filters Name=group-name,Values=shop-web-sg --query 'SecurityGroups[0].IpPermissions[].[IpProtocol,FromPort,ToPort,IpRanges[].CidrIp]' --output json</pre>
<pre class="out"><span class="c"># Illustrative output</span>
[ [ "tcp", <span class="hl">2222</span>, 2222, [ "0.0.0.0/0" ] ] ]</pre>
<p>Group TCP <b>2222</b> allow karta hai, par SSH TCP <b>22</b> use karta hai. <b>Fault 4.</b> Fix: <code>aws ec2 authorize-security-group-ingress --group-id $SG --protocol tcp --port 22 --cidr 203.0.113.0/24</code>, poore internet ki jagah apni office range ke saath. (Emulator ticket 0.0.0.0/0 accept karta hai kyunki woh simulation hai; real life mein SSH restrict karo.)</p>

<h3>Step 5: network ACL; Steps 6 aur 7: instance</h3>
<p>Subnet ka ACL dono directions mein check karo (agla module). Phir instance dekho: status checks ke liye <code>aws ec2 describe-instance-status --instance-ids $INST</code>, boot errors ke liye <code>aws ec2 get-console-output --instance-id $INST</code>, aur login hone ke baad <code>ss -ltn</code> se dekho ki service listen kar rahi hai.</p>

<h3>Tool jo steps 1 se 5 aapke liye karta hai</h3>
<p>VPC Reachability Analyzer (USD 0.10 per analysis) source aur destination leta hai aur path block karne wale pehle component ka naam batata hai. Aise ticket ke liye behtareen hai: ek run, ek explanation. Yeh instance ke andar nahi dekh sakta, isliye steps 6 aur 7 manual rehte hain.</p>

<div class="eg"><p><b>Worked example.</b> Fault 1 fix hone ke baad probe phir fail hota hai. Fault 2 fix hone ke baad <i>alag tarah</i> fail hota hai: request pahunchti lagti hai par kuch lautta nahi, jo emulator mein blocked reply ke roop mein report hota hai. Fault 4 ke baad connect ho jaata hai. Teen faults, teen single changes, aur har ek ke baad re-test: yahi discipline diagnosis ko bharosemand aur ticket ko reviewable banata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pehli reaction mein security group ko har port par 0.0.0.0/0 ke liye khol dena. Isse asli fault (missing route ya attachment) chhup jaata hai aur hole bachta hai. Pehle checklist chalo; sirf ek port ek source se kholo.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Instance timeout hota hai" network-path problem hai. "Connection refused" ka matlab packet <i>pahuncha</i> aur us port par kuch listen nahi kar raha: steps 6 aur 7 dekho, gateways nahi. Sawaal aksar dono symptoms dete hain yeh dekhne ke liye ki aap farak pehchante ho.</p></div>

<div class="scn"><h4>Fault doosre step mein mila</h4><p>Ek team ne staging VPC template se rebuild kiya. SSH timeout hua. Engineer ne gateway check kiya (attached), phir subnet ki route table (local ke alawa khali). Template ne route main table mein banaya tha, par subnets kisi doosri table se explicitly associated the. Usne sahi table mein default route jodha aur SSH chal gaya. Total time: chhe minute.</p><p><b>Lesson:</b> "route table" nahi, <i>subnet</i> se associated table query karo.</p></div>

<div class="iv"><p class="q">"User kehta hai public subnet ka web server timeout hota hai. Kya order mein check karoge?"</p><p>Internet gateway VPC se attached; subnet ki route table mein 0.0.0.0/0 uski taraf; instance ke paas public ya Elastic IP; security group user ke address se port allow karta hai; network ACL dono directions allow karta hai; instance running hai aur service listen karti hai. Reachability Analyzer batao aur yeh ki ek samay mein ek cheez badalte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Packet ke peeche chalo: IGW attachment, route, public IP, security group, network ACL, instance, service.</li>
<li>Timeout ka matlab path toota hai; refused ka matlab service listen nahi kar rahi.</li>
<li>Subnet se associated route table check karo, koi bhi table nahi.</li>
<li>Ek samay mein ek fault fix karo aur har ke baad re-test karo.</li>
<li>Reachability Analyzer steps 1 se 5 USD 0.10 per run mein explain karta hai.</li>
</ul></div>
`}};export{e as default};