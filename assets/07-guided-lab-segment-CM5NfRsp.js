var e=`<svg viewBox="0 0 640 220" role="img" aria-label="Guided lab 2 results matrix: which analyses should find a path">
<rect x="40" y="20" width="560" height="40" fill="#e2e8f0" stroke="#64748b"/>
<text x="140" y="45" text-anchor="middle" class="svg-ink" font-size="13">path (TCP 443)</text><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="13">before segmentation</text><text x="520" y="45" text-anchor="middle" class="svg-ink" font-size="13">after segmentation</text>
<g font-size="13" class="svg-ink">
<rect x="40" y="60" width="560" height="34" fill="#f8fafc" stroke="#64748b"/><text x="140" y="82" text-anchor="middle">prod (a) → dev (b)</text><text x="330" y="82" text-anchor="middle">found</text><rect x="440" y="62" width="160" height="30" fill="#fed7aa"/><text x="520" y="82" text-anchor="middle">NOT found</text>
<rect x="40" y="94" width="560" height="34" fill="#f8fafc" stroke="#64748b"/><text x="140" y="116" text-anchor="middle">dev (b) → prod (a)</text><text x="330" y="116" text-anchor="middle">found</text><rect x="440" y="96" width="160" height="30" fill="#fed7aa"/><text x="520" y="116" text-anchor="middle">NOT found</text>
<rect x="40" y="128" width="560" height="34" fill="#f8fafc" stroke="#64748b"/><text x="140" y="150" text-anchor="middle">prod (a) → shared (c)</text><text x="330" y="150" text-anchor="middle">found</text><rect x="440" y="130" width="160" height="30" fill="#bbf7d0"/><text x="520" y="150" text-anchor="middle">found</text>
<rect x="40" y="162" width="560" height="34" fill="#f8fafc" stroke="#64748b"/><text x="140" y="184" text-anchor="middle">dev (b) → shared (c)</text><text x="330" y="184" text-anchor="middle">found</text><rect x="440" y="164" width="160" height="30" fill="#bbf7d0"/><text x="520" y="184" text-anchor="middle">found</text>
</g>
</svg>`,t={id:`guided-lab-segment`,h:{en:`Guided lab on your own AWS account: segment prod from dev`,hi:`Apne AWS account par guided lab: prod ko dev se segment karo`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish. The in-app emulator ticket "segment dev away from prod on the Transit Gateway" is the same exercise with probes instead of the analyzer.</p></div>

<h3>Goal</h3>
<p>Start from the flat hub of the previous chapter and turn it into a segmented one: <b>a = prod</b>, <b>b = dev</b>, <b>c = shared services</b>. Prod and dev must both reach shared and must not reach each other. You will prove it with Reachability Analyzer before and after the change.</p>
<div class="dia">`+e+`<p class="cap">Expected analyzer results. The only change in the second column is created by TGW route tables.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>Finish steps 0 to 4 of the previous chapter and <b>keep the resources</b>: TGW, three attachments, VPC routes, ENIs, and the shell variables <code>$TGW</code>, <code>$ATT_a</code>, <code>$ATT_b</code>, <code>$ATT_c</code>, <code>$ENI_a</code>, <code>$ENI_b</code>, <code>$ENI_c</code>. If your shell was closed, look the IDs up again with the describe commands (the Name tags help).</li>
<li>The budget alert from the previous chapter is still active.</li>
</ul>
<div class="note"><p><b>Console wording.</b> As before, console labels are from familiarity and <b>not re-verified</b> against current AWS documentation in this build. CLI commands are the reference.</p></div>

<h3>Honest cost</h3>
<p>Nothing new is billed per se: the pricing pages list attachment-hours, data processed and analyzer runs. (We believe extra TGW route tables carry no separate charge, but this was <b>not re-verified</b> in this build; check the pricing page.) Using the same <b>assumed</b> rates as before ($0.05 per attachment-hour, $0.02 per GB, $0.10 per analysis): one more hour with 3 attachments = $0.15; six analyses = $0.60; total about <b>$0.75</b>. The meter is still running as long as the attachments exist, so the same loud warning applies: <b>assumed $109.50 per month if three attachments are forgotten</b>. Finish and clean up today.</p>

<h3>Step 1: baseline analyses (flat network)</h3>
<p><b>Console (unverified):</b> VPC → Reachability Analyzer → Create and analyze path, source type Network interface, TCP 443.</p>
<pre class="code">chk() { # usage: chk SRC DST
  P=$(aws ec2 create-network-insights-path --source $1 --destination $2 --protocol tcp --destination-port 443 --query NetworkInsightsPath.NetworkInsightsPathId --output text)
  N=$(aws ec2 start-network-insights-analysis --network-insights-path-id $P --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)
  sleep 30
  aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $N --query 'NetworkInsightsAnalyses[0].[Status,NetworkPathFound]' --output text
  echo "$P $N" >> /tmp/nk-paths.txt
}
chk $ENI_a $ENI_b; chk $ENI_a $ENI_c</pre>
<p>Both should print <code>succeeded True</code>. The file <code>/tmp/nk-paths.txt</code> remembers path and analysis IDs for cleanup.</p>

<h3>Step 2: create the spokes table</h3>
<p><b>Console:</b> VPC → Transit gateway route tables → Create transit gateway route table, name <code>spokes-rt</code>, choose lab-hub.</p>
<pre class="code">SPK=$(aws ec2 create-transit-gateway-route-table --transit-gateway-id $TGW --tag-specifications 'ResourceType=transit-gateway-route-table,Tags=[{Key=Name,Value=spokes-rt}]' --query TransitGatewayRouteTable.TransitGatewayRouteTableId --output text)
DEF=$(aws ec2 describe-transit-gateways --transit-gateway-ids $TGW --query 'TransitGateways[0].Options.AssociationDefaultRouteTableId' --output text)</pre>

<h3>Step 3: move prod and dev to spokes-rt</h3>
<p><b>Console:</b> open the default route table → Associations tab → delete the association of the two attachments; open spokes-rt → Associations → Create association.</p>
<pre class="code">aws ec2 disassociate-transit-gateway-route-table --transit-gateway-route-table-id $DEF --transit-gateway-attachment-id $ATT_a
aws ec2 disassociate-transit-gateway-route-table --transit-gateway-route-table-id $DEF --transit-gateway-attachment-id $ATT_b
sleep 30
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id $SPK --transit-gateway-attachment-id $ATT_a
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id $SPK --transit-gateway-attachment-id $ATT_b
sleep 30
aws ec2 get-transit-gateway-route-table-associations --transit-gateway-route-table-id $SPK --query 'Associations[].[TransitGatewayAttachmentId,State]' --output text</pre>
<p><b>Check:</b> both attachments show <code>associated</code>. If you see <code>associating</code>, wait and repeat. Between the disassociate and the associate, those attachments have no table and their traffic is dropped.</p>

<h3>Step 4: let spokes-rt learn only shared</h3>
<p><b>Console:</b> spokes-rt → Propagations → Create propagation, choose the shared attachment.</p>
<pre class="code">aws ec2 enable-transit-gateway-route-table-propagation --transit-gateway-route-table-id $SPK --transit-gateway-attachment-id $ATT_c
aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id $SPK --filters Name=state,Values=active --query 'Routes[].DestinationCidrBlock' --output text
aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id $DEF --filters Name=state,Values=active --query 'Routes[].DestinationCidrBlock' --output text</pre>
<p><b>Illustrative output:</b></p>
<pre class="out"><span class="hl">10.82.0.0/16</span>
10.80.0.0/16  10.81.0.0/16  10.82.0.0/16</pre>
<p>The first line is spokes-rt: only shared. The second is the default table, still used by shared: it learns both spokes, which is what lets replies come back.</p>

<h3>Step 5: prove it</h3>
<pre class="code">chk $ENI_a $ENI_b; chk $ENI_b $ENI_a; chk $ENI_a $ENI_c; chk $ENI_b $ENI_c</pre>
<p>Expected: the first two print <code>succeeded False</code>, the last two <code>succeeded True</code> (see the table above). For a False result read the explanation in the console or in <code>describe-network-insights-analyses</code>; it should point at the Transit Gateway route table having no route to the destination. We do not quote an exact code name here because it was not re-verified.</p>

<h3>Optional: add a blackhole as a second lock</h3>
<pre class="code">aws ec2 create-transit-gateway-route --transit-gateway-route-table-id $SPK --destination-cidr-block 10.81.0.0/16 --blackhole</pre>
<p>Now even a stray propagation of dev into spokes-rt would lose to the static blackhole for the same prefix.</p>

<h3>Cleanup: mandatory, in dependency order</h3>
<ol>
<li>Delete every analysis and path recorded in <code>/tmp/nk-paths.txt</code>.</li>
<li>Delete the 10.0.0.0/8 VPC routes.</li>
<li>Delete the three attachments (this also removes their associations and propagations) and <b>wait until they are gone</b>.</li>
<li>Delete <code>spokes-rt</code>: it must have no associations left.</li>
<li>Delete the Transit Gateway.</li>
<li>Delete ENIs, security groups, subnets and VPCs, exactly as in the previous chapter.</li>
</ol>
<pre class="code">while read P N; do
  aws ec2 delete-network-insights-analysis --network-insights-analysis-id $N
  aws ec2 delete-network-insights-path --network-insights-path-id $P
done &lt; /tmp/nk-paths.txt
<span class="c"># ...VPC routes and attachments: same commands as the previous chapter, then:</span>
aws ec2 delete-transit-gateway-route-table --transit-gateway-route-table-id $SPK
aws ec2 delete-transit-gateway --transit-gateway-id $TGW</pre>
<p><b>Confirm</b> with <code>aws ec2 describe-transit-gateway-route-tables</code> and <code>describe-transit-gateways</code> that nothing remains in a non-deleted state.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>The three attachments, hourly, until deleted. This is the big one.</li>
<li>Each extra analysis; run only the six you need.</li>
<li>Any instance you launched as a fallback test host.</li>
<li>Forgotten flow logs or VPN attachments if you experimented beyond this lab.</li>
</ul>

<div class="scn"><h4>Segmentation that broke the monitoring</h4><p>After moving prod and dev to a spokes table, a team's monitoring server in the shared VPC could no longer poll prod. The cause: they had also disabled propagation of prod into the default table "for cleanliness". Requests from shared found no route to prod. Re-enabling prod and dev propagation into the default table restored polling without reopening dev to prod.</p><p><b>Lesson:</b> the table used by shared must learn the spokes; segmentation limits spoke-to-spoke traffic, not shared-to-spoke.</p></div>

<div class="iv"><p class="q">"You changed an attachment association and traffic stopped for a minute. Why?"</p><p>An attachment has exactly one association, so moving it means disassociate then associate. Until the new association is in the associated state, lookups for that attachment have no table and packets are dropped. Plan such changes in a maintenance window or associate first in a new design before cutting over.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Segmentation = new table + move associations + propagate only what is allowed.</li>
<li>Prove with before and after analyses in both directions.</li>
<li>Moving an association briefly leaves the attachment without a table.</li>
<li>Delete order: analyses, VPC routes, attachments (wait), custom route table, TGW, VPC pieces.</li>
<li>Same-day cleanup keeps this lab at roughly the price of a coffee, not a month of hourly fees.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish. In-app emulator ticket "segment dev away from prod on the Transit Gateway" wahi exercise hai, analyzer ki jagah probes ke saath.</p></div>

<h3>Goal</h3>
<p>Pichhle chapter ke flat hub se shuru karo aur use segmented banao: <b>a = prod</b>, <b>b = dev</b>, <b>c = shared services</b>. Prod aur dev dono shared tak pahunchein aur ek doosre tak nahi. Reachability Analyzer se before aur after saabit karoge.</p>
<div class="dia">`+e+`<p class="cap">Expected analyzer results. Doosre column ka akela badlav TGW route tables se aata hai.</p></div>

<h3>Prerequisites</h3>
<ul>
<li>Pichhle chapter ke steps 0 se 4 poore karo aur <b>resources rakho</b>: TGW, teen attachments, VPC routes, ENIs, aur shell variables <code>$TGW</code>, <code>$ATT_a</code>, <code>$ATT_b</code>, <code>$ATT_c</code>, <code>$ENI_a</code>, <code>$ENI_b</code>, <code>$ENI_c</code>. Shell band ho gayi ho to describe commands se IDs dobara dhundo (Name tags madad karte hain).</li>
<li>Pichhle chapter ka budget alert abhi bhi active hai.</li>
</ul>
<div class="note"><p><b>Console wording.</b> Pehle ki tarah console labels jaankari se hain aur is build mein current AWS documentation se <b>re-verify nahi</b> hue. CLI commands reference hain.</p></div>

<h3>Imaandar cost</h3>
<p>Naya kuch bill nahi hota: pricing pages attachment-hours, data processed aur analyzer runs list karte hain. (Hamara maanna hai ki extra TGW route tables ka alag charge nahi, par yeh is build mein <b>re-verify nahi</b> hua; pricing page dekho.) Pehle jaise <b>assumed</b> rates ($0.05 per attachment-hour, $0.02 per GB, $0.10 per analysis) lekar: 3 attachments ke saath ek aur ghanta = $0.15; chhe analyses = $0.60; total lagbhag <b>$0.75</b>. Jab tak attachments hain meter chal raha hai, isliye wahi loud warning: <b>teen attachments bhool gaye to assumed $109.50 per month</b>. Aaj hi khatam karo aur cleanup karo.</p>

<h3>Step 1: baseline analyses (flat network)</h3>
<p><b>Console (unverified):</b> VPC → Reachability Analyzer → Create and analyze path, source type Network interface, TCP 443.</p>
<pre class="code">chk() { # usage: chk SRC DST
  P=$(aws ec2 create-network-insights-path --source $1 --destination $2 --protocol tcp --destination-port 443 --query NetworkInsightsPath.NetworkInsightsPathId --output text)
  N=$(aws ec2 start-network-insights-analysis --network-insights-path-id $P --query NetworkInsightsAnalysis.NetworkInsightsAnalysisId --output text)
  sleep 30
  aws ec2 describe-network-insights-analyses --network-insights-analysis-ids $N --query 'NetworkInsightsAnalyses[0].[Status,NetworkPathFound]' --output text
  echo "$P $N" >> /tmp/nk-paths.txt
}
chk $ENI_a $ENI_b; chk $ENI_a $ENI_c</pre>
<p>Dono <code>succeeded True</code> print karein. File <code>/tmp/nk-paths.txt</code> cleanup ke liye path aur analysis IDs yaad rakhti hai.</p>

<h3>Step 2: spokes table banao</h3>
<p><b>Console:</b> VPC → Transit gateway route tables → Create transit gateway route table, naam <code>spokes-rt</code>, lab-hub chuno.</p>
<pre class="code">SPK=$(aws ec2 create-transit-gateway-route-table --transit-gateway-id $TGW --tag-specifications 'ResourceType=transit-gateway-route-table,Tags=[{Key=Name,Value=spokes-rt}]' --query TransitGatewayRouteTable.TransitGatewayRouteTableId --output text)
DEF=$(aws ec2 describe-transit-gateways --transit-gateway-ids $TGW --query 'TransitGateways[0].Options.AssociationDefaultRouteTableId' --output text)</pre>

<h3>Step 3: prod aur dev ko spokes-rt par le jao</h3>
<p><b>Console:</b> default route table kholo → Associations tab → dono attachments ki association delete karo; spokes-rt kholo → Associations → Create association.</p>
<pre class="code">aws ec2 disassociate-transit-gateway-route-table --transit-gateway-route-table-id $DEF --transit-gateway-attachment-id $ATT_a
aws ec2 disassociate-transit-gateway-route-table --transit-gateway-route-table-id $DEF --transit-gateway-attachment-id $ATT_b
sleep 30
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id $SPK --transit-gateway-attachment-id $ATT_a
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id $SPK --transit-gateway-attachment-id $ATT_b
sleep 30
aws ec2 get-transit-gateway-route-table-associations --transit-gateway-route-table-id $SPK --query 'Associations[].[TransitGatewayAttachmentId,State]' --output text</pre>
<p><b>Check:</b> dono attachments <code>associated</code> dikhayein. <code>associating</code> dikhe to ruko aur dohrao. Disassociate aur associate ke beech un attachments ki koi table nahi hoti aur unka traffic drop hota hai.</p>

<h3>Step 4: spokes-rt ko sirf shared seekhne do</h3>
<p><b>Console:</b> spokes-rt → Propagations → Create propagation, shared attachment chuno.</p>
<pre class="code">aws ec2 enable-transit-gateway-route-table-propagation --transit-gateway-route-table-id $SPK --transit-gateway-attachment-id $ATT_c
aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id $SPK --filters Name=state,Values=active --query 'Routes[].DestinationCidrBlock' --output text
aws ec2 search-transit-gateway-routes --transit-gateway-route-table-id $DEF --filters Name=state,Values=active --query 'Routes[].DestinationCidrBlock' --output text</pre>
<p><b>Illustrative output:</b></p>
<pre class="out"><span class="hl">10.82.0.0/16</span>
10.80.0.0/16  10.81.0.0/16  10.82.0.0/16</pre>
<p>Pehli line spokes-rt ki hai: sirf shared. Doosri default table ki, jo shared use karta hai: woh dono spokes seekhti hai, isi se replies wapas aate hain.</p>

<h3>Step 5: saabit karo</h3>
<pre class="code">chk $ENI_a $ENI_b; chk $ENI_b $ENI_a; chk $ENI_a $ENI_c; chk $ENI_b $ENI_c</pre>
<p>Expected: pehle do <code>succeeded False</code>, aakhri do <code>succeeded True</code> (upar ki table dekho). False result ke liye console ya <code>describe-network-insights-analyses</code> mein explanation padho; woh Transit Gateway route table mein destination ka route na hone ki taraf ishara karni chahiye. Exact code name yahan nahi likha kyunki woh re-verify nahi hua.</p>

<h3>Optional: doosre lock ke taur par blackhole</h3>
<pre class="code">aws ec2 create-transit-gateway-route --transit-gateway-route-table-id $SPK --destination-cidr-block 10.81.0.0/16 --blackhole</pre>
<p>Ab dev ka galti se spokes-rt mein propagate hona bhi same prefix ke liye static blackhole se haar jaayega.</p>

<h3>Cleanup: zaroori, dependency order mein</h3>
<ol>
<li><code>/tmp/nk-paths.txt</code> mein record har analysis aur path delete karo.</li>
<li>10.0.0.0/8 VPC routes delete karo.</li>
<li>Teeno attachments delete karo (isse unki associations aur propagations bhi hat jaate hain) aur <b>unke jaane tak intezaar karo</b>.</li>
<li><code>spokes-rt</code> delete karo: usme koi association nahi bachi honi chahiye.</li>
<li>Transit Gateway delete karo.</li>
<li>ENIs, security groups, subnets aur VPCs delete karo, bilkul pichhle chapter jaise.</li>
</ol>
<pre class="code">while read P N; do
  aws ec2 delete-network-insights-analysis --network-insights-analysis-id $N
  aws ec2 delete-network-insights-path --network-insights-path-id $P
done &lt; /tmp/nk-paths.txt
<span class="c"># ...VPC routes aur attachments: pichhle chapter ke same commands, phir:</span>
aws ec2 delete-transit-gateway-route-table --transit-gateway-route-table-id $SPK
aws ec2 delete-transit-gateway --transit-gateway-id $TGW</pre>
<p><b>Confirm</b> karo <code>aws ec2 describe-transit-gateway-route-tables</code> aur <code>describe-transit-gateways</code> se ki non-deleted state mein kuch nahi bacha.</p>

<h3>Kaun bill karta hai: trap list</h3>
<ul>
<li>Teen attachments, hourly, jab tak delete na ho. Yeh sabse bada hai.</li>
<li>Har extra analysis; sirf wahi chhe chalao jo chahiye.</li>
<li>Fallback test host ke taur par launch kiya gaya koi bhi instance.</li>
<li>Is lab se aage experiment kiya ho to bhoole hue flow logs ya VPN attachments.</li>
</ul>

<div class="scn"><h4>Segmentation jisne monitoring tod di</h4><p>Prod aur dev ko spokes table par le jaane ke baad ek team ka shared VPC ka monitoring server prod ko poll nahi kar paaya. Wajah: unhone "saaf-suthra" rakhne ke liye prod ka default table mein propagation bhi band kar diya tha. Shared se aayi requests ko prod ka route nahi mila. Prod aur dev ka default table mein propagation wapas enable karne se polling chali gayi aur dev ko prod tak khule bina.</p><p><b>Seekh:</b> shared jis table ko use karta hai woh spokes seekhe; segmentation spoke-to-spoke traffic rokta hai, shared-to-spoke nahi.</p></div>

<div class="iv"><p class="q">"Aapne attachment ki association badli aur traffic ek minute ke liye ruk gaya. Kyun?"</p><p>Attachment ki bilkul ek association hoti hai, isliye usse move karne ka matlab disassociate phir associate. Nayi association associated state mein aane tak us attachment ke lookups ko koi table nahi milti aur packets drop hote hain. Aise changes maintenance window mein karo, ya cutover se pehle naye design mein pehle associate karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Segmentation = nayi table + associations move + sirf allowed cheezein propagate.</li>
<li>Dono directions mein before aur after analyses se saabit karo.</li>
<li>Association move karne par attachment kuch der bina table ke rehta hai.</li>
<li>Delete order: analyses, VPC routes, attachments (wait), custom route table, TGW, VPC ke hisse.</li>
<li>Usi din cleanup se yeh lab chai ke daam jitna rehta hai, mahine bhar ke hourly fees jitna nahi.</li>
</ul></div>
`}};export{t as default};