var e={id:`sync-and-service-setup`,h:{en:`Out of sync, In sync and the Service Setup scope`,hi:`Out of sync, In sync aur Service Setup scope`},body:{en:`
<p>A restaurant has an order book in the manager's office and an order board in the kitchen. When both match, the cook prepares what the customer asked for. When the manager writes a new order but nobody updates the kitchen board, the book and the board disagree, and the customer gets the wrong dish. <b>In sync</b> means the book and the board match. <b>Out of sync</b> means they do not. Prisma Access shows you this state per location, per remote network and per service connection, and your job is to read it before you debug anything else.</p>

<h3>What the two states mean</h3>
<table class="cmp">
<tr><th>State</th><th>Meaning</th><th>What to do</th></tr>
<tr><td>In sync</td><td>The configuration in the console equals what Prisma Access is running.</td><td>Troubleshoot other layers.</td></tr>
<tr><td>Out of sync</td><td>A change exists in the console that has not reached Prisma Access (or a push failed).</td><td>Find the pending change or failed job, push the right scope, wait.</td></tr>
</table>
<p>On Panorama, the <b>Config Status</b> column in <b>Cloud Services, Status, Status</b> shows In sync or Out of sync per location, and the <b>Monitor, Remote Networks</b> tab shows Config Status per remote network. On SCM, <b>Configuration, Prisma Access, Sync Status</b> has views such as Remote Networks.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Sync state">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Console config</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">what you want</text>
<rect x="450" y="20" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">Prisma Access</text><text x="535" y="66" text-anchor="middle" class="svg-muted" font-size="12">what is running</text>
<line x1="190" y1="50" x2="450" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="230" y="30" width="180" height="40" rx="8" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Push (job)</text>
<rect x="60" y="130" width="230" height="60" rx="8" fill="#bbf7d0"/><text x="175" y="157" text-anchor="middle" class="svg-ink" font-size="13">Equal: In sync</text><text x="175" y="175" text-anchor="middle" class="svg-muted" font-size="12">debug other layers</text>
<rect x="350" y="130" width="230" height="60" rx="8" fill="#fed7aa"/><text x="465" y="157" text-anchor="middle" class="svg-ink" font-size="13">Different: Out of sync</text><text x="465" y="175" text-anchor="middle" class="svg-muted" font-size="12">push the right scope</text>
</svg><p class="cap">The push is the bridge between what you want and what runs.</p></div>

<h3>Why Out of sync happens</h3>
<ol>
<li><b>The change was never pushed</b> (Commit to Panorama only, or saved but no Push Config).</li>
<li><b>The wrong scope was pushed</b>, so a related container is left behind.</li>
<li><b>The push job failed</b>, for example because of a best-practice check, a missing licence capability or no connectivity to the service.</li>
<li><b>A new change was made after the last push</b>; the state is correct, but pending.</li>
</ol>
<p>One documented error from the Panorama plugin is worth knowing: <i>"Error getting list of services: Prisma access edition license capabilities not present Failed plugin validation"</i>. It is associated with licence changes or expired licences. If you see it, treat it as a licence or plugin validation problem, not a policy problem.</p>

<h3>The Service Setup scope</h3>
<p><b>Service Setup</b> holds the foundations of the tenant: the Infrastructure Subnet (lab: 10.255.0.0/24), the Infrastructure BGP AS (lab: 65534), IPv6 support, the Internal Domain List with DNS servers, the Strata Logging Service theater and log forwarding, the Routing Preference, Backbone Routing, and Advanced Settings such as HIP redistribution, IKE peer routes and outbound routes. On Panorama it is under <b>Cloud Services, Configuration, Service Setup</b>. On SCM it appears as Infrastructure Settings (fields include Infrastructure Subnet, Infrastructure BGP AS, IPv6 Support, Egress IP API Key, Pre-prod or Lab Tenant, Preserve Pre-NAT, Fast-Session Delete and Internal DNS).</p>
<p>The rule is simple: <b>if you edited Service Setup or a service connection, include the service setup scope in the push</b>. On Panorama, that is Commit, Commit and Push, Edit Selections, Prisma Access tab, <b>Prisma Access for service setup</b>. The documentation states that a plain Commit to Panorama does not push a service connection change to Prisma Access.</p>
<p>Also remember that the Infrastructure Subnet must not overlap your network. Documented sizing is a /24 for fewer than 50 sites and 2,500 mobile users, and a /23 for fewer than 100 sites and 5,000 users. Avoid 169.254.0.0/16 and 100.64.0.0/10.</p>

<div class="eg"><p><b>Worked example (lab pa-start-3 and pa-ops-1).</b> The engineer changes Backbone Routing for the HQ service connection (peer HQ-FW, tenant endpoint 203.0.113.102). The Status page shows Config Status <b>Out of sync</b> for the service setup. She runs Commit and Push with the service setup scope. A first attempt fails and the job panel shows a failure; she opens the details, sees the licence validation text, and renews the licence entry. The second push succeeds and the page shows In sync.</p></div>
<pre class="out">Sync Status (teaching view)
Remote Networks
Name        Location      Config Status
BR-FW       India West    <span class="hl">In sync</span>
Service connections
HQ-FW       India South   <span class="hl">Out of sync</span></pre>

<h3>A repeatable routine</h3>
<ol>
<li>Read the Config Status for the object that is misbehaving.</li>
<li>If Out of sync, open the job history and decide: pending, wrong scope or failed.</li>
<li>Fix the cause, push the right scope, wait.</li>
<li>Only after In sync, continue with tunnel, BGP, pool or policy checks.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Debugging policy while Config Status is Out of sync; assuming one success means everything is pushed; forgetting the service setup scope after a service connection change; picking an infrastructure subnet that overlaps a branch or the mobile pool.</p></div>
<div class="exam"><p><b>Exam trap.</b> Out of sync points to configuration delivery, not to the tunnel. A service connection or Service Setup change needs the service setup scope. A plain commit to Panorama is not a push.</p></div>

<div class="scn"><h4>Green tunnel, old configuration</h4><p>After a routing preference change the HQ tunnel was up and BGP established, but traffic still took the old path. The Status page showed Out of sync for service setup. The engineer had committed to Panorama and pushed only the mobile users scope. Pushing the service setup scope aligned the tenant.</p><p><b>Lesson:</b> an up tunnel and an out-of-sync configuration can exist at the same time.</p></div>

<div class="iv"><p class="q">"What does Out of sync mean and how do you fix it?"</p><p>The console has a change that Prisma Access is not running. Find whether it is pending, pushed with the wrong scope or failed, fix that, push the correct scope (including service setup for service connection changes) and confirm In sync at Status or Sync Status.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>In sync means console and cloud match; Out of sync means a change has not arrived.</li>
<li>Causes: not pushed, wrong scope, failed job, or a newer pending change.</li>
<li>Service Setup holds infrastructure subnet, BGP AS, DNS, logging and routing settings.</li>
<li>Service connection or service setup changes need the service setup scope in the push.</li>
<li>Read sync state first; debug other layers after it is In sync.</li>
</ul></div>
`,hi:`
<p>Restaurant mein manager ke office mein order book hoti hai aur kitchen mein order board. Dono match karein to cook wahi banata hai jo customer ne manga. Manager naya order likh de lekin kitchen board koi update na kare, to book aur board disagree karte hain, aur customer ko galat dish milti hai. <b>In sync</b> ka matlab book aur board match karte hain. <b>Out of sync</b> ka matlab nahi karte. Prisma Access ye state har location, har remote network aur har service connection ke liye dikhata hai, aur aapka kaam hai kuch aur debug karne se pehle ise padhna.</p>

<h3>Dono states ka matlab</h3>
<table class="cmp">
<tr><th>State</th><th>Matlab</th><th>Kya karein</th></tr>
<tr><td>In sync</td><td>Console ki configuration wahi hai jo Prisma Access chala raha hai.</td><td>Doosri layers troubleshoot karo.</td></tr>
<tr><td>Out of sync</td><td>Console mein ek change hai jo Prisma Access tak nahi pahuncha (ya push fail hua).</td><td>Pending change ya failed job dhundo, sahi scope push karo, wait karo.</td></tr>
</table>
<p>Panorama par <b>Cloud Services, Status, Status</b> ka <b>Config Status</b> column har location ke liye In sync ya Out of sync dikhata hai, aur <b>Monitor, Remote Networks</b> tab har remote network ka Config Status. SCM par <b>Configuration, Prisma Access, Sync Status</b> mein Remote Networks jaise views hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Sync state">
<rect x="20" y="20" width="170" height="60" rx="8" fill="#bae6fd"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">Console config</text><text x="105" y="66" text-anchor="middle" class="svg-muted" font-size="12">jo aap chahte ho</text>
<rect x="450" y="20" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="48" text-anchor="middle" class="svg-ink" font-size="13">Prisma Access</text><text x="535" y="66" text-anchor="middle" class="svg-muted" font-size="12">jo chal raha hai</text>
<line x1="190" y1="50" x2="450" y2="50" stroke="#64748b" stroke-width="2"/>
<rect x="230" y="30" width="180" height="40" rx="8" fill="#fde68a"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Push (job)</text>
<rect x="60" y="130" width="230" height="60" rx="8" fill="#bbf7d0"/><text x="175" y="157" text-anchor="middle" class="svg-ink" font-size="13">Barabar: In sync</text><text x="175" y="175" text-anchor="middle" class="svg-muted" font-size="12">doosri layers debug karo</text>
<rect x="350" y="130" width="230" height="60" rx="8" fill="#fed7aa"/><text x="465" y="157" text-anchor="middle" class="svg-ink" font-size="13">Alag: Out of sync</text><text x="465" y="175" text-anchor="middle" class="svg-muted" font-size="12">sahi scope push karo</text>
</svg><p class="cap">Push wo bridge hai jo "jo chahiye" aur "jo chal raha hai" ko jodta hai.</p></div>

<h3>Out of sync kyun hota hai</h3>
<ol>
<li><b>Change kabhi push nahi hua</b> (sirf Commit to Panorama, ya saved lekin Push Config nahi).</li>
<li><b>Galat scope push hua</b>, isliye related container peeche reh gaya.</li>
<li><b>Push job fail hua</b>, jaise best-practice check, licence capability missing ya service tak connectivity na hone se.</li>
<li><b>Aakhri push ke baad naya change hua</b>; state sahi hai, lekin pending.</li>
</ol>
<p>Panorama plugin ka ek documented error jaanna zaroori hai: <i>"Error getting list of services: Prisma access edition license capabilities not present Failed plugin validation"</i>. Ye licence changes ya expired licences se jura hai. Ye dikhe to ise licence ya plugin validation problem maano, policy problem nahi.</p>

<h3>Service Setup scope</h3>
<p><b>Service Setup</b> tenant ki foundations rakhta hai: Infrastructure Subnet (lab: 10.255.0.0/24), Infrastructure BGP AS (lab: 65534), IPv6 support, DNS servers ke saath Internal Domain List, Strata Logging Service theater aur log forwarding, Routing Preference, Backbone Routing, aur Advanced Settings jaise HIP redistribution, IKE peer routes aur outbound routes. Panorama par ye <b>Cloud Services, Configuration, Service Setup</b> mein hai. SCM par ye Infrastructure Settings ke roop mein dikhta hai (fields: Infrastructure Subnet, Infrastructure BGP AS, IPv6 Support, Egress IP API Key, Pre-prod ya Lab Tenant, Preserve Pre-NAT, Fast-Session Delete aur Internal DNS).</p>
<p>Rule simple hai: <b>Service Setup ya service connection edit kiya ho to push mein service setup scope shamil karo</b>. Panorama par ye hai Commit, Commit and Push, Edit Selections, Prisma Access tab, <b>Prisma Access for service setup</b>. Documentation kehti hai ki plain Commit to Panorama service connection change ko Prisma Access tak push nahi karta.</p>
<p>Ye bhi yaad rakho ki Infrastructure Subnet aapke network se overlap nahi karna chahiye. Documented sizing hai: 50 se kam sites aur 2,500 mobile users ke liye /24, aur 100 se kam sites aur 5,000 users ke liye /23. 169.254.0.0/16 aur 100.64.0.0/10 se bachho.</p>

<div class="eg"><p><b>Worked example (lab pa-start-3 aur pa-ops-1).</b> Engineer HQ service connection (peer HQ-FW, tenant endpoint 203.0.113.102) ka Backbone Routing badalti hai. Status page service setup ke liye Config Status <b>Out of sync</b> dikhata hai. Wo service setup scope ke saath Commit and Push chalati hai. Pehli koshish fail hoti hai aur job panel failure dikhata hai; wo details kholti hai, licence validation text dekhti hai, aur licence entry renew karti hai. Doosra push succeed hota hai aur page In sync dikhata hai.</p></div>
<pre class="out">Sync Status (teaching view)
Remote Networks
Name        Location      Config Status
BR-FW       India West    <span class="hl">In sync</span>
Service connections
HQ-FW       India South   <span class="hl">Out of sync</span></pre>

<h3>Repeatable routine</h3>
<ol>
<li>Jo object misbehave kar raha hai uska Config Status padho.</li>
<li>Out of sync ho to job history kholo aur decide karo: pending, galat scope ya failed.</li>
<li>Cause fix karo, sahi scope push karo, wait karo.</li>
<li>In sync hone ke baad hi tunnel, BGP, pool ya policy checks par jao.</li>
</ol>

<div class="warn"><p><b>Common mistakes.</b> Config Status Out of sync hote hue policy debug karna; ek success ko sab pushed maan lena; service connection change ke baad service setup scope bhool jana; aisa infrastructure subnet chunna jo branch ya mobile pool se overlap kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> Out of sync configuration delivery ki taraf ishara karta hai, tunnel ki taraf nahi. Service connection ya Service Setup change ko service setup scope chahiye. Plain commit to Panorama push nahi hai.</p></div>

<div class="scn"><h4>Green tunnel, purani configuration</h4><p>Routing preference change ke baad HQ tunnel up tha aur BGP established, lekin traffic purane path se ja raha tha. Status page service setup ke liye Out of sync dikha raha tha. Engineer ne Panorama tak commit kiya tha aur sirf mobile users scope push kiya tha. Service setup scope push karne se tenant align hua.</p><p><b>Lesson:</b> up tunnel aur out-of-sync configuration ek saath ho sakte hain.</p></div>

<div class="iv"><p class="q">"Out of sync ka kya matlab hai aur kaise fix karte ho?"</p><p>Console mein ek change hai jo Prisma Access chala nahi raha. Dekho wo pending hai, galat scope se push hua ya fail hua, use fix karo, sahi scope push karo (service connection changes ke liye service setup sahit) aur Status ya Sync Status par In sync confirm karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>In sync matlab console aur cloud match; Out of sync matlab change pahuncha nahi.</li>
<li>Causes: push nahi hua, galat scope, failed job, ya naya pending change.</li>
<li>Service Setup mein infrastructure subnet, BGP AS, DNS, logging aur routing settings hain.</li>
<li>Service connection ya service setup changes ko push mein service setup scope chahiye.</li>
<li>Pehle sync state padho; In sync ke baad doosri layers debug karo.</li>
</ul></div>
`}};export{e as default};