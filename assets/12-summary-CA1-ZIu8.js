var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before an exam or an interview, a pilot runs a pre-flight checklist: not because they forgot how to fly, but because a checklist catches the one thing memory misses. This chapter is your pre-flight checklist for Versa onboarding.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Module summary">
<rect x="10" y="20" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="46" text-anchor="middle" class="svg-ink" font-size="13">Plan</text><text x="70" y="64" text-anchor="middle" class="svg-muted" font-size="12">bind-data sheet</text>
<rect x="150" y="20" width="120" height="60" rx="8" fill="#bae6fd"/><text x="210" y="46" text-anchor="middle" class="svg-ink" font-size="13">Director</text><text x="210" y="64" text-anchor="middle" class="svg-muted" font-size="12">tpl, group, device</text>
<rect x="290" y="20" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="350" y="46" text-anchor="middle" class="svg-ink" font-size="13">Staging</text><text x="350" y="64" text-anchor="middle" class="svg-muted" font-size="12">tunnel to Controller</text>
<rect x="430" y="20" width="90" height="60" rx="8" fill="#fde68a"/><text x="475" y="46" text-anchor="middle" class="svg-ink" font-size="13">Deploy</text><text x="475" y="64" text-anchor="middle" class="svg-muted" font-size="12">workflow</text>
<rect x="540" y="20" width="90" height="60" rx="8" fill="#bbf7d0"/><text x="585" y="46" text-anchor="middle" class="svg-ink" font-size="13">Online</text><text x="585" y="64" text-anchor="middle" class="svg-muted" font-size="12">push + verify</text>
<line x1="130" y1="50" x2="150" y2="50" stroke="#64748b" stroke-width="2"/><line x1="270" y1="50" x2="290" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="50" x2="430" y2="50" stroke="#64748b" stroke-width="2"/><line x1="520" y1="50" x2="540" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Failure? Read the state, name the layer, fix in the owner, re-read.</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Rejected = serial; Post-staging failed = Director data; Staging failed = underlay or headend link</text>
</svg><p class="cap">Plan, build objects, stage, deploy, verify.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can build a bind-data sheet with site-id, serial, group, LAN and WAN addresses and gateways.</li>
<li>I can explain template, device group and bind data, and what each one holds.</li>
<li>I can create BR-DUAL, BRANCHES and Branch3 with complete bind data and read <code>Missing bind data: none</code>.</li>
<li>I can describe staging (first tunnel to the Controller) and post-staging (Director NETCONF push).</li>
<li>I can run staging on a branch and deploy the workflow from the Director.</li>
<li>I can name the six states and the layer each points to.</li>
<li>I can fix the eight failure modes in the right component.</li>
<li>I can walk through the Kolkata ticket: serial with a letter O, then missing wan2-gateway.</li>
<li>I can explain commit versus deploy, revisions, rollback, undeploy and decommission.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Director</dt><dd>Management and orchestration node; holds templates, groups, devices and bind data.</dd>
<dt>Controller</dt><dd>Control-plane node; terminates the staging tunnel and runs MP-BGP with sites.</dd>
<dt>Template</dt><dd>Reusable configuration shape with variables.</dd>
<dt>Device group</dt><dd>Collection of same-role devices that points to a template.</dd>
<dt>Bind data</dt><dd>Per-device values filling the template variables.</dd>
<dt>Staging</dt><dd>First contact: underlay, serial and Controller bring up the first tunnel.</dd>
<dt>Post-staging</dt><dd>Director builds and pushes the full configuration (NETCONF).</dd>
<dt>ZTP</dt><dd>Zero-touch provisioning: onboarding with no engineer at site.</dd>
<dt>Workflow deploy</dt><dd>The Director action that submits a device configuration push (course helper: <code>request devices workflow deploy device &lt;n&gt;</code>).</dd>
<dt>Revision</dt><dd>Numbered version created by each deploy (r1, r2...).</dd>
<dt>Serial</dt><dd>The identity that links the physical box to a Director record.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Who terminates staging</td><td>Controller</td></tr>
<tr><td>Who pushes the template</td><td>Director, over NETCONF</td></tr>
<tr><td>Wrong serial</td><td>Rejected; fix serial in the Director</td></tr>
<tr><td>Missing bind data</td><td>Post-staging failed; nothing is pushed</td></tr>
<tr><td>wan1, wan2, wan3</td><td>Template WAN interfaces in VNI order</td></tr>
<tr><td>Pushed lines on branch</td><td>Read-only; change in Director</td></tr>
<tr><td>Online</td><td>Template pushed; overlay still needs checking</td></tr></table>

