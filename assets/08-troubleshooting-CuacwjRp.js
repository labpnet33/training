var e=`<svg viewBox="0 0 640 250" role="img" aria-label="Troubleshooting flow">
<rect x="20" y="10" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="37" text-anchor="middle" class="svg-ink" font-size="13">1 Who am I? az account show</text>
<rect x="235" y="10" width="170" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="13">2 Right subscription?</text>
<rect x="450" y="10" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="535" y="37" text-anchor="middle" class="svg-ink" font-size="13">3 Right region?</text>
<rect x="20" y="100" width="170" height="44" rx="8" fill="#fde68a"/><text x="105" y="127" text-anchor="middle" class="svg-ink" font-size="13">4 Permissions (RBAC)?</text>
<rect x="235" y="100" width="170" height="44" rx="8" fill="#fed7aa"/><text x="320" y="127" text-anchor="middle" class="svg-ink" font-size="13">5 Policy or quota?</text>
<rect x="450" y="100" width="170" height="44" rx="8" fill="#e2e8f0"/><text x="535" y="127" text-anchor="middle" class="svg-ink" font-size="13">6 Read the error text</text>
<rect x="150" y="190" width="340" height="44" rx="8" fill="#bbf7d0"/><text x="320" y="217" text-anchor="middle" class="svg-ink" font-size="13">7 Activity log in portal shows the real reason</text>
<g stroke="#64748b" stroke-width="2"><line x1="190" y1="32" x2="235" y2="32"/><line x1="405" y1="32" x2="450" y2="32"/><line x1="535" y1="54" x2="535" y2="100"/><line x1="450" y1="122" x2="405" y2="122"/><line x1="235" y1="122" x2="190" y2="122"/><line x1="320" y1="144" x2="320" y2="190"/></g>
</svg>`,t={id:`troubleshooting`,h:{en:`Troubleshooting workflow: login, subscription, region, permissions, policy and quota`,hi:`Troubleshooting workflow: login, subscription, region, permissions, policy aur quota`},body:{en:`
<h3>A calm order of checks</h3>
<p>When an Azure command fails, beginners change five things at once and learn nothing. Experienced engineers walk a fixed order. Most beginner problems in this module sit in the first six steps.</p>

<div class="dia">`+e+`<p class="cap">Seven checks, in order. Stop at the first one that is wrong.</p></div>

<h3>1. Who am I?</h3>
<pre class="code">az account show --output table</pre>
<p>If you see "Please run az login", you are signed out or your token expired. Run <code>az login</code> again. In Cloud Shell you are already signed in, but the session may have timed out.</p>

<h3>2. Right subscription?</h3>
<p>Empty lists usually mean the wrong subscription is active.</p>
<pre class="code">az account list --output table
az account set --subscription "&lt;subscription-name-or-id&gt;"</pre>
<p>If a subscription is disabled (for example the free credit ended and the account was not upgraded), you may read resources but not create them (verify exact behaviour before publishing).</p>

<h3>3. Right region?</h3>
<p>Resources in the portal and CLI list from all regions, but a create needs a region. Typical errors: "location not available" for your subscription or size, or a resource that must match its VNet region (a NIC and a VM must share the VNet region). List what you can use with <code>az account list-locations</code>. If a VM size is unavailable, try another size or region (error wording varies; verify).</p>

<h3>4. Permissions (RBAC)</h3>
<p>The error says <b>AuthorizationFailed</b> or that the client does not have authorization to perform an action over the scope. You need a role such as Contributor at the resource group or subscription. Ask the owner, or check your roles:</p>
<pre class="code">az role assignment list --assignee "&lt;your-user-or-object-id&gt;" --all --output table</pre>

<h3>5. Policy or quota</h3>
<p>If the message mentions <b>RequestDisallowedByPolicy</b>, an Azure Policy blocked it (for example, region not allowed, tag required). If it mentions quota or "cores", the subscription limit in that region is too low and you can request an increase or choose another region (verify wording). For networking you can also hit limits such as the number of VNets per region; check the Azure limits page.</p>

<h3>6. Read the whole error</h3>
<p>Azure errors are long JSON blobs. Find three things: the <b>code</b> (for example <code>InvalidTemplateDeployment</code>), the <b>target</b> resource, and the <b>message</b> text. Search with the code, not the whole blob. Overlap errors name the overlapping prefix; "SubnetIsFull" style errors mean no free addresses; name conflicts mean the name is used already in that scope.</p>

<h3>7. Activity log</h3>
<p>In the portal, open the resource group, then <b>Activity log</b> (verify wording). It lists who did what, when, and whether it failed with the full detail. For deployments there is also <b>Deployments</b> on the resource group.</p>
<pre class="code">az monitor activity-log list --resource-group rg-nk-lab --offset 1h --query "[].{op:operationName.localizedValue, status:status.value}" --output table</pre>

<h3>Worked tickets from this module's labs</h3>
<ol>
<li><b>"My resource group delete hangs."</b> A lock or a resource still in use. Check <code>az lock list --resource-group rg-nk-lab</code>, remove locks, retry.</li>
<li><b>"Subnet creation fails with overlap."</b> Compare the new range with <code>az network vnet subnet list</code>. Choose a free range.</li>
<li><b>"check-ip-address says .2 is not available."</b> Expected. It is reserved. Use .4 or higher.</li>
<li><b>"My budget never emailed me."</b> The email is wrong, cost data lags, or the threshold has not been reached. Check the recipient list.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Asha runs <code>az network vnet create</code> and gets <i>AuthorizationFailed</i>. She runs <code>az account show</code> and sees she is in the company subscription, not her own lab one. She switches with <code>az account set</code>, retries, and it works. Steps 1 and 2 solved it in a minute.</p></div>

<div class="warn"><p><b>Common mistake.</b> Deleting and recreating things to "fix" an error without reading it. If the cause is policy or quota, the repeat fails the same way and you lose time.</p></div>

<div class="exam"><p><b>Exam trap.</b> Know the difference: RBAC controls who may act, Policy controls what may exist, locks prevent delete or change, and quotas cap how much you can create.</p></div>

<div class="scn"><h4>Denied by a rule nobody remembered</h4><p>A trainee in a company subscription could not create a VNet in West Europe. The error said RequestDisallowedByPolicy. A management-group policy allowed only Indian regions. She recreated it in Central India and it worked. The ticket was closed with a note to read the policy name in the error.</p><p><b>Lesson:</b> the error text names the policy assignment; read it before escalating.</p></div>

<div class="iv"><p class="q">"A teammate cannot create a resource and gets an authorisation error. How do you triage?"</p><p>Confirm identity and subscription, check role assignments at the scope, check whether a policy denies it, then check locks and quotas. Use the activity log for details.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check identity, subscription and region before anything else.</li>
<li>AuthorizationFailed means RBAC; RequestDisallowedByPolicy means Policy.</li>
<li>Read error code, target and message; search by code.</li>
<li>Activity log and Deployments show the true reason.</li>
<li>Locks and quotas explain stuck deletes and failed creates.</li>
</ul></div>
`,hi:`
<h3>Checks ka shaant order</h3>
<p>Jab Azure command fail hoti hai, beginners ek saath paanch cheezein badal dete hain aur kuch seekhte nahi. Experienced engineers ek fixed order follow karte hain. Is module ki zyadatar beginner problems pehle chhe steps mein hoti hain.</p>

<div class="dia">`+e+`<p class="cap">Saat checks, order mein. Jo pehla galat mile wahin ruk jao.</p></div>

<h3>1. Main kaun hoon?</h3>
<pre class="code">az account show --output table</pre>
<p>Agar "Please run az login" dikhe to aap signed out ho ya token expire ho gaya. Dobara <code>az login</code> chalao. Cloud Shell mein aap pehle se signed in ho, lekin session time out ho sakta hai.</p>

<h3>2. Sahi subscription?</h3>
<p>Khali lists ka matlab aam taur par galat subscription active hai.</p>
<pre class="code">az account list --output table
az account set --subscription "&lt;subscription-name-or-id&gt;"</pre>
<p>Agar subscription disabled hai (jaise free credit khatam hua aur account upgrade nahi hua) to aap resources padh sakte ho lekin create nahi kar sakte (exact behaviour publish karne se pehle verify karo).</p>

<h3>3. Sahi region?</h3>
<p>Portal aur CLI mein resources sab regions se list hote hain, lekin create ke liye region chahiye. Typical errors: aapki subscription ya size ke liye "location not available", ya aisa resource jo apne VNet ke region se match kare (NIC aur VM ko VNet ka region share karna padta hai). <code>az account list-locations</code> se dekho kya use kar sakte ho. Agar VM size available nahi hai to doosra size ya region try karo (error wording alag hoti hai; verify).</p>

<h3>4. Permissions (RBAC)</h3>
<p>Error mein <b>AuthorizationFailed</b> ya yeh likha hota hai ki client ke paas scope par action ki authorization nahi hai. Aapko resource group ya subscription par Contributor jaisa role chahiye. Owner se kaho, ya apne roles check karo:</p>
<pre class="code">az role assignment list --assignee "&lt;your-user-or-object-id&gt;" --all --output table</pre>

<h3>5. Policy ya quota</h3>
<p>Agar message mein <b>RequestDisallowedByPolicy</b> hai to Azure Policy ne block kiya (jaise region allowed nahi, tag required). Agar quota ya "cores" ka zikr hai to us region mein subscription limit kam hai aur aap increase request kar sakte ho ya doosra region chun sakte ho (verify wording). Networking mein bhi limits lag sakti hain, jaise ek region mein VNets ki sankhya; Azure limits page check karo.</p>

<h3>6. Poora error padho</h3>
<p>Azure errors lambe JSON blobs hote hain. Teen cheezein dhundho: <b>code</b> (jaise <code>InvalidTemplateDeployment</code>), <b>target</b> resource, aur <b>message</b> text. Poore blob ki jagah code se search karo. Overlap errors overlapping prefix ka naam batate hain; "SubnetIsFull" jaise errors ka matlab free addresses nahi bache; name conflict ka matlab naam us scope mein pehle se use mein hai.</p>

<h3>7. Activity log</h3>
<p>Portal mein resource group kholo, phir <b>Activity log</b> (verify wording). Yeh batata hai kisne kya kab kiya aur fail hua to poori detail ke saath. Deployments ke liye resource group par <b>Deployments</b> bhi hota hai.</p>
<pre class="code">az monitor activity-log list --resource-group rg-nk-lab --offset 1h --query "[].{op:operationName.localizedValue, status:status.value}" --output table</pre>

<h3>Is module ke labs ke worked tickets</h3>
<ol>
<li><b>"Mera resource group delete hang ho gaya."</b> Lock ya koi resource still in use. <code>az lock list --resource-group rg-nk-lab</code> check karo, locks hatao, retry karo.</li>
<li><b>"Subnet creation overlap ke saath fail ho rahi hai."</b> Nayi range ko <code>az network vnet subnet list</code> se compare karo. Free range chuno.</li>
<li><b>"check-ip-address kehta hai .2 available nahi hai."</b> Expected hai. Woh reserved hai. .4 ya usse upar use karo.</li>
<li><b>"Mere budget ne kabhi email nahi bheja."</b> Email galat hai, cost data late hai, ya threshold abhi reach nahi hua. Recipient list check karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Asha <code>az network vnet create</code> chalati hai aur <i>AuthorizationFailed</i> milta hai. Woh <code>az account show</code> chalati hai aur dekhti hai ki woh company subscription mein hai, apni lab wali mein nahi. Woh <code>az account set</code> se switch karti hai, retry karti hai, aur chal jata hai. Steps 1 aur 2 ne ek minute mein solve kar diya.</p></div>

<div class="warn"><p><b>Common mistake.</b> Error padhe bina "fix" ke naam par cheezein delete aur recreate karna. Agar wajah policy ya quota hai to repeat bhi waise hi fail hota hai aur time barbaad hota hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Farak jaano: RBAC batata hai kaun act kar sakta hai, Policy batati hai kya exist kar sakta hai, locks delete ya change rokte hain, aur quotas cap karte hain ki kitna bana sakte ho.</p></div>

<div class="scn"><h4>Aise rule se deny jo kisi ko yaad nahi tha</h4><p>Company subscription mein ek trainee West Europe mein VNet nahi bana pa rahi thi. Error mein RequestDisallowedByPolicy tha. Management-group policy sirf Indian regions allow karti thi. Usne Central India mein dobara banaya aur chal gaya. Ticket is note ke saath close hua ki error mein policy ka naam padho.</p><p><b>Lesson:</b> error text policy assignment ka naam batata hai; escalate karne se pehle padho.</p></div>

<div class="iv"><p class="q">"Ek teammate resource create nahi kar pa raha aur use authorisation error aa raha hai. Triage kaise karoge?"</p><p>Identity aur subscription confirm karo, scope par role assignments check karo, dekho kya policy deny kar rahi hai, phir locks aur quotas check karo. Detail ke liye activity log use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sabse pehle identity, subscription aur region check karo.</li>
<li>AuthorizationFailed matlab RBAC; RequestDisallowedByPolicy matlab Policy.</li>
<li>Error code, target aur message padho; code se search karo.</li>
<li>Activity log aur Deployments asli wajah dikhate hain.</li>
<li>Locks aur quotas atke deletes aur fail creates samjhate hain.</li>
</ul></div>
`}};export{t as default};