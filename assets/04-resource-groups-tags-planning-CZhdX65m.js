var e=`<svg viewBox="0 0 640 230" role="img" aria-label="Planning an address space">
<rect x="10" y="10" width="620" height="60" rx="8" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="14">VNet address space 10.10.0.0/16 (65,536 addresses)</text><text x="320" y="56" text-anchor="middle" class="svg-muted" font-size="12">chosen from RFC1918 private ranges, never overlapping other networks</text>
<rect x="10" y="100" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="105" y="126" text-anchor="middle" class="svg-ink" font-size="13">snet-web 10.10.1.0/24</text><text x="105" y="146" text-anchor="middle" class="svg-muted" font-size="12">251 usable</text>
<rect x="225" y="100" width="190" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="126" text-anchor="middle" class="svg-ink" font-size="13">snet-app 10.10.2.0/24</text><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">251 usable</text>
<rect x="440" y="100" width="190" height="60" rx="8" fill="#fde68a"/><text x="535" y="126" text-anchor="middle" class="svg-ink" font-size="13">snet-data 10.10.3.0/24</text><text x="535" y="146" text-anchor="middle" class="svg-muted" font-size="12">251 usable</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">10.10.4.0 onward stays free for growth (GatewaySubnet, Bastion, Firewall later)</text>
<g stroke="#64748b" stroke-width="2"><line x1="105" y1="70" x2="105" y2="100"/><line x1="320" y1="70" x2="320" y2="100"/><line x1="535" y1="70" x2="535" y2="100"/></g>
</svg>`,t={id:`resource-groups-tags-planning`,h:{en:`Resource groups in practice: naming, tags, locks and planning an address range`,hi:`Resource groups practice mein: naming, tags, locks aur address range planning`},body:{en:`
<h3>Why a little planning saves a lot of pain</h3>
<p>Most cloud mistakes are not clever attacks. They are an unnamed resource nobody remembers, an overlapping IP range discovered a year later, or a delete that hit the wrong group. A few habits at the start prevent almost all of them. This chapter turns the resource group into your main working tool.</p>

<h3>Resource group rules of thumb</h3>
<ul>
<li><b>Group by life cycle.</b> Things that are created, changed and deleted together belong together. A lab, one application, or one network.</li>
<li><b>One lab = one group.</b> When the lab ends, delete the group.</li>
<li><b>Put shared networking in its own group</b> in real projects, so a team can delete an app without removing the network others use.</li>
<li><b>Mind the region of the group.</b> It stores metadata; if that region has an outage, you may not be able to manage resources in the group, even if they run elsewhere (verify before publishing).</li>
</ul>

<h3>Naming that people can read</h3>
<p>Microsoft's cloud adoption guidance suggests a pattern like <code>type-workload-environment-region-instance</code>. Common type abbreviations: <code>rg</code> resource group, <code>vnet</code> virtual network, <code>snet</code> subnet, <code>nsg</code> network security group, <code>pip</code> public IP, <code>nic</code> network interface, <code>vm</code> virtual machine. Our labs use short names such as <code>rg-nk-lab</code>, <code>vnet-nk</code> and <code>snet-web</code>. Names have rules (length, allowed characters, uniqueness scope) that differ per resource type, so a name that works for a VNet may fail for a storage account. Verify per type.</p>

<h3>Tags: cheap labels that answer money questions</h3>
<p>Tags are name and value pairs. For labs use at least <code>purpose</code>, <code>owner</code> and <code>delete-after</code>. Cost Management can group costs by tag, which turns "what is this charge?" into a one-line answer.</p>
<pre class="code"><span class="c"># create a group with tags</span>
az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=asha delete-after=2026-12-31
<span class="c"># show it</span>
az group show --name rg-nk-lab --query "{name:name, location:location, tags:tags}"</pre>
<p>Illustrative output:</p>
<pre class="out">{
  "name": "rg-nk-lab",
  "location": "centralindia",
  <span class="hl">"tags": { "purpose": "lab", "owner": "asha", "delete-after": "2026-12-31" }</span>
}</pre>

<h3>Locks: a seat belt, not a steering wheel</h3>
<p>A <b>resource lock</b> stops accidental changes. <code>CanNotDelete</code> lets authorised users read and modify but not delete. <code>ReadOnly</code> blocks changes (and can surprise you, because some actions that look like reads are actually writes). Locks apply to a resource, group or subscription and are inherited. Use <code>CanNotDelete</code> on shared networks in production. In a throw-away lab, a lock only gets in the way, so remove it before cleanup.</p>

<h3>Planning an address range</h3>
<p>The VNet address space is the only thing you cannot casually change if other networks connect to it. Plan once.</p>
<ol>
<li><b>Use private ranges (RFC1918):</b> 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Azure also reserves some ranges you cannot use in a VNet, such as 224.0.0.0/4 (multicast), 255.255.255.255/32 (broadcast), 127.0.0.0/8 (loopback), 169.254.0.0/16 (link local) and 168.63.129.16/32 (platform DNS and health probes). Verify the current list before publishing.</li>
<li><b>Never overlap</b> with your office, other VNets you may peer, or an on-premises network you may connect. Overlap blocks peering and VPN routing.</li>
<li><b>Size for growth.</b> A /16 for the VNet and /24 subnets is generous for a lab and common in tutorials.</li>
<li><b>Remember the five reserved addresses per subnet.</b> Chapter 2 of the next module covers them: a /24 gives 256 minus 5 = 251 usable addresses.</li>
<li><b>Leave gaps.</b> Some Azure services need their own named subnet later: <code>GatewaySubnet</code> for VPN gateways, <code>AzureBastionSubnet</code>, <code>AzureFirewallSubnet</code>.</li>
</ol>

<div class="dia">`+e+`<p class="cap">One /16 divided into /24 subnets with room to grow. The same plan works for any lab.</p></div>

<div class="eg"><p><b>Worked example.</b> A team has an office on 192.168.1.0/24 and plans a VPN. They pick 10.10.0.0/16 for the VNet, with no overlap. Subnets: snet-web 10.10.1.0/24, snet-app 10.10.2.0/24, snet-data 10.10.3.0/24. A different team picks 10.10.0.0/16 for their own VNet. When the two later need peering, Azure rejects it, because the ranges overlap. The fix is to rebuild one VNet, which means moving every resource.</p></div>

<div class="warn"><p><b>Common mistake.</b> Copying the tutorial range 10.0.0.0/16 for every project. It is easy to type and almost guarantees an overlap later. Give each environment its own block, for example 10.10.x for lab, 10.20.x for dev, 10.30.x for prod.</p></div>

<div class="exam"><p><b>Exam trap.</b> You can add address space to an existing VNet, but you cannot create overlapping ranges inside the same VNet, and peered networks must not overlap. Subnets must fit inside the VNet address space and must not overlap each other.</p></div>

<div class="scn"><h4>Two teams, one 10.0.0.0/16</h4><p>Two project teams each built a VNet with the tutorial range 10.0.0.0/16. Months later management asked to connect them. Peering failed with an overlap error. The teams spent a weekend rebuilding one VNet in 10.20.0.0/16. Afterwards they kept a shared address plan in a spreadsheet and added a Policy check for the allowed ranges.</p><p><b>Lesson:</b> address planning is cheap on day one and expensive on day 300.</p></div>

<div class="iv"><p class="q">"How do you choose address ranges for a new Azure environment?"</p><p>Use RFC1918, keep a central address plan, never overlap with on-premises or other VNets, size subnets for growth, leave space for gateway, Bastion and firewall subnets, and remember five addresses per subnet are reserved by Azure.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Group resources by life cycle; one lab equals one resource group.</li>
<li>Use readable names and at least purpose, owner and delete-after tags.</li>
<li>CanNotDelete locks protect shared networks; remove them before deleting a lab.</li>
<li>Use RFC1918 ranges and never overlap with networks you may connect.</li>
<li>Leave space for GatewaySubnet, AzureBastionSubnet and AzureFirewallSubnet.</li>
</ul></div>
`,hi:`
<h3>Thodi planning se bahut dard bachta hai</h3>
<p>Zyadatar cloud galtiyan clever attacks nahi hoti. Woh ek unnamed resource hota hai jo kisi ko yaad nahi, ek overlapping IP range jo saal bhar baad pata chalti hai, ya ek delete jo galat group par lag gaya. Shuru ki kuch aadatein inme se lagbhag sab rok deti hain. Yeh chapter resource group ko aapka main working tool banata hai.</p>

<h3>Resource group ke rules of thumb</h3>
<ul>
<li><b>Life cycle ke hisaab se group karo.</b> Jo cheezein saath banti, badalti aur delete hoti hain woh saath rakho. Ek lab, ek application, ya ek network.</li>
<li><b>Ek lab = ek group.</b> Lab khatam, group delete.</li>
<li><b>Real projects mein shared networking ko alag group mein rakho</b>, taki team ek app delete kare to doosron ka network na hate.</li>
<li><b>Group ke region ka dhyan rakho.</b> Woh metadata store karta hai; agar us region mein outage ho to group ke resources doosri jagah chalte hon tab bhi aap unhe manage nahi kar paoge (verify before publishing).</li>
</ul>

<h3>Naming jo log padh sakein</h3>
<p>Microsoft ki cloud adoption guidance <code>type-workload-environment-region-instance</code> jaisa pattern suggest karti hai. Common type abbreviations: <code>rg</code> resource group, <code>vnet</code> virtual network, <code>snet</code> subnet, <code>nsg</code> network security group, <code>pip</code> public IP, <code>nic</code> network interface, <code>vm</code> virtual machine. Hamare labs mein chhote naam hain jaise <code>rg-nk-lab</code>, <code>vnet-nk</code> aur <code>snet-web</code>. Naming ke rules (length, allowed characters, uniqueness scope) har resource type ke liye alag hote hain, isliye jo naam VNet ke liye chalta hai woh storage account ke liye fail ho sakta hai. Har type ke liye verify karo.</p>

<h3>Tags: sasti labels jo paise ke sawal ka jawab deti hain</h3>
<p>Tags name aur value ke pair hote hain. Labs ke liye kam se kam <code>purpose</code>, <code>owner</code> aur <code>delete-after</code> use karo. Cost Management tag ke hisaab se cost group kar sakta hai, jisse "yeh charge kya hai?" ek line ka jawab ban jata hai.</p>
<pre class="code"><span class="c"># tags ke saath group banao</span>
az group create --name rg-nk-lab --location centralindia --tags purpose=lab owner=asha delete-after=2026-12-31
<span class="c"># dikhao</span>
az group show --name rg-nk-lab --query "{name:name, location:location, tags:tags}"</pre>
<p>Illustrative output:</p>
<pre class="out">{
  "name": "rg-nk-lab",
  "location": "centralindia",
  <span class="hl">"tags": { "purpose": "lab", "owner": "asha", "delete-after": "2026-12-31" }</span>
}</pre>

<h3>Locks: seat belt, steering wheel nahi</h3>
<p><b>Resource lock</b> accidental changes rokta hai. <code>CanNotDelete</code> authorised users ko read aur modify karne deta hai lekin delete nahi. <code>ReadOnly</code> changes block karta hai (aur surprise de sakta hai, kyunki kuch actions jo read lagte hain asal mein write hote hain). Locks resource, group ya subscription par lagte hain aur inherit hote hain. Production mein shared networks par <code>CanNotDelete</code> use karo. Throw-away lab mein lock sirf raste mein aata hai, isliye cleanup se pehle hata do.</p>

<h3>Address range plan karna</h3>
<p>VNet address space woh cheez hai jise aap aasaani se badal nahi sakte agar doosre networks us se jude hon. Ek baar achhe se plan karo.</p>
<ol>
<li><b>Private ranges (RFC1918) use karo:</b> 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Azure kuch ranges bhi reserve karta hai jo VNet mein use nahi kar sakte, jaise 224.0.0.0/4 (multicast), 255.255.255.255/32 (broadcast), 127.0.0.0/8 (loopback), 169.254.0.0/16 (link local) aur 168.63.129.16/32 (platform DNS aur health probes). Current list publish karne se pehle verify karo.</li>
<li><b>Kabhi overlap mat karo</b> office, doosre VNets jinhe peer kar sakte ho, ya on-premises network ke saath jisse jud sakte ho. Overlap peering aur VPN routing block karta hai.</li>
<li><b>Growth ke liye size karo.</b> Lab ke liye VNet ka /16 aur subnets /24 kaafi generous hai aur tutorials mein common hai.</li>
<li><b>Har subnet ke paanch reserved addresses yaad rakho.</b> Agle module ka chapter 2 batata hai: /24 mein 256 minus 5 = 251 usable addresses.</li>
<li><b>Gaps chhodo.</b> Kuch Azure services ko baad mein apna named subnet chahiye: VPN gateways ke liye <code>GatewaySubnet</code>, <code>AzureBastionSubnet</code>, <code>AzureFirewallSubnet</code>.</li>
</ol>

<div class="dia">`+e+`<p class="cap">Ek /16 jo /24 subnets mein bata hai aur growth ke liye jagah hai. Yahi plan kisi bhi lab ke liye chalta hai.</p></div>

<div class="eg"><p><b>Worked example.</b> Ek team ka office 192.168.1.0/24 par hai aur woh VPN plan kar rahi hai. Woh VNet ke liye 10.10.0.0/16 chunti hai, overlap nahi. Subnets: snet-web 10.10.1.0/24, snet-app 10.10.2.0/24, snet-data 10.10.3.0/24. Doosri team apne VNet ke liye bhi 10.10.0.0/16 chunti hai. Baad mein jab dono ko peering chahiye, Azure reject kar deta hai kyunki ranges overlap hoti hain. Fix hai ek VNet dobara banana, matlab har resource move karna.</p></div>

<div class="warn"><p><b>Common mistake.</b> Har project ke liye tutorial range 10.0.0.0/16 copy karna. Type karna aasaan hai aur baad mein overlap lagbhag pakka. Har environment ko apna block do, jaise lab ke liye 10.10.x, dev ke liye 10.20.x, prod ke liye 10.30.x.</p></div>

<div class="exam"><p><b>Exam trap.</b> Maujooda VNet mein address space add kar sakte ho, lekin ek hi VNet ke andar overlapping ranges nahi bana sakte, aur peered networks overlap nahi kar sakte. Subnets VNet address space ke andar fit hone chahiye aur ek doosre se overlap nahi karne chahiye.</p></div>

<div class="scn"><h4>Do teams, ek 10.0.0.0/16</h4><p>Do project teams ne tutorial range 10.0.0.0/16 se apne VNet banaye. Mahino baad management ne dono ko connect karne ko kaha. Peering overlap error ke saath fail hui. Teams ne ek weekend ek VNet ko 10.20.0.0/16 mein dobara banane mein lagaya. Uske baad unhone shared address plan spreadsheet mein rakha aur allowed ranges ke liye Policy check lagaya.</p><p><b>Lesson:</b> address planning din 1 par sasti hai aur din 300 par mehngi.</p></div>

<div class="iv"><p class="q">"Naye Azure environment ke liye address ranges kaise chunte ho?"</p><p>RFC1918 use karo, central address plan rakho, on-premises ya doosre VNets ke saath kabhi overlap mat karo, subnets growth ke liye size karo, gateway, Bastion aur firewall subnets ke liye jagah chhodo, aur yaad rakho ki har subnet ke paanch addresses Azure reserve karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Life cycle ke hisaab se group karo; ek lab barabar ek resource group.</li>
<li>Readable names aur kam se kam purpose, owner, delete-after tags use karo.</li>
<li>CanNotDelete locks shared networks bachate hain; lab delete karne se pehle hata do.</li>
<li>RFC1918 ranges use karo aur jin networks se jud sakte ho unse overlap mat karo.</li>
<li>GatewaySubnet, AzureBastionSubnet aur AzureFirewallSubnet ke liye jagah chhodo.</li>
</ul></div>
`}};export{t as default};