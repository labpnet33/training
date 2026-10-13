var e=`<svg viewBox="0 0 640 230" role="img" aria-label="Reachability Analyzer path result: the path stops at the destination security group">
<defs><marker id="r2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
<rect x="8" y="50" width="86" height="60" rx="8" fill="#bae6fd" stroke="#64748b"/><text x="51" y="76" text-anchor="middle" class="svg-ink" font-size="13">web-1</text><text x="51" y="94" text-anchor="middle" class="svg-muted" font-size="11">source</text>
<rect x="112" y="50" width="92" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="158" y="76" text-anchor="middle" class="svg-ink" font-size="12">web-sg out</text><text x="158" y="94" text-anchor="middle" class="svg-muted" font-size="11">allowed</text>
<rect x="222" y="50" width="92" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="268" y="76" text-anchor="middle" class="svg-ink" font-size="12">route table</text><text x="268" y="94" text-anchor="middle" class="svg-muted" font-size="11">local</text>
<rect x="332" y="50" width="92" height="60" rx="8" fill="#bbf7d0" stroke="#64748b"/><text x="378" y="76" text-anchor="middle" class="svg-ink" font-size="12">NACLs</text><text x="378" y="94" text-anchor="middle" class="svg-muted" font-size="11">allowed</text>
<rect x="442" y="50" width="98" height="60" rx="8" fill="#fed7aa" stroke="#b91c1c" stroke-width="2.5"/><text x="491" y="76" text-anchor="middle" class="svg-ink" font-size="12">app-sg in</text><text x="491" y="94" text-anchor="middle" class="svg-muted" font-size="11">no rule 8080</text>
<rect x="556" y="50" width="76" height="60" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-dasharray="4 3"/><text x="594" y="76" text-anchor="middle" class="svg-ink" font-size="13">app-1</text><text x="594" y="94" text-anchor="middle" class="svg-muted" font-size="11">not reached</text>
<g stroke="#64748b" stroke-width="2" marker-end="url(#r2)"><line x1="94" y1="80" x2="110" y2="80"/><line x1="204" y1="80" x2="220" y2="80"/><line x1="314" y1="80" x2="330" y2="80"/><line x1="424" y1="80" x2="440" y2="80"/></g>
<text x="491" y="140" text-anchor="middle" class="svg-accent" font-size="12">ENI_SG_RULES_MISMATCH</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">NetworkPathFound: false. The explanation names the component that stopped the path.</text>
<text x="320" y="204" text-anchor="middle" class="svg-muted" font-size="12">Configuration is analysed; no test packet is sent.</text>
</svg>`,t={id:`reachability-analyzer`,h:{en:`Reachability Analyzer: let the platform walk the path`,hi:`Reachability Analyzer: platform ko path chalne do`},body:{en:`
<p>Imagine asking a courier company "can you deliver from my shop to this address?" and getting back a printed route: office A, depot B, van C, and a red mark saying "stopped at the security gate of the destination building". You did not send a parcel and nobody got on a bike. The company simply read its own maps and rules. <b>VPC Reachability Analyzer</b> does exactly this for your VPC network.</p>

<h3>What it does</h3>
<p>You define a <b>path</b>: a source, a destination, a protocol and a port. Then you start an <b>analysis</b>. The service reads the configuration along the way (security groups, route tables, NACLs, gateways, peerings, endpoints, Transit Gateway attachments) and reports:</p>
<ul>
<li><code>NetworkPathFound: true</code> with the ordered list of hops the traffic would take, or</li>
<li><code>NetworkPathFound: false</code> with an <b>explanation</b>: a code and the component (for example a specific security group) that blocks it.</li>
</ul>
<p><b>No packet is sent.</b> That is why you can run it against a server that is stopped, or against a production network, without any risk.</p>

<div class="dia">`+e+`<p class="cap">An analysis result drawn as a path: everything is fine until the destination security group.</p></div>

<h3>Sources and destinations</h3>
<p>Typical endpoints are instances and network interfaces, internet gateways, VPC peering connections, VPN gateways, Transit Gateways and their attachments, and VPC endpoints. You can also give an IP address as a destination. The protocol is TCP or UDP and you supply a destination port.</p>

<h3>Running one from the CLI</h3>
<pre class="code"><span class="c"># 1. define the path (this itself is free of analysis charges)</span>
aws ec2 create-network-insights-path --source $SRC --destination $DST --protocol tcp --destination-port 8080
<span class="c"># 2. run an analysis</span>
aws ec2 start-network-insights-analysis --network-insights-path-id $NIP
<span class="c"># 3. read the result (wait until Status is succeeded)</span>
aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $NIA</pre>
<p><b>Illustrative output</b> (trimmed; real output has more fields and IDs):</p>
<pre class="out">{
  "NetworkInsightsAnalyses": [{
    "Status": "succeeded",
    <span class="hl">"NetworkPathFound": false,</span>
    "Explanations": [{
      <span class="hl">"ExplanationCode": "ENI_SG_RULES_MISMATCH",</span>
      "SecurityGroups": [{ "GroupName": "app-sg" }],
      "Direction": "ingress"
    }]
  }]
}</pre>

<h3>Reading the explanation code</h3>
<table class="cmp"><tr><th>Code</th><th>Meaning</th><th>Typical fix</th></tr>
<tr><td><code>ENI_SG_RULES_MISMATCH</code></td><td>No security group rule allows the traffic</td><td>Add the inbound (or outbound) rule</td></tr>
<tr><td><code>SUBNET_ACL_RESTRICTION</code></td><td>A network ACL rule denies it</td><td>Add an allow with a lower rule number</td></tr>
<tr><td><code>NO_ROUTE_TO_DESTINATION</code></td><td>The route table has no matching route</td><td>Add the route</td></tr>
<tr><td><code>BLACKHOLE_ROUTE_FOR_DESTINATION</code></td><td>The route's target no longer exists</td><td>Repoint or delete the route</td></tr>
<tr><td>Gateway, peering and TGW codes</td><td>No internet gateway or public address, peering not active, TGW attachment or table problem</td><td>Attach, accept, associate or propagate as needed</td></tr></table>
<p>The names above are the ones you meet most often and the ones used in this module's emulator. AWS publishes the full list of explanation codes in the Reachability Analyzer documentation; confirm the exact spelling there before you quote one in a report.</p>

<h3>What it cannot tell you</h3>
<ul>
<li><b>Inside the instance.</b> An OS firewall, a service that is not listening, a wrong port in a config file: invisible.</li>
<li><b>Real behaviour.</b> It does not measure latency, loss or bandwidth, and it does not prove an application works.</li>
<li><b>The return direction in full.</b> Treat "found" as "the configuration allows the forward path". A stateless NACL that blocks the <i>reply</i>, or a missing return route, can still break real traffic. In the emulator lab this is exactly what happens in the NOC ticket. Read the whole output for any return-path details your version provides (check the API reference), and confirm with flow logs.</li>
<li><b>DNS.</b> It works with IPs and resources, not names.</li>
</ul>

<h3>Cost, in one line</h3>
<p>Reachability Analyzer is billed <b>per analysis</b> you run (see the Amazon VPC pricing page for the current rate in your Region). Creating a path is not an analysis. Run it when you need an answer, not in a loop. The guided lab in chapter 7 uses an assumed $0.10 per analysis for its arithmetic.</p>

<div class="eg"><p><b>Worked example.</b> In rv-vpc (10.90.0.0/16), web-1 sits in web-sn 10.90.1.0/24 and app-1 in app-sn 10.90.2.0/24. Path: web-1 to app-1, TCP 8080. First analysis: <code>NetworkPathFound false</code>, <code>ENI_SG_RULES_MISMATCH</code> on app-sg ingress. Fix: allow TCP 8080 from 10.90.1.0/24 in app-sg. Second analysis on the same path: <code>NetworkPathFound true</code>. Two analyses, one fix, no logins.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Believing "found" means the app works. Re-creating the path each time (reuse the path, start new analyses). Analysing with the wrong port or protocol. Forgetting that the explanation names only the first blocker.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Reachability Analyzer sends test packets to verify connectivity." False: it is a configuration analysis. Packet-level evidence comes from VPC Flow Logs or traffic mirroring.</p></div>

<div class="scn"><h4>Ten minutes instead of two hours</h4><p>A team had spent two hours comparing security group screenshots for a failing database connection. A junior engineer created one Reachability Analyzer path from the app instance to the database ENI on port 5432. The result named a NACL on the database subnet that lacked an allow rule for the app subnet. One rule later, the analysis returned found and the application connected.</p><p><b>Lesson:</b> let the tool walk the layers; you read the one line it prints.</p></div>

<div class="iv"><p class="q">"How does Reachability Analyzer work and what are its limits?"</p><p>It analyses configuration between a source and destination for a protocol and port and returns hops or an explanation code, without sending packets. Limits: it cannot see host firewalls, application state, DNS, latency, or full return-path behaviour, so you confirm with flow logs and host checks. It is billed per analysis.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A path defines source, destination, protocol and port; an analysis evaluates it.</li>
<li>No packets are sent; it reads route tables, security groups, NACLs and gateways.</li>
<li>The explanation code names the first blocking component.</li>
<li>"Found" does not prove the reply or the application; confirm with flow logs and host checks.</li>
<li>It is billed per analysis; reuse paths and run on purpose.</li>
</ul></div>
`,hi:`
<p>Socho aap courier company se poochte ho "kya meri dukaan se is address tak delivery ho sakti hai?" aur wapas ek printed route milta hai: office A, depot B, van C, aur ek laal nishan jo kehta hai "destination building ke security gate par ruka". Aapne parcel nahi bheja aur kisi ne cycle nahi chalayi. Company ne bas apne maps aur rules padhe. <b>VPC Reachability Analyzer</b> aapke VPC network ke liye bilkul yahi karta hai.</p>

<h3>Yeh kya karta hai</h3>
<p>Aap ek <b>path</b> define karte ho: source, destination, protocol aur port. Phir ek <b>analysis</b> start karte ho. Service raaste ki configuration padhti hai (security groups, route tables, NACLs, gateways, peerings, endpoints, Transit Gateway attachments) aur batati hai:</p>
<ul>
<li><code>NetworkPathFound: true</code> aur traffic ke hops ki ordered list, ya</li>
<li><code>NetworkPathFound: false</code> aur ek <b>explanation</b>: ek code aur woh component (jaise ek specific security group) jo ise rokta hai.</li>
</ul>
<p><b>Koi packet nahi bheja jaata.</b> Isliye aap ise band server par ya production network par bina risk ke chala sakte ho.</p>

<div class="dia">`+e+`<p class="cap">Analysis result path ki tarah: destination security group tak sab theek hai.</p></div>

<h3>Sources aur destinations</h3>
<p>Typical endpoints instances aur network interfaces, internet gateways, VPC peering connections, VPN gateways, Transit Gateways aur unke attachments, aur VPC endpoints hain. Destination ke taur par IP address bhi de sakte ho. Protocol TCP ya UDP hai aur aap destination port dete ho.</p>

<h3>CLI se chalana</h3>
<pre class="code"><span class="c"># 1. path define karo (isme analysis charge nahi lagta)</span>
aws ec2 create-network-insights-path --source $SRC --destination $DST --protocol tcp --destination-port 8080
<span class="c"># 2. analysis chalao</span>
aws ec2 start-network-insights-analysis --network-insights-path-id $NIP
<span class="c"># 3. result padho (Status succeeded hone tak ruko)</span>
aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $NIA</pre>
<p><b>Illustrative output</b> (trimmed; asli output mein zyada fields aur IDs hote hain):</p>
<pre class="out">{
  "NetworkInsightsAnalyses": [{
    "Status": "succeeded",
    <span class="hl">"NetworkPathFound": false,</span>
    "Explanations": [{
      <span class="hl">"ExplanationCode": "ENI_SG_RULES_MISMATCH",</span>
      "SecurityGroups": [{ "GroupName": "app-sg" }],
      "Direction": "ingress"
    }]
  }]
}</pre>

<h3>Explanation code padhna</h3>
<table class="cmp"><tr><th>Code</th><th>Matlab</th><th>Typical fix</th></tr>
<tr><td><code>ENI_SG_RULES_MISMATCH</code></td><td>Koi security group rule traffic allow nahi karta</td><td>Inbound (ya outbound) rule jodo</td></tr>
<tr><td><code>SUBNET_ACL_RESTRICTION</code></td><td>Network ACL rule deny karta hai</td><td>Kam rule number ke saath allow jodo</td></tr>
<tr><td><code>NO_ROUTE_TO_DESTINATION</code></td><td>Route table mein matching route nahi</td><td>Route jodo</td></tr>
<tr><td><code>BLACKHOLE_ROUTE_FOR_DESTINATION</code></td><td>Route ka target ab exist nahi karta</td><td>Route repoint ya delete karo</td></tr>
<tr><td>Gateway, peering aur TGW codes</td><td>Internet gateway ya public address nahi, peering active nahi, TGW attachment ya table problem</td><td>Zaroorat ke hisaab se attach, accept, associate ya propagate karo</td></tr></table>
<p>Upar ke naam woh hain jo sabse zyada milte hain aur jo is module ke emulator mein use hote hain. AWS poori explanation codes ki list Reachability Analyzer documentation mein publish karta hai; report mein code likhne se pehle wahan exact spelling confirm karo.</p>

<h3>Yeh kya nahi bata sakta</h3>
<ul>
<li><b>Instance ke andar.</b> OS firewall, service jo listen nahi kar rahi, config file mein galat port: invisible.</li>
<li><b>Asli behaviour.</b> Yeh latency, loss ya bandwidth nahi naapta, aur yeh saabit nahi karta ki application chalti hai.</li>
<li><b>Return direction poori tarah.</b> "Found" ko "configuration forward path allow karti hai" maano. Stateless NACL jo <i>reply</i> roke, ya missing return route, asli traffic ko tab bhi tod sakta hai. Emulator lab ke NOC ticket mein bilkul yahi hota hai. Apne version ke return-path details ke liye poora output padho (API reference dekho), aur flow logs se confirm karo.</li>
<li><b>DNS.</b> Yeh IPs aur resources ke saath chalta hai, names ke saath nahi.</li>
</ul>

<h3>Cost, ek line mein</h3>
<p>Reachability Analyzer aapke chalaye <b>har analysis</b> par bill hota hai (apne Region ka current rate Amazon VPC pricing page par dekho). Path banana analysis nahi hai. Jab jawab chahiye tab chalao, loop mein nahi. Chapter 7 ka guided lab apne arithmetic ke liye assumed $0.10 per analysis use karta hai.</p>

<div class="eg"><p><b>Worked example.</b> rv-vpc (10.90.0.0/16) mein web-1 web-sn 10.90.1.0/24 mein hai aur app-1 app-sn 10.90.2.0/24 mein. Path: web-1 se app-1, TCP 8080. Pehli analysis: <code>NetworkPathFound false</code>, app-sg ingress par <code>ENI_SG_RULES_MISMATCH</code>. Fix: app-sg mein 10.90.1.0/24 se TCP 8080 allow karo. Usi path par doosri analysis: <code>NetworkPathFound true</code>. Do analyses, ek fix, koi login nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> "Found" ka matlab app chalti hai maan lena. Har baar path dobara banana (path reuse karo, nayi analyses start karo). Galat port ya protocol se analyse karna. Yeh bhoolna ki explanation sirf pehla blocker batati hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Reachability Analyzer connectivity verify karne ke liye test packets bhejta hai." Galat: yeh configuration analysis hai. Packet-level saboot VPC Flow Logs ya traffic mirroring se aata hai.</p></div>

<div class="scn"><h4>Do ghante ki jagah das minute</h4><p>Ek team do ghante failing database connection ke liye security group screenshots compare karti rahi. Ek junior engineer ne app instance se database ENI tak port 5432 ka ek Reachability Analyzer path banaya. Result ne database subnet ke ek NACL ka naam liya jisme app subnet ke liye allow rule nahi tha. Ek rule ke baad analysis found aayi aur application connect ho gayi.</p><p><b>Seekh:</b> tool ko layers chalne do; aap woh ek line padho jo woh print karta hai.</p></div>

<div class="iv"><p class="q">"Reachability Analyzer kaise kaam karta hai aur uski limits kya hain?"</p><p>Yeh source aur destination ke beech protocol aur port ke liye configuration analyse karta hai aur bina packets bheje hops ya explanation code deta hai. Limits: host firewalls, application state, DNS, latency, ya poora return-path behaviour nahi dekh sakta, isliye flow logs aur host checks se confirm karte hain. Per analysis bill hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Path source, destination, protocol aur port define karta hai; analysis use evaluate karti hai.</li>
<li>Koi packet nahi; yeh route tables, security groups, NACLs aur gateways padhta hai.</li>
<li>Explanation code pehle blocking component ka naam leta hai.</li>
<li>"Found" reply ya application saabit nahi karta; flow logs aur host checks se confirm karo.</li>
<li>Per analysis bill; paths reuse karo aur soch-samajhkar chalao.</li>
</ul></div>
`}};export{t as default};