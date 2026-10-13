var e={id:`onboarding-order`,h:{en:`The onboarding order: what to build first, and why`,hi:`Onboarding order: pehle kya banayein, aur kyun`},body:{en:`
<p>Prisma Access has dependencies. You cannot attach a branch before the infrastructure exists, and you cannot test an internal application before HQ is connected. Building in the right order saves hours. This chapter gives the order, the reason for each step, and how the lab labs follow it.</p>

<h3>Analogy: opening a new restaurant</h3>
<p>First you get the licence and the building (account and licence). Then water, power and the kitchen (infrastructure). Then the delivery door for suppliers (service connection to HQ). Then you invite customers (mobile users, branches). Last, you write the house rules and check the health reports (policy and verification). Opening the doors before the kitchen works would be a disaster, and so would be onboarding users before the infrastructure is pushed.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Onboarding order">
<rect x="10" y="40" width="96" height="60" rx="6" fill="#e2e8f0"/><text x="58" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Account</text><text x="58" y="84" text-anchor="middle" class="svg-muted" font-size="11">and licence</text>
<rect x="116" y="40" width="96" height="60" rx="6" fill="#ddd6fe"/><text x="164" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Management</text><text x="164" y="84" text-anchor="middle" class="svg-muted" font-size="11">path ready</text>
<rect x="222" y="40" width="96" height="60" rx="6" fill="#bae6fd"/><text x="270" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Service</text><text x="270" y="84" text-anchor="middle" class="svg-muted" font-size="11">infrastructure</text>
<rect x="328" y="40" width="96" height="60" rx="6" fill="#bbf7d0"/><text x="376" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Service</text><text x="376" y="84" text-anchor="middle" class="svg-muted" font-size="11">connection</text>
<rect x="434" y="40" width="96" height="60" rx="6" fill="#fde68a"/><text x="482" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Mobile users</text><text x="482" y="84" text-anchor="middle" class="svg-muted" font-size="11">remote nets</text>
<rect x="540" y="40" width="90" height="60" rx="6" fill="#fed7aa"/><text x="585" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Policy</text><text x="585" y="84" text-anchor="middle" class="svg-muted" font-size="11">and verify</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Each step needs the one before it</text>
</svg><p class="cap">The six-stage order used in the labs and in real projects.</p></div>

<h3>Stage 1: account and licence</h3>
<p>The subscription is activated in the common services hub. For the Panorama path, the flow ends with an OTP for Panorama. For SCM you launch the app from the hub, and optionally restrict administrator access by IP address in settings. In the simulator this stage is concept only.</p>

<h3>Stage 2: management path ready</h3>
<p><b>Panorama path:</b> allow the needed FQDNs through your firewall (api.gpcloudservice.com, api.paloaltonetworks.com, apitrusted.paloaltonetworks.com and the Strata Logging Service FQDNs), register Panorama and activate the licence, install the Cloud Services plugin, create or import templates and device groups, and update the master key in Panorama and in the plugin. <b>SCM path:</b> launch SCM and check that the licence appears.</p>

<h3>Stage 3: service infrastructure</h3>
<p>Enter the infrastructure subnet (10.255.0.0/24) and BGP AS (65534). Then apply. On Panorama this is <code>Cloud Services &gt; Configuration &gt; Service Setup</code>; on SCM it is Infrastructure Settings under Prisma Access. This is pa-start-1.</p>

<h3>Stage 4: a service connection</h3>
<p>Gateways reach the corporate side through service connections, so at least one must exist before GlobalProtect can be set up. The documentation allows placeholder values at first. The real tunnel to HQ-FW is built in the pa-service module.</p>

<h3>Stage 5: mobile users and remote networks</h3>
<p>Configure GlobalProtect (pa-mobile), then onboard branches (pa-remote). Order between these two is flexible; both depend on stages 3 and 4.</p>

<h3>Stage 6: policy and verification</h3>
<p>Set the zone mapping, write security rules, and push (pa-policy, pa-ops). Verify at each stage: status screens, then a real traffic test.</p>
<pre class="out">Onboarding checklist (lab console view)
[x] Licence active
[x] Management path ready
[x] Infrastructure subnet 10.255.0.0/24, AS 65534
[ ] Service connection  <span class="hl">pending</span>
[ ] Mobile users
[ ] Remote networks
[ ] Policy and push
</pre>

<table class="cmp"><tr><th>Stage</th><th>Panorama path</th><th>SCM path</th></tr>
<tr><td>3 Infrastructure</td><td>Cloud Services &gt; Configuration &gt; Service Setup</td><td>Configuration Scope &gt; Prisma Access &gt; Infrastructure Settings</td></tr>
<tr><td>4 Service connection</td><td>Cloud Services &gt; Configuration &gt; Service Connection</td><td>Prisma Access &gt; Service Connections</td></tr>
<tr><td>5 Mobile users</td><td>Mobile Users - GlobalProtect</td><td>Prisma Access &gt; Mobile Users</td></tr>
<tr><td>5 Remote networks</td><td>Remote Networks</td><td>Prisma Access &gt; Remote Networks</td></tr>
<tr><td>Apply</td><td>Commit and Push</td><td>Operations &gt; Push Config</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> An engineer starts with the branch tunnel because "the branch is waiting". The remote network saves, but the tunnel does not come up and routes to HQ do not appear. The reason: service infrastructure was never pushed, and no service connection exists. After completing stages 3 and 4, and pushing, the branch tunnel negotiates and the branch can reach HQ through the hub.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Onboarding users before pushing the infrastructure. (2) Forgetting that SCM needs a full push for new tenants and for mobile and remote user setup. (3) Skipping verification until the end, so you do not know which stage failed.</p></div>
<div class="exam"><p><b>Exam trap.</b> The first GlobalProtect setup needs at least one service connection, even with placeholder values. Questions that ask "what must exist before configuring mobile users" are pointing at this.</p></div>

<div class="scn"><h4>Everything configured, nothing connected</h4><p>A new administrator spent a day entering the portal, locations and pool, but the status page showed nothing deployed. Service Setup had never been completed or pushed. After entering the infrastructure subnet and AS, adding a placeholder service connection, and pushing, the status turned healthy.</p><p><b>Lesson:</b> follow the order, and verify each stage before moving on.</p></div>

<div class="iv"><p class="q">"Walk me through onboarding a new Prisma Access tenant."</p><p>Strong answer: activate the licence, prepare the management path, configure the infrastructure subnet and AS, create a service connection to HQ, then onboard mobile users and remote networks, then policy and push, verifying at each stage. Mention that GlobalProtect needs at least one service connection and that nothing takes effect until pushed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: licence, management path, infrastructure, service connection, users and branches, policy.</li>
<li>Each stage depends on the earlier one; verify as you go.</li>
<li>Panorama path needs FQDN access, plugin and master key work first.</li>
<li>At least one service connection must exist before GlobalProtect setup.</li>
<li>Nothing takes effect until a push has completed.</li>
</ul></div>
`,hi:`
<p>Prisma Access mein dependencies hoti hain. Infrastructure bane bina aap branch attach nahi kar sakte, aur HQ jude bina internal application test nahi kar sakte. Sahi order mein banane se ghante bachte hain. Yeh chapter order, har step ka reason aur labs ise kaise follow karte hain batata hai.</p>

<h3>Analogy: naya restaurant kholna</h3>
<p>Pehle licence aur building (account aur licence). Phir paani, bijli aur kitchen (infrastructure). Phir suppliers ke liye delivery door (HQ tak service connection). Phir customers ko bulaate ho (mobile users, branches). Aakhir mein ghar ke rules likhte ho aur health reports check karte ho (policy aur verification). Kitchen chalne se pehle darwaze kholna disaster hota, aur infrastructure push hone se pehle users onboard karna bhi.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Onboarding order">
<rect x="10" y="40" width="96" height="60" rx="6" fill="#e2e8f0"/><text x="58" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Account</text><text x="58" y="84" text-anchor="middle" class="svg-muted" font-size="11">aur licence</text>
<rect x="116" y="40" width="96" height="60" rx="6" fill="#ddd6fe"/><text x="164" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Management</text><text x="164" y="84" text-anchor="middle" class="svg-muted" font-size="11">path ready</text>
<rect x="222" y="40" width="96" height="60" rx="6" fill="#bae6fd"/><text x="270" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Service</text><text x="270" y="84" text-anchor="middle" class="svg-muted" font-size="11">infrastructure</text>
<rect x="328" y="40" width="96" height="60" rx="6" fill="#bbf7d0"/><text x="376" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Service</text><text x="376" y="84" text-anchor="middle" class="svg-muted" font-size="11">connection</text>
<rect x="434" y="40" width="96" height="60" rx="6" fill="#fde68a"/><text x="482" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Mobile users</text><text x="482" y="84" text-anchor="middle" class="svg-muted" font-size="11">remote nets</text>
<rect x="540" y="40" width="90" height="60" rx="6" fill="#fed7aa"/><text x="585" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Policy</text><text x="585" y="84" text-anchor="middle" class="svg-muted" font-size="11">aur verify</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">Har step ko pichhla step chahiye</text>
</svg><p class="cap">Labs aur real projects mein use hone wala chhe-stage order.</p></div>

<h3>Stage 1: account aur licence</h3>
<p>Subscription common services hub mein activate hoti hai. Panorama path ke liye flow Panorama ke OTP par khatam hota hai. SCM ke liye aap hub se app launch karte ho, aur settings mein optionally administrator access ko IP address se restrict kar sakte ho. Simulator mein yeh stage sirf concept hai.</p>

<h3>Stage 2: management path ready</h3>
<p><b>Panorama path:</b> apne firewall se zaroori FQDNs allow karo (api.gpcloudservice.com, api.paloaltonetworks.com, apitrusted.paloaltonetworks.com aur Strata Logging Service FQDNs), Panorama register karo aur licence activate karo, Cloud Services plugin install karo, templates aur device groups banao ya import karo, aur Panorama aur plugin dono mein master key update karo. <b>SCM path:</b> SCM launch karo aur check karo ki licence dikh raha hai.</p>

<h3>Stage 3: service infrastructure</h3>
<p>Infrastructure subnet (10.255.0.0/24) aur BGP AS (65534) enter karo. Phir apply karo. Panorama par yeh <code>Cloud Services &gt; Configuration &gt; Service Setup</code> hai; SCM par Prisma Access ke neeche Infrastructure Settings. Yeh pa-start-1 hai.</p>

<h3>Stage 4: service connection</h3>
<p>Gateways corporate side tak service connections ke through pahunchte hain, isliye GlobalProtect set up karne se pehle kam se kam ek hona chahiye. Documentation shuru mein placeholder values allow karti hai. HQ-FW tak asli tunnel pa-service module mein banta hai.</p>

<h3>Stage 5: mobile users aur remote networks</h3>
<p>GlobalProtect configure karo (pa-mobile), phir branches onboard karo (pa-remote). In dono ka order flexible hai; dono stages 3 aur 4 par depend karte hain.</p>

<h3>Stage 6: policy aur verification</h3>
<p>Zone mapping set karo, security rules likho, aur push karo (pa-policy, pa-ops). Har stage par verify karo: pehle status screens, phir asli traffic test.</p>
<pre class="out">Onboarding checklist (lab console view)
[x] Licence active
[x] Management path ready
[x] Infrastructure subnet 10.255.0.0/24, AS 65534
[ ] Service connection  <span class="hl">pending</span>
[ ] Mobile users
[ ] Remote networks
[ ] Policy and push
</pre>

<table class="cmp"><tr><th>Stage</th><th>Panorama path</th><th>SCM path</th></tr>
<tr><td>3 Infrastructure</td><td>Cloud Services &gt; Configuration &gt; Service Setup</td><td>Configuration Scope &gt; Prisma Access &gt; Infrastructure Settings</td></tr>
<tr><td>4 Service connection</td><td>Cloud Services &gt; Configuration &gt; Service Connection</td><td>Prisma Access &gt; Service Connections</td></tr>
<tr><td>5 Mobile users</td><td>Mobile Users - GlobalProtect</td><td>Prisma Access &gt; Mobile Users</td></tr>
<tr><td>5 Remote networks</td><td>Remote Networks</td><td>Prisma Access &gt; Remote Networks</td></tr>
<tr><td>Apply</td><td>Commit and Push</td><td>Operations &gt; Push Config</td></tr>
</table>

<div class="eg"><p><b>Worked example.</b> Engineer branch tunnel se shuru karta hai kyunki "branch wait kar rahi hai". Remote network save ho jaata hai, lekin tunnel up nahi aata aur HQ ke routes nahi dikhte. Wajah: service infrastructure kabhi push nahi hui, aur koi service connection nahi hai. Stages 3 aur 4 poore karke push karne ke baad branch tunnel negotiate karta hai aur branch hub ke through HQ tak pahunch jaati hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Infrastructure push karne se pehle users onboard karna. (2) Bhool jaana ki SCM mein naye tenant aur mobile aur remote user setup ke liye full push chahiye. (3) Verification aakhir tak taalna, jisse pata nahi chalta kaunsa stage fail hua.</p></div>
<div class="exam"><p><b>Exam trap.</b> Pehle GlobalProtect setup ke liye kam se kam ek service connection chahiye, placeholder values ke saath bhi. "Mobile users configure karne se pehle kya hona chahiye" jaise sawal isi ki taraf ishara karte hain.</p></div>

<div class="scn"><h4>Sab configure kiya, kuch connect nahi hua</h4><p>Naye administrator ne ek din portal, locations aur pool enter karne mein lagaya, lekin status page par kuch deployed nahi dikha. Service Setup kabhi complete ya push nahi hua tha. Infrastructure subnet aur AS enter karke, placeholder service connection jodkar aur push karke status healthy ho gaya.</p><p><b>Seekh:</b> order follow karo, aur aage badhne se pehle har stage verify karo.</p></div>

<div class="iv"><p class="q">"Naye Prisma Access tenant ko onboard karne ka process samjhao."</p><p>Strong answer: licence activate karo, management path taiyar karo, infrastructure subnet aur AS configure karo, HQ tak service connection banao, phir mobile users aur remote networks, phir policy aur push, har stage par verify karte hue. Bolo ki GlobalProtect ko kam se kam ek service connection chahiye aur push hue bina kuch effect mein nahi aata.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: licence, management path, infrastructure, service connection, users aur branches, policy.</li>
<li>Har stage pichhle par depend karta hai; chalte chalte verify karo.</li>
<li>Panorama path mein pehle FQDN access, plugin aur master key ka kaam.</li>
<li>GlobalProtect setup se pehle kam se kam ek service connection hona zaroori.</li>
<li>Push complete hue bina kuch effect mein nahi aata.</li>
</ul></div>
`}};export{e as default};