<h3>Command cheat-sheet (course model)</h3>
<pre class="code"><span class="c">! Director</span>
set director templates BR-DUAL tenant Acme
set director templates BR-DUAL wan-interface vni-0/0 transport Internet
set director templates BR-DUAL wan-interface vni-0/1 transport MPLS
set director templates BR-DUAL lan-interface vni-0/3
set director groups BRANCHES template BR-DUAL
set director devices Branch3 serial VOS-BR3-0001
set director devices Branch3 group BRANCHES
set director devices Branch3 bind site-id 103
set director devices Branch3 bind lan-address 10.1.3.1/24
set director devices Branch3 bind wan1-address 203.0.113.14/30
set director devices Branch3 bind wan1-gateway 203.0.113.13
set director devices Branch3 bind wan2-address 172.31.3.2/30
set director devices Branch3 bind wan2-gateway 172.31.3.1
request devices workflow deploy device Branch3
<span class="c">! Branch</span>
request staging start serial VOS-BR3-0001 controller 198.51.100.20
show system staging status
show orgs org Acme sd-wan brief
<span class="c">! Director verify</span>
show templates   show device-groups   show devices brief   show devices device Branch3</pre>

<div class="warn"><p><b>Common mistakes to avoid on the exam:</b> saying the Controller pushes the template; saying Rejected means a network failure; treating Online as proof of service; forgetting to deploy after commit.</p></div>
<div class="exam"><p><b>Exam trap:</b> the course CLI is a simplified model. In the real product, the same ideas appear as Director workflow wizard steps, template variables and device status, and real VOS has a much larger CLI.</p></div>

<div class="scn"><h4>The 15-minute branch</h4><p>A team that had practised this checklist onboarded a new branch in 15 minutes: sheet verified, objects created, Missing bind data none, staging, deploy, Online, overlay Established, ping to HQ. A year earlier, the same job had taken two days of guessing.</p><p><b>Lesson:</b> a clear mental model turns troubleshooting into a short routine.</p></div>

