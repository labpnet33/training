var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="{{aria}}">
<rect x="10" y="10" width="620" height="230" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="24" y="30" class="svg-muted" font-size="12">VNet 10.60.0.0/16</text>
<rect x="30" y="50" width="330" height="170" rx="8" fill="#ddd6fe"/><text x="195" y="70" text-anchor="middle" class="svg-ink" font-size="13">Subnet nk-nat-sn 10.60.1.0/24</text>
<rect x="50" y="100" width="120" height="50" rx="6" fill="#bbf7d0"/><text x="110" y="122" text-anchor="middle" class="svg-ink" font-size="13">app-1</text><text x="110" y="138" text-anchor="middle" class="svg-muted" font-size="12">10.60.1.4</text>
<rect x="215" y="100" width="130" height="50" rx="6" fill="#fde68a"/><text x="280" y="122" text-anchor="middle" class="svg-ink" font-size="13">NAT Gateway</text><text x="280" y="138" text-anchor="middle" class="svg-muted" font-size="12">{{attached}}</text>
<rect x="420" y="100" width="100" height="50" rx="6" fill="#bae6fd"/><text x="470" y="122" text-anchor="middle" class="svg-ink" font-size="13">Public IP</text><text x="470" y="138" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.50</text>
<rect x="550" y="105" width="70" height="40" rx="6" fill="#fed7aa"/><text x="585" y="130" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="170" y1="125" x2="215" y2="125" stroke="#64748b" stroke-width="2"/><line x1="345" y1="125" x2="420" y2="125" stroke="#64748b" stroke-width="2"/><line x1="520" y1="125" x2="550" y2="125" stroke="#64748b" stroke-width="2"/>
<text x="195" y="185" text-anchor="middle" class="svg-accent" font-size="12">{{cap1}}</text>
<text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">{{cap2}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=`<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no Azure subscription and no bill using the hands-on labs at azure.mypnetlab.vercel.app. Or use your own account: set a budget alert first and delete the resource group when you finish.</div>`,r=e(t,{aria:`VM in a subnet reaching the internet through a NAT Gateway`,attached:`attached to the subnet`,cap1:`no route table change needed`,cap2:`Outbound only: the internet cannot start a connection to app-1`,cap:`The whole module in one picture: a NAT Gateway is attached to a subnet and gives every VM in it a shared, stable outbound public IP.`}),i=e(t,{aria:`Subnet ka VM NAT Gateway se internet tak`,attached:`subnet se attached`,cap1:`route table badalna nahi padta`,cap2:`Sirf outbound: internet app-1 par connection shuru nahi kar sakta`,cap:`Poora module ek picture mein: NAT Gateway subnet se attach hota hai aur us subnet ke har VM ko ek shared, stable outbound public IP deta hai.`}),a={id:`big-picture`,h:{en:`Why private VMs still need the internet`,hi:`Private VMs ko phir bhi internet kyun chahiye`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>The four ways an Azure VM can reach the internet, and which one wins when several are configured.</li>
<li>What <b>default outbound access</b> is, why Microsoft is retiring it for new virtual networks, and what to do instead.</li>
<li>How a <b>NAT Gateway</b> works: attached to a subnet, shared public IPs, SNAT ports, idle timeout.</li>
<li>How <b>SNAT port exhaustion</b> shows up, how to measure it and how to fix it.</li>
<li>Outbound rules on a Standard Load Balancer, public IP prefixes, and NAT Gateway versus Azure Firewall.</li>
<li>How to build, verify and <b>clean up</b> a NAT Gateway on your own Azure subscription without a surprise bill.</li>
</ul>
<p><b>Prerequisites:</b> the earlier modules of this track: virtual networks and subnets, address planning (RFC1918 ranges such as 10.60.0.0/16), and network security groups (NSGs). If you do not yet know what a subnet or a public IP is, revisit those first.</p>

`+n+`

<h3>The hotel analogy</h3>
<p>Think of a hotel. Guests in the rooms (your VMs) have no street door of their own. To order a pizza they phone the <b>front desk</b>. The desk calls the pizzeria from the hotel's one public number, and when the pizzeria calls back, the desk routes the answer to the right room. The pizzeria never learns the room number, and a stranger cannot ask the desk to be put through to room 204 because the desk only forwards calls a guest started.</p>
<p>The <b>NAT Gateway</b> is that front desk. NAT means <b>Network Address Translation</b>. Specifically it does <b>SNAT</b> (source NAT): it rewrites the private source address and port of an outbound packet to one of its own public IP addresses, and reverses the change on the reply.</p>
`+r+`
<h3>Why this matters</h3>
<p>Good design keeps application and database VMs without public IPs so nobody on the internet can open a connection to them. But those VMs still have chores: install OS patches, pull container images, call a payment API, ship logs to a SaaS tool. Without a deliberate outbound path, things fail with timeouts. For years Azure hid this problem with <b>default outbound access</b>: a VM with no explicit outbound method still got an implicit public IP owned by Azure. That implicit address is not yours, can change, and cannot be allow-listed reliably. Microsoft is moving new virtual networks to <b>private subnets</b> where this implicit path is off (retirement date and exact behaviour: verify before publishing). So you must choose an outbound design on purpose, and the recommended choice for most workloads is a NAT Gateway.</p>

