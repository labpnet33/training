var e={id:`welcome-safe-setup`,h:{en:`Welcome to AWS networking: the big picture and a safe personal account`,hi:`AWS networking mein swagat: big picture aur ek safe personal account`},body:{en:`
<h3>What you will learn</h3>
<p>By the end of this module you can explain what a cloud network is, pick a Region and Availability Zones, plan a VPC address range, drive AWS from the command line, and run three small guided labs on your own account without a surprise bill. This is the first of three AWS networking modules. The next two cover <b>VPC design</b> (public and private subnets, route tables, internet gateway) and <b>security groups and network ACLs</b>.</p>
<p><b>Prerequisites:</b> you know what an IP address, a subnet mask and a default gateway are (the IPv4 chapters of the CCNA path are enough). You do not need any cloud experience.</p>

<h3>The analogy: a gated housing society</h3>
<p>Think of AWS as a very large city. A <b>Region</b> is a city (Mumbai). An <b>Availability Zone</b> is one separate locality inside that city, with its own power and cooling. A <b>VPC</b> is your own gated housing society: you decide the lane numbers (the IP range), which lanes are open to visitors (public subnets), which are private, who stands at the gate (security groups) and what the main road is called (the route table). The city runs the roads, the electricity and the buildings. You run everything inside your gate.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="From your laptop to a VPC">
<rect x="10" y="95" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="70" y="122" text-anchor="middle" class="svg-ink" font-size="13">Your laptop</text><text x="70" y="140" text-anchor="middle" class="svg-muted" font-size="12">Console or CLI</text>
<line x1="130" y1="125" x2="200" y2="125" stroke="#64748b" stroke-width="2"/><text x="165" y="115" text-anchor="middle" class="svg-accent" font-size="12">API call</text>
<rect x="200" y="95" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="250" y="122" text-anchor="middle" class="svg-ink" font-size="13">AWS API</text><text x="250" y="140" text-anchor="middle" class="svg-muted" font-size="12">IAM checks you</text>
<line x1="300" y1="125" x2="345" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="345" y="15" width="285" height="220" rx="10" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="360" y="35" class="svg-accent" font-size="13">Region ap-south-1 (Mumbai)</text>
<rect x="365" y="50" width="245" height="170" rx="8" fill="#bae6fd"/><text x="380" y="70" class="svg-ink" font-size="13">Your VPC 10.0.0.0/16</text>
<rect x="380" y="85" width="105" height="55" rx="6" fill="#bbf7d0"/><text x="432" y="108" text-anchor="middle" class="svg-ink" font-size="12">Subnet AZ-a</text><text x="432" y="125" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.0/24</text>
<rect x="495" y="85" width="105" height="55" rx="6" fill="#fde68a"/><text x="547" y="108" text-anchor="middle" class="svg-ink" font-size="12">Subnet AZ-b</text><text x="547" y="125" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.0/24</text>
<text x="487" y="175" text-anchor="middle" class="svg-muted" font-size="12">instances, load balancers, databases live in subnets</text>
</svg><p class="cap">Everything you create is an API call, and everything lives in one Region, inside a VPC, inside a subnet.</p></div>

<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish.</p></div>

<h3>Setting up a personal account safely</h3>
<p>Nothing in this module needs a paid service, but a careless account can still cost money. Follow these rules before you create a single VPC.</p>
<ol>
<li><b>Know the current free rules.</b> From the AWS Free Tier pages: accounts created after the July 2025 change get a <b>Free plan</b>. You receive <b>USD 100 in credits at sign-up</b> and can earn up to <b>USD 100 more</b> by completing activities (for example trying EC2). The Free plan ends after <b>6 months or when the credits run out, whichever comes first</b>. It is limited to eligible services (VPC and EC2 are on the list) and does not charge you during the free period. When it ends you must <b>upgrade to the Paid plan within 90 days</b>, or AWS closes the account and deletes its content. Credits expire 12 months after you open the account. Older accounts may still be on the previous 12-month Free Tier; check your own Billing console.</li>
<li><b>Create a budget and alert first.</b> In the Billing and Cost Management console open Budgets, create a monthly cost budget (for example USD 5) and give your email. Chapter 6 walks through it.</li>
<li><b>Never use the root user for daily work.</b> The root user is the email you signed up with. Turn on MFA for it (AWS now enforces MFA for root users), store the password safely and then stop using it.</li>
<li><b>Use IAM Identity Center, or an IAM user with MFA.</b> Identity Center gives you short-lived credentials through <code>aws sso login</code>. If you choose an IAM user, enable MFA and avoid long-lived access keys.</li>
<li><b>Choose a Region on purpose.</b> From India use <b>ap-south-1 (Mumbai)</b>: lowest latency, and your data stays in India. Set it as your default and check the Region name at the top right of the console before every create.</li>
<li><b>Know how to shut down.</b> Delete what you created, in dependency order, and check the Billing page the next day. If you finish with AWS, you can close the account from the account settings.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Asha signs up on 1 March. She receives USD 100 and earns USD 40 more by launching an EC2 instance and using other activities, so she holds USD 140. If she burns USD 20 of it in labs, USD 120 remains. The plan still ends on 1 September at the latest, because 6 months is the cap. After 90 more days she must upgrade or lose the account, so she saves her lab notes in her own repository, not only in AWS.</p></div>

<div class="warn"><p><b>Common mistake.</b> Creating resources in the wrong Region and then forgetting them. The console shows only the current Region, so a forgotten NAT gateway in Virginia is invisible while you look at Mumbai. Check the bill by service, not just the resources you can see.</p></div>

<div class="exam"><p><b>Exam trap.</b> Certification questions about the shared responsibility model: AWS secures the cloud (hardware, facilities, hypervisor); you secure what you put in it (addressing, routes, security groups, patching, data). A Region is not an Availability Zone, and a VPC is regional, not global.</p></div>

<div class="scn"><h4>The forgotten lab</h4><p>A student finished a tutorial, closed the laptop and forgot the NAT gateway she had built. Two weeks later a budget alert at 80 percent of her USD 5 limit landed in her inbox. She opened the Billing page, saw NAT Gateway hours and public IPv4 hours, deleted the gateway, released the Elastic IP and the bill stopped growing.</p><p><b>Lesson:</b> the alert you set before the lab is what saved the month. Always delete in reverse order of creation.</p></div>

<div class="iv"><p class="q">"How do you protect a personal or lab AWS account from cost and security surprises?"</p><p>Strong answer: budget with email alert first; MFA on root and root unused; Identity Center or IAM user with least privilege; one chosen Region; tags on everything; and a written cleanup list. Mention that you check the Free plan terms because they changed in 2025.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A VPC is your private network inside one Region; subnets live in one AZ each.</li>
<li>New accounts (after July 2025) get a Free plan: USD 100 credits plus up to USD 100 more, 6 months at most.</li>
<li>Budget and alert first, MFA on root, no daily root use, Identity Center or an IAM user with MFA.</li>
<li>Use ap-south-1 (Mumbai) from India and always check the Region before you create.</li>
<li>Delete resources in dependency order when you finish.</li>
</ul></div>
`,hi:`
<h3>Is module mein aap kya seekhoge</h3>
<p>Module ke end tak aap samjha sakoge ki cloud network kya hai, Region aur Availability Zones kaise chunte hain, VPC ki address range kaise plan karte hain, command line se AWS kaise chalate hain, aur apne account par teen chhote guided labs bina surprise bill ke kaise karte hain. Yeh AWS networking ke teen modules mein pehla hai. Agle do modules mein <b>VPC design</b> (public aur private subnets, route tables, internet gateway) aur <b>security groups aur network ACLs</b> aate hain.</p>
<p><b>Prerequisites:</b> aapko IP address, subnet mask aur default gateway ka matlab pata hona chahiye (CCNA path ke IPv4 chapters kaafi hain). Cloud ka koi experience nahi chahiye.</p>

<h3>Analogy: ek gated housing society</h3>
<p>AWS ko ek bahut bada shehar samjho. <b>Region</b> ek shehar hai (Mumbai). <b>Availability Zone</b> us shehar ke andar ek alag mohalla hai jiski apni bijli aur cooling hai. <b>VPC</b> aapki apni gated society hai: lane numbers (IP range) aap tay karte ho, kaunsi lanes visitors ke liye khuli hain (public subnets), kaunsi private, gate par kaun khada hai (security groups) aur main road ka naam kya hai (route table). Shehar sadkein, bijli aur buildings chalata hai. Gate ke andar sab kuch aap chalate ho.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Laptop se VPC tak">
<rect x="10" y="95" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="70" y="122" text-anchor="middle" class="svg-ink" font-size="13">Aapka laptop</text><text x="70" y="140" text-anchor="middle" class="svg-muted" font-size="12">Console ya CLI</text>
<line x1="130" y1="125" x2="200" y2="125" stroke="#64748b" stroke-width="2"/><text x="165" y="115" text-anchor="middle" class="svg-accent" font-size="12">API call</text>
<rect x="200" y="95" width="100" height="60" rx="8" fill="#ddd6fe"/><text x="250" y="122" text-anchor="middle" class="svg-ink" font-size="13">AWS API</text><text x="250" y="140" text-anchor="middle" class="svg-muted" font-size="12">IAM check karta hai</text>
<line x1="300" y1="125" x2="345" y2="125" stroke="#64748b" stroke-width="2"/>
<rect x="345" y="15" width="285" height="220" rx="10" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/><text x="360" y="35" class="svg-accent" font-size="13">Region ap-south-1 (Mumbai)</text>
<rect x="365" y="50" width="245" height="170" rx="8" fill="#bae6fd"/><text x="380" y="70" class="svg-ink" font-size="13">Aapka VPC 10.0.0.0/16</text>
<rect x="380" y="85" width="105" height="55" rx="6" fill="#bbf7d0"/><text x="432" y="108" text-anchor="middle" class="svg-ink" font-size="12">Subnet AZ-a</text><text x="432" y="125" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.0/24</text>
<rect x="495" y="85" width="105" height="55" rx="6" fill="#fde68a"/><text x="547" y="108" text-anchor="middle" class="svg-ink" font-size="12">Subnet AZ-b</text><text x="547" y="125" text-anchor="middle" class="svg-muted" font-size="12">10.0.2.0/24</text>
<text x="487" y="175" text-anchor="middle" class="svg-muted" font-size="12">instances, load balancers, databases subnets mein rehte hain</text>
</svg><p class="cap">Jo bhi aap banate ho woh ek API call hai, aur sab kuch ek Region mein, ek VPC ke andar, ek subnet mein rehta hai.</p></div>

<div class="note"><p><b>Jhanjhat nahi chahiye? (Prefer no hassle?)</b> Yeh exact steps aap bina AWS account aur bina bill ke aws.nwkings.com ke hands-on labs par practise kar sakte ho. Ya apna account use karo: pehle budget alert lagao aur kaam khatam hone par sab kuch delete kar do.</p></div>

<h3>Personal account ko safely set up karna</h3>
<p>Is module mein koi paid service zaroori nahi hai, par laparwah account phir bhi paisa kha sakta hai. Pehla VPC banane se pehle yeh rules follow karo.</p>
<ol>
<li><b>Current free rules jaano.</b> AWS Free Tier pages ke hisaab se: July 2025 ke badlav ke baad bane accounts ko <b>Free plan</b> milta hai. Sign-up par <b>USD 100 credits</b> milte hain aur activities poori karke (jaise EC2 try karna) <b>USD 100 aur</b> kama sakte ho. Free plan <b>6 mahine ya credits khatam hone par, jo pehle ho</b>, end ho jaata hai. Yeh sirf eligible services tak limited hai (VPC aur EC2 list mein hain) aur free period mein aap se charge nahi leta. End hone par <b>90 din ke andar Paid plan par upgrade</b> karna padta hai, warna AWS account band karke content delete kar deta hai. Credits account kholne ke 12 mahine baad expire hote hain. Purane accounts abhi bhi pehle waale 12-month Free Tier par ho sakte hain; apna Billing console check karo.</li>
<li><b>Pehle budget aur alert banao.</b> Billing and Cost Management console mein Budgets kholo, monthly cost budget banao (jaise USD 5) aur apna email do. Chapter 6 mein step by step hai.</li>
<li><b>Daily kaam ke liye root user kabhi nahi.</b> Root user woh email hai jisse sign up kiya. Uspar MFA lagao (AWS ab root users ke liye MFA enforce karta hai), password safe rakho aur phir use mat karo.</li>
<li><b>IAM Identity Center ya MFA wala IAM user use karo.</b> Identity Center <code>aws sso login</code> se short-lived credentials deta hai. IAM user chuno to MFA enable karo aur long-lived access keys se bacho.</li>
<li><b>Region soch ke chuno.</b> India se <b>ap-south-1 (Mumbai)</b> use karo: sabse kam latency aur data India mein rehta hai. Usse default banao aur har create se pehle console ke top right mein Region ka naam dekho.</li>
<li><b>Shutdown karna seekho.</b> Jo banaya use dependency order mein delete karo aur agle din Billing page dekho. AWS se kaam khatam ho to account settings se account close bhi kar sakte ho.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Asha 1 March ko sign up karti hai. Use USD 100 milte hain aur EC2 instance launch karke aur doosri activities karke USD 40 aur kamati hai, to uske paas USD 140 hain. Labs mein USD 20 kharch ho jaayein to USD 120 bachte hain. Plan phir bhi zyada se zyada 1 September ko end hota hai, kyunki 6 mahine ki limit hai. Uske 90 din baad use upgrade karna padega warna account jayega, isliye woh apne lab notes apni repository mein rakhti hai, sirf AWS mein nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> Galat Region mein resources banake bhool jaana. Console sirf current Region dikhata hai, isliye Virginia ka bhoola hua NAT gateway tab dikhta nahi jab aap Mumbai dekh rahe ho. Bill ko service ke hisaab se dekho, sirf un resources se nahi jo dikh rahe hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Shared responsibility model ke sawaal: AWS cloud ko secure karta hai (hardware, facilities, hypervisor); jo aap usme rakhte ho woh aap secure karte ho (addressing, routes, security groups, patching, data). Region, Availability Zone nahi hai, aur VPC regional hai, global nahi.</p></div>

<div class="scn"><h4>Bhoola hua lab</h4><p>Ek student ne tutorial khatam kiya, laptop band kiya aur apna banaya NAT gateway bhool gayi. Do hafte baad uski USD 5 limit ke 80 percent par budget alert email aaya. Usne Billing page khola, NAT Gateway hours aur public IPv4 hours dekhe, gateway delete kiya, Elastic IP release kiya aur bill badhna ruk gaya.</p><p><b>Lesson:</b> lab se pehle lagaya alert hi mahina bacha gaya. Hamesha banane ke ulte order mein delete karo.</p></div>

<div class="iv"><p class="q">"Personal ya lab AWS account ko cost aur security surprises se kaise bachate ho?"</p><p>Strong answer: pehle email alert wala budget; root par MFA aur root ka use nahi; Identity Center ya least privilege wala IAM user; ek chuna hua Region; sab par tags; aur likhi hui cleanup list. Batao ki aap Free plan ki terms check karte ho kyunki 2025 mein badli thi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>VPC ek Region ke andar aapka private network hai; har subnet ek AZ mein rehta hai.</li>
<li>Naye accounts (July 2025 ke baad) ko Free plan milta hai: USD 100 credits aur USD 100 tak aur, zyada se zyada 6 mahine.</li>
<li>Pehle budget aur alert, root par MFA, root ka daily use nahi, Identity Center ya MFA wala IAM user.</li>
<li>India se ap-south-1 (Mumbai) use karo aur banane se pehle hamesha Region check karo.</li>
<li>Kaam khatam hone par resources dependency order mein delete karo.</li>
</ul></div>
`}};export{e as default};