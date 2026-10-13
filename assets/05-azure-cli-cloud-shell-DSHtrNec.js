var e=`<svg viewBox="0 0 640 200" role="img" aria-label="Three ways to reach Azure">
<rect x="10" y="20" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="75" y="50" text-anchor="middle" class="svg-ink" font-size="13">Azure portal</text>
<rect x="10" y="80" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="75" y="110" text-anchor="middle" class="svg-ink" font-size="13">az CLI (laptop)</text>
<rect x="10" y="140" width="130" height="50" rx="8" fill="#e2e8f0"/><text x="75" y="170" text-anchor="middle" class="svg-ink" font-size="13">Cloud Shell</text>
<rect x="260" y="60" width="140" height="80" rx="8" fill="#ddd6fe"/><text x="330" y="95" text-anchor="middle" class="svg-ink" font-size="13">Azure Resource</text><text x="330" y="113" text-anchor="middle" class="svg-ink" font-size="13">Manager</text>
<rect x="500" y="60" width="130" height="80" rx="8" fill="#bae6fd"/><text x="565" y="95" text-anchor="middle" class="svg-ink" font-size="13">VNet, NSG,</text><text x="565" y="113" text-anchor="middle" class="svg-ink" font-size="13">VM, IP ...</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="45" x2="260" y2="90"/><line x1="140" y1="105" x2="260" y2="100"/><line x1="140" y1="165" x2="260" y2="115"/><line x1="400" y1="100" x2="500" y2="100"/></g>
<text x="450" y="90" text-anchor="middle" class="svg-accent" font-size="12">creates</text>
</svg>`,t={id:`azure-cli-cloud-shell`,h:{en:`The Azure CLI and Cloud Shell: login, defaults, output and queries`,hi:`Azure CLI aur Cloud Shell: login, defaults, output aur queries`},body:{en:`
<h3>Why learn the command line when the portal exists?</h3>
<p>The portal is friendly for exploring. The command line is better for repeating, sharing and checking. A command can be pasted into a ticket, a runbook or a lab guide, and it always does the same thing. Every guided lab in this course shows the portal steps first and the <code>az</code> command beside them. Learn both.</p>

<h3>Three ways in, one engine</h3>
<p>The portal, the CLI and Cloud Shell all call <b>Azure Resource Manager</b>. If a command works, the same resource appears in the portal immediately.</p>

<div class="dia">`+e+`<p class="cap">Different front doors, same Azure Resource Manager behind them.</p></div>

<h3>Azure CLI on your laptop</h3>
<p>The Azure CLI command is <code>az</code>. It runs on Windows, macOS and Linux. Install it from the official instructions (verify the current install method for your operating system), then check it:</p>
<pre class="code">az version
az login</pre>
<p><code>az login</code> opens a browser to sign in. On a machine with no browser use <code>az login --use-device-code</code>. After login the CLI lists the subscriptions you can use.</p>
<pre class="out">[
  {
    "cloudName": "AzureCloud",
    "id": "00000000-0000-0000-0000-000000000000",
    "isDefault": <span class="hl">true</span>,
    "name": "Azure subscription 1",
    "state": "Enabled"
  }
]</pre>
<p class="cap">Illustrative output. Your IDs will differ.</p>

<h3>Azure Cloud Shell: nothing to install</h3>
<p><b>Cloud Shell</b> is a browser-based shell inside the portal with <code>az</code> already installed and you already signed in. It offers Bash and PowerShell. The first time you open it, it asks you to create or mount a storage account and file share so that your files persist. That storage is a billable resource (small, but real), so treat it as part of your cost list (verify current behaviour before publishing, because Microsoft has been changing the storage options). Cloud Shell sessions time out when idle.</p>

<h3>Set defaults so you type less and make fewer mistakes</h3>
<pre class="code">az account set --subscription "&lt;subscription-name-or-id&gt;"
az config set defaults.location=centralindia
az config set defaults.group=rg-nk-lab</pre>
<p>With defaults set you can omit <code>--location</code> and <code>--resource-group</code>. Be careful: a default group can also make you delete or change the wrong thing without noticing. In this course commands show the group explicitly, so you can read each line on its own.</p>

<h3>Command shape</h3>
<p>Commands read like a sentence: <code>az &lt;group&gt; &lt;subgroup&gt; &lt;verb&gt; --parameter value</code>. For example <code>az network vnet create</code>. Use <code>-h</code> for help at any level, for example <code>az network vnet -h</code> or <code>az network vnet create -h</code>. Common verbs: <code>create</code>, <code>show</code>, <code>list</code>, <code>update</code>, <code>delete</code>.</p>

<h3>Output and --query</h3>
<p>Output formats: <code>json</code> (default), <code>table</code>, <code>tsv</code>, <code>yaml</code>. The <code>--query</code> option takes a JMESPath expression and filters before display.</p>
<pre class="code">az group list --output table
az network vnet list --query "[].{name:name, space:addressSpace.addressPrefixes[0], rg:resourceGroup}" --output table
az group exists --name rg-nk-lab</pre>
<pre class="out">Name       Space          Rg
---------  -------------  ---------
<span class="hl">vnet-nk</span>    10.10.0.0/16   rg-nk-lab</pre>
<p class="cap">Illustrative output.</p>

<h3>Templates in one paragraph</h3>
<p>For repeatable builds Azure uses <b>ARM templates</b> (JSON) and <b>Bicep</b>, a friendlier language that compiles to ARM. You run <code>az deployment group create</code> with a template file. We use plain <code>az</code> commands in this course because they are easier to read line by line, but real teams keep infrastructure in Bicep or Terraform.</p>

<div class="eg"><p><b>Worked example.</b> Asha opens Cloud Shell, runs <code>az account show</code> to confirm the subscription, then runs <code>az group create --name rg-nk-lab --location centralindia</code>. In the portal she refreshes Resource groups and sees <code>rg-nk-lab</code>. Same result, two views.</p></div>

<div class="warn"><p><b>Common mistake.</b> Pasting a command from a blog without reading it. Check the subscription, the resource group name and the region, and check whether the command contains <code>delete</code> or <code>--yes</code>. Another trap is copying commands from a page that turned the straight quotes into curly ones; they fail with odd errors.</p></div>

<div class="exam"><p><b>Exam trap.</b> AZ-900 expects you to know the portal, Cloud Shell, Azure CLI, Azure PowerShell and ARM templates or Bicep as ways to manage Azure, and that they all use Azure Resource Manager.</p></div>

<div class="scn"><h4>Nobody was logged in</h4><p>A trainee ran <code>az network vnet list</code> and got an error asking her to run <code>az login</code>. After login the list was empty, because the CLI had selected an old subscription from her previous employer's guest access. She listed subscriptions with <code>az account list</code>, set the right one, and the VNets appeared.</p><p><b>Lesson:</b> empty output usually means wrong subscription, not missing resources.</p></div>

<div class="iv"><p class="q">"What is Cloud Shell, and what are its cost and security considerations?"</p><p>A browser-based authenticated shell with az preinstalled. It uses a storage account and file share to persist files, which has a small cost, and it runs with your own permissions, so least privilege and MFA still matter.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Portal, CLI and Cloud Shell all call Azure Resource Manager.</li>
<li>az login, az account show and az account set come first in every session.</li>
<li>Cloud Shell needs no install but uses a small billable storage resource.</li>
<li>Use --output table and --query to read results fast.</li>
<li>Real teams use Bicep or ARM templates for repeatable builds.</li>
</ul></div>
`,hi:`
<h3>Portal hone ke baad command line kyun seekhein?</h3>
<p>Portal explore karne ke liye friendly hai. Command line repeat karne, share karne aur check karne ke liye behtar hai. Command ko ticket, runbook ya lab guide mein paste kar sakte ho, aur woh hamesha same kaam karti hai. Is course ke har guided lab mein pehle portal steps aur unke saath <code>az</code> command dikhayi gayi hai. Dono seekho.</p>

<h3>Teen darwaze, ek engine</h3>
<p>Portal, CLI aur Cloud Shell teeno <b>Azure Resource Manager</b> ko call karte hain. Agar command chalti hai to wahi resource portal mein turant dikhta hai.</p>

<div class="dia">`+e+`<p class="cap">Alag-alag front doors, peeche wahi Azure Resource Manager.</p></div>

<h3>Laptop par Azure CLI</h3>
<p>Azure CLI ki command <code>az</code> hai. Yeh Windows, macOS aur Linux par chalti hai. Official instructions se install karo (apne operating system ke liye current install method verify karo), phir check karo:</p>
<pre class="code">az version
az login</pre>
<p><code>az login</code> sign in ke liye browser kholta hai. Jis machine par browser nahi hai wahan <code>az login --use-device-code</code> use karo. Login ke baad CLI un subscriptions ki list dikhata hai jo aap use kar sakte ho.</p>
<pre class="out">[
  {
    "cloudName": "AzureCloud",
    "id": "00000000-0000-0000-0000-000000000000",
    "isDefault": <span class="hl">true</span>,
    "name": "Azure subscription 1",
    "state": "Enabled"
  }
]</pre>
<p class="cap">Illustrative output. Aapke IDs alag honge.</p>

<h3>Azure Cloud Shell: kuch install nahi karna</h3>
<p><b>Cloud Shell</b> portal ke andar browser-based shell hai jismein <code>az</code> pehle se install hai aur aap pehle se signed in ho. Yeh Bash aur PowerShell deta hai. Pehli baar kholne par woh storage account aur file share create ya mount karne ko kehta hai taki aapki files bachi rahein. Woh storage billable resource hai (chhota, lekin asli), isliye use apni cost list ka hissa maano (current behaviour publish karne se pehle verify karo, kyunki Microsoft storage options badalta rehta hai). Idle hone par Cloud Shell sessions time out ho jaate hain.</p>

<h3>Defaults set karo taki kam type karo aur kam galtiyan ho</h3>
<pre class="code">az account set --subscription "&lt;subscription-name-or-id&gt;"
az config set defaults.location=centralindia
az config set defaults.group=rg-nk-lab</pre>
<p>Defaults set hone par <code>--location</code> aur <code>--resource-group</code> chhod sakte ho. Savdhan: default group ki wajah se galat cheez delete ya change bhi ho sakti hai bina pata chale. Is course mein commands group ko explicitly dikhati hain, taki har line akeli padhi ja sake.</p>

<h3>Command ka shape</h3>
<p>Commands sentence ki tarah padhi jaati hain: <code>az &lt;group&gt; &lt;subgroup&gt; &lt;verb&gt; --parameter value</code>. Jaise <code>az network vnet create</code>. Kisi bhi level par help ke liye <code>-h</code> use karo, jaise <code>az network vnet -h</code> ya <code>az network vnet create -h</code>. Common verbs: <code>create</code>, <code>show</code>, <code>list</code>, <code>update</code>, <code>delete</code>.</p>

<h3>Output aur --query</h3>
<p>Output formats: <code>json</code> (default), <code>table</code>, <code>tsv</code>, <code>yaml</code>. <code>--query</code> option JMESPath expression leta hai aur display se pehle filter karta hai.</p>
<pre class="code">az group list --output table
az network vnet list --query "[].{name:name, space:addressSpace.addressPrefixes[0], rg:resourceGroup}" --output table
az group exists --name rg-nk-lab</pre>
<pre class="out">Name       Space          Rg
---------  -------------  ---------
<span class="hl">vnet-nk</span>    10.10.0.0/16   rg-nk-lab</pre>
<p class="cap">Illustrative output.</p>

<h3>Templates ek paragraph mein</h3>
<p>Repeatable builds ke liye Azure <b>ARM templates</b> (JSON) aur <b>Bicep</b> use karta hai, jo ek friendly language hai aur ARM mein compile hoti hai. Aap template file ke saath <code>az deployment group create</code> chalate ho. Is course mein hum plain <code>az</code> commands use karte hain kyunki unhe line by line padhna aasaan hai, lekin real teams infrastructure Bicep ya Terraform mein rakhti hain.</p>

<div class="eg"><p><b>Worked example.</b> Asha Cloud Shell kholti hai, subscription confirm karne ke liye <code>az account show</code> chalati hai, phir <code>az group create --name rg-nk-lab --location centralindia</code> chalati hai. Portal mein Resource groups refresh karke use <code>rg-nk-lab</code> dikhta hai. Result ek, views do.</p></div>

<div class="warn"><p><b>Common mistake.</b> Blog se command bina padhe paste kar dena. Subscription, resource group ka naam aur region check karo, aur dekho ki command mein <code>delete</code> ya <code>--yes</code> to nahi. Ek aur trap: aisi page se commands copy karna jisne straight quotes ko curly bana diya; woh ajeeb errors ke saath fail hoti hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> AZ-900 mein expect kiya jata hai ki aap Azure manage karne ke tareeke jaano: portal, Cloud Shell, Azure CLI, Azure PowerShell aur ARM templates ya Bicep, aur yeh sab Azure Resource Manager use karte hain.</p></div>

<div class="scn"><h4>Koi logged in nahi tha</h4><p>Ek trainee ne <code>az network vnet list</code> chalayi aur use <code>az login</code> chalane ka error mila. Login ke baad list khali thi, kyunki CLI ne uske pichle employer ke guest access ki purani subscription chuni thi. Usne <code>az account list</code> se subscriptions dekhi, sahi wali set ki, aur VNets dikhne lage.</p><p><b>Lesson:</b> khali output ka matlab aam taur par galat subscription hota hai, resources ka gaayab hona nahi.</p></div>

<div class="iv"><p class="q">"Cloud Shell kya hai, aur uske cost aur security considerations kya hain?"</p><p>Browser-based authenticated shell jismein az preinstalled hota hai. Files persist karne ke liye woh storage account aur file share use karta hai jiska chhota cost hota hai, aur woh aapki apni permissions se chalta hai, isliye least privilege aur MFA ab bhi zaroori hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Portal, CLI aur Cloud Shell sab Azure Resource Manager ko call karte hain.</li>
<li>Har session mein pehle az login, az account show aur az account set.</li>
<li>Cloud Shell mein install nahi karna padta lekin chhota billable storage resource use hota hai.</li>
<li>Results jaldi padhne ke liye --output table aur --query use karo.</li>
<li>Real teams repeatable builds ke liye Bicep ya ARM templates use karti hain.</li>
</ul></div>
`}};export{t as default};