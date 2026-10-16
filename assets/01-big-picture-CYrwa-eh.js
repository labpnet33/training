var e={id:`big-picture`,h:{en:`The big picture: what makes a VPC design public or private`,hi:`Big picture: VPC design ko public ya private kya banata hai`},body:{en:`
<h3>What you will learn</h3>
<p>In this module you design the network that almost every AWS application sits in: a VPC with <b>public subnets</b> (reachable from the internet), <b>private subnets</b> (not reachable), <b>route tables</b> that decide where packets go, an <b>internet gateway</b> for the front door and a <b>NAT gateway</b> for polite outbound access. You will draw it, build it twice (console and CLI), prove it works, troubleshoot a web server nobody can reach, and delete everything cleanly.</p>
<p><b>Prerequisites:</b> the module "Cloud networking from zero" (Regions, AZs, CIDR, the five reserved addresses, the CLI), plus basic routing: what a default route and a longest-prefix match are.</p>

<h3>The analogy: a shopping mall</h3>
<p>Picture a mall. The <b>public subnet</b> is the shopfront area with doors to the street: customers walk in. The <b>private subnet</b> is the stockroom and office behind the shops: staff only. The <b>internet gateway</b> is the main entrance. The <b>route table</b> is the signboard that says "street this way, stockroom that way". The <b>NAT gateway</b> is the delivery counter: staff in the stockroom can send a request out ("order more stock") and receive the reply, but a stranger on the street cannot walk in through it.</p>

<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="Standard two-tier VPC">
<rect x="250" y="8" width="140" height="36" rx="18" fill="#e2e8f0"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="320" y1="44" x2="320" y2="74" stroke="#64748b" stroke-width="3"/>
<rect x="240" y="74" width="160" height="30" rx="6" fill="#fde68a"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="13">Internet gateway</text>
<rect x="20" y="115" width="600" height="195" rx="10" fill="#bae6fd"/><text x="35" y="136" class="svg-ink" font-size="13">VPC 10.20.0.0/16</text>
<rect x="40" y="148" width="270" height="68" rx="8" fill="#bbf7d0"/><text x="175" y="170" text-anchor="middle" class="svg-ink" font-size="12">Public subnets (route 0.0.0.0/0 to IGW)</text><text x="175" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.20.1.0/24 AZ a  |  10.20.2.0/24 AZ b</text><text x="175" y="206" text-anchor="middle" class="svg-muted" font-size="12">load balancer, NAT gateway, bastion</text>
<rect x="330" y="148" width="270" height="68" rx="8" fill="#fed7aa"/><text x="465" y="170" text-anchor="middle" class="svg-ink" font-size="12">Private subnets (no route to IGW)</text><text x="465" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.20.11.0/24 AZ a  |  10.20.12.0/24 AZ b</text><text x="465" y="206" text-anchor="middle" class="svg-muted" font-size="12">app servers, databases</text>
<line x1="320" y1="104" x2="175" y2="148" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="230" x2="330" y2="230" stroke="#64748b" stroke-width="2"/>
<text x="320" y="258" text-anchor="middle" class="svg-accent" font-size="12">Private reaches the internet only through a NAT gateway placed in a public subnet</text>
<text x="320" y="282" text-anchor="middle" class="svg-muted" font-size="12">Subnets talk to each other through the automatic local route</text>
</svg><p class="cap">The standard design: public tier at the front, private tier behind, one pair of each per Availability Zone.</p></div>

<div class="note"><p><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish.</p></div>

<h3>Four ideas that run through the module</h3>
<ol>
<li><b>Public is a route, not a checkbox.</b> A subnet is public when its route table sends <code>0.0.0.0/0</code> to an internet gateway. Nothing else.</li>
<li><b>The route table is the decision-maker.</b> Every subnet uses exactly one route table, and the longest matching prefix wins.</li>
<li><b>The internet gateway needs a public address to translate.</b> An instance with only a private IP is invisible to the internet even in a public subnet.</li>
<li><b>Private means no inbound path from the internet</b>, not "no internet at all". Outbound goes through NAT.</li>
</ol>

<h3>What this costs, honestly</h3>
<p>The VPC, subnets, route tables, internet gateway, security groups and network ACLs have <b>no charge</b>. What costs money is what you put <i>in</i> them: an EC2 instance (hours), every public IPv4 address (about USD 0.005 per hour), a NAT gateway (an hourly charge plus a per-GB processing charge; AWS lists USD 0.045 per hour and USD 0.045 per GB for US East, so check the Mumbai price before you build one) and data transfer out. The guided labs in this module spell out the cost of every step.</p>

<div class="eg"><p><b>Worked example.</b> A small web shop needs a website the world can open, an app server and a database that nobody on the internet may touch. Public subnets: the load balancer. Private subnets: app and database. The route table of the public subnets has an IGW route; the route table of the private subnets has only the local route (plus a NAT route if the app must download updates). The database has no public address, so even a wrong security-group rule cannot expose it directly.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting a database in a public subnet "just for now". "Now" lasts for years and scanners find open ports within minutes. Default to private for everything that does not need to be reached from the internet.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which resource makes a subnet public?" Answer: the route to an internet gateway in the subnet's route table, not a setting on the subnet and not a security group. Also: a VPC can have only one internet gateway attached, and an internet gateway belongs to one VPC at a time.</p></div>

<div class="scn"><h4>The dev database on the internet</h4><p>A developer created a "quick" PostgreSQL instance in the default VPC, whose subnets are public, and opened port 5432 to 0.0.0.0/0 to test from home. A security scan two days later found it with a weak password. The team rebuilt it in a private subnet behind the app and reached it through a bastion only when needed.</p><p><b>Lesson:</b> public subnet plus public IP plus an open port is three mistakes away from an incident; private subnets remove the first two.</p></div>

<div class="iv"><p class="q">"Explain the difference between a public and a private subnet in AWS."</p><p>A public subnet has a route to an internet gateway in its route table, and its instances need a public or Elastic IP to be reachable. A private subnet has no such route; instances reach the internet outbound through a NAT gateway if at all. Stress that it is routing that decides, not a flag.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Public vs private is decided by the route table: a route to an internet gateway.</li>
<li>Standard design: public and private subnets in two AZs, front tier public, data tier private.</li>
<li>VPC, subnets, route tables, IGW, SGs and NACLs are free; NAT gateways, instances and public IPv4 addresses are not.</li>
<li>Private instances get outbound internet through a NAT gateway placed in a public subnet.</li>
<li>Always design first, then build, then verify, then clean up.</li>
</ul></div>
`,hi:`
<h3>Is module mein aap kya seekhoge</h3>
<p>Is module mein aap woh network design karte ho jisme lagbhag har AWS application baithi hoti hai: ek VPC jisme <b>public subnets</b> (internet se reachable), <b>private subnets</b> (reachable nahi), <b>route tables</b> jo tay karti hain packets kahan jayein, front door ke liye <b>internet gateway</b> aur shaleenta se outbound access ke liye <b>NAT gateway</b>. Aap use draw karoge, do baar build karoge (console aur CLI), sabit karoge ki chalta hai, ek web server troubleshoot karoge jise koi reach nahi kar pata, aur sab kuch saaf delete karoge.</p>
<p><b>Prerequisites:</b> module "Cloud networking from zero" (Regions, AZs, CIDR, paanch reserved addresses, CLI), aur basic routing: default route aur longest-prefix match kya hote hain.</p>

<h3>Analogy: ek shopping mall</h3>
<p>Ek mall socho. <b>Public subnet</b> shopfront area hai jiske darwaze sadak par khulte hain: customers andar aate hain. <b>Private subnet</b> shops ke peeche ka stockroom aur office hai: sirf staff. <b>Internet gateway</b> main entrance hai. <b>Route table</b> signboard hai jo kehta hai "sadak is taraf, stockroom us taraf". <b>NAT gateway</b> delivery counter hai: stockroom ka staff request bahar bhej sakta hai ("aur stock mangao") aur reply le sakta hai, par sadak ka ajnabi uske through andar nahi aa sakta.</p>

<div class="dia"><svg viewBox="0 0 640 320" role="img" aria-label="Standard two-tier VPC">
<rect x="250" y="8" width="140" height="36" rx="18" fill="#e2e8f0"/><text x="320" y="31" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="320" y1="44" x2="320" y2="74" stroke="#64748b" stroke-width="3"/>
<rect x="240" y="74" width="160" height="30" rx="6" fill="#fde68a"/><text x="320" y="94" text-anchor="middle" class="svg-ink" font-size="13">Internet gateway</text>
<rect x="20" y="115" width="600" height="195" rx="10" fill="#bae6fd"/><text x="35" y="136" class="svg-ink" font-size="13">VPC 10.20.0.0/16</text>
<rect x="40" y="148" width="270" height="68" rx="8" fill="#bbf7d0"/><text x="175" y="170" text-anchor="middle" class="svg-ink" font-size="12">Public subnets (0.0.0.0/0 se IGW ka route)</text><text x="175" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.20.1.0/24 AZ a  |  10.20.2.0/24 AZ b</text><text x="175" y="206" text-anchor="middle" class="svg-muted" font-size="12">load balancer, NAT gateway, bastion</text>
<rect x="330" y="148" width="270" height="68" rx="8" fill="#fed7aa"/><text x="465" y="170" text-anchor="middle" class="svg-ink" font-size="12">Private subnets (IGW ka route nahi)</text><text x="465" y="190" text-anchor="middle" class="svg-muted" font-size="12">10.20.11.0/24 AZ a  |  10.20.12.0/24 AZ b</text><text x="465" y="206" text-anchor="middle" class="svg-muted" font-size="12">app servers, databases</text>
<line x1="320" y1="104" x2="175" y2="148" stroke="#64748b" stroke-width="2"/>
<line x1="310" y1="230" x2="330" y2="230" stroke="#64748b" stroke-width="2"/>
<text x="320" y="258" text-anchor="middle" class="svg-accent" font-size="12">Private sirf public subnet mein rakhe NAT gateway se internet tak jaata hai</text>
<text x="320" y="282" text-anchor="middle" class="svg-muted" font-size="12">Subnets automatic local route se aapas mein baat karte hain</text>
</svg><p class="cap">Standard design: aage public tier, peeche private tier, har Availability Zone mein ek-ek jodi.</p></div>

<div class="note"><p><b>Jhanjhat nahi chahiye? (Prefer no hassle?)</b> Yeh exact steps aap bina AWS account aur bina bill ke aws.mypnetlab.vercel.app ke hands-on labs par practise kar sakte ho. Ya apna account use karo: pehle budget alert lagao aur kaam khatam hone par sab kuch delete kar do.</p></div>

<h3>Chaar ideas jo poore module mein chalte hain</h3>
<ol>
<li><b>Public ek route hai, checkbox nahi.</b> Subnet tab public hai jab uski route table <code>0.0.0.0/0</code> ko internet gateway par bhejti hai. Aur kuch nahi.</li>
<li><b>Route table decision-maker hai.</b> Har subnet theek ek route table use karta hai, aur longest matching prefix jeetta hai.</li>
<li><b>Internet gateway ko translate karne ke liye public address chahiye.</b> Sirf private IP wala instance public subnet mein bhi internet ko dikhta nahi.</li>
<li><b>Private ka matlab internet se inbound path nahi</b>, "internet bilkul nahi" nahi. Outbound NAT se jaata hai.</li>
</ol>

<h3>Isme kitna kharch lagta hai, imaandaari se</h3>
<p>VPC, subnets, route tables, internet gateway, security groups aur network ACLs par <b>koi charge nahi</b>. Paisa unme jo <i>rakhte</i> ho usme lagta hai: EC2 instance (hours), har public IPv4 address (lagbhag USD 0.005 per ghanta), NAT gateway (ghante ka charge plus per-GB processing charge; AWS US East ke liye USD 0.045 per ghanta aur USD 0.045 per GB list karta hai, isliye banane se pehle Mumbai ka price check karo) aur data transfer out. Is module ke guided labs har step ka cost batate hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek chhoti web shop ko chahiye: website jo poori duniya khol sake, app server aur database jise internet par koi chhu na sake. Public subnets: load balancer. Private subnets: app aur database. Public subnets ki route table mein IGW route hai; private subnets ki route table mein sirf local route hai (aur app ko updates download karne ho to NAT route). Database ka public address nahi hai, isliye galat security-group rule bhi use directly expose nahi kar sakta.</p></div>

<div class="warn"><p><b>Common mistake.</b> Database ko "abhi ke liye" public subnet mein rakh dena. "Abhi" saalon chalta hai aur scanners minutes mein open ports dhundh lete hain. Jo cheez internet se reach hone ki zaroorat nahi rakhti, uska default private rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Subnet ko public kaun banata hai?" Jawab: subnet ki route table mein internet gateway ka route, na ki subnet ki koi setting ya security group. Yeh bhi: VPC mein sirf ek internet gateway attach ho sakta hai, aur internet gateway ek samay mein ek hi VPC ka hota hai.</p></div>

<div class="scn"><h4>Internet par dev database</h4><p>Ek developer ne default VPC mein "quick" PostgreSQL instance banaya, jiske subnets public hote hain, aur ghar se test karne ke liye port 5432 ko 0.0.0.0/0 ke liye khol diya. Do din baad security scan ne use weak password ke saath dhundh liya. Team ne use app ke peeche private subnet mein rebuild kiya aur zaroorat par hi bastion se reach kiya.</p><p><b>Lesson:</b> public subnet plus public IP plus khula port, teen galtiyan hain; private subnets pehli do hata dete hain.</p></div>

<div class="iv"><p class="q">"AWS mein public aur private subnet ka farak samjhao."</p><p>Public subnet ki route table mein internet gateway ka route hota hai, aur uske instances ko reachable hone ke liye public ya Elastic IP chahiye. Private subnet mein aisa route nahi hota; instances outbound internet agar chahiye to NAT gateway se jaate hain. Zor do ki routing tay karti hai, koi flag nahi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Public vs private route table tay karti hai: internet gateway ka route.</li>
<li>Standard design: do AZs mein public aur private subnets, front tier public, data tier private.</li>
<li>VPC, subnets, route tables, IGW, SGs aur NACLs free hain; NAT gateways, instances aur public IPv4 addresses nahi.</li>
<li>Private instances ko outbound internet public subnet mein rakhe NAT gateway se milta hai.</li>
<li>Hamesha pehle design, phir build, phir verify, phir cleanup.</li>
</ul></div>
`}};export{e as default};