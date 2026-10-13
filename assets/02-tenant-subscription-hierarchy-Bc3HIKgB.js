var e=`<svg viewBox="0 0 640 270" role="img" aria-label="Azure management hierarchy">
<rect x="220" y="8" width="200" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">Tenant (Entra ID)</text>
<rect x="220" y="68" width="200" height="40" rx="8" fill="#bae6fd"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="13">Management groups</text>
<rect x="60" y="130" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="150" y="155" text-anchor="middle" class="svg-ink" font-size="13">Subscription A (prod)</text>
<rect x="400" y="130" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="490" y="155" text-anchor="middle" class="svg-ink" font-size="13">Subscription B (lab)</text>
<rect x="20" y="200" width="130" height="40" rx="8" fill="#fde68a"/><text x="85" y="225" text-anchor="middle" class="svg-ink" font-size="12">rg-web</text>
<rect x="165" y="200" width="130" height="40" rx="8" fill="#fde68a"/><text x="230" y="225" text-anchor="middle" class="svg-ink" font-size="12">rg-data</text>
<rect x="420" y="200" width="140" height="40" rx="8" fill="#fde68a"/><text x="490" y="225" text-anchor="middle" class="svg-ink" font-size="12">rg-nk-lab</text>
<g stroke="#64748b" stroke-width="2"><line x1="320" y1="48" x2="320" y2="68"/><line x1="280" y1="108" x2="150" y2="130"/><line x1="360" y1="108" x2="490" y2="130"/><line x1="120" y1="170" x2="85" y2="200"/><line x1="180" y1="170" x2="230" y2="200"/><line x1="490" y1="170" x2="490" y2="200"/></g>
<text x="330" y="262" text-anchor="middle" class="svg-muted" font-size="12">Policy, RBAC and tags flow downward through the scopes</text>
</svg>`,t={id:`tenant-subscription-hierarchy`,h:{en:`Tenant, management group, subscription and resource group`,hi:`Tenant, management group, subscription aur resource group`},body:{en:`
<h3>Two questions Azure always asks</h3>
<p>Every Azure action answers two questions. <b>Who are you?</b> That is identity, handled by <b>Microsoft Entra ID</b>. <b>Where does the thing live and who pays?</b> That is the hierarchy: management group, subscription, resource group, resource. Beginners mix these up, so let us separate them.</p>

<h3>The tenant: your identity directory</h3>
<p>A <b>tenant</b> is a dedicated instance of Microsoft Entra ID. It holds users, groups and applications. When you sign up with a personal email, Azure creates a default tenant for you. A company usually has one tenant for the whole organisation. A tenant does not hold resources by itself: it holds identities, and subscriptions are trusted by exactly one tenant.</p>

<h3>The subscription: billing and access boundary</h3>
<p>A <b>subscription</b> is the container that is billed. It also sets limits (quotas), for example how many virtual CPUs you may use in a region. You can have many subscriptions in one tenant, such as production, development and a personal lab. Teams often split subscriptions to separate cost, to isolate risk, or to stay under quotas.</p>

<h3>Management groups: above subscriptions</h3>
<p>A <b>management group</b> lets you apply policy and access to many subscriptions at once. They sit between the tenant root and subscriptions and can be nested. A personal learner almost never needs one; an enterprise uses them heavily. For the exam you should know the order from top to bottom: management group, subscription, resource group, resource.</p>

<h3>The resource group: logical folder and unit of cleanup</h3>
<p>A <b>resource group</b> is a logical container for resources that share a life cycle. Rules you must remember:</p>
<ul>
<li>Every resource is in exactly one resource group.</li>
<li>A resource group has a region, but it only stores metadata there; resources inside can be in other regions.</li>
<li>Deleting a resource group deletes everything in it.</li>
<li>Resources can be moved between groups for many types, but not all (verify per resource type before publishing).</li>
<li>Resource groups cannot be nested.</li>
</ul>

<div class="dia">`+e+`<p class="cap">Scopes nest like folders. A setting applied at a higher scope is inherited by everything below it.</p></div>

<h3>Access, policy and tags in one paragraph each</h3>
<p><b>Azure RBAC</b> (role-based access control) says who may do what at a scope, for example Reader, Contributor or Owner on a resource group. Roles are inherited downward. <b>Azure Policy</b> says what is allowed: for example, only these regions, or every resource must have a cost-centre tag. Policy can audit or deny. <b>Tags</b> are name and value pairs such as <code>purpose=lab</code> and <code>owner=asha</code>. They are for finding and costing resources; tags on a resource group are not automatically copied to resources unless you use a policy to do so (verify before publishing).</p>

<h3>Azure Resource Manager (ARM)</h3>
<p>Whether you click in the portal, run <code>az</code> or deploy a Bicep file, the request reaches <b>Azure Resource Manager</b>. ARM checks your identity and RBAC role, applies Policy, then creates the resource through the right resource provider (for networking it is <code>Microsoft.Network</code>). Knowing this explains why the portal, CLI and templates always agree.</p>

<div class="eg"><p><b>Worked example.</b> Company Contoso has one tenant, two subscriptions (<code>sub-prod</code> and <code>sub-lab</code>) under one management group. A policy at the management group says "allowed regions: Central India and South India". Asha gets Contributor on <code>rg-nk-lab</code> only. She can create a VNet in Central India inside that group, but a try in West Europe is denied by policy, and she cannot touch <code>sub-prod</code> at all.</p></div>

<pre class="code"><span class="c"># see where you are</span>
az account show --output table
az account list --output table
<span class="c"># choose the subscription for this session</span>
az account set --subscription "&lt;subscription-name-or-id&gt;"</pre>
<p>Illustrative output (your values will differ):</p>
<pre class="out">EnvironmentName    IsDefault    Name                 State    TenantId
-----------------  -----------  -------------------  -------  ------------------------------------
AzureCloud         <span class="hl">True</span>         Azure subscription 1  Enabled  00000000-0000-0000-0000-000000000000</pre>

<div class="warn"><p><b>Common mistake.</b> Working in the wrong subscription. If you have several, always run <code>az account show</code> before a create or a delete. The portal shows the active directory and subscription filter at the top right.</p></div>

<div class="exam"><p><b>Exam trap.</b> A subscription is not a resource group, and a resource group is not a region. A tenant can have many subscriptions, but a subscription trusts one tenant. Policy says what is allowed; RBAC says who may act.</p></div>

<div class="scn"><h4>The delete that hit the wrong place</h4><p>An engineer with two subscriptions ran a cleanup command for <code>rg-test</code>. The group existed in both, and the CLI was pointed at production. The delete started in production. A resource lock on the production group blocked it, and the engineer noticed the error. After that the team added a habit: run <code>az account show</code> first, and put a delete lock on production groups.</p><p><b>Lesson:</b> the active subscription is part of every command. Locks are a safety net, not a plan.</p></div>

<div class="iv"><p class="q">"Explain tenant versus subscription in Azure."</p><p>A tenant is the Entra ID directory of identities. A subscription is a billing and quota container that trusts one tenant. One tenant can hold many subscriptions. Resources live in resource groups inside subscriptions. Add that RBAC and Policy inherit from management group down to resource.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: management group, subscription, resource group, resource.</li>
<li>Tenant means identities; subscription means billing and quota.</li>
<li>A resource is in exactly one resource group; deleting the group deletes its contents.</li>
<li>RBAC answers who may act; Policy answers what is allowed; tags help find and cost.</li>
<li>All tools go through Azure Resource Manager.</li>
</ul></div>
`,hi:`
<h3>Do sawal jo Azure hamesha poochta hai</h3>
<p>Azure ka har action do sawalon ka jawab deta hai. <b>Aap kaun ho?</b> Yeh identity hai, jo <b>Microsoft Entra ID</b> sambhalta hai. <b>Cheez kahan rehti hai aur paisa kaun deta hai?</b> Yeh hierarchy hai: management group, subscription, resource group, resource. Beginners inhe mix kar dete hain, isliye inhe alag karte hain.</p>

<h3>Tenant: aapki identity directory</h3>
<p><b>Tenant</b> Microsoft Entra ID ka ek dedicated instance hai. Usmein users, groups aur applications hote hain. Jab aap personal email se sign up karte ho to Azure aapke liye ek default tenant bana deta hai. Company mein aam taur par poori organisation ke liye ek tenant hota hai. Tenant khud resources nahi rakhta: woh identities rakhta hai, aur subscriptions theek ek tenant par trust karti hain.</p>

<h3>Subscription: billing aur access boundary</h3>
<p><b>Subscription</b> woh container hai jiska bill banta hai. Yeh limits (quotas) bhi set karti hai, jaise ek region mein kitne virtual CPUs use kar sakte ho. Ek tenant mein kai subscriptions ho sakti hain, jaise production, development aur personal lab. Teams cost alag karne, risk isolate karne ya quota ke andar rehne ke liye subscriptions baantti hain.</p>

<h3>Management groups: subscriptions ke upar</h3>
<p><b>Management group</b> se aap kai subscriptions par ek saath policy aur access laga sakte ho. Yeh tenant root aur subscriptions ke beech hote hain aur nested ho sakte hain. Personal learner ko lagbhag kabhi zaroorat nahi padti; enterprise inhe bahut use karta hai. Exam ke liye upar se neeche ka order yaad rakho: management group, subscription, resource group, resource.</p>

<h3>Resource group: logical folder aur cleanup ki unit</h3>
<p><b>Resource group</b> un resources ka logical container hai jinki life cycle same hai. Yeh rules yaad rakho:</p>
<ul>
<li>Har resource theek ek resource group mein hota hai.</li>
<li>Resource group ka ek region hota hai, lekin wahan sirf metadata store hota hai; andar ke resources doosre regions mein ho sakte hain.</li>
<li>Resource group delete karne se andar ka sab kuch delete ho jata hai.</li>
<li>Kai resource types ko groups ke beech move kar sakte ho, sab ko nahi (verify per resource type before publishing).</li>
<li>Resource groups nested nahi ho sakte.</li>
</ul>

<div class="dia">`+e+`<p class="cap">Scopes folders ki tarah nest hote hain. Upar ke scope par lagayi setting neeche sab ko inherit hoti hai.</p></div>

<h3>Access, policy aur tags: ek-ek paragraph</h3>
<p><b>Azure RBAC</b> (role-based access control) batata hai ki kaun kis scope par kya kar sakta hai, jaise resource group par Reader, Contributor ya Owner. Roles neeche ki taraf inherit hote hain. <b>Azure Policy</b> batata hai ki kya allowed hai: jaise sirf yeh regions, ya har resource par cost-centre tag. Policy audit ya deny kar sakti hai. <b>Tags</b> name aur value ke pair hote hain, jaise <code>purpose=lab</code> aur <code>owner=asha</code>. Yeh resources dhundhne aur cost nikalne ke liye hain; resource group ke tags apne aap resources mein copy nahi hote jab tak aap policy se na karwao (verify before publishing).</p>

<h3>Azure Resource Manager (ARM)</h3>
<p>Aap portal mein click karo, <code>az</code> chalao ya Bicep file deploy karo, request <b>Azure Resource Manager</b> tak hi pahunchti hai. ARM aapki identity aur RBAC role check karta hai, Policy lagata hai, phir sahi resource provider se resource banata hai (networking ke liye woh <code>Microsoft.Network</code> hai). Isse samajh aata hai ki portal, CLI aur templates hamesha ek jaisa result kyun dete hain.</p>

<div class="eg"><p><b>Worked example.</b> Company Contoso ka ek tenant hai, ek management group ke neeche do subscriptions (<code>sub-prod</code> aur <code>sub-lab</code>). Management group par policy hai "allowed regions: Central India aur South India". Asha ko sirf <code>rg-nk-lab</code> par Contributor milta hai. Woh us group ke andar Central India mein VNet bana sakti hai, lekin West Europe mein koshish policy se deny hoti hai, aur woh <code>sub-prod</code> ko chhu bhi nahi sakti.</p></div>

<pre class="code"><span class="c"># dekho aap kahan ho</span>
az account show --output table
az account list --output table
<span class="c"># is session ke liye subscription chuno</span>
az account set --subscription "&lt;subscription-name-or-id&gt;"</pre>
<p>Illustrative output (aapki values alag hongi):</p>
<pre class="out">EnvironmentName    IsDefault    Name                 State    TenantId
-----------------  -----------  -------------------  -------  ------------------------------------
AzureCloud         <span class="hl">True</span>         Azure subscription 1  Enabled  00000000-0000-0000-0000-000000000000</pre>

<div class="warn"><p><b>Common mistake.</b> Galat subscription mein kaam karna. Agar kai subscriptions hain to create ya delete se pehle hamesha <code>az account show</code> chalao. Portal mein upar right par active directory aur subscription filter dikhta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Subscription resource group nahi hai, aur resource group region nahi hai. Ek tenant mein kai subscriptions ho sakti hain, lekin ek subscription ek hi tenant par trust karti hai. Policy batati hai kya allowed hai; RBAC batata hai kaun act kar sakta hai.</p></div>

<div class="scn"><h4>Delete jo galat jagah lag gaya</h4><p>Do subscriptions wale ek engineer ne <code>rg-test</code> ke liye cleanup command chalayi. Woh group dono mein tha, aur CLI production par point kar raha tha. Delete production mein shuru ho gaya. Production group par resource lock tha jisne use roka, aur engineer ne error dekh liya. Uske baad team ne aadat banayi: pehle <code>az account show</code> chalao, aur production groups par delete lock lagao.</p><p><b>Lesson:</b> active subscription har command ka hissa hai. Locks safety net hain, plan nahi.</p></div>

<div class="iv"><p class="q">"Azure mein tenant aur subscription ka farak samjhao."</p><p>Tenant identities ki Entra ID directory hai. Subscription billing aur quota container hai jo ek tenant par trust karta hai. Ek tenant mein kai subscriptions ho sakti hain. Resources subscriptions ke andar resource groups mein rehte hain. Jodo ki RBAC aur Policy management group se resource tak inherit hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: management group, subscription, resource group, resource.</li>
<li>Tenant matlab identities; subscription matlab billing aur quota.</li>
<li>Resource theek ek resource group mein hota hai; group delete karne se contents delete hote hain.</li>
<li>RBAC: kaun act kare; Policy: kya allowed; tags: dhundhna aur cost.</li>
<li>Saare tools Azure Resource Manager se guzarte hain.</li>
</ul></div>
`}};export{t as default};