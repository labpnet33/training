var e={id:`big-picture`,h:{en:`Why private servers still need the internet`,hi:`Private servers ko phir bhi internet kyun chahiye`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>What a NAT gateway is, what it translates, and what it can never do (accept inbound connections).</li>
<li>The placement rule: a public NAT gateway lives in a PUBLIC subnet, and you need routes on two sides.</li>
<li>What a NAT gateway really costs (hourly plus per GB) and four ways to avoid paying for traffic you do not need to send through it.</li>
<li>The alternatives: NAT instance, egress-only internet gateway for IPv6, and VPC endpoints.</li>
<li>How to build, verify and, most importantly, <b>clean up</b> a NAT gateway on your own AWS account without a surprise bill.</li>
<li>How to troubleshoot "the NAT exists but patches still fail".</li>
</ul>
<p><b>Prerequisites:</b> the previous modules in this track: VPC design (public and private subnets, route tables, the internet gateway) and security groups. If "a subnet is public because its route table points 0.0.0.0/0 at an internet gateway" is not yet obvious to you, revisit that module first.</p>

<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish.</div>

<h3>The hotel analogy</h3>
<p>Imagine a hotel. Guests in the rooms (private servers) have no street-facing door of their own. If a guest wants to order a pizza, they phone the <b>front desk</b>. The front desk calls the pizzeria using the hotel's single public phone number, and when the pizzeria calls back, the front desk forwards the answer to the right room. The pizzeria never learns the room number. And a stranger on the street cannot phone the front desk and ask to be put through to room 204, because the front desk only forwards calls that a guest started.</p>
<p>The <b>NAT gateway</b> is that front desk. "NAT" means <b>Network Address Translation</b>: rewriting the source address of a packet. Your private server has an address such as 10.60.2.4 that is meaningless on the internet. The NAT gateway swaps it for its own public <b>Elastic IP</b> on the way out and swaps it back on the reply.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Private subnet to NAT gateway to internet gateway">
<rect x="10" y="10" width="620" height="230" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="24" y="30" class="svg-muted" font-size="12">VPC 10.60.0.0/16</text>
<rect x="30" y="60" width="170" height="150" rx="8" fill="#ddd6fe"/><text x="115" y="80" text-anchor="middle" class="svg-ink" font-size="13">Private subnet</text><text x="115" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.60.2.0/24</text>
<rect x="55" y="120" width="120" height="50" rx="6" fill="#bbf7d0"/><text x="115" y="142" text-anchor="middle" class="svg-ink" font-size="13">app-1</text><text x="115" y="158" text-anchor="middle" class="svg-muted" font-size="12">10.60.2.4, no public IP</text>
<rect x="250" y="60" width="190" height="150" rx="8" fill="#bae6fd"/><text x="345" y="80" text-anchor="middle" class="svg-ink" font-size="13">Public subnet</text><text x="345" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.60.1.0/24</text>
<rect x="275" y="120" width="140" height="50" rx="6" fill="#fde68a"/><text x="345" y="142" text-anchor="middle" class="svg-ink" font-size="13">NAT gateway</text><text x="345" y="158" text-anchor="middle" class="svg-muted" font-size="12">Elastic IP (public)</text>
<rect x="490" y="105" width="100" height="40" rx="6" fill="#fed7aa"/><text x="540" y="130" text-anchor="middle" class="svg-ink" font-size="13">Internet GW</text>
<line x1="175" y1="145" x2="275" y2="145" stroke="#64748b" stroke-width="2"/><line x1="415" y1="145" x2="490" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="225" y="136" text-anchor="middle" class="svg-accent" font-size="12">1</text><text x="452" y="136" text-anchor="middle" class="svg-accent" font-size="12">2</text>
<text x="540" y="180" text-anchor="middle" class="svg-muted" font-size="12">to the internet</text>
<text x="320" y="232" text-anchor="middle" class="svg-muted" font-size="12">1 = private route 0.0.0.0/0 to NAT, 2 = public route 0.0.0.0/0 to IGW</text>
</svg><p class="cap">The whole module in one picture: outbound traffic leaves the private subnet through a NAT gateway that sits in the public subnet.</p></div>

<h3>Why this matters</h3>
<p>Good design keeps databases and application servers in <b>private subnets</b> with no public IP, so nobody on the internet can open a connection to them. But those servers still have chores: install OS security patches, pull container images, call a payment API, send logs to a SaaS tool. Without a way out, patching fails and the application breaks in strange ways (a timeout, not a clean error). A NAT gateway gives you <b>outbound-only</b> internet: servers can start conversations, the internet cannot.</p>

<div class="eg"><b>Worked example.</b> app-1 (10.60.2.4) runs <code>dnf update</code> and connects to a package mirror at 198.51.100.20 port 443. The NAT gateway rewrites the packet to source 203.0.113.50 (its Elastic IP, documentation address) and a fresh source port. The mirror replies to 203.0.113.50; the NAT gateway looks up its translation table and delivers the reply to 10.60.2.4. The mirror only ever saw 203.0.113.50.</div>

<div class="warn"><b>Common mistake.</b> Thinking a NAT gateway is a security product. It is not a firewall and it cannot forward a port such as 443 to a server. If the internet must reach a server, use a load balancer or a public IP in a public subnet. NAT is for outbound only.</div>

<div class="scn"><h4>The patch window that timed out</h4><p>A team moved their application servers into private subnets for compliance. The next night, the automated patch job failed on every server with connection timeouts. The engineer ran a probe from a server to a public mirror on port 443 and saw it die at the route table: the private subnet had no default route. Adding a NAT gateway in the public subnet and one default route in the private route table fixed it in ten minutes.</p><p><b>Lesson:</b> moving servers to private subnets removes their path to the internet. Plan the outbound path (NAT, endpoints) at the same time.</p></div>

<div class="iv"><p class="q">"What is a NAT gateway and why would you use one?"</p><p>A strong answer: it is a managed AWS service that lets instances in a private subnet start outbound connections to the internet by translating their private source address to the gateway's Elastic IP; replies return through the same translation. It is outbound-only, so the instances stay unreachable from the internet. Mention that it sits in a public subnet and that you pay per hour plus per GB processed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A NAT gateway gives private instances outbound-only internet access.</li>
<li>It translates the private source address to its own public Elastic IP and reverses it on replies.</li>
<li>It cannot accept connections that begin on the internet and is not a firewall.</li>
<li>It costs money by the hour and by the GB, so design around it.</li>
<li>This module has theory, packet-flow diagrams, and guided labs you can run on your own account or in the free practice labs.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<ul>
<li>NAT gateway kya hai, woh kya translate karta hai, aur woh kya kabhi nahi kar sakta (inbound connections accept karna).</li>
<li>Placement rule: public NAT gateway PUBLIC subnet mein rehta hai, aur routes do taraf chahiye.</li>
<li>NAT gateway ka asli kharcha (hourly plus per GB) aur woh traffic jo NAT se bhejna zaroori nahi, usse bachne ke chaar tareeke.</li>
<li>Alternatives: NAT instance, IPv6 ke liye egress-only internet gateway, aur VPC endpoints.</li>
<li>Apne AWS account par NAT gateway ko kaise build, verify aur sabse zaroori, <b>clean up</b> karein bina surprise bill ke.</li>
<li>"NAT hai par patches phir bhi fail" ko troubleshoot kaise karein.</li>
</ul>
<p><b>Prerequisites:</b> is track ke pichle modules: VPC design (public aur private subnets, route tables, internet gateway) aur security groups. Agar "subnet tab public hota hai jab uski route table 0.0.0.0/0 ko internet gateway par point kare" abhi clear nahi hai, to pehle woh module dobara dekho.</p>

<div class="note"><b>Prefer no hassle?</b> You can practise these exact steps with no AWS account and no bill using the hands-on labs at aws.nwkings.com. Or use your own account: set a budget alert first and delete everything when you finish.</div>

<h3>Hotel ki analogy</h3>
<p>Ek hotel socho. Rooms ke guests (private servers) ke paas street ki taraf apna darwaza nahi hai. Guest ko pizza mangwana ho to woh <b>front desk</b> ko phone karta hai. Front desk hotel ke ek public phone number se pizzeria ko call karta hai, aur pizzeria wapas call kare to front desk jawab sahi room tak pahuncha deta hai. Pizzeria ko room number kabhi pata nahi chalta. Aur street ka koi ajnabi front desk ko phone karke room 204 nahi maang sakta, kyunki front desk sirf wahi calls forward karta hai jo kisi guest ne shuru ki ho.</p>
<p><b>NAT gateway</b> wahi front desk hai. "NAT" ka matlab <b>Network Address Translation</b>: packet ka source address badalna. Aapke private server ka address, jaise 10.60.2.4, internet par bekaar hai. NAT gateway jaate waqt use apne public <b>Elastic IP</b> se badal deta hai aur reply par wapas badal deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Private subnet se NAT gateway se internet gateway">
<rect x="10" y="10" width="620" height="230" rx="10" fill="#f1f5f9" stroke="#94a3b8"/><text x="24" y="30" class="svg-muted" font-size="12">VPC 10.60.0.0/16</text>
<rect x="30" y="60" width="170" height="150" rx="8" fill="#ddd6fe"/><text x="115" y="80" text-anchor="middle" class="svg-ink" font-size="13">Private subnet</text><text x="115" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.60.2.0/24</text>
<rect x="55" y="120" width="120" height="50" rx="6" fill="#bbf7d0"/><text x="115" y="142" text-anchor="middle" class="svg-ink" font-size="13">app-1</text><text x="115" y="158" text-anchor="middle" class="svg-muted" font-size="12">10.60.2.4, public IP nahi</text>
<rect x="250" y="60" width="190" height="150" rx="8" fill="#bae6fd"/><text x="345" y="80" text-anchor="middle" class="svg-ink" font-size="13">Public subnet</text><text x="345" y="96" text-anchor="middle" class="svg-muted" font-size="12">10.60.1.0/24</text>
<rect x="275" y="120" width="140" height="50" rx="6" fill="#fde68a"/><text x="345" y="142" text-anchor="middle" class="svg-ink" font-size="13">NAT gateway</text><text x="345" y="158" text-anchor="middle" class="svg-muted" font-size="12">Elastic IP (public)</text>
<rect x="490" y="105" width="100" height="40" rx="6" fill="#fed7aa"/><text x="540" y="130" text-anchor="middle" class="svg-ink" font-size="13">Internet GW</text>
<line x1="175" y1="145" x2="275" y2="145" stroke="#64748b" stroke-width="2"/><line x1="415" y1="145" x2="490" y2="145" stroke="#64748b" stroke-width="2"/>
<text x="225" y="136" text-anchor="middle" class="svg-accent" font-size="12">1</text><text x="452" y="136" text-anchor="middle" class="svg-accent" font-size="12">2</text>
<text x="540" y="180" text-anchor="middle" class="svg-muted" font-size="12">internet ki taraf</text>
<text x="320" y="232" text-anchor="middle" class="svg-muted" font-size="12">1 = private route 0.0.0.0/0 se NAT, 2 = public route 0.0.0.0/0 se IGW</text>
</svg><p class="cap">Poora module ek picture mein: outbound traffic private subnet se nikalkar public subnet mein baithe NAT gateway ke through bahar jaata hai.</p></div>

<h3>Yeh kyun zaroori hai</h3>
<p>Achhe design mein databases aur application servers <b>private subnets</b> mein bina public IP ke rehte hain, taaki internet par koi unse connection na khol sake. Lekin un servers ko kuch kaam hote hain: OS security patches install karna, container images pull karna, payment API call karna, logs kisi SaaS tool ko bhejna. Bahar jaane ka raasta na ho to patching fail hoti hai aur application ajeeb tareeke se toot-ti hai (clean error nahi, timeout aata hai). NAT gateway <b>outbound-only</b> internet deta hai: servers baat shuru kar sakte hain, internet nahi.</p>

<div class="eg"><b>Worked example.</b> app-1 (10.60.2.4) <code>dnf update</code> chalata hai aur package mirror 198.51.100.20 port 443 se connect hota hai. NAT gateway packet ko source 203.0.113.50 (uska Elastic IP, documentation address) aur naye source port ke saath rewrite karta hai. Mirror 203.0.113.50 ko reply karta hai; NAT gateway apni translation table dekhkar reply 10.60.2.4 tak pahuncha deta hai. Mirror ne sirf 203.0.113.50 dekha.</div>

<div class="warn"><b>Common mistake.</b> NAT gateway ko security product samajhna. Yeh firewall nahi hai aur 443 jaise port ko server par forward nahi kar sakta. Internet ko server tak pahunchna hai to load balancer ya public subnet mein public IP use karo. NAT sirf outbound ke liye hai.</div>

<div class="scn"><h4>Patch window jo timeout ho gaya</h4><p>Ek team ne compliance ke liye application servers private subnets mein shift kiye. Agli raat automated patch job har server par connection timeout se fail hui. Engineer ne server se public mirror ke port 443 par probe chalaya aur dekha ki woh route table par hi mar gaya: private subnet mein default route thi hi nahi. Public subnet mein NAT gateway aur private route table mein ek default route dalne se das minute mein theek ho gaya.</p><p><b>Lesson:</b> servers ko private subnets mein le jaane se internet ka raasta hat jaata hai. Outbound path (NAT, endpoints) ka plan usi waqt karo.</p></div>

<div class="iv"><p class="q">"NAT gateway kya hai aur aap ise kyun use karoge?"</p><p>Strong answer: yeh ek managed AWS service hai jo private subnet ke instances ko internet par outbound connections shuru karne deti hai, unka private source address gateway ke Elastic IP mein translate karke; replies usi translation se wapas aati hain. Yeh outbound-only hai, isliye instances internet se unreachable rehte hain. Batao ki yeh public subnet mein rehta hai aur bill per hour plus per GB processed aata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT gateway private instances ko outbound-only internet access deta hai.</li>
<li>Yeh private source address ko apne public Elastic IP mein translate karta hai aur replies par ulta karta hai.</li>
<li>Internet se shuru hone wale connections accept nahi karta aur firewall nahi hai.</li>
<li>Isme per hour aur per GB kharcha hota hai, isliye design usi hisaab se karo.</li>
<li>Is module mein theory, packet-flow diagrams aur guided labs hain jo aap apne account par ya free practice labs mein chala sakte ho.</li>
</ul></div>
`}};export{e as default};