<div class="eg"><b>Worked example.</b> app-1 (10.60.1.4) runs <code>apt update</code> and connects to a package mirror at 198.51.100.20 port 443. The NAT Gateway rewrites the packet to source 203.0.113.50 (its public IP, a documentation address) and a fresh source port, say 1024. The mirror replies to 203.0.113.50:1024; the gateway finds the entry in its translation table and delivers the reply to 10.60.1.4. The mirror only ever saw 203.0.113.50.</div>

<div class="note"><b>AWS vs Azure.</b> In AWS a NAT gateway sits in a public subnet and you add a 0.0.0.0/0 route in the private route table. In Azure you <b>attach the NAT Gateway to the subnet itself</b>; no route table entry is needed and there is no separate public subnet. The NAT Gateway is also not "in" a subnet the way an AWS one is.</div>

<div class="warn"><b>Common mistake.</b> Treating a NAT Gateway as a firewall or as a way to publish a service. It is outbound only and cannot forward port 443 to a VM. To accept inbound connections use a load balancer or a public IP on the VM (see the load-balancing module).</div>

<div class="scn"><h4>The patch window that timed out</h4><p>A team built a new virtual network in a new subscription and deployed application VMs with no public IP. The nightly patch job timed out on every VM. The engineer found that the subnet was private by default, so there was no implicit outbound path any more, and no NAT Gateway, load balancer or firewall had been added. Attaching a NAT Gateway to the subnet fixed it in ten minutes with no route changes.</p><p><b>Lesson:</b> for new virtual networks, plan the outbound path at design time; do not rely on the implicit one.</p></div>

<div class="iv"><p class="q">"What is a NAT Gateway in Azure and why use one?"</p><p>A strong answer: it is a managed, zone-aware service attached at subnet level that gives all VMs in that subnet outbound internet access through one or more static public IPs, using SNAT. It is outbound-only, so VMs stay unreachable from the internet. Compare it with default outbound access (implicit, not owned by you, being retired for new VNets) and mention that you pay per hour plus per GB processed (verify current structure).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A NAT Gateway gives a whole subnet outbound-only internet using static public IPs.</li>
<li>It is attached to the subnet; no route table change is needed.</li>
<li>Default outbound access is implicit, unowned and being retired for new VNets (verify date).</li>
<li>It costs money by the hour and by the GB; delete it when practising.</li>
<li>This module mixes theory, packet-flow diagrams and guided labs you can run on your own subscription or in the free practice labs.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<ul>
<li>Azure VM internet tak pahunchne ke chaar tareeke, aur kai configured hon to kaunsa jeetta hai.</li>
<li><b>Default outbound access</b> kya hai, Microsoft ise naye virtual networks ke liye kyun retire kar raha hai, aur uski jagah kya karein.</li>
<li><b>NAT Gateway</b> kaise kaam karta hai: subnet se attached, shared public IPs, SNAT ports, idle timeout.</li>
<li><b>SNAT port exhaustion</b> kaise dikhta hai, kaise measure karein aur kaise fix karein.</li>
<li>Standard Load Balancer ke outbound rules, public IP prefixes, aur NAT Gateway versus Azure Firewall.</li>
<li>Apne Azure subscription par NAT Gateway ko kaise build, verify aur <b>clean up</b> karein bina surprise bill ke.</li>
</ul>
<p><b>Prerequisites:</b> is track ke pichle modules: virtual networks aur subnets, address planning (RFC1918 ranges jaise 10.60.0.0/16), aur network security groups (NSGs). Agar subnet ya public IP abhi clear nahi hai to pehle woh dekho.</p>

`+n+`

