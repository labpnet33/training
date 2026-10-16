var e=`<svg viewBox="0 0 640 250" role="img" aria-label="From laptop to a virtual network">
<rect x="10" y="95" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="65" y="122" text-anchor="middle" class="svg-ink" font-size="13">Your laptop</text><text x="65" y="140" text-anchor="middle" class="svg-muted" font-size="12">Portal or az CLI</text>
<line x1="120" y1="125" x2="180" y2="125" stroke="#64748b" stroke-width="2"/><text x="150" y="115" text-anchor="middle" class="svg-accent" font-size="12">request</text>
<rect x="180" y="95" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="235" y="122" text-anchor="middle" class="svg-ink" font-size="13">Azure Resource</text><text x="235" y="140" text-anchor="middle" class="svg-ink" font-size="13">Manager (ARM)</text>
<line x1="290" y1="125" x2="320" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="320" y="10" width="312" height="232" rx="10" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="334" y="30" class="svg-accent" font-size="13">Tenant (Microsoft Entra ID)</text>
<rect x="336" y="42" width="284" height="190" rx="8" fill="#e2e8f0"/><text x="348" y="60" class="svg-ink" font-size="13">Subscription (billing boundary)</text>
<rect x="350" y="72" width="256" height="150" rx="8" fill="#fde68a"/><text x="362" y="90" class="svg-ink" font-size="13">Resource group rg-nk-lab (Central India)</text>
<rect x="364" y="102" width="228" height="108" rx="6" fill="#bae6fd"/><text x="376" y="120" class="svg-ink" font-size="12">Virtual network vnet-nk 10.10.0.0/16</text>
<rect x="378" y="132" width="98" height="64" rx="6" fill="#bbf7d0"/><text x="427" y="158" text-anchor="middle" class="svg-ink" font-size="12">snet-web</text><text x="427" y="176" text-anchor="middle" class="svg-muted" font-size="12">10.10.1.0/24</text>
<rect x="484" y="132" width="98" height="64" rx="6" fill="#ddd6fe"/><text x="533" y="158" text-anchor="middle" class="svg-ink" font-size="12">snet-app</text><text x="533" y="176" text-anchor="middle" class="svg-muted" font-size="12">10.10.2.0/24</text>
</svg>`,t={id:`welcome-safe-setup`,h:{en:`Welcome to Azure networking: the big picture and a safe personal account`,hi:`Azure networking mein swagat: big picture aur ek safe personal account`},body:{en:`
<h3>What you will learn</h3>
<p>By the end of this module you can explain how Azure is organised (tenant, management group, subscription, resource group, resource), choose a region such as Central India, drive Azure from the portal, the Azure CLI and Cloud Shell, and run two small guided labs on your own account without a surprise bill. This is the first of three Azure networking modules. The next two cover <b>virtual networks</b> (subnets, system routes, public IPs) and <b>network security groups, ASGs and service tags</b>.</p>
<p><b>Prerequisites:</b> you know what an IP address, a subnet mask and a default gateway are (the IPv4 chapters of the CCNA path are enough). You do not need any cloud experience. If you have done the AWS modules, you will meet many ideas again with new names.</p>
<p><b>Exam alignment:</b> this module supports the networking objectives of AZ-900 (Azure Fundamentals) and the foundations of AZ-700 (Azure Network Engineer). It is a practical foundation course, not an exam-prep course, so always check the current skills outline on the Microsoft Learn exam page.</p>

<h3>The analogy: a company campus with a head office</h3>
<p>Think of Azure as a huge business park run by a utility company. Your <b>tenant</b> is your company's identity office: it knows who your people are. A <b>subscription</b> is a billing account you open with the park. A <b>resource group</b> is one labelled project room: everything for one project sits in it, and when the project ends you clear the whole room at once. A <b>virtual network (VNet)</b> is your private lane system inside the park, with its own numbering, and <b>subnets</b> are the separate lanes. The park runs the electricity, buildings and roads. You run everything inside your lanes.</p>

<div class="dia">`+e+`<p class="cap">Every request goes through Azure Resource Manager. Resources live in a resource group, inside a subscription, inside a tenant.</p></div>

<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Setting up a personal account safely</h3>
<p>Nothing in this module needs an expensive service, but a careless account can still cost money. Follow these rules before you create anything.</p>
<ol>
<li><b>Know the current free rules.</b> Azure has offered new personal accounts a free credit for the first 30 days, a set of popular services free for 12 months, and some services that stay always free within limits. The amounts, durations and service list change, so <b>verify current terms on the Azure free account page</b> before you rely on any of them. Also check what happens when the credit ends: you normally have to choose to upgrade to pay-as-you-go before anything is charged (verify before publishing).</li>
<li><b>Create a budget and a cost alert first.</b> In Cost Management open Budgets, create a monthly budget and give your email. A budget alerts you; it does not stop spending by itself (verify before publishing). Chapter 6 walks through it.</li>
<li><b>Protect your sign-in.</b> A Microsoft account or Entra ID user should use multifactor authentication (MFA). Do not share the login.</li>
<li><b>Choose a region on purpose.</b> From India use <b>Central India</b> (Pune) or <b>South India</b> (Chennai). Check the region name before every create.</li>
<li><b>Use one resource group per lab.</b> The resource group is your unit of cleanup: delete it and everything inside goes with it.</li>
<li><b>Know how to shut down.</b> Delete the resource group, then check Cost Management the next day.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ravi opens a free account and receives a credit (assume an example of USD 200 for 30 days, a labelled assumption only). On day 3 he creates a resource group <code>rg-nk-lab</code>, builds a VNet and a small VM, and spends the equivalent of a few dollars. He sets a budget of 5 dollars first, so at 80 percent he gets an email. He deletes <code>rg-nk-lab</code> that evening. Nothing is left to bill.</p></div>

<table class="cmp"><tr><th>Idea</th><th>AWS</th><th>Azure</th></tr>
<tr><td>Billing and identity unit</td><td>Account</td><td>Subscription inside a tenant</td></tr>
<tr><td>Private network</td><td>VPC</td><td>Virtual network (VNet)</td></tr>
<tr><td>Cleanup unit</td><td>Tags or delete one by one</td><td>Resource group</td></tr>
<tr><td>Geography</td><td>Region and AZ</td><td>Region and availability zone</td></tr>
</table>
<div class="note"><p><b>AWS vs Azure.</b> A subnet in AWS lives in one AZ. A subnet in Azure is regional and can span all zones of the region. You will see this again in chapter 3.</p></div>

<div class="warn"><p><b>Common mistake.</b> Creating resources in a random region and forgetting them. The portal shows resources from all regions in a list, but a forgotten Standard public IP or Bastion host keeps billing. Use the resource group list and Cost Management by service to find them.</p></div>

<div class="exam"><p><b>Exam trap.</b> AZ-900 asks about the shared responsibility model: Microsoft secures the physical datacentre and hosts; you secure addressing, rules, identities and data. A VNet is a regional resource; it does not span regions.</p></div>

<div class="scn"><h4>The forgotten lab</h4><p>A student finished a tutorial, closed the laptop and left a Standard public IP and a small VM running in a resource group she had not named clearly. Two weeks later a budget alert at 80 percent of her small limit arrived. She opened Cost Management, grouped costs by resource group, found the group, deleted it, and the cost line went flat.</p><p><b>Lesson:</b> the alert she set before the lab saved her month, and one resource group made cleanup a single command.</p></div>

<div class="iv"><p class="q">"How do you protect a personal or lab Azure subscription from cost surprises?"</p><p>Strong answer: budget with email alert before any deployment; MFA on the account; one resource group per lab with a clear name and tags; a chosen region; delete the resource group at the end and confirm in Cost Management. Mention that you verify the free account terms because they change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Azure hierarchy: tenant, management groups, subscriptions, resource groups, resources.</li>
<li>A VNet is a regional private network; subnets divide it.</li>
<li>Set a budget and alert first; verify current free account terms.</li>
<li>Use Central India or South India from India and check the region before you create.</li>
<li>One resource group per lab, deleted at the end.</li>
</ul></div>
`,hi:`
<h3>Is module mein aap kya seekhoge</h3>
<p>Module ke end tak aap samjha sakoge ki Azure kaise organised hai (tenant, management group, subscription, resource group, resource), Central India jaisa region kaise chunte hain, portal, Azure CLI aur Cloud Shell se Azure kaise chalate hain, aur apne account par do chhote guided labs bina surprise bill ke kaise karte hain. Yeh Azure networking ke teen modules mein pehla hai. Agle do modules mein <b>virtual networks</b> (subnets, system routes, public IPs) aur <b>network security groups, ASGs aur service tags</b> aate hain.</p>
<p><b>Prerequisites:</b> aapko IP address, subnet mask aur default gateway ka matlab pata hona chahiye (CCNA path ke IPv4 chapters kaafi hain). Cloud ka koi experience nahi chahiye. Agar aapne AWS modules kiye hain to bahut ideas naye naamon ke saath dobara milenge.</p>
<p><b>Exam alignment:</b> yeh module AZ-900 (Azure Fundamentals) ke networking objectives aur AZ-700 (Azure Network Engineer) ki foundations ko support karta hai. Yeh practical foundation course hai, exam-prep course nahi, isliye Microsoft Learn exam page par current skills outline zaroor check karo.</p>

<h3>Analogy: head office wala company campus</h3>
<p>Azure ko ek bade business park ki tarah socho jo ek utility company chalati hai. Aapka <b>tenant</b> aapki company ka identity office hai: use pata hai ki aapke log kaun hain. <b>Subscription</b> ek billing account hai jo aap park ke saath kholte ho. <b>Resource group</b> ek labelled project room hai: ek project ki saari cheezein usi mein rehti hain, aur project khatam hone par poora room ek saath saaf kar dete ho. <b>Virtual network (VNet)</b> park ke andar aapka private lane system hai, apni numbering ke saath, aur <b>subnets</b> alag-alag lanes hain. Park bijli, buildings aur roads chalata hai. Lanes ke andar sab kuch aap chalate ho.</p>

<div class="dia">`+e+`<p class="cap">Har request Azure Resource Manager se guzarti hai. Resources resource group mein rehte hain, resource group subscription mein, aur subscription tenant mein.</p></div>

<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</p></div>

<h3>Personal account ko safely set up karna</h3>
<p>Is module mein koi mehengi service nahi chahiye, lekin laparwah account se bhi paise kat sakte hain. Kuch bhi banane se pehle in rules ko follow karo.</p>
<ol>
<li><b>Current free rules jaano.</b> Azure naye personal accounts ko pehle 30 din ke liye free credit, 12 mahine ke liye kuch popular services free, aur kuch services limits ke andar hamesha free deta raha hai. Amounts, duration aur service list badalti rehti hain, isliye kisi par bharosa karne se pehle <b>Azure free account page par current terms verify karo</b>. Yeh bhi dekho ki credit khatam hone par kya hota hai: aam taur par kuch charge hone se pehle aapko pay-as-you-go par upgrade karna padta hai (verify before publishing).</li>
<li><b>Pehle budget aur cost alert banao.</b> Cost Management mein Budgets kholo, monthly budget banao aur apna email do. Budget aapko alert karta hai; woh khud spending nahi rokta (verify before publishing). Chapter 6 isse step by step dikhata hai.</li>
<li><b>Apna sign-in protect karo.</b> Microsoft account ya Entra ID user par multifactor authentication (MFA) lagao. Login kisi ke saath share mat karo.</li>
<li><b>Region soch-samajh kar chuno.</b> India se <b>Central India</b> (Pune) ya <b>South India</b> (Chennai) use karo. Har create se pehle region ka naam check karo.</li>
<li><b>Har lab ke liye ek resource group.</b> Resource group aapki cleanup ki unit hai: use delete karo aur andar ka sab kuch chala jata hai.</li>
<li><b>Shutdown karna jaano.</b> Resource group delete karo, phir agle din Cost Management check karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ravi free account kholta hai aur use credit milta hai (example ke liye USD 200, 30 din, sirf labelled assumption). Teesre din woh resource group <code>rg-nk-lab</code> banata hai, ek VNet aur chhota VM banata hai, aur kuch dollar ke barabar kharch karta hai. Usne pehle 5 dollar ka budget set kiya tha, isliye 80 percent par use email aata hai. Woh shaam ko <code>rg-nk-lab</code> delete kar deta hai. Billing ke liye kuch nahi bachta.</p></div>

<table class="cmp"><tr><th>Idea</th><th>AWS</th><th>Azure</th></tr>
<tr><td>Billing aur identity unit</td><td>Account</td><td>Tenant ke andar Subscription</td></tr>
<tr><td>Private network</td><td>VPC</td><td>Virtual network (VNet)</td></tr>
<tr><td>Cleanup unit</td><td>Tags ya ek-ek delete</td><td>Resource group</td></tr>
<tr><td>Geography</td><td>Region aur AZ</td><td>Region aur availability zone</td></tr>
</table>
<div class="note"><p><b>AWS vs Azure.</b> AWS mein subnet ek AZ mein rehta hai. Azure mein subnet regional hota hai aur region ke saare zones mein phail sakta hai. Yeh aap chapter 3 mein dobara dekhoge.</p></div>

<div class="warn"><p><b>Common mistake.</b> Kisi bhi random region mein resources bana kar bhool jana. Portal sab regions ke resources ki list dikhata hai, lekin bhoola hua Standard public IP ya Bastion host billing karta rehta hai. Inhe dhundhne ke liye resource group list aur Cost Management ka by-service view use karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> AZ-900 shared responsibility model puchta hai: Microsoft physical datacentre aur hosts secure karta hai; addressing, rules, identities aur data aap secure karte ho. VNet ek regional resource hai; woh regions ke beech nahi phailta.</p></div>

<div class="scn"><h4>Bhoola hua lab</h4><p>Ek student ne tutorial khatam kiya, laptop band kiya aur ek aise resource group mein Standard public IP aur chhota VM chhod diya jiska naam clear nahi tha. Do hafte baad uski chhoti limit ke 80 percent par budget alert aaya. Usne Cost Management kholkar resource group ke hisaab se costs group kiye, group dhundha, delete kiya, aur cost line seedhi ho gayi.</p><p><b>Lesson:</b> lab se pehle set kiya gaya alert ne uska mahina bacha liya, aur ek resource group ne cleanup ko ek command bana diya.</p></div>

<div class="iv"><p class="q">"Personal ya lab Azure subscription ko cost surprises se kaise bachate ho?"</p><p>Strong answer: kisi bhi deployment se pehle email alert wala budget; account par MFA; har lab ke liye clear naam aur tags wala ek resource group; chuna hua region; end mein resource group delete karke Cost Management mein confirm karna. Yeh bhi bolo ki aap free account terms verify karte ho kyunki woh badalte rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Azure hierarchy: tenant, management groups, subscriptions, resource groups, resources.</li>
<li>VNet ek regional private network hai; subnets use baantte hain.</li>
<li>Pehle budget aur alert; current free account terms verify karo.</li>
<li>India se Central India ya South India use karo aur create se pehle region check karo.</li>
<li>Har lab ke liye ek resource group, end mein delete.</li>
</ul></div>
`}};export{t as default};