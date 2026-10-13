var e={id:`purpose-big-picture`,h:{en:`Service connections: purpose and the big picture`,hi:`Service connections: purpose aur big picture`},body:{en:`
<h3>What you will learn</h3>
<p>In this module you connect Prisma Access to your headquarters (HQ) or data centre. You will learn why service connections exist, how mobile users reach branches through them (hub and spoke), how to create one in Strata Cloud Manager (SCM) or Panorama, how to build the tunnel and BGP on the HQ firewall, how Source NAT works for mobile users, which backbone routing options exist, which return routes HQ needs, and how to troubleshoot "no return path".</p>
<p><b>Prerequisites:</b> pa-start (tenant, infrastructure subnet, Commit and Push), pa-mobile (GlobalProtect and the mobile pool) and pa-remote (branch IPsec and BGP). We recap the IPsec parts only briefly.</p>

<h3>An analogy: the national courier and your own warehouse</h3>
<p>Think of the courier company again. Branch post offices and travelling salespeople (mobile users) hand parcels to the courier's regional sorting centres. But some parcels must go to your own warehouse, where your inventory, your payroll system and your internal servers live. For that, the courier builds one special locked corridor between its network and your warehouse. That corridor is a <b>service connection</b>.</p>

<h3>What is a service connection?</h3>
<p>A service connection is an IPsec tunnel from Prisma Access to your HQ or data centre. The docs also call these Corporate Access Nodes. Each one has a geographically registered service endpoint. Its purposes are:</p>
<ul>
<li>Let mobile users and remote networks reach <b>internal resources</b> such as the app server 10.10.0.50.</li>
<li>Reach <b>authentication and DNS servers</b> in the corporate network (our DNS is 10.10.0.53).</li>
<li>Act as the <b>hub</b> in a hub-and-spoke design: the docs state that mobile users reach remote networks through a service connection.</li>
</ul>
<p>Internet egress over a service connection is <b>not</b> supported. A service connection is for private corporate access, not for sending internet traffic to HQ.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Hub and spoke">
<rect x="230" y="90" width="180" height="80" rx="12" fill="#bae6fd"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="14">Prisma Access</text><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">backbone 10.255.0.0/24</text>
<rect x="20" y="20" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="95" y="50" text-anchor="middle" class="svg-ink" font-size="13">Mobile users</text><text x="95" y="70" text-anchor="middle" class="svg-muted" font-size="12">pool 10.200.0.0/23</text>
<rect x="20" y="170" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="95" y="200" text-anchor="middle" class="svg-ink" font-size="13">Branch BR-FW</text><text x="95" y="220" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/24</text>
<rect x="470" y="90" width="150" height="80" rx="10" fill="#fde68a"/><text x="545" y="122" text-anchor="middle" class="svg-ink" font-size="13">HQ-FW</text><text x="545" y="144" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/24, AS 65002</text>
<line x1="170" y1="55" x2="230" y2="115" stroke="#64748b" stroke-width="2"/><line x1="170" y1="205" x2="230" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="130" x2="470" y2="130" stroke="#64748b" stroke-width="4"/><text x="440" y="120" text-anchor="middle" class="svg-accent" font-size="11">service conn.</text>
</svg><p class="cap">Mobile users and branches reach HQ through the service connection.</p></div>

<h3>Mobile users and remote networks: why the hub matters</h3>
<p>Remote networks are meshed with each other, so branches reach branches. Mobile users and branches normally meet through a service connection. In our lab, the laptop (LAPTOP-HOME) reaching PC-BR (10.20.0.100) follows the hub-and-spoke path described in the documentation.</p>

<h3>License limits</h3>
<ul>
<li>Base licences allow up to <b>5</b> service connections.</li>
<li>The Private Application add-on allows up to <b>200</b> per tenant.</li>
</ul>
<p>At least one service connection (even with placeholder values) must exist before GlobalProtect gateways can reach the corporate side, which is why pa-mobile asked you to create a placeholder.</p>

<div class="eg"><p><b>Worked example (lab plan).</b> HQ-FW has WAN 192.0.2.10 and LAN 10.10.0.1/24, BGP AS 65002. The tenant service-connection endpoint is 203.0.113.102. The app server is 10.10.0.50 and DNS is 10.10.0.53. Prisma Access uses the infrastructure subnet 10.255.0.0/24 and AS 65534, and the mobile pool is 10.200.0.0/23. After pa-service, LAPTOP-HOME (203.0.113.50) reaches 10.10.0.50 through the tunnel.</p></div>

<div class="note"><p><b>Teaching model.</b> The cloud console in this course is a simplified model. The HQ-FW commands and checks are real PAN-OS ones. Endpoint addresses use documentation ranges.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Using a service connection for internet egress; thinking one service connection is enough for any amount of HQ traffic; forgetting that the corporate side also needs routes back to Prisma Access (chapter 6).</p></div>
<div class="exam"><p><b>Exam trap.</b> Service connection equals HQ or data centre (Corporate Access Node). Remote network equals branch. Limits: 5 base, up to 200 with the Private Application add-on.</p></div>

<div class="scn"><h4>Laptop connects but cannot reach the app</h4><p>A pilot user connected GlobalProtect from home, got an address from 10.200.0.0/23, yet the internal portal did not open. The team had onboarded mobile users but never built the service connection to HQ. Once the tunnel and routes existed, the portal opened.</p><p><b>Lesson:</b> a connected client is not a reachable data centre. The service connection is the bridge.</p></div>

<div class="iv"><p class="q">"What is a service connection in Prisma Access?"</p><p>An IPsec tunnel from Prisma Access to the HQ or data centre, also called a Corporate Access Node. It lets mobile users and remote networks reach internal resources and authentication servers, and acts as the hub between mobile users and remote networks. It does not support internet egress.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A service connection links Prisma Access to HQ or a data centre.</li>
<li>It is the hub for mobile-user to branch traffic.</li>
<li>Internet egress over it is not supported.</li>
<li>Limits: 5 base, 200 with the Private Application add-on.</li>
<li>HQ must route back to Prisma Access address space.</li>
</ul></div>
`,hi:`
<h3>Is chapter mein aap kya seekhoge</h3>
<p>Is module mein aap Prisma Access ko apne headquarters (HQ) ya data centre se connect karoge. Aap seekhoge ki service connections kyun hote hain, mobile users unke through branches tak kaise pahunchte hain (hub and spoke), SCM ya Panorama mein ek kaise banate hain, HQ firewall par tunnel aur BGP kaise banate hain, mobile users ke liye Source NAT kaise kaam karta hai, kaun se backbone routing options hain, HQ ko kaun se return routes chahiye, aur "no return path" ka troubleshooting kaise karte hain.</p>
<p><b>Prerequisites:</b> pa-start (tenant, infrastructure subnet, Commit and Push), pa-mobile (GlobalProtect aur mobile pool) aur pa-remote (branch IPsec aur BGP). IPsec ke parts ka sirf chhota recap hoga.</p>

<h3>Analogy: national courier aur aapka apna warehouse</h3>
<p>Courier company dobara socho. Branch post offices aur travelling salespeople (mobile users) parcels courier ke regional sorting centres ko dete hain. Lekin kuch parcels aapke apne warehouse jaane hain, jahan aapka inventory, payroll system aur internal servers hain. Uske liye courier apne network aur aapke warehouse ke beech ek special locked corridor banata hai. Yahi corridor <b>service connection</b> hai.</p>

<h3>Service connection kya hai?</h3>
<p>Service connection Prisma Access se aapke HQ ya data centre tak IPsec tunnel hai. Docs ise Corporate Access Node bhi kehte hain. Har ek ka geographically registered service endpoint hota hai. Iske purposes:</p>
<ul>
<li>Mobile users aur remote networks ko <b>internal resources</b> tak pahunchana, jaise app server 10.10.0.50.</li>
<li>Corporate network ke <b>authentication aur DNS servers</b> tak pahunchna (hamara DNS 10.10.0.53 hai).</li>
<li>Hub-and-spoke design mein <b>hub</b> ban-na: docs kehte hain ki mobile users remote networks tak service connection ke through pahunchte hain.</li>
</ul>
<p>Service connection par internet egress <b>supported nahi</b> hai. Service connection private corporate access ke liye hai, internet traffic HQ bhejne ke liye nahi.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Hub and spoke">
<rect x="230" y="90" width="180" height="80" rx="12" fill="#bae6fd"/><text x="320" y="122" text-anchor="middle" class="svg-ink" font-size="14">Prisma Access</text><text x="320" y="144" text-anchor="middle" class="svg-muted" font-size="12">backbone 10.255.0.0/24</text>
<rect x="20" y="20" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="95" y="50" text-anchor="middle" class="svg-ink" font-size="13">Mobile users</text><text x="95" y="70" text-anchor="middle" class="svg-muted" font-size="12">pool 10.200.0.0/23</text>
<rect x="20" y="170" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="95" y="200" text-anchor="middle" class="svg-ink" font-size="13">Branch BR-FW</text><text x="95" y="220" text-anchor="middle" class="svg-muted" font-size="12">10.20.0.0/24</text>
<rect x="470" y="90" width="150" height="80" rx="10" fill="#fde68a"/><text x="545" y="122" text-anchor="middle" class="svg-ink" font-size="13">HQ-FW</text><text x="545" y="144" text-anchor="middle" class="svg-muted" font-size="12">10.10.0.0/24, AS 65002</text>
<line x1="170" y1="55" x2="230" y2="115" stroke="#64748b" stroke-width="2"/><line x1="170" y1="205" x2="230" y2="150" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="130" x2="470" y2="130" stroke="#64748b" stroke-width="4"/><text x="440" y="120" text-anchor="middle" class="svg-accent" font-size="11">service conn.</text>
</svg><p class="cap">Mobile users aur branches service connection se HQ tak pahunchte hain.</p></div>

<h3>Mobile users aur remote networks: hub kyun important hai</h3>
<p>Remote networks aapas mein meshed hain, to branches branches tak pahunchte hain. Mobile users aur branches aam taur par service connection ke through milte hain. Hamari lab mein laptop (LAPTOP-HOME) jab PC-BR (10.20.0.100) tak jaata hai to documentation mein bataye hub-and-spoke path ko follow karta hai.</p>

<h3>License limits</h3>
<ul>
<li>Base licences up to <b>5</b> service connections allow karte hain.</li>
<li>Private Application add-on per tenant up to <b>200</b> allow karta hai.</li>
</ul>
<p>GlobalProtect gateways corporate side tak pahunch sakein, isse pehle kam se kam ek service connection (placeholder values ke saath bhi) hona zaroori hai, isliye pa-mobile ne placeholder banane ko kaha tha.</p>

<div class="eg"><p><b>Worked example (lab plan).</b> HQ-FW ka WAN 192.0.2.10 aur LAN 10.10.0.1/24 hai, BGP AS 65002. Tenant ka service-connection endpoint 203.0.113.102 hai. App server 10.10.0.50 aur DNS 10.10.0.53 hai. Prisma Access infrastructure subnet 10.255.0.0/24 aur AS 65534 use karta hai, aur mobile pool 10.200.0.0/23 hai. pa-service ke baad LAPTOP-HOME (203.0.113.50) tunnel ke through 10.10.0.50 tak pahunchta hai.</p></div>

<div class="note"><p><b>Teaching model.</b> Is course ka cloud console simplified model hai. HQ-FW ke commands aur checks asli PAN-OS ke hain. Endpoint addresses documentation ranges use karte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Service connection ko internet egress ke liye use karna; yeh sochna ki ek service connection kisi bhi amount ke HQ traffic ke liye kaafi hai; yeh bhoolna ki corporate side ko bhi Prisma Access ke routes wapas chahiye (chapter 6).</p></div>
<div class="exam"><p><b>Exam trap.</b> Service connection matlab HQ ya data centre (Corporate Access Node). Remote network matlab branch. Limits: base 5, Private Application add-on ke saath 200 tak.</p></div>

<div class="scn"><h4>Laptop connect hota hai par app nahi khulta</h4><p>Pilot user ne ghar se GlobalProtect connect kiya, 10.200.0.0/23 se address mila, phir bhi internal portal nahi khula. Team ne mobile users onboard kiye the par HQ tak service connection kabhi nahi banaya. Tunnel aur routes aate hi portal khul gaya.</p><p><b>Lesson:</b> connected client ka matlab reachable data centre nahi. Service connection bridge hai.</p></div>

<div class="iv"><p class="q">"Prisma Access mein service connection kya hai?"</p><p>Prisma Access se HQ ya data centre tak IPsec tunnel, jise Corporate Access Node bhi kehte hain. Isse mobile users aur remote networks internal resources aur authentication servers tak pahunchte hain, aur yeh mobile users aur remote networks ke beech hub ka kaam karta hai. Internet egress support nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Service connection Prisma Access ko HQ ya data centre se jodta hai.</li>
<li>Mobile-user se branch traffic ke liye hub hai.</li>
<li>Internet egress supported nahi.</li>
<li>Limits: base 5, Private Application add-on ke saath 200.</li>
<li>HQ ko Prisma Access address space ke routes wapas chahiye.</li>
</ul></div>
`}};export{e as default};