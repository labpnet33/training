var e={id:`guided-lab-safe-account`,h:{en:`Guided lab 1 on your own AWS account: a safe account, a budget alert and a working CLI`,hi:`Guided lab 1 apne AWS account par: safe account, budget alert aur chalta hua CLI`},body:{en:`
<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish.</p></div>

<h3>Goal</h3>
<p>Finish with an account that cannot surprise you: root user locked with MFA, a monthly budget that emails you, a daily identity that is not root, the Mumbai Region as default, and a CLI (or CloudShell) that answers <code>aws sts get-caller-identity</code>.</p>

<h3>Prerequisites</h3>
<ul>
<li>An AWS account (the Free plan described in chapter 1 is fine), a payment method on file, a phone or authenticator app for MFA.</li>
<li>A laptop with the AWS CLI v2 installed, <b>or</b> just a browser if you use AWS CloudShell.</li>
<li>About 30 minutes.</li>
</ul>

<h3>Estimated cost</h3>
<p><b>USD 0.</b> This lab creates no billable network or compute resources. A cost budget itself is free for your first budgets (confirm on the AWS Budgets pricing page, because the allowance has changed before). On the Free plan you spend credits only when you use services.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Account safety layers">
<rect x="10" y="20" width="140" height="70" rx="8" fill="#fed7aa"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="13">Root user</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="12">MFA, then locked away</text>
<rect x="180" y="20" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="250" y="50" text-anchor="middle" class="svg-ink" font-size="13">Daily identity</text><text x="250" y="70" text-anchor="middle" class="svg-muted" font-size="12">Identity Center + MFA</text>
<rect x="350" y="20" width="140" height="70" rx="8" fill="#bae6fd"/><text x="420" y="50" text-anchor="middle" class="svg-ink" font-size="13">Budget alert</text><text x="420" y="70" text-anchor="middle" class="svg-muted" font-size="12">email at 80 percent</text>
<rect x="520" y="20" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="575" y="50" text-anchor="middle" class="svg-ink" font-size="13">Region</text><text x="575" y="70" text-anchor="middle" class="svg-muted" font-size="12">ap-south-1</text>
<line x1="150" y1="55" x2="180" y2="55" stroke="#64748b" stroke-width="2"/><line x1="320" y1="55" x2="350" y2="55" stroke="#64748b" stroke-width="2"/><line x1="490" y1="55" x2="520" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="180" y="125" width="310" height="55" rx="8" fill="#e2e8f0"/><text x="335" y="150" text-anchor="middle" class="svg-ink" font-size="13">CLI or CloudShell: aws sts get-caller-identity</text><text x="335" y="168" text-anchor="middle" class="svg-muted" font-size="12">proves who you are and where</text>
<line x1="250" y1="90" x2="250" y2="125" stroke="#64748b" stroke-width="2"/><line x1="575" y1="90" x2="490" y2="150" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Four small controls make a lab account safe. The order matters: lock root, create the budget, then use a daily identity.</p></div>

<h3>Steps</h3>
<p>Console wording below is marked <b>(AWS docs)</b> when it matches the current AWS documentation we checked, and <b>(unverified wording)</b> when it is from experience and the menu may have moved. Look for the nearest equivalent label.</p>

<h4>Step 1. Lock the root user with MFA</h4>
<ol>
<li>Sign in with the root email. In the console, open your account name at the top right and choose <b>Security credentials</b> (unverified wording).</li>
<li>Under Multi-factor authentication choose <b>Assign MFA device</b> (unverified wording), pick an authenticator app or a passkey and follow the prompts.</li>
<li>Sign out. From now on use the root user only for the rare tasks that need it.</li>
</ol>
<p>There is no CLI step: the root user is not used from the CLI.</p>

<h4>Step 2. Create a monthly cost budget with an email alert</h4>
<ol>
<li>Open the <b>Billing and Cost Management</b> console, then <b>Budgets</b> in the navigation pane (AWS docs).</li>
<li>Choose <b>Create budget</b>, then the simplified option that uses a budget template, then the <b>Monthly cost budget</b> template (AWS docs; the exact option name may differ slightly).</li>
<li>Enter a budget amount such as 5 (US dollars) and your email address as a recipient, then create the budget.</li>
</ol>
<p>CLI equivalent (check <code>aws budgets create-budget help</code>; your account ID goes in place of the documentation ID):</p>
<pre class="code">aws budgets create-budget --account-id 111122223333 --budget '{"BudgetName":"nk-lab-monthly","BudgetLimit":{"Amount":"5","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"you@example.com"}]}]'</pre>

<h4>Step 3. Create a daily identity (not root)</h4>
<p><b>Preferred: IAM Identity Center.</b></p>
<ol>
<li>Open the <b>IAM Identity Center</b> console and choose to enable it (unverified wording). Pick the home Region on purpose, because it is hard to change later; ap-south-1 is a good choice from India.</li>
<li>Create a user for yourself (<b>Users</b>, then <b>Add user</b>; unverified wording) and finish the invitation email.</li>
<li>Create a <b>permission set</b> for lab work (unverified wording), for example the AWS managed policy PowerUserAccess or, tighter, a custom policy for EC2/VPC only, and <b>assign</b> your user and that permission set to your account.</li>
<li>Require MFA for the user at sign-in (unverified wording: look under the Identity Center settings for authentication).</li>
</ol>
<p><b>Alternative: an IAM user.</b> Create the user in IAM, enable console access, attach a policy, and enable an MFA device for the user. Avoid creating access keys unless you need them.</p>

<h4>Step 4. Pick the Region and connect the CLI</h4>
<ol>
<li>In the console, use the Region selector at the top right and choose <b>Asia Pacific (Mumbai) ap-south-1</b> (the name shown can vary slightly).</li>
<li>On your laptop run the commands below. With CloudShell, open it from the console toolbar and skip the sign-in lines.</li>
</ol>
<pre class="code">aws configure sso
aws sso login --profile nk-lab
export AWS_PROFILE=nk-lab
aws configure set region ap-south-1
aws sts get-caller-identity
aws ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' --output text</pre>

<h3>How to verify</h3>
<pre class="out"><span class="c"># Illustrative output</span>
{
    "UserId": "AROAEXAMPLEID:asha",
    "Account": "111122223333",
    "Arn": "arn:aws:sts::111122223333:assumed-role/AWSReservedSSO_NKLab_0123456789abcdef/asha"
}
<span class="hl">ap-south-1a  ap-south-1b  ap-south-1c</span></pre>
<ul>
<li>The Arn shows a role or IAM user, <b>not</b> <code>root</code>.</li>
<li>The Region list shows three Mumbai zones.</li>
<li><code>aws budgets describe-budgets --account-id 111122223333</code> lists your budget. Check that the email subscription is confirmed if AWS asked you to confirm it.</li>
</ul>

<h3>Cleanup</h3>
<p>This lab creates nothing that bills. Keep the budget, the MFA and the daily identity: they protect every later lab. If you want to remove the budget, delete it from the Budgets page or run <code>aws budgets delete-budget --account-id 111122223333 --budget-name nk-lab-monthly</code>.</p>

<h3>What bills you: the trap list</h3>
<ul>
<li>The <b>Free plan ends</b> after 6 months or when credits are used, and you must upgrade within 90 days or the account is closed. Put the dates in your calendar.</li>
<li><b>Upgrading to the Paid plan</b> removes the "no charges" safety net: after credits, you pay normally.</li>
<li><b>Credits are not unlimited.</b> A NAT gateway or a database can burn USD 100 in weeks.</li>
<li>Some services are not on the Free plan, and the console may warn or refuse them.</li>
<li>Public IPv4 addresses are charged hourly (USD 0.005 per hour per address, about USD 3.60 a month) even when idle.</li>
<li>Resources in a <b>forgotten Region</b> keep billing while you look at Mumbai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Creating the budget with the wrong email or never confirming the subscription, so no alert ever arrives. Test by setting a very low threshold once, then raise it.</p></div>

<div class="exam"><p><b>Exam trap.</b> Security best practice questions: lock away the root user, use MFA, grant least privilege, use roles or temporary credentials instead of long-lived keys. Billing alerts and budgets are cost governance tools; they notify, they do not stop spending automatically.</p></div>

<div class="scn"><h4>The alert that arrived</h4><p>Karan set a USD 5 budget with an 80 percent alert before his first lab. On day nine an email said he had reached USD 4. He checked Cost Explorer by service and found a NAT gateway left running from a tutorial. He deleted it the same hour, kept the loss under USD 5 and added a Project tag to his future labs.</p><p><b>Lesson:</b> a budget does not prevent cost, but it turns an unnoticed month into a one-hour fix.</p></div>

<div class="iv"><p class="q">"You get an AWS account for a new project. What do you do in the first hour?"</p><p>Enable MFA on root and stop using it, set up an admin identity through Identity Center or an IAM user with MFA, create a budget with alerts, pick the Region and set CLI defaults, enable audit logging, and agree a tagging standard. Say "before any workload".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do the safety setup before creating any resource.</li>
<li>Budgets notify; they do not stop spending.</li>
<li>Verify with <code>aws sts get-caller-identity</code>: you must not be root.</li>
<li>Know the Free plan dates: 6 months, credits, 90-day upgrade window.</li>
<li>This lab costs nothing and creates nothing to delete except an optional budget.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Jhanjhat nahi chahiye? (Prefer no hassle?)</b> Yeh exact steps aap bina AWS account aur bina bill ke aws.nwkings.com ke hands-on labs par practise kar sakte ho. Ya apna account use karo: pehle budget alert lagao aur kaam khatam hone par sab kuch delete kar do.</p></div>

<h3>Goal</h3>
<p>End mein aapke paas aisa account ho jo surprise na de: root user MFA se locked, ek monthly budget jo email kare, daily identity jo root nahi hai, Mumbai Region default, aur CLI (ya CloudShell) jo <code>aws sts get-caller-identity</code> ka jawab de.</p>

<h3>Prerequisites</h3>
<ul>
<li>Ek AWS account (chapter 1 wala Free plan chalega), payment method file par, MFA ke liye phone ya authenticator app.</li>
<li>AWS CLI v2 installed laptop, <b>ya</b> AWS CloudShell use karo to sirf browser.</li>
<li>Lagbhag 30 minute.</li>
</ul>

<h3>Estimated cost</h3>
<p><b>USD 0.</b> Is lab mein koi billable network ya compute resource nahi banta. Cost budget khud aapke pehle budgets ke liye free hai (AWS Budgets pricing page par confirm karo, kyunki allowance pehle badal chuka hai). Free plan par credits tabhi kharch hote hain jab aap services use karte ho.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Account safety layers">
<rect x="10" y="20" width="140" height="70" rx="8" fill="#fed7aa"/><text x="80" y="50" text-anchor="middle" class="svg-ink" font-size="13">Root user</text><text x="80" y="70" text-anchor="middle" class="svg-muted" font-size="12">MFA, phir band</text>
<rect x="180" y="20" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="250" y="50" text-anchor="middle" class="svg-ink" font-size="13">Daily identity</text><text x="250" y="70" text-anchor="middle" class="svg-muted" font-size="12">Identity Center + MFA</text>
<rect x="350" y="20" width="140" height="70" rx="8" fill="#bae6fd"/><text x="420" y="50" text-anchor="middle" class="svg-ink" font-size="13">Budget alert</text><text x="420" y="70" text-anchor="middle" class="svg-muted" font-size="12">80 percent par email</text>
<rect x="520" y="20" width="110" height="70" rx="8" fill="#ddd6fe"/><text x="575" y="50" text-anchor="middle" class="svg-ink" font-size="13">Region</text><text x="575" y="70" text-anchor="middle" class="svg-muted" font-size="12">ap-south-1</text>
<line x1="150" y1="55" x2="180" y2="55" stroke="#64748b" stroke-width="2"/><line x1="320" y1="55" x2="350" y2="55" stroke="#64748b" stroke-width="2"/><line x1="490" y1="55" x2="520" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="180" y="125" width="310" height="55" rx="8" fill="#e2e8f0"/><text x="335" y="150" text-anchor="middle" class="svg-ink" font-size="13">CLI ya CloudShell: aws sts get-caller-identity</text><text x="335" y="168" text-anchor="middle" class="svg-muted" font-size="12">sabit karta hai aap kaun ho aur kahan</text>
<line x1="250" y1="90" x2="250" y2="125" stroke="#64748b" stroke-width="2"/><line x1="575" y1="90" x2="490" y2="150" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Chaar chhote controls lab account ko safe banate hain. Order matter karta hai: root lock karo, budget banao, phir daily identity use karo.</p></div>

<h3>Steps</h3>
<p>Neeche console wording <b>(AWS docs)</b> se mark hai jab woh current AWS documentation se match karti hai jo humne check ki, aur <b>(unverified wording)</b> jab woh experience se hai aur menu hil gaya ho sakta hai. Sabse kareebi label dhundho.</p>

<h4>Step 1. Root user ko MFA se lock karo</h4>
<ol>
<li>Root email se sign in karo. Console mein top right par apna account name kholo aur <b>Security credentials</b> chuno (unverified wording).</li>
<li>Multi-factor authentication ke neeche <b>Assign MFA device</b> chuno (unverified wording), authenticator app ya passkey chuno aur prompts follow karo.</li>
<li>Sign out karo. Ab se root user ko sirf un rare kaamon ke liye use karo jinke liye woh zaroori hai.</li>
</ol>
<p>Iska CLI step nahi hai: root user CLI se use nahi hota.</p>

<h4>Step 2. Email alert ke saath monthly cost budget banao</h4>
<ol>
<li><b>Billing and Cost Management</b> console kholo, phir navigation pane mein <b>Budgets</b> (AWS docs).</li>
<li><b>Create budget</b> chuno, phir budget template wala simplified option, phir <b>Monthly cost budget</b> template (AWS docs; option ka exact naam thoda alag ho sakta hai).</li>
<li>Budget amount jaise 5 (US dollars) aur recipient ke roop mein apna email daalo, phir budget create karo.</li>
</ol>
<p>CLI equivalent (<code>aws budgets create-budget help</code> check karo; documentation ID ki jagah apna account ID daalo):</p>
<pre class="code">aws budgets create-budget --account-id 111122223333 --budget '{"BudgetName":"nk-lab-monthly","BudgetLimit":{"Amount":"5","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"you@example.com"}]}]'</pre>

<h4>Step 3. Daily identity banao (root nahi)</h4>
<p><b>Preferred: IAM Identity Center.</b></p>
<ol>
<li><b>IAM Identity Center</b> console kholo aur use enable karo (unverified wording). Home Region soch ke chuno, kyunki baad mein badalna mushkil hai; India se ap-south-1 achha choice hai.</li>
<li>Apne liye user banao (<b>Users</b>, phir <b>Add user</b>; unverified wording) aur invitation email poora karo.</li>
<li>Lab kaam ke liye ek <b>permission set</b> banao (unverified wording), jaise AWS managed policy PowerUserAccess ya, zyada tight, sirf EC2/VPC ke liye custom policy, aur apne user aur us permission set ko account par <b>assign</b> karo.</li>
<li>Sign-in par user ke liye MFA require karo (unverified wording: Identity Center settings mein authentication ke neeche dekho).</li>
</ol>
<p><b>Alternative: IAM user.</b> IAM mein user banao, console access enable karo, policy attach karo, aur user ke liye MFA device enable karo. Access keys tab tak mat banao jab tak zaroorat na ho.</p>

<h4>Step 4. Region chuno aur CLI jodo</h4>
<ol>
<li>Console mein top right ke Region selector se <b>Asia Pacific (Mumbai) ap-south-1</b> chuno (dikhne wala naam thoda alag ho sakta hai).</li>
<li>Laptop par neeche ke commands chalao. CloudShell mein console toolbar se use kholo aur sign-in wali lines chhod do.</li>
</ol>
<pre class="code">aws configure sso
aws sso login --profile nk-lab
export AWS_PROFILE=nk-lab
aws configure set region ap-south-1
aws sts get-caller-identity
aws ec2 describe-availability-zones --query 'AvailabilityZones[].ZoneName' --output text</pre>

<h3>Verify kaise karein</h3>
<pre class="out"><span class="c"># Illustrative output</span>
{
    "UserId": "AROAEXAMPLEID:asha",
    "Account": "111122223333",
    "Arn": "arn:aws:sts::111122223333:assumed-role/AWSReservedSSO_NKLab_0123456789abcdef/asha"
}
<span class="hl">ap-south-1a  ap-south-1b  ap-south-1c</span></pre>
<ul>
<li>Arn mein role ya IAM user dikhe, <code>root</code> <b>nahi</b>.</li>
<li>Region list mein Mumbai ke teen zones dikhen.</li>
<li><code>aws budgets describe-budgets --account-id 111122223333</code> aapka budget list karta hai. Agar AWS ne confirm karne ko kaha ho to email subscription confirm hai ya nahi check karo.</li>
</ul>

<h3>Cleanup</h3>
<p>Is lab mein koi billing wali cheez nahi banti. Budget, MFA aur daily identity rakho: yeh aage ke har lab ko protect karte hain. Budget hatana ho to Budgets page se delete karo ya <code>aws budgets delete-budget --account-id 111122223333 --budget-name nk-lab-monthly</code> chalao.</p>

<h3>Kya bill banata hai: trap list</h3>
<ul>
<li><b>Free plan khatam</b> hota hai 6 mahine baad ya credits use hone par, aur 90 din ke andar upgrade karna padta hai warna account close. Dates calendar mein daalo.</li>
<li><b>Paid plan par upgrade</b> "no charges" ka safety net hata deta hai: credits ke baad normal payment.</li>
<li><b>Credits unlimited nahi hain.</b> NAT gateway ya database hafton mein USD 100 jala sakta hai.</li>
<li>Kuch services Free plan par nahi hain, aur console warn ya refuse kar sakta hai.</li>
<li>Public IPv4 addresses ka ghante ke hisaab se charge lagta hai (USD 0.005 per ghanta per address, lagbhag USD 3.60 mahina) idle hone par bhi.</li>
<li><b>Bhoole hue Region</b> ke resources tab bhi bill karte rehte hain jab aap Mumbai dekh rahe ho.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Budget galat email se banana ya subscription confirm hi na karna, to alert kabhi aata hi nahi. Ek baar bahut low threshold rakh kar test karo, phir badhao.</p></div>

<div class="exam"><p><b>Exam trap.</b> Security best practice ke sawaal: root user ko lock karo, MFA lagao, least privilege do, long-lived keys ki jagah roles ya temporary credentials use karo. Billing alerts aur budgets cost governance tools hain; woh notify karte hain, kharch apne aap nahi rokte.</p></div>

<div class="scn"><h4>Jo alert aaya</h4><p>Karan ne pehle lab se pehle USD 5 ka budget 80 percent alert ke saath lagaya. Nauven din email aaya ki woh USD 4 tak pahunch gaya. Usne Cost Explorer mein service ke hisaab se dekha aur ek tutorial se bachha NAT gateway chalta mila. Usne usi ghante delete kiya, nuksan USD 5 se kam rakha aur aage ke labs mein Project tag lagana shuru kiya.</p><p><b>Lesson:</b> budget cost rokta nahi, par anjaan mahine ko ek ghante ke fix mein badal deta hai.</p></div>

<div class="iv"><p class="q">"Naye project ke liye AWS account mila hai. Pehle ghante mein kya karoge?"</p><p>Root par MFA lagao aur use chhod do, Identity Center ya MFA wale IAM user se admin identity banao, alerts ke saath budget banao, Region chuno aur CLI defaults set karo, audit logging enable karo, aur tagging standard tay karo. Kehna "kisi bhi workload se pehle".</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Koi resource banane se pehle safety setup karo.</li>
<li>Budgets notify karte hain; spending rokte nahi.</li>
<li><code>aws sts get-caller-identity</code> se verify karo: aap root nahi hone chahiye.</li>
<li>Free plan ki dates jaano: 6 mahine, credits, 90 din ka upgrade window.</li>
<li>Is lab ka kharch zero hai aur delete karne ko sirf optional budget banta hai.</li>
</ul></div>
`}};export{e as default};