<div class="iv"><p class="q">"Summarise how Versa zero-touch onboarding works in one minute."</p><p>You prepare a template, a device group and per-device bind data in the Director, including the serial. The branch stages: it builds a tunnel to the Controller using its serial and Controller address. The Controller informs the Director, which matches the serial, resolves group, template and bind data, and pushes the configuration over NETCONF. The branch becomes Online, and I verify tunnels, MP-BGP and end-to-end traffic.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Plan data first; template = shape, bind data = values, group = who gets which template.</li>
<li>Staging goes to the Controller; post-staging comes from the Director.</li>
<li>States point at layers; fix in the owning component and re-read.</li>
<li>Commit is intent; deploy makes it real.</li>
<li>Always verify the overlay after Online.</li>
</ul></div>
`,hi:`
<p>Exam ya interview se pehle pilot pre-flight checklist chalata hai: isliye nahi ki wo udna bhool gaya, balki isliye ki checklist wo ek cheez pakad leti hai jo yaaddasht chhod deti hai. Ye chapter Versa onboarding ke liye aapki pre-flight checklist hai.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Module summary">
<rect x="10" y="20" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="46" text-anchor="middle" class="svg-ink" font-size="13">Plan</text><text x="70" y="64" text-anchor="middle" class="svg-muted" font-size="12">bind-data sheet</text>
<rect x="150" y="20" width="120" height="60" rx="8" fill="#bae6fd"/><text x="210" y="46" text-anchor="middle" class="svg-ink" font-size="13">Director</text><text x="210" y="64" text-anchor="middle" class="svg-muted" font-size="12">tpl, group, device</text>
<rect x="290" y="20" width="120" height="60" rx="8" fill="#ddd6fe"/><text x="350" y="46" text-anchor="middle" class="svg-ink" font-size="13">Staging</text><text x="350" y="64" text-anchor="middle" class="svg-muted" font-size="12">Controller tak tunnel</text>
<rect x="430" y="20" width="90" height="60" rx="8" fill="#fde68a"/><text x="475" y="46" text-anchor="middle" class="svg-ink" font-size="13">Deploy</text><text x="475" y="64" text-anchor="middle" class="svg-muted" font-size="12">workflow</text>
<rect x="540" y="20" width="90" height="60" rx="8" fill="#bbf7d0"/><text x="585" y="46" text-anchor="middle" class="svg-ink" font-size="13">Online</text><text x="585" y="64" text-anchor="middle" class="svg-muted" font-size="12">push + verify</text>
<line x1="130" y1="50" x2="150" y2="50" stroke="#64748b" stroke-width="2"/><line x1="270" y1="50" x2="290" y2="50" stroke="#64748b" stroke-width="2"/><line x1="410" y1="50" x2="430" y2="50" stroke="#64748b" stroke-width="2"/><line x1="520" y1="50" x2="540" y2="50" stroke="#64748b" stroke-width="2"/>
<text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="13">Failure? State padho, layer ka naam lo, owner mein fix karo, dobara padho.</text>
<text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="12">Rejected = serial; Post-staging failed = Director data; Staging failed = underlay ya headend link</text>
</svg><p class="cap">Plan, objects banao, stage, deploy, verify.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main site-id, serial, group, LAN aur WAN addresses aur gateways ke saath bind-data sheet bana sakta hoon.</li>
<li>Main template, device group aur bind data samjha sakta hoon, aur har ek mein kya hota hai.</li>
<li>Main BR-DUAL, BRANCHES aur Branch3 complete bind data ke saath bana sakta hoon aur <code>Missing bind data: none</code> padh sakta hoon.</li>
<li>Main staging (Controller tak pehla tunnel) aur post-staging (Director NETCONF push) describe kar sakta hoon.</li>
<li>Main branch par staging chala sakta hoon aur Director se workflow deploy kar sakta hoon.</li>
<li>Main chhe states aur har ek ki layer bata sakta hoon.</li>
<li>Main aath failure modes ko sahi component mein fix kar sakta hoon.</li>
<li>Main Kolkata ticket walk through kar sakta hoon: letter O wala serial, phir missing wan2-gateway.</li>
<li>Main commit vs deploy, revisions, rollback, undeploy aur decommission samjha sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Director</dt><dd>Management aur orchestration node; templates, groups, devices aur bind data rakhta hai.</dd>
<dt>Controller</dt><dd>Control-plane node; staging tunnel terminate karta hai aur sites ke saath MP-BGP chalata hai.</dd>
<dt>Template</dt><dd>Variables ke saath reusable configuration shape.</dd>
<dt>Device group</dt><dd>Same-role devices ka collection jo ek template ko point karta hai.</dd>
<dt>Bind data</dt><dd>Per-device values jo template variables bharti hain.</dd>
<dt>Staging</dt><dd>First contact: underlay, serial aur Controller pehla tunnel banate hain.</dd>
<dt>Post-staging</dt><dd>Director poori configuration banata aur push karta hai (NETCONF).</dd>
<dt>ZTP</dt><dd>Zero-touch provisioning: site par engineer ke bina onboarding.</dd>
<dt>Workflow deploy</dt><dd>Director action jo device configuration push submit karta hai (course helper: <code>request devices workflow deploy device &lt;n&gt;</code>).</dd>
<dt>Revision</dt><dd>Har deploy se bana numbered version (r1, r2...).</dd>
<dt>Serial</dt><dd>Wo identity jo physical box ko Director record se jodti hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Staging kaun terminate karta hai</td><td>Controller</td></tr>
<tr><td>Template kaun push karta hai</td><td>Director, NETCONF se</td></tr>
<tr><td>Galat serial</td><td>Rejected; Director mein serial fix karo</td></tr>
<tr><td>Missing bind data</td><td>Post-staging failed; kuch push nahi hota</td></tr>
<tr><td>wan1, wan2, wan3</td><td>Template WAN interfaces VNI order mein</td></tr>
<tr><td>Branch par pushed lines</td><td>Read-only; Director mein badlo</td></tr>
<tr><td>Online</td><td>Template push hua; overlay abhi bhi check karna hai</td></tr></table>

