var e={id:`big-picture`,h:{en:`Two VPCs, one private link`,hi:`Do VPCs, ek private link`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>What a VPC peering connection is, and its life cycle: request, accept, active.</li>
<li>The five things that must all be true before two VPCs can talk, including the route on <b>both</b> sides.</li>
<li>The hard limits: no overlapping CIDRs, no transitive routing, no edge-to-edge access to the other VPC's gateways.</li>
<li>Cross-account and cross-region peering, DNS resolution and security group references.</li>
<li>How peering is billed, and how it compares with Transit Gateway and PrivateLink.</li>
<li>How to build, verify and <b>clean up</b> peering on your own AWS account safely, and how to troubleshoot "peering is active but traffic fails".</li>
</ul>
<p><b>Prerequisites:</b> the earlier modules of this track: VPC design (CIDR, subnets, route tables), security groups and network ACLs, and ideally the NAT gateway module. You should be able to read a route table and say what <code>local</code> means.</p>

<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish.</div>

<h3>The two offices analogy</h3>
<p>Imagine two companies in two separate office buildings. Each building has its own internal phone system, and extension 204 in one building means nothing in the other. Now the companies agree to run a <b>private tie-line</b> between the buildings. Both sides must agree (one asks, the other accepts). Each building must then add a line to its switchboard: "calls to the other building's extensions go over the tie-line". If only one switchboard is updated, the call arrives but the answer cannot find its way back. And if building A is tied to B and B is tied to C, A still cannot dial C through B: a tie-line connects exactly two buildings.</p>
<p>A <b>VPC peering connection</b> is that tie-line. Each VPC is a private network with its own IP range. By default VPCs cannot reach each other. Peering lets them use <b>private IP addresses</b> directly, over the AWS network, with no internet gateway, no VPN and no extra hop.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two VPCs joined by a peering connection">
<rect x="10" y="20" width="250" height="170" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="135" y="42" text-anchor="middle" class="svg-ink" font-size="13">app-vpc 10.70.0.0/16</text>
<rect x="30" y="60" width="210" height="50" rx="6" fill="#bbf7d0"/><text x="135" y="82" text-anchor="middle" class="svg-ink" font-size="13">app-1 10.70.1.10</text><text x="135" y="99" text-anchor="middle" class="svg-muted" font-size="12">subnet 10.70.1.0/24</text>
<rect x="30" y="125" width="210" height="50" rx="6" fill="#fff" stroke="#94a3b8"/><text x="135" y="147" text-anchor="middle" class="svg-muted" font-size="12">app-rt</text><text x="135" y="165" text-anchor="middle" class="svg-accent" font-size="12">10.71.0.0/16 to pcx</text>
<rect x="380" y="20" width="250" height="170" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="505" y="42" text-anchor="middle" class="svg-ink" font-size="13">db-vpc 10.71.0.0/16</text>
<rect x="400" y="60" width="210" height="50" rx="6" fill="#ddd6fe"/><text x="505" y="82" text-anchor="middle" class="svg-ink" font-size="13">db-1 10.71.1.20</text><text x="505" y="99" text-anchor="middle" class="svg-muted" font-size="12">subnet 10.71.1.0/24</text>
<rect x="400" y="125" width="210" height="50" rx="6" fill="#fff" stroke="#94a3b8"/><text x="505" y="147" text-anchor="middle" class="svg-muted" font-size="12">db-rt</text><text x="505" y="165" text-anchor="middle" class="svg-accent" font-size="12">10.70.0.0/16 to pcx</text>
<line x1="260" y1="100" x2="380" y2="100" stroke="#0ea5e9" stroke-width="6"/>
<text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">pcx-</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">peering</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Private addresses talk directly. Routes are needed on BOTH sides.</text>
</svg><p class="cap">The whole module in one picture: a peering connection plus one route in each VPC.</p></div>

<h3>Why it matters</h3>
<p>Real companies split workloads over many VPCs: one per environment (dev, test, prod), per team, per application, or per account. Sooner or later they need to connect: an application VPC must reach a shared database VPC, a monitoring VPC must reach everything, or a migration must move data between accounts. Peering is the simplest and cheapest way to connect <b>a few</b> VPCs. Knowing its limits tells you when to switch to Transit Gateway.</p>

<div class="eg"><b>Worked example.</b> app-vpc (10.70.0.0/16) holds app-1 (10.70.1.10). db-vpc (10.71.0.0/16) holds db-1 (10.71.1.20) which listens on PostgreSQL port 5432. After the peering is active, app-1 connects to 10.71.1.20:5432 directly. In db-vpc's security group the rule allows TCP 5432 from 10.70.0.0/16. Nothing crosses the internet, and db-1 has no public IP.</div>

<div class="warn"><b>Common mistake.</b> Believing that "active" means "working". An active peering connection is only the tie-line. Without routes on both sides and matching security rules, traffic still fails.</div>

<div class="scn"><h4>The database nobody could reach</h4><p>A team created a peering connection between the application VPC and the database VPC, saw the status "active" and declared victory. The application timed out. They had added the route in the application VPC but not in the database VPC. The request reached the database; the reply had no route home and was dropped.</p><p><b>Lesson:</b> peering needs a route on both sides, always.</p></div>

<div class="iv"><p class="q">"What is VPC peering and when would you use it?"</p><p>It is a one-to-one private network connection between two VPCs (same or different accounts and Regions) that lets resources use private IPs over the AWS backbone. It needs a request and accept, routes in both VPCs' route tables, and security rules that allow the other CIDR. Use it for a small number of VPCs that need full connectivity; for many VPCs or transitive routing use Transit Gateway.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Peering connects exactly two VPCs privately; no gateway or appliance is involved.</li>
<li>Life cycle: request, accept, active. The accepter must act.</li>
<li>Routes are needed in both VPCs, and security groups and NACLs must allow the other CIDR.</li>
<li>Limits: no overlapping CIDRs, no transitive routing.</li>
<li>This module includes guided labs you can run on your own account or in the free practice labs.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<ul>
<li>VPC peering connection kya hai, aur uska life cycle: request, accept, active.</li>
<li>Do VPCs ke baat karne se pehle paanch cheezein jo sab sahi honi chahiye, <b>dono</b> taraf ke route samet.</li>
<li>Hard limits: overlapping CIDR nahi, transitive routing nahi, doosre VPC ke gateways tak edge-to-edge access nahi.</li>
<li>Cross-account aur cross-region peering, DNS resolution aur security group references.</li>
<li>Peering ka bill kaise banta hai, aur Transit Gateway aur PrivateLink se comparison.</li>
<li>Apne AWS account par peering ko safely kaise build, verify aur <b>clean up</b> karein, aur "peering active hai par traffic fail" ko troubleshoot kaise karein.</li>
</ul>
<p><b>Prerequisites:</b> is track ke pichle modules: VPC design (CIDR, subnets, route tables), security groups aur network ACLs, aur behtar hoga NAT gateway module bhi. Aapko route table padhni aani chahiye aur <code>local</code> ka matlab pata hona chahiye.</p>

<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete everything when you finish.</div>

<h3>Do offices ki analogy</h3>
<p>Do companies ke do alag office buildings socho. Har building ka apna internal phone system hai, aur ek building ka extension 204 doosri building mein kuch matlab nahi rakhta. Ab dono companies buildings ke beech ek <b>private tie-line</b> bichhane par razi hoti hain. Dono ki sehmati chahiye (ek maangta hai, doosra accept karta hai). Phir har building apne switchboard mein ek line jodti hai: "doosri building ke extensions ki calls tie-line se jaayengi". Sirf ek switchboard update hua to call pahunchti hai par jawab ko wapas raasta nahi milta. Aur agar building A, B se aur B, C se tied hai, tab bhi A, B ke through C ko dial nahi kar sakta: tie-line sirf do buildings ko jodti hai.</p>
<p><b>VPC peering connection</b> wahi tie-line hai. Har VPC apni IP range wala private network hai. Default mein VPCs ek doosre tak nahi pahunch sakte. Peering unhe AWS network par <b>private IP addresses</b> seedhe use karne deti hai, bina internet gateway, VPN ya extra hop ke.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Peering connection se jude do VPCs">
<rect x="10" y="20" width="250" height="170" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="135" y="42" text-anchor="middle" class="svg-ink" font-size="13">app-vpc 10.70.0.0/16</text>
<rect x="30" y="60" width="210" height="50" rx="6" fill="#bbf7d0"/><text x="135" y="82" text-anchor="middle" class="svg-ink" font-size="13">app-1 10.70.1.10</text><text x="135" y="99" text-anchor="middle" class="svg-muted" font-size="12">subnet 10.70.1.0/24</text>
<rect x="30" y="125" width="210" height="50" rx="6" fill="#fff" stroke="#94a3b8"/><text x="135" y="147" text-anchor="middle" class="svg-muted" font-size="12">app-rt</text><text x="135" y="165" text-anchor="middle" class="svg-accent" font-size="12">10.71.0.0/16 se pcx</text>
<rect x="380" y="20" width="250" height="170" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="505" y="42" text-anchor="middle" class="svg-ink" font-size="13">db-vpc 10.71.0.0/16</text>
<rect x="400" y="60" width="210" height="50" rx="6" fill="#ddd6fe"/><text x="505" y="82" text-anchor="middle" class="svg-ink" font-size="13">db-1 10.71.1.20</text><text x="505" y="99" text-anchor="middle" class="svg-muted" font-size="12">subnet 10.71.1.0/24</text>
<rect x="400" y="125" width="210" height="50" rx="6" fill="#fff" stroke="#94a3b8"/><text x="505" y="147" text-anchor="middle" class="svg-muted" font-size="12">db-rt</text><text x="505" y="165" text-anchor="middle" class="svg-accent" font-size="12">10.70.0.0/16 se pcx</text>
<line x1="260" y1="100" x2="380" y2="100" stroke="#0ea5e9" stroke-width="6"/>
<text x="320" y="88" text-anchor="middle" class="svg-accent" font-size="12">pcx-</text><text x="320" y="122" text-anchor="middle" class="svg-muted" font-size="12">peering</text>
<text x="320" y="215" text-anchor="middle" class="svg-muted" font-size="12">Private addresses seedhe baat karte hain. Routes DONO taraf chahiye.</text>
</svg><p class="cap">Poora module ek picture mein: ek peering connection aur har VPC mein ek route.</p></div>

<h3>Yeh kyun zaroori hai</h3>
<p>Asli companies workloads ko kai VPCs mein baantti hain: har environment (dev, test, prod), team, application ya account ke liye ek. Jaldi ya der se unhe jodna padta hai: application VPC ko shared database VPC tak pahunchna hai, monitoring VPC ko sab tak, ya migration mein accounts ke beech data move karna hai. Peering <b>kuch</b> VPCs ko jodne ka sabse simple aur sasta tareeka hai. Uski limits jaanna batata hai ki Transit Gateway par kab jaana hai.</p>

<div class="eg"><b>Worked example.</b> app-vpc (10.70.0.0/16) mein app-1 (10.70.1.10) hai. db-vpc (10.71.0.0/16) mein db-1 (10.71.1.20) hai jo PostgreSQL port 5432 par sunta hai. Peering active hone ke baad app-1 seedha 10.71.1.20:5432 se connect hota hai. db-vpc ke security group mein rule 10.70.0.0/16 se TCP 5432 allow karta hai. Kuch bhi internet se nahi guzarta, aur db-1 ka public IP nahi hai.</div>

<div class="warn"><b>Common mistake.</b> Maan lena ki "active" ka matlab "working" hai. Active peering connection sirf tie-line hai. Dono taraf routes aur matching security rules ke bina traffic phir bhi fail hota hai.</div>

<div class="scn"><h4>Database jo koi reach nahi kar paya</h4><p>Ek team ne application VPC aur database VPC ke beech peering connection banaya, status "active" dekha aur jeet maan li. Application timeout hota raha. Unhone route application VPC mein dala tha par database VPC mein nahi. Request database tak pahunchi; reply ko ghar ka raasta nahi mila aur drop ho gayi.</p><p><b>Lesson:</b> peering ko hamesha dono taraf route chahiye.</p></div>

<div class="iv"><p class="q">"VPC peering kya hai aur kab use karoge?"</p><p>Yeh do VPCs (same ya alag accounts aur Regions) ke beech one-to-one private network connection hai jo resources ko AWS backbone par private IPs use karne deti hai. Isme request aur accept, dono VPCs ki route tables mein routes, aur doosre CIDR ko allow karte security rules chahiye. Kuch VPCs ko full connectivity chahiye to use karo; bahut VPCs ya transitive routing ke liye Transit Gateway.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Peering sirf do VPCs ko private tareeke se jodti hai; koi gateway ya appliance nahi.</li>
<li>Life cycle: request, accept, active. Accepter ko action lena padta hai.</li>
<li>Dono VPCs mein routes chahiye, aur security groups aur NACLs doosre CIDR ko allow karein.</li>
<li>Limits: overlapping CIDR nahi, transitive routing nahi.</li>
<li>Is module mein guided labs hain jo aap apne account par ya free practice labs mein chala sakte ho.</li>
</ul></div>
`}};export{e as default};