<h3>Hotel ki analogy</h3>
<p>Ek hotel socho. Rooms ke guests (aapke VMs) ke paas street ka apna darwaza nahi hai. Pizza mangwana ho to woh <b>front desk</b> ko phone karte hain. Desk hotel ke ek public number se pizzeria ko call karta hai, aur pizzeria wapas call kare to desk jawab sahi room tak pahuncha deta hai. Pizzeria ko room number kabhi nahi pata chalta, aur koi ajnabi desk se room 204 nahi maang sakta kyunki desk sirf wahi calls forward karta hai jo guest ne shuru ki ho.</p>
<p><b>NAT Gateway</b> wahi front desk hai. NAT ka matlab <b>Network Address Translation</b>. Khaas taur par yeh <b>SNAT</b> (source NAT) karta hai: outbound packet ka private source address aur port apne kisi public IP address se badal deta hai, aur reply par ulta badal deta hai.</p>
`+i+`
<h3>Yeh kyun zaroori hai</h3>
<p>Achhe design mein application aur database VMs bina public IP ke rehte hain taaki internet par koi unse connection na khol sake. Lekin un VMs ke kaam hote hain: OS patches install karna, container images pull karna, payment API call karna, logs kisi SaaS tool ko bhejna. Jaanboojhkar banaye outbound path ke bina cheezein timeout se fail hoti hain. Saalon tak Azure ne yeh problem <b>default outbound access</b> se chhupayi: jis VM ke paas koi explicit outbound method nahi tha use bhi Azure ka implicit public IP mil jaata tha. Woh implicit address aapka nahi hota, badal sakta hai, aur use reliably allow-list nahi kar sakte. Microsoft naye virtual networks ko <b>private subnets</b> ki taraf le ja raha hai jahan yeh implicit path off hai (retirement date aur exact behaviour: publish karne se pehle verify karo). Isliye outbound design ab soch-samajhkar chunna padega, aur zyadatar workloads ke liye recommended choice NAT Gateway hai.</p>

<div class="eg"><b>Worked example.</b> app-1 (10.60.1.4) <code>apt update</code> chalata hai aur package mirror 198.51.100.20 port 443 se connect hota hai. NAT Gateway packet ko source 203.0.113.50 (uska public IP, documentation address) aur naye source port, maan lo 1024, ke saath rewrite karta hai. Mirror 203.0.113.50:1024 ko reply karta hai; gateway translation table mein entry dhoondhkar reply 10.60.1.4 tak pahuncha deta hai. Mirror ne sirf 203.0.113.50 dekha.</div>

<div class="note"><b>AWS vs Azure.</b> AWS mein NAT gateway public subnet mein hota hai aur private route table mein 0.0.0.0/0 route daalte ho. Azure mein NAT Gateway ko <b>subnet se hi attach</b> karte ho; route table entry nahi chahiye aur alag public subnet nahi hota. NAT Gateway AWS ki tarah kisi subnet "ke andar" bhi nahi baithta.</div>

<div class="warn"><b>Common mistake.</b> NAT Gateway ko firewall samajhna ya service publish karne ka tareeka maanna. Yeh sirf outbound hai aur port 443 ko VM par forward nahi kar sakta. Inbound connections ke liye load balancer ya VM par public IP use karo (load-balancing module dekho).</div>

<div class="scn"><h4>Patch window jo timeout ho gaya</h4><p>Ek team ne naye subscription mein naya virtual network banaya aur application VMs bina public IP ke deploy kiye. Raat ka patch job har VM par timeout hua. Engineer ne dekha ki subnet by default private tha, yaani implicit outbound path ab tha hi nahi, aur na NAT Gateway, na load balancer, na firewall lagaya gaya tha. Subnet par NAT Gateway attach karne se das minute mein bina route changes ke theek ho gaya.</p><p><b>Lesson:</b> naye virtual networks mein outbound path design time par plan karo; implicit path par bharosa mat karo.</p></div>

<div class="iv"><p class="q">"Azure mein NAT Gateway kya hai aur kyun use karte hain?"</p><p>Strong answer: yeh managed, zone-aware service hai jo subnet level par attach hoti hai aur us subnet ke saare VMs ko ek ya zyada static public IPs ke through SNAT se outbound internet deti hai. Yeh outbound-only hai isliye VMs internet se unreachable rehte hain. Default outbound access se compare karo (implicit, aapka nahi, naye VNets ke liye retire ho raha) aur batao ki bill per hour plus per GB processed aata hai (current structure verify karo).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT Gateway poore subnet ko static public IPs se outbound-only internet deta hai.</li>
<li>Yeh subnet se attach hota hai; route table change nahi chahiye.</li>
<li>Default outbound access implicit hai, aapka nahi, aur naye VNets ke liye retire ho raha hai (date verify karo).</li>
<li>Isme per hour aur per GB kharcha hota hai; practise ke baad delete karo.</li>
<li>Is module mein theory, packet-flow diagrams aur guided labs hain jo aap apne subscription par ya free practice labs mein chala sakte ho.</li>
</ul></div>
`}};export{a as default};