<h3>Command cheat-sheet (course model)</h3>
<pre class="code"><span class="c">! Director</span>
set director templates BR-DUAL tenant Acme
set director templates BR-DUAL wan-interface vni-0/0 transport Internet
set director templates BR-DUAL wan-interface vni-0/1 transport MPLS
set director templates BR-DUAL lan-interface vni-0/3
set director groups BRANCHES template BR-DUAL
set director devices Branch3 serial VOS-BR3-0001
set director devices Branch3 group BRANCHES
set director devices Branch3 bind site-id 103
set director devices Branch3 bind lan-address 10.1.3.1/24
set director devices Branch3 bind wan1-address 203.0.113.14/30
set director devices Branch3 bind wan1-gateway 203.0.113.13
set director devices Branch3 bind wan2-address 172.31.3.2/30
set director devices Branch3 bind wan2-gateway 172.31.3.1
request devices workflow deploy device Branch3
<span class="c">! Branch</span>
request staging start serial VOS-BR3-0001 controller 198.51.100.20
show system staging status
show orgs org Acme sd-wan brief
<span class="c">! Director verify</span>
show templates   show device-groups   show devices brief   show devices device Branch3</pre>

<div class="warn"><p><b>Exam mein bachne wali mistakes:</b> ye kehna ki Controller template push karta hai; Rejected ko network failure kehna; Online ko service ka proof maanna; commit ke baad deploy bhoolna.</p></div>
<div class="exam"><p><b>Exam trap:</b> course CLI simplified model hai. Real product mein wahi ideas Director workflow wizard steps, template variables aur device status ke roop mein dikhte hain, aur real VOS ka CLI kaafi bada hai.</p></div>

<div class="scn"><h4>15 minute ki branch</h4><p>Jis team ne ye checklist practise ki thi usne naya branch 15 minute mein onboard kiya: sheet verified, objects bane, Missing bind data none, staging, deploy, Online, overlay Established, HQ ko ping. Ek saal pehle wahi kaam do din ke andaze mein laga tha.</p><p><b>Lesson:</b> saaf mental model troubleshooting ko chhoti routine bana deta hai.</p></div>

<div class="iv"><p class="q">"Versa zero-touch onboarding ek minute mein samjhao."</p><p>Director mein template, device group aur serial ke saath per-device bind data prepare karte hain. Branch stage hota hai: apne serial aur Controller address se Controller tak tunnel banata hai. Controller Director ko batata hai, jo serial match karta hai, group, template aur bind data resolve karta hai, aur configuration NETCONF se push karta hai. Branch Online hota hai, aur main tunnels, MP-BGP aur end-to-end traffic verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Data pehle plan karo; template = shape, bind data = values, group = kisko kaunsa template.</li>
<li>Staging Controller tak jaati hai; post-staging Director se aata hai.</li>
<li>States layers ko point karte hain; owning component mein fix karo aur dobara padho.</li>
<li>Commit intent hai; deploy use real banata hai.</li>
<li>Online ke baad overlay hamesha verify karo.</li>
</ul></div>
`}};export{e as default};