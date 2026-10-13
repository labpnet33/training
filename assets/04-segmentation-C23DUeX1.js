var e=`<svg viewBox="0 0 640 270" role="img" aria-label="Segmentation: prod and dev both reach shared services but not each other">
<defs><marker id="a3" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#64748b"/></marker></defs>
<rect x="30" y="30" width="170" height="70" rx="10" fill="#fed7aa" stroke="#64748b"/><text x="115" y="58" text-anchor="middle" class="svg-ink" font-size="14">dev-vpc</text><text x="115" y="78" text-anchor="middle" class="svg-muted" font-size="12">10.84.0.0/16</text>
<rect x="440" y="30" width="170" height="70" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="525" y="58" text-anchor="middle" class="svg-ink" font-size="14">prod-vpc</text><text x="525" y="78" text-anchor="middle" class="svg-muted" font-size="12">10.83.0.0/16</text>
<rect x="235" y="170" width="170" height="70" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="320" y="198" text-anchor="middle" class="svg-ink" font-size="14">shared-vpc</text><text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">10.85.0.0/16</text>
<rect x="260" y="55" width="120" height="40" rx="8" fill="#ddd6fe" stroke="#64748b"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">core-tgw</text>
<g stroke="#64748b" stroke-width="2"><line x1="200" y1="66" x2="258" y2="72"/><line x1="440" y1="66" x2="382" y2="72"/><line x1="320" y1="95" x2="320" y2="168"/></g>
<g stroke="#b91c1c" stroke-width="3"><line x1="228" y1="14" x2="412" y2="14" stroke-dasharray="6 5"/><line x1="312" y1="6" x2="328" y2="22"/><line x1="328" y1="6" x2="312" y2="22"/></g>
<text x="320" y="256" text-anchor="middle" class="svg-ink" font-size="12">dev ↔ shared and prod ↔ shared work; dev ↔ prod has no route</text>
</svg>`,t={id:`segmentation`,h:{en:`Segmentation: prod, dev and shared services`,hi:`Segmentation: prod, dev aur shared services`},body:{en:`
<p>A housing society has a main gate and a clubhouse. Residents of Tower A and Tower B both use the clubhouse, but a resident of A should not wander into B's corridors. The society achieves this with <b>corridors that simply do not connect</b>, not with a guard at every flat door. Segmentation on a Transit Gateway is the same: remove the route and the corridor is gone.</p>

<h3>Why segment at the routing layer</h3>
<ul>
<li><b>Blast radius</b>: a compromised dev server cannot even send packets to production.</li>
<li><b>Compliance</b>: auditors for card-data or healthcare workloads like to see network separation that does not depend on a hundred security group rules staying correct.</li>
<li><b>Simplicity</b>: one routing decision protects many hosts at once.</li>
</ul>
<p>Routing isolation is <b>coarse</b>: it works per VPC (per CIDR), not per server. It is the outer wall. Security groups and NACLs inside each VPC remain the inner doors. Use both.</p>

<div class="dia">`+e+`<p class="cap">The target design from the segmentation lab: shared services are reachable from both environments, the environments cannot reach each other.</p></div>

<h3>The reachability matrix comes first</h3>
<p>Before touching the console, write down who may talk to whom. A small table prevents most design bugs:</p>
<table class="cmp"><tr><th>From \\ To</th><th>prod</th><th>dev</th><th>shared</th></tr>
<tr><td>prod</td><td>local</td><td>no</td><td>yes</td></tr>
<tr><td>dev</td><td>no</td><td>local</td><td>yes</td></tr>
<tr><td>shared</td><td>yes (replies and management)</td><td>yes</td><td>local</td></tr></table>
<p>Each row is the TGW route table used for traffic <i>coming from</i> that environment. Rows with identical content can share a table. Prod and dev have identical rows (only shared), so one table, <code>spokes-rt</code>, serves both. Shared needs to learn both spokes, so it keeps the default table.</p>

<h3>Four common patterns</h3>
<ol>
<li><b>Shared services</b> (this chapter): spokes see only shared; shared sees everyone.</li>
<li><b>Fully isolated environments</b>: one table per environment, each learning only itself and the shared VPC.</li>
<li><b>Blackhole guardrail</b>: a static <code>--blackhole</code> route for a forbidden prefix such as the dev range in the prod table. Even if somebody propagates dev by mistake, the blackhole is a static route and wins over a propagated one for the same prefix.</li>
<li><b>Deny-by-default</b>: disable default association and propagation, so nothing connects until you say so.</li>
</ol>

<h3>The configuration, step by step</h3>
<pre class="code"><span class="c"># 1. create the spokes table</span>
aws ec2 create-transit-gateway-route-table --transit-gateway-id $TGW
<span class="c"># 2. move prod and dev off the default table</span>
aws ec2 disassociate-transit-gateway-route-table --transit-gateway-route-table-id $DEF --transit-gateway-attachment-id $PROD
aws ec2 disassociate-transit-gateway-route-table --transit-gateway-route-table-id $DEF --transit-gateway-attachment-id $DEV
<span class="c"># 3. associate them with spokes-rt</span>
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id $SPK --transit-gateway-attachment-id $PROD
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id $SPK --transit-gateway-attachment-id $DEV
<span class="c"># 4. let spokes-rt learn the shared VPC</span>
aws ec2 enable-transit-gateway-route-table-propagation --transit-gateway-route-table-id $SPK --transit-gateway-attachment-id $SHARED
<span class="c"># 5. optional guardrail: explicit drop of the dev range for prod traffic</span>
aws ec2 create-transit-gateway-route --transit-gateway-route-table-id $SPK --destination-cidr-block 10.84.0.0/16 --blackhole</pre>
<p>Step 5 as written would also blackhole dev for dev itself, which is harmless because local traffic never uses the TGW. Prod and dev already stay isolated without it; use blackholes as a second lock, not as the first one.</p>

<h3>Verification</h3>
<p>The proof has two parts: routes present where wanted, and routes absent where not wanted.</p>
<pre class="out">search-transit-gateway-routes on spokes-rt (state active)
  <span class="hl">10.85.0.0/16   propagated   tgw-attach-shared   active</span>
search-transit-gateway-routes on default table
  10.83.0.0/16   propagated   tgw-attach-prod     active
  10.84.0.0/16   propagated   tgw-attach-dev      active
  10.85.0.0/16   propagated   tgw-attach-shared   active</pre>
<p>That block is <b>illustrative output</b>. In the in-app emulator lab you prove it with probes: <code>nk-probe prod-1 shared-1 443</code> connects, <code>nk-probe dev-1 prod-1 443</code> does not.</p>

<div class="eg"><p><b>Worked example.</b> 4 spokes: payments (prod), web (prod), qa and dev. The matrix gives two groups with identical rows: prod-group {payments, web} and nonprod-group {qa, dev}. Create <code>prod-rt</code> (learns shared plus the other prod VPC) and <code>nonprod-rt</code> (learns shared and the other nonprod VPC). Associations: 2 attachments each. Propagations: each spoke into the table of its own group, and all four into the shared table. Four attachments, three tables, no spoke-to-spoke link across groups.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Forgetting that the shared VPC must also learn the spokes, otherwise requests arrive and replies have no route. Segmenting only with security group names (these do not even work across a TGW). Disassociating the default table and forgetting to associate the new one: the attachment then has no association and its traffic is dropped.</p></div>
<div class="exam"><p><b>Exam trap.</b> To isolate two VPCs on a TGW you do not need to delete anything: it is enough that neither attachment's associated table contains a route to the other.</p></div>

<div class="scn"><h4>The contractor in dev</h4><p>A pen-test report found that a contractor's laptop VPN could reach production databases through the Transit Gateway, because the VPN attachment sat on the flat default table. The network team created a dedicated <code>vendor-rt</code> that learns only the dev VPC, associated the VPN attachment with it, and added blackholes for the production ranges. A retest showed no route to production.</p><p><b>Lesson:</b> every kind of attachment needs a place in the matrix, not just VPCs.</p></div>

<div class="iv"><p class="q">"How would you stop dev reaching prod on a Transit Gateway while both reach shared services?"</p><p>Create a separate route table for the spokes, associate prod and dev with it, and propagate only the shared VPC into it. Keep shared on a table that learns all spokes so replies work. Add blackhole routes as a guardrail, and mention that security groups and NACLs still apply inside each VPC.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Write the reachability matrix first; identical rows share one TGW table.</li>
<li>Isolation = no route in the associated table, not deleting resources.</li>
<li>Shared services need a table that learns every spoke so replies have a path.</li>
<li>Static blackhole routes are a second lock because static beats propagated.</li>
<li>Routing separation is coarse; keep security groups and NACLs as inner layers.</li>
</ul></div>
`,hi:`
<p>Ek housing society mein main gate aur clubhouse hai. Tower A aur Tower B ke residents dono clubhouse use karte hain, par A ka resident B ke corridors mein nahi ghoomna chahiye. Society yeh <b>aise corridors se karti hai jo jude hi nahi</b>, har flat ke darwaze par guard se nahi. Transit Gateway par segmentation bhi aisa hi hai: route hata do, corridor khatam.</p>

<h3>Routing layer par segment kyun</h3>
<ul>
<li><b>Blast radius</b>: compromised dev server production ko packet bhej hi nahi sakta.</li>
<li><b>Compliance</b>: card-data ya healthcare workloads ke auditors woh network separation pasand karte hain jo sau security group rules ke sahi rehne par depend na kare.</li>
<li><b>Simplicity</b>: ek routing decision kai hosts ko ek saath bachata hai.</li>
</ul>
<p>Routing isolation <b>coarse</b> hai: yeh VPC (CIDR) ke hisaab se chalta hai, server ke hisaab se nahi. Yeh bahar ki deewar hai. Har VPC ke andar security groups aur NACLs andar ke darwaze rehte hain. Dono use karo.</p>

<div class="dia">`+e+`<p class="cap">Segmentation lab ka target design: shared services dono environments se reachable hain, environments ek doosre tak nahi pahunchte.</p></div>

<h3>Pehle reachability matrix</h3>
<p>Console chhune se pehle likho ki kaun kisse baat kar sakta hai. Chhoti table zyada tar design bugs rok deti hai:</p>
<table class="cmp"><tr><th>From \\ To</th><th>prod</th><th>dev</th><th>shared</th></tr>
<tr><td>prod</td><td>local</td><td>no</td><td>yes</td></tr>
<tr><td>dev</td><td>no</td><td>local</td><td>yes</td></tr>
<tr><td>shared</td><td>yes (replies aur management)</td><td>yes</td><td>local</td></tr></table>
<p>Har row us TGW route table ki hai jo us environment <i>se aane wale</i> traffic ke liye use hoti hai. Same content wali rows ek table share kar sakti hain. Prod aur dev ki rows identical hain (sirf shared), isliye ek table, <code>spokes-rt</code>, dono ko serve karti hai. Shared ko dono spokes seekhne hain, isliye woh default table rakhta hai.</p>

<h3>Chaar common patterns</h3>
<ol>
<li><b>Shared services</b> (is chapter ka): spokes sirf shared dekhte hain; shared sabko dekhta hai.</li>
<li><b>Fully isolated environments</b>: har environment ki ek table, jo sirf khud ko aur shared VPC ko seekhti hai.</li>
<li><b>Blackhole guardrail</b>: forbidden prefix ke liye static <code>--blackhole</code> route, jaise prod table mein dev range. Agar koi galti se dev propagate kar de, tab bhi blackhole static route hai aur same prefix ke liye propagated par jeetta hai.</li>
<li><b>Deny-by-default</b>: default association aur propagation band karo, to jab tak aap na kaho kuch nahi judta.</li>
</ol>

<h3>Configuration, step by step</h3>
<pre class="code"><span class="c"># 1. spokes table banao</span>
aws ec2 create-transit-gateway-route-table --transit-gateway-id $TGW
<span class="c"># 2. prod aur dev ko default table se hatao</span>
aws ec2 disassociate-transit-gateway-route-table --transit-gateway-route-table-id $DEF --transit-gateway-attachment-id $PROD
aws ec2 disassociate-transit-gateway-route-table --transit-gateway-route-table-id $DEF --transit-gateway-attachment-id $DEV
<span class="c"># 3. unhe spokes-rt se associate karo</span>
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id $SPK --transit-gateway-attachment-id $PROD
aws ec2 associate-transit-gateway-route-table --transit-gateway-route-table-id $SPK --transit-gateway-attachment-id $DEV
<span class="c"># 4. spokes-rt ko shared VPC seekhne do</span>
aws ec2 enable-transit-gateway-route-table-propagation --transit-gateway-route-table-id $SPK --transit-gateway-attachment-id $SHARED
<span class="c"># 5. optional guardrail: prod traffic ke liye dev range ka explicit drop</span>
aws ec2 create-transit-gateway-route --transit-gateway-route-table-id $SPK --destination-cidr-block 10.84.0.0/16 --blackhole</pre>
<p>Step 5 jaise likha hai woh dev ke liye khud dev ko bhi blackhole karega, jo harmless hai kyunki local traffic TGW use nahi karta. Prod aur dev iske bina bhi isolated rehte hain; blackhole ko doosre lock ki tarah use karo, pehle ki tarah nahi.</p>

<h3>Verification</h3>
<p>Saboot ke do hisse hain: jahan chahiye wahan routes maujood, jahan nahi chahiye wahan absent.</p>
<pre class="out">search-transit-gateway-routes on spokes-rt (state active)
  <span class="hl">10.85.0.0/16   propagated   tgw-attach-shared   active</span>
search-transit-gateway-routes on default table
  10.83.0.0/16   propagated   tgw-attach-prod     active
  10.84.0.0/16   propagated   tgw-attach-dev      active
  10.85.0.0/16   propagated   tgw-attach-shared   active</pre>
<p>Yeh block <b>illustrative output</b> hai. In-app emulator lab mein aap probes se saabit karte ho: <code>nk-probe prod-1 shared-1 443</code> connect hota hai, <code>nk-probe dev-1 prod-1 443</code> nahi.</p>

<div class="eg"><p><b>Worked example.</b> 4 spokes: payments (prod), web (prod), qa aur dev. Matrix do groups deta hai jinki rows identical hain: prod-group {payments, web} aur nonprod-group {qa, dev}. <code>prod-rt</code> banao (shared plus doosra prod VPC seekhti hai) aur <code>nonprod-rt</code> (shared plus doosra nonprod VPC). Associations: har table ke 2 attachments. Propagations: har spoke apne group ki table mein, aur chaaron shared table mein. Chaar attachments, teen tables, groups ke beech koi spoke-to-spoke link nahi.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Yeh bhoolna ki shared VPC ko bhi spokes seekhne hain, warna requests pahunchti hain aur replies ka route nahi hota. Sirf security group names se segment karna (jo TGW ke paar kaam hi nahi karte). Default table se disassociate karke nayi table se associate karna bhool jaana: tab attachment ki koi association nahi hoti aur uska traffic drop hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> TGW par do VPCs ko isolate karne ke liye kuch delete nahi karna: itna kaafi hai ki kisi bhi attachment ki associated table mein doosre ka route na ho.</p></div>

<div class="scn"><h4>Dev mein contractor</h4><p>Pen-test report mein mila ki ek contractor ka laptop VPN Transit Gateway ke through production databases tak pahunch raha tha, kyunki VPN attachment flat default table par tha. Network team ne alag <code>vendor-rt</code> banayi jo sirf dev VPC seekhti hai, VPN attachment ko usse associate kiya, aur production ranges ke liye blackholes jode. Retest mein production ka koi route nahi mila.</p><p><b>Seekh:</b> har tarah ke attachment ko matrix mein jagah chahiye, sirf VPCs ko nahi.</p></div>

<div class="iv"><p class="q">"Transit Gateway par dev ko prod tak pahunchne se kaise rokoge jabki dono shared services tak pahunchein?"</p><p>Spokes ke liye alag route table banao, prod aur dev ko usse associate karo, aur usme sirf shared VPC propagate karo. Shared ko aisi table par rakho jo saare spokes seekhe taaki replies chalein. Guardrail ke taur par blackhole routes jodo, aur batao ki security groups aur NACLs har VPC ke andar ab bhi lagu hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle reachability matrix likho; identical rows ek TGW table share karti hain.</li>
<li>Isolation = associated table mein route na hona, resources delete karna nahi.</li>
<li>Shared services ko aisi table chahiye jo har spoke seekhe taaki replies ka path ho.</li>
<li>Static blackhole routes doosra lock hain kyunki static, propagated par jeetta hai.</li>
<li>Routing separation coarse hai; security groups aur NACLs ko andar ki layers rakho.</li>
</ul></div>
`}};export{t as default};