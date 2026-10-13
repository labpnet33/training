var e={id:`what-is-prisma-access`,h:{en:`What Prisma Access is, and why companies move security to the cloud`,hi:`Prisma Access kya hai, aur companies security cloud mein kyun le jaati hain`},body:{en:`
<p><b>What you will learn in this module.</b> You will start from zero and finish able to describe, plan and operate the foundations of a Palo Alto Networks Prisma Access tenant. You will learn what Security Service Edge (SSE) means, the three kinds of connection into Prisma Access (mobile users, remote networks, service connections), the difference between a location and a compute location, what the infrastructure subnet, the infrastructure BGP AS and the Tenant Service Group (TSG) are, how licences and bandwidth are counted, how to choose between Panorama with the Cloud Services plugin and Strata Cloud Manager (SCM), the correct onboarding order, why <i>Commit to Panorama</i> alone does not change Prisma Access, how zones decide what is internet and what is private, and what the Security Service Edge Engineer exam tests. Then you will practise three labs: <b>pa-start-1</b> (tenant and infrastructure), <b>pa-start-2</b> (the Panorama plugin view) and <b>pa-start-3</b> (a ticket where a change was committed but never pushed).</p>
<p><b>Prerequisites.</b> Basic IPv4 subnetting, what an IPsec VPN tunnel does, what a firewall zone is, and what BGP is in one sentence. Experience with a Palo Alto Networks firewall (the pan-start module) helps but is not required.</p>

<h3>Start with an analogy: the airport security hall</h3>
<p>Picture a company whose staff work in one building. Every visitor passes through one security hall at the front door. This works while everyone is inside. Now half the staff work from home or from branch offices. If you force every person to travel to the head office security hall just to read a web page, the queue is long and the journey is slow.</p>
<p>Prisma Access is like opening a ring of identical security halls in many cities, run by the vendor, so each person is checked at the hall nearest to them. The checks are the same everywhere because one set of rules is pushed to all halls. The company no longer builds or patches the halls; it only writes the rules.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Users reach apps through cloud security">
<rect x="20" y="30" width="110" height="40" rx="6" fill="#bae6fd"/><text x="75" y="54" text-anchor="middle" class="svg-ink" font-size="12">Home laptop</text>
<rect x="20" y="90" width="110" height="40" rx="6" fill="#bae6fd"/><text x="75" y="114" text-anchor="middle" class="svg-ink" font-size="12">Branch office</text>
<ellipse cx="320" cy="85" rx="110" ry="55" fill="#ddd6fe"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="14">Prisma Access</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">cloud security service</text>
<rect x="510" y="30" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="565" y="54" text-anchor="middle" class="svg-ink" font-size="12">HQ data center</text>
<rect x="510" y="90" width="110" height="40" rx="6" fill="#fed7aa"/><text x="565" y="114" text-anchor="middle" class="svg-ink" font-size="12">Internet and SaaS</text>
<line x1="130" y1="50" x2="230" y2="75" stroke="#64748b"/><line x1="130" y1="110" x2="230" y2="95" stroke="#64748b"/><line x1="410" y1="75" x2="510" y2="50" stroke="#64748b"/><line x1="410" y1="95" x2="510" y2="110" stroke="#64748b"/>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Every path is inspected once, in the cloud, with one rulebase</text>
</svg><p class="cap">Users and sites connect to the nearest Prisma Access location; from there traffic goes to the data center or to the internet.</p></div>

<h3>The problem it solves</h3>
<p>For many years a remote worker started a VPN to the head office firewall. All traffic, including video calls and cloud applications, travelled to the head office and out again. This is called <b>backhaul</b>. It wastes bandwidth, adds delay, and makes the head office firewall a single point of failure. Branch offices had the same issue.</p>
<p><b>Security Service Edge (SSE)</b> is the idea of delivering security functions from the cloud, close to users, instead of from a box in one building. Typical functions are a secure web gateway, firewall as a service, private application access (zero trust style) and data protection. Prisma Access is the Palo Alto Networks SSE service for the network security part: it terminates user and site connections in its own locations and applies your security policy there.</p>
<table class="cmp"><tr><th>Question</th><th>Classic VPN to HQ</th><th>Prisma Access</th></tr>
<tr><td>Where is traffic inspected?</td><td>At the head office firewall</td><td>At the nearest cloud location</td></tr>
<tr><td>Who patches and scales the gateways?</td><td>Your team</td><td>The service provider</td></tr>
<tr><td>Internet traffic path</td><td>Backhauled through HQ</td><td>Straight out from the cloud location</td></tr>
<tr><td>Rulebase</td><td>Per firewall</td><td>One rulebase for users and sites</td></tr>
<tr><td>What you still own</td><td>Hardware and rules</td><td>Rules, identity, routing plan, onboarding</td></tr>
</table>
<div class="note"><p><b>SSE versus SASE.</b> SASE combines networking (such as SD-WAN) with SSE security. This module is about the security half. You will connect branch sites with plain IPsec tunnels, not an SD-WAN fabric.</p></div>

<div class="eg"><p><b>Worked example.</b> A company has 400 staff, 120 of them working remotely, and 12 branches. Before: 120 remote users all tunnel to a pair of HQ firewalls. Each user streams about 5 Mbps of internet traffic, which is 600 Mbps the HQ internet link must carry twice (in and out of the tunnel). After: remote users connect to a nearby Prisma Access location. Only traffic for private applications travels on to HQ. The HQ link now carries a small fraction, and the users get a shorter path.</p></div>

<h3>The lab network you will use</h3>
<p>Every lab in this track uses documentation address ranges so nothing touches a real network. Learn them now: HQ firewall on 192.0.2.10 with the LAN 10.10.0.0/24; branch firewall on 198.51.100.10 with the LAN 10.20.0.0/24; a home laptop on 203.0.113.50; the tenant portal on 203.0.113.100; an infrastructure subnet 10.255.0.0/24 with BGP AS 65534; a mobile user pool 10.200.0.0/23; internal domains end in <code>.example</code>.</p>
<div class="note"><p><b>An honest note about the simulator.</b> Prisma Access is a cloud service run by the vendor. The cloud console in this academy is a <b>teaching model</b>: it shows the real concepts, real field names and the same order of work, but it is simplified. It does not run real SaaS onboarding, licence activation or the real GlobalProtect client logs. When a topic is concept only, the text says so.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking Prisma Access replaces your own firewalls and routing knowledge. You still need correct addressing, routes back to the cloud, identity, and a clean rulebase. The cloud removes the box, not the design.</p></div>

<div class="scn"><h4>The Monday morning video call problem</h4><p>A services company ran a pair of HQ VPN firewalls. Every Monday at 10:00 all remote staff joined video calls and the HQ internet link reached 95 percent; calls froze and nobody could open internal tools. The engineer did not buy a bigger link. Remote staff were moved to Prisma Access, so video traffic left from the nearest cloud location and only internal application traffic went to HQ. The link dropped to a comfortable level the next Monday.</p><p><b>Lesson:</b> the value of SSE is the path, not only the product. Put inspection near the user and send only what must reach HQ.</p></div>

<div class="iv"><p class="q">"What is Prisma Access and what problem does it solve?"</p><p>Strong answer: a cloud-delivered security service (SSE) that terminates mobile users, branch sites and data center links in vendor-run locations and enforces one security policy there. It removes backhaul through HQ, scales without your hardware, and still needs you to plan addressing, routing, identity and policy. Mention that it protects both internet access and private application access.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prisma Access delivers firewall-grade security from vendor cloud locations near users and sites.</li>
<li>SSE is the security half of SASE; SD-WAN is not required.</li>
<li>You still own rules, identity, addressing and routing design.</li>
<li>Labs use documentation ranges, and the cloud console is a teaching model.</li>
<li>Next: the three connection types and the vocabulary used all through the exam.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap zero se shuru karoge aur end tak Palo Alto Networks Prisma Access tenant ki foundations describe, plan aur operate kar paoge. Aap seekhoge ki Security Service Edge (SSE) ka matlab kya hai, Prisma Access mein jodne ke teen tareeke kaun se hain (mobile users, remote networks, service connections), location aur compute location mein kya farak hai, infrastructure subnet, infrastructure BGP AS aur Tenant Service Group (TSG) kya hote hain, licences aur bandwidth kaise count hote hain, Panorama (Cloud Services plugin ke saath) aur Strata Cloud Manager (SCM) mein se kaise choose karna hai, sahi onboarding order kya hai, sirf <i>Commit to Panorama</i> karne se Prisma Access kyun nahi badalta, zones kaise decide karte hain ki kya internet hai aur kya private, aur Security Service Edge Engineer exam kya test karta hai. Phir aap teen labs practise karoge: <b>pa-start-1</b> (tenant aur infrastructure), <b>pa-start-2</b> (Panorama plugin view) aur <b>pa-start-3</b> (ek ticket jahan change commit hua lekin push kabhi nahi hua).</p>
<p><b>Prerequisites.</b> Basic IPv4 subnetting, IPsec VPN tunnel kya karta hai, firewall zone kya hota hai, aur BGP ek line mein kya hai. Palo Alto Networks firewall ka experience (pan-start module) madad karta hai lekin zaroori nahi.</p>

<h3>Analogy se shuru karo: airport ka security hall</h3>
<p>Ek company socho jiska staff ek building mein kaam karta hai. Har visitor front door par ek security hall se guzarta hai. Jab tak sab andar hain yeh kaam karta hai. Ab aadha staff ghar se ya branch offices se kaam karta hai. Agar aap har insaan ko sirf ek web page padhne ke liye head office ke security hall tak bhejoge to line lambi hogi aur safar slow.</p>
<p>Prisma Access aisa hai jaise vendor kai shehron mein ek jaise security halls ki ring khol de, taaki har insaan apne sabse paas ke hall mein check ho. Checks har jagah same hote hain kyunki rules ka ek hi set sabhi halls mein push hota hai. Company ko halls banane ya patch karne nahi padte; sirf rules likhne padte hain.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Users cloud security se apps tak">
<rect x="20" y="30" width="110" height="40" rx="6" fill="#bae6fd"/><text x="75" y="54" text-anchor="middle" class="svg-ink" font-size="12">Home laptop</text>
<rect x="20" y="90" width="110" height="40" rx="6" fill="#bae6fd"/><text x="75" y="114" text-anchor="middle" class="svg-ink" font-size="12">Branch office</text>
<ellipse cx="320" cy="85" rx="110" ry="55" fill="#ddd6fe"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="14">Prisma Access</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">cloud security service</text>
<rect x="510" y="30" width="110" height="40" rx="6" fill="#bbf7d0"/><text x="565" y="54" text-anchor="middle" class="svg-ink" font-size="12">HQ data center</text>
<rect x="510" y="90" width="110" height="40" rx="6" fill="#fed7aa"/><text x="565" y="114" text-anchor="middle" class="svg-ink" font-size="12">Internet aur SaaS</text>
<line x1="130" y1="50" x2="230" y2="75" stroke="#64748b"/><line x1="130" y1="110" x2="230" y2="95" stroke="#64748b"/><line x1="410" y1="75" x2="510" y2="50" stroke="#64748b"/><line x1="410" y1="95" x2="510" y2="110" stroke="#64748b"/>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Har path cloud mein ek baar inspect hota hai, ek rulebase ke saath</text>
</svg><p class="cap">Users aur sites sabse paas ke Prisma Access location se jude hote hain; wahan se traffic data center ya internet jaata hai.</p></div>

<h3>Yeh kaunsa problem solve karta hai</h3>
<p>Kai saal tak remote worker head office firewall tak VPN start karta tha. Saara traffic, video calls aur cloud applications bhi, head office jaake wapas nikalta tha. Isse <b>backhaul</b> kehte hain. Yeh bandwidth waste karta hai, delay badhata hai, aur head office firewall ko single point of failure bana deta hai. Branch offices mein bhi yahi dikkat thi.</p>
<p><b>Security Service Edge (SSE)</b> ka idea hai security functions ko ek building ke box se nahi, balki users ke paas cloud se deliver karna. Typical functions: secure web gateway, firewall as a service, private application access (zero trust style) aur data protection. Prisma Access Palo Alto Networks ki SSE service hai network security ke liye: yeh user aur site connections ko apne locations par terminate karti hai aur wahin aapki security policy lagati hai.</p>
<table class="cmp"><tr><th>Sawaal</th><th>Classic VPN to HQ</th><th>Prisma Access</th></tr>
<tr><td>Traffic kahan inspect hota hai?</td><td>Head office firewall par</td><td>Sabse paas ke cloud location par</td></tr>
<tr><td>Gateways ko patch aur scale kaun karta hai?</td><td>Aapki team</td><td>Service provider</td></tr>
<tr><td>Internet traffic ka path</td><td>HQ ke through backhaul</td><td>Cloud location se seedha bahar</td></tr>
<tr><td>Rulebase</td><td>Har firewall ka alag</td><td>Users aur sites ke liye ek rulebase</td></tr>
<tr><td>Aapke paas kya rehta hai</td><td>Hardware aur rules</td><td>Rules, identity, routing plan, onboarding</td></tr>
</table>
<div class="note"><p><b>SSE versus SASE.</b> SASE networking (jaise SD-WAN) ko SSE security ke saath combine karta hai. Yeh module security wale half ke baare mein hai. Aap branch sites ko plain IPsec tunnels se jodoge, SD-WAN fabric se nahi.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek company mein 400 staff hain, unme se 120 remote, aur 12 branches. Pehle: 120 remote users sab HQ firewalls ki ek pair tak tunnel karte hain. Har user lagbhag 5 Mbps internet traffic stream karta hai, yaani 600 Mbps jo HQ internet link ko do baar (tunnel ke andar aur bahar) carry karna padta hai. Baad mein: remote users paas ke Prisma Access location se jude. Sirf private applications ka traffic aage HQ jaata hai. HQ link ab bahut kam carry karta hai, aur users ko chhota path milta hai.</p></div>

<h3>Lab network jo aap use karoge</h3>
<p>Is track ke har lab mein documentation address ranges use hote hain, taaki asli network ko kuch na chhue. Abhi yaad kar lo: HQ firewall 192.0.2.10 aur LAN 10.10.0.0/24; branch firewall 198.51.100.10 aur LAN 10.20.0.0/24; home laptop 203.0.113.50; tenant portal 203.0.113.100; infrastructure subnet 10.255.0.0/24 aur BGP AS 65534; mobile user pool 10.200.0.0/23; internal domains <code>.example</code> par khatam hote hain.</p>
<div class="note"><p><b>Simulator ke baare mein ek imaandaar note.</b> Prisma Access vendor ki chalayi hui cloud service hai. Is academy ka cloud console ek <b>teaching model</b> hai: yeh asli concepts, asli field names aur kaam ka wahi order dikhata hai, lekin simplified hai. Yeh real SaaS onboarding, licence activation ya real GlobalProtect client logs nahi chalata. Jo topic sirf concept hai, text mein likha hota hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh sochna ki Prisma Access aapke apne firewalls aur routing ki knowledge ko replace kar deta hai. Aapko abhi bhi sahi addressing, cloud tak wapas jaane wale routes, identity aur clean rulebase chahiye. Cloud box hatata hai, design nahi.</p></div>

<div class="scn"><h4>Monday subah ki video call ki dikkat</h4><p>Ek services company ke paas HQ VPN firewalls ki pair thi. Har Monday 10:00 baje saare remote staff video calls join karte the aur HQ internet link 95 percent par pahunch jaata tha; calls freeze hoti thi aur koi internal tools nahi khol paata tha. Engineer ne bada link nahi kharida. Remote staff ko Prisma Access par move kiya, to video traffic sabse paas ke cloud location se nikla aur sirf internal application traffic HQ gaya. Agle Monday link comfortable level par tha.</p><p><b>Seekh:</b> SSE ki value sirf product nahi, path hai. Inspection user ke paas rakho aur sirf wahi HQ bhejo jo wahan pahunchna zaroori hai.</p></div>

<div class="iv"><p class="q">"Prisma Access kya hai aur kaunsa problem solve karta hai?"</p><p>Strong answer: ek cloud-delivered security service (SSE) jo mobile users, branch sites aur data center links ko vendor ke locations par terminate karti hai aur wahin ek security policy enforce karti hai. Yeh HQ ke through backhaul hatati hai, aapke hardware ke bina scale hoti hai, lekin addressing, routing, identity aur policy ka plan aapko hi banana padta hai. Yeh bhi bolo ki yeh internet access aur private application access dono protect karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Prisma Access users aur sites ke paas vendor cloud locations se firewall-grade security deta hai.</li>
<li>SSE SASE ka security half hai; SD-WAN zaroori nahi.</li>
<li>Rules, identity, addressing aur routing design aapki zimmedari rehti hai.</li>
<li>Labs documentation ranges use karte hain, aur cloud console ek teaching model hai.</li>
<li>Aage: teen connection types aur vocabulary jo poore exam mein aati hai.</li>
</ul></div>
`}};export{e as default};