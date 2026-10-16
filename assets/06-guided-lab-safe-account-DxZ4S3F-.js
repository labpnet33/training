var e=`<svg viewBox="0 0 640 190" role="img" aria-label="Safe account controls">
<rect x="10" y="20" width="140" height="70" rx="8" fill="#fed7aa"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="13">Sign-in + MFA</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="12">protect identity</text>
<rect x="180" y="20" width="140" height="70" rx="8" fill="#bae6fd"/><text x="250" y="50" text-anchor="middle" class="svg-ink" font-size="13">Budget + alert</text><text x="250" y="70" text-anchor="middle" class="svg-muted" font-size="12">Cost Management</text>
<rect x="350" y="20" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="420" y="50" text-anchor="middle" class="svg-ink" font-size="13">Resource group</text><text x="420" y="70" text-anchor="middle" class="svg-muted" font-size="12">rg-nk-lab + tags</text>
<rect x="520" y="20" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="575" y="50" text-anchor="middle" class="svg-ink" font-size="13">Region</text><text x="575" y="70" text-anchor="middle" class="svg-muted" font-size="12">centralindia</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="55" x2="180" y2="55"/><line x1="320" y1="55" x2="350" y2="55"/><line x1="490" y1="55" x2="520" y2="55"/></g>
<rect x="150" y="125" width="340" height="50" rx="8" fill="#e2e8f0"/><text x="320" y="147" text-anchor="middle" class="svg-ink" font-size="13">az account show  /  az group list</text><text x="320" y="164" text-anchor="middle" class="svg-muted" font-size="12">proves who you are and where you work</text>
<line x1="320" y1="90" x2="320" y2="125" stroke="#64748b" stroke-width="2"/>
</svg>`,t={id:`guided-lab-safe-account`,h:{en:`Guided lab 1 on your own Azure account: budget alert, resource group and a working CLI`,hi:`Guided lab 1 apne Azure account par: budget alert, resource group aur chalta hua CLI`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Goal</h3>
<p>Finish with an account that cannot surprise you: a budget that emails you, a tagged resource group in Central India, and a CLI (or Cloud Shell) that answers <code>az account show</code>. Then delete the group and prove it is gone.</p>

<h3>Prerequisites</h3>
<ul>
<li>An Azure subscription (free account or pay-as-you-go; <b>verify current terms on the Azure free account page</b>), a sign-in with MFA, and a payment method if the sign-up asks for one.</li>
<li>A laptop with the Azure CLI installed, <b>or</b> just a browser if you use Cloud Shell.</li>
<li>About 30 minutes.</li>
</ul>

<h3>Honest cost estimate</h3>
<p>Pricing structure only: a resource group, a tag and a budget are not billed (verify before publishing). The only possible charge is Cloud Shell storage if you use Cloud Shell, which is a small storage account and file share billed by capacity and operations. As an <b>assumed example for planning only</b>, treat it as well under one US dollar a month, and check the Azure pricing calculator for your region. Cost data in Cost Management can lag by hours, so a zero today does not prove a zero tomorrow.</p>

<div class="dia">`+e+`<p class="cap">Four small controls make a lab account safe. Order matters: protect sign-in, create the budget, then build.</p></div>

<h3>Steps</h3>
<p>Portal labels below come from experience and menus move often. Where we are unsure we write (verify wording). Look for the nearest equivalent.</p>

<h4>Step 1. Check your sign-in and MFA</h4>
<ol>
<li>Sign in to the Azure portal. Open your profile menu at the top right and choose to view your account (verify wording).</li>
<li>Make sure MFA is on for your Microsoft or Entra ID sign-in, using an authenticator app or a passkey. Many subscriptions enforce this already.</li>
</ol>
<p>There is no CLI step for this.</p>

<h4>Step 2. Create a monthly budget with an email alert</h4>
<ol>
<li>In the portal search box type <b>Cost Management</b> and open it. Choose <b>Budgets</b> from the left menu (verify wording).</li>
<li>Choose <b>Add</b>. Set the scope to your subscription, a reset period of <b>Monthly</b>, and an amount such as 5 (in your billing currency; assumed example).</li>
<li>On the alerts page add a condition: type <b>Actual</b>, <b>% of budget</b> 80, and your email in the alert recipients. Optionally add a second at 100.</li>
<li>Create the budget.</li>
</ol>
<p>CLI note: <code>az consumption budget</code> exists, but notification settings are limited and the command has changed between versions, so use the portal for this step (verify before publishing). A budget alert emails you; it does not switch resources off.</p>

<h4>Step 3. Sign in with the CLI</h4>
<ol>
<li>Either open <b>Cloud Shell</b> (the terminal icon at the top of the portal) or run <code>az login</code> on your laptop.</li>
<li>Confirm who and where you are.</li>
</ol>
<pre class="code">az login
az account show --output table
az account list --output table</pre>
<p>If you have several subscriptions, set the one you want:</p>
<pre class="code">az account set --subscription "&lt;subscription-name-or-id&gt;"</pre>

<h4>Step 4. Create a tagged resource group</h4>
<p>Portal: <b>Resource groups</b>, then <b>Create</b>, choose the subscription, name <code>rg-nk-lab</code>, region <b>Central India</b>, then add tags <code>purpose=lab</code> and <code>owner=yourname</code>, then <b>Review + create</b> (verify wording).</p>
<pre class="code">az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=yourname</pre>

<h3>Verification</h3>
<pre class="code">az group show --name rg-nk-lab --query "{name:name, state:properties.provisioningState, location:location}" --output table
az group list --output table</pre>
<p>Illustrative output:</p>
<pre class="out">Name       State        Location
---------  -----------  ------------
rg-nk-lab  <span class="hl">Succeeded</span>    centralindia</pre>
<p>In the portal, open Cost Management and confirm the budget exists with your email on it.</p>

<h3>Mandatory cleanup</h3>
<p>Do this now, even if you plan to continue to lab 2: a group costs nothing, but build the habit.</p>
<pre class="code">az group delete --name rg-nk-lab --yes --no-wait
<span class="c"># a few minutes later</span>
az group exists --name rg-nk-lab</pre>
<pre class="out"><span class="hl">false</span></pre>
<p>Keep the budget. It is free and protects every later lab.</p>

<h3>What bills you: trap list</h3>
<ul>
<li><b>Cloud Shell storage account and file share</b> keeps billing small amounts until you delete it (verify before publishing).</li>
<li><b>Anything left running</b> in a group you forgot, especially VMs, Standard public IPs, Bastion and gateways in later labs.</li>
<li><b>Free credit ending.</b> If you upgrade or the subscription converts to pay-as-you-go, usage after the credit is billed. Verify what your account does.</li>
<li><b>Cost data delay.</b> Charges can appear a day later.</li>
<li><b>Budgets do not stop spending.</b> They only notify.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Setting the budget amount in the wrong currency or sending the alert to an email you never read. Test by opening the budget and checking the recipient list.</p></div>

<div class="exam"><p><b>Exam trap.</b> Cost Management features in AZ-900: budgets and alerts notify, the pricing calculator estimates before you deploy, and the TCO calculator compares with on-premises. Tags help allocate costs.</p></div>

<div class="scn"><h4>The alert nobody read</h4><p>A trainee set a budget but entered an old email. A weekend of an oversized VM went unnoticed until the bill arrived. After that the team's lab guide had one step added: open the budget and read the recipient line aloud.</p><p><b>Lesson:</b> an alert is only as good as the inbox behind it.</p></div>

<div class="iv"><p class="q">"Does an Azure budget stop spending when it is reached?"</p><p>No, a budget triggers alerts and can trigger action groups, for example automation that you write yourself. It does not by itself stop or delete resources. Pair it with tags, resource groups and scheduled cleanup.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Budget and email alert first, build second.</li>
<li>Resource group in Central India with purpose and owner tags.</li>
<li>az account show proves who you are and which subscription is active.</li>
<li>Delete the group and confirm with az group exists.</li>
<li>Cloud Shell storage and forgotten resources are the real cost risks.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Goal</h3>
<p>Aise account ke saath khatam karo jo aapko surprise na de sake: email bhejne wala budget, Central India mein tagged resource group, aur CLI (ya Cloud Shell) jo <code>az account show</code> ka jawab de. Phir group delete karo aur prove karo ki woh chala gaya.</p>

<h3>Prerequisites</h3>
<ul>
<li>Ek Azure subscription (free account ya pay-as-you-go; <b>Azure free account page par current terms verify karo</b>), MFA wala sign-in, aur payment method agar sign-up maange.</li>
<li>Azure CLI install wala laptop, <b>ya</b> Cloud Shell use karo to sirf browser.</li>
<li>Lagbhag 30 minute.</li>
</ul>

<h3>Honest cost estimate</h3>
<p>Sirf pricing structure: resource group, tag aur budget par bill nahi lagta (verify before publishing). Ek hi possible charge Cloud Shell storage ka hai agar Cloud Shell use karo, jo chhota storage account aur file share hai aur capacity aur operations ke hisaab se bill hota hai. <b>Sirf planning ke liye assumed example</b> ke taur par ise mahine ke ek US dollar se kaafi kam maano, aur apne region ke liye Azure pricing calculator check karo. Cost Management ka data ghanton late ho sakta hai, isliye aaj ka zero kal ke zero ka saboot nahi.</p>

<div class="dia">`+e+`<p class="cap">Chaar chhote controls lab account ko safe banate hain. Order matter karta hai: sign-in protect karo, budget banao, phir build karo.</p></div>

<h3>Steps</h3>
<p>Neeche ke portal labels experience se hain aur menus aksar hilte rehte hain. Jahan hum sure nahi hain wahan (verify wording) likha hai. Sabse nazdeeki equivalent dhundho.</p>

<h4>Step 1. Sign-in aur MFA check karo</h4>
<ol>
<li>Azure portal mein sign in karo. Upar right ka profile menu kholo aur account dekhne ka option chuno (verify wording).</li>
<li>Check karo ki aapke Microsoft ya Entra ID sign-in par MFA on hai, authenticator app ya passkey ke saath. Kai subscriptions yeh pehle se enforce karti hain.</li>
</ol>
<p>Iska koi CLI step nahi hai.</p>

<h4>Step 2. Email alert ke saath monthly budget banao</h4>
<ol>
<li>Portal search box mein <b>Cost Management</b> type karke kholo. Left menu se <b>Budgets</b> chuno (verify wording).</li>
<li><b>Add</b> chuno. Scope apni subscription, reset period <b>Monthly</b>, aur amount jaise 5 (apni billing currency mein; assumed example) set karo.</li>
<li>Alerts page par condition add karo: type <b>Actual</b>, <b>% of budget</b> 80, aur alert recipients mein apna email. Chaaho to 100 par doosra add karo.</li>
<li>Budget create karo.</li>
</ol>
<p>CLI note: <code>az consumption budget</code> maujood hai, lekin notification settings limited hain aur command versions ke beech badli hai, isliye is step ke liye portal use karo (verify before publishing). Budget alert email bhejta hai; woh resources band nahi karta.</p>

<h4>Step 3. CLI se sign in karo</h4>
<ol>
<li>Ya to <b>Cloud Shell</b> kholo (portal ke upar terminal icon) ya laptop par <code>az login</code> chalao.</li>
<li>Confirm karo ki aap kaun ho aur kahan ho.</li>
</ol>
<pre class="code">az login
az account show --output table
az account list --output table</pre>
<p>Agar kai subscriptions hain to jo chahiye woh set karo:</p>
<pre class="code">az account set --subscription "&lt;subscription-name-or-id&gt;"</pre>

<h4>Step 4. Tagged resource group banao</h4>
<p>Portal: <b>Resource groups</b>, phir <b>Create</b>, subscription chuno, naam <code>rg-nk-lab</code>, region <b>Central India</b>, phir tags <code>purpose=lab</code> aur <code>owner=yourname</code> add karo, phir <b>Review + create</b> (verify wording).</p>
<pre class="code">az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=yourname</pre>

<h3>Verification</h3>
<pre class="code">az group show --name rg-nk-lab --query "{name:name, state:properties.provisioningState, location:location}" --output table
az group list --output table</pre>
<p>Illustrative output:</p>
<pre class="out">Name       State        Location
---------  -----------  ------------
rg-nk-lab  <span class="hl">Succeeded</span>    centralindia</pre>
<p>Portal mein Cost Management kholo aur confirm karo ki budget maujood hai aur usme aapka email hai.</p>

<h3>Mandatory cleanup</h3>
<p>Yeh abhi karo, chahe lab 2 par jaane ka plan ho: group par kuch cost nahi lagta, lekin aadat banao.</p>
<pre class="code">az group delete --name rg-nk-lab --yes --no-wait
<span class="c"># kuch minute baad</span>
az group exists --name rg-nk-lab</pre>
<pre class="out"><span class="hl">false</span></pre>
<p>Budget rakho. Woh free hai aur har agle lab ko protect karta hai.</p>

<h3>Kya bill karta hai: trap list</h3>
<ul>
<li><b>Cloud Shell storage account aur file share</b> jab tak delete na karo chhote amounts bill karte rehte hain (verify before publishing).</li>
<li><b>Jo kuch chalta chhoda gaya</b> bhoole hue group mein, khaas kar VMs, Standard public IPs, Bastion aur gateways agle labs mein.</li>
<li><b>Free credit ka khatam hona.</b> Agar aap upgrade karo ya subscription pay-as-you-go ban jaye to credit ke baad ka usage bill hota hai. Verify karo aapka account kya karta hai.</li>
<li><b>Cost data delay.</b> Charges ek din baad dikh sakte hain.</li>
<li><b>Budgets spending nahi rokte.</b> Woh sirf notify karte hain.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Budget amount galat currency mein dalna ya alert aise email par bhejna jo aap kabhi padhte nahi. Budget kholkar recipient list check karke test karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> AZ-900 mein Cost Management features: budgets aur alerts notify karte hain, pricing calculator deploy se pehle estimate karta hai, aur TCO calculator on-premises se compare karta hai. Tags cost allocate karne mein madad karte hain.</p></div>

<div class="scn"><h4>Alert jo kisi ne nahi padha</h4><p>Ek trainee ne budget set kiya lekin purana email daal diya. Ek weekend ka oversized VM kisi ko dikha hi nahi, bill aane tak. Uske baad team ki lab guide mein ek step jod diya gaya: budget kholo aur recipient line zor se padho.</p><p><b>Lesson:</b> alert utna hi achha hai jitna uske peeche ka inbox.</p></div>

<div class="iv"><p class="q">"Kya Azure budget reach hone par spending rok deta hai?"</p><p>Nahi, budget alerts trigger karta hai aur action groups bhi trigger kar sakta hai, jaise aapki khud likhi automation. Woh khud se resources stop ya delete nahi karta. Ise tags, resource groups aur scheduled cleanup ke saath jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle budget aur email alert, phir build.</li>
<li>Central India mein purpose aur owner tags wala resource group.</li>
<li>az account show prove karta hai ki aap kaun ho aur kaun si subscription active hai.</li>
<li>Group delete karo aur az group exists se confirm karo.</li>
<li>Cloud Shell storage aur bhoole hue resources asli cost risks hain.</li>
</ul></div>
`}};export{t as default};