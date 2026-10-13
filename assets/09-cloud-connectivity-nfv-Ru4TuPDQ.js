var e={id:`cloud-connectivity-nfv`,h:{en:`Reaching the cloud and virtual network functions (NFV)`,hi:`Cloud tak pahunchna aur virtual network functions (NFV)`},body:{en:`
<p>A company that moves its warehouse to another city must decide how goods travel there. It can use public roads (cheap, available everywhere, but traffic jams are out of its control), put goods in a locked armoured truck on those same roads (safer, still public traffic), or rent a private rail line (predictable and fast, but expensive and slow to set up). Connecting an enterprise to a public cloud involves exactly the same choices.</p>

<h3>Option 1: the public internet</h3>
<p>The simplest path: users and branches reach cloud services over their normal internet connection. For <b>SaaS</b> this is the normal design; the application itself encrypts traffic with TLS (HTTPS).</p>
<ul>
<li>Pros: no extra setup, works from anywhere, cheap, easy to switch providers.</li>
<li>Cons: no QoS or latency guarantee across the internet, and traffic to private resources (IaaS VMs) needs extra protection.</li>
</ul>

<h3>Option 2: internet VPN</h3>
<p>A <b>site-to-site IPsec VPN</b> builds an encrypted tunnel across the internet between the enterprise router or firewall and a VPN gateway inside the cloud (a provider VPN service or a virtual router you run there). Remote workers can use a <b>remote-access VPN</b> in the same way. The tunnel makes the cloud's private subnets look like just another site.</p>
<ul>
<li>Pros: confidentiality and integrity, reuses existing internet links, quick to set up.</li>
<li>Cons: still no internet QoS; encryption overhead; bandwidth limited by the internet link and the VPN gateway.</li>
</ul>
<pre class="out">R1# show ip route 10.200.0.0
Routing entry for 10.200.0.0/16
  Known via "static", distance 1, metric 0 (connected)
  Routing Descriptor Blocks:
<span class="hl">  * directly connected, via Tunnel1</span>
      Route metric is 0, traffic share count is 1</pre>
<p>Here the branch router sends everything for the cloud's private range 10.200.0.0/16 into Tunnel1, the IPsec tunnel to the cloud VPN gateway. IPsec itself is taught in the security concepts module.</p>

<h3>Option 3: private WAN</h3>
<p>The enterprise extends its existing <b>private WAN</b>, for example an MPLS VPN or a leased Ethernet WAN service from a carrier, to the cloud provider. Many providers offer a <b>dedicated connection</b> product where a circuit from your carrier or colocation site lands directly on the provider's edge.</p>
<ul>
<li>Pros: predictable latency and bandwidth, carrier SLAs and QoS, traffic never crosses the public internet.</li>
<li>Cons: expensive, takes weeks to provision, ties you to specific locations; moving to another cloud means new circuits.</li>
</ul>

<h3>Option 4: intercloud exchange</h3>
<p>An <b>intercloud exchange</b> is a third-party provider, usually in a large colocation data center, that is already connected to many cloud providers. The enterprise buys <b>one</b> private link to the exchange, then creates virtual connections to any cloud through it.</p>
<ul>
<li>Pros: one circuit reaches several clouds; changing or adding a cloud is a software change; private and predictable like a WAN.</li>
<li>Cons: another provider and contract; the exchange location must be reachable from your sites.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Cloud connectivity options">
<rect x="20" y="110" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="133" text-anchor="middle" class="svg-ink" font-size="13">Enterprise</text><text x="80" y="150" text-anchor="middle" class="svg-muted" font-size="12">HQ and branches</text>
<rect x="500" y="30" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="57" text-anchor="middle" class="svg-ink" font-size="13">Cloud A</text>
<rect x="500" y="200" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="227" text-anchor="middle" class="svg-ink" font-size="13">Cloud B</text>
<rect x="250" y="20" width="140" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="12">Internet (+ VPN)</text>
<rect x="250" y="116" width="140" height="36" rx="8" fill="#fde68a"/><text x="320" y="139" text-anchor="middle" class="svg-ink" font-size="12">Private WAN (MPLS)</text>
<rect x="250" y="212" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="12">Intercloud exchange</text>
<line x1="140" y1="120" x2="250" y2="40" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="390" y1="38" x2="500" y2="50" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="140" y1="135" x2="250" y2="135" stroke="#64748b" stroke-width="3"/><line x1="390" y1="134" x2="500" y2="60" stroke="#64748b" stroke-width="3"/>
<line x1="140" y1="150" x2="250" y2="228" stroke="#64748b" stroke-width="3"/><line x1="390" y1="226" x2="500" y2="70" stroke="#64748b" stroke-width="2"/><line x1="390" y1="232" x2="500" y2="222" stroke="#64748b" stroke-width="2"/>
<text x="320" y="272" text-anchor="middle" class="svg-muted" font-size="12">one exchange link reaches several clouds</text>
</svg><p class="cap">Three paths to the cloud: internet with a VPN, a private WAN, or one link to an intercloud exchange that fans out to several clouds.</p></div>

<table class="cmp"><tr><th></th><th>Internet</th><th>Internet VPN</th><th>Private WAN</th><th>Intercloud exchange</th></tr>
<tr><td>Security</td><td>app-level (TLS)</td><td>IPsec encryption</td><td>private network</td><td>private network</td></tr>
<tr><td>QoS / SLA</td><td>no</td><td>no</td><td>yes</td><td>yes</td></tr>
<tr><td>Cost / setup time</td><td>low / none</td><td>low / hours</td><td>high / weeks</td><td>medium / days to weeks</td></tr>
<tr><td>Changing cloud provider</td><td>easy</td><td>easy</td><td>hard</td><td>easy</td></tr></table>

<h3>Network functions virtualization (NFV)</h3>
<p>Routers, firewalls, load balancers and WAN optimisers used to be dedicated appliances. <b>NFV</b> runs these <b>network functions as software</b>, as VMs or containers on standard x86 servers. Each one is a <b>VNF</b> (virtual network function). The ETSI NFV framework names three parts: the VNFs, the <b>NFVI</b> (the servers, hypervisors and virtual networks they run on) and <b>MANO</b> (management and orchestration, which deploys and scales them).</p>
<p>Examples: Cisco Catalyst 8000V (a virtual IOS XE router), virtual ASA or Secure Firewall Threat Defense Virtual, and virtual load balancers. In the cloud, you cannot install a physical router, so a VNF is often <b>the</b> VPN endpoint or firewall inside your virtual network. At branches, a single <b>uCPE</b> server can replace a router, firewall and WAN optimiser.</p>

<div class="eg"><p><b>Worked example.</b> A retailer with 200 stores and two clouds. Stores already have MPLS plus internet. Design: the two data centers connect to an intercloud exchange with one 10 Gbps private link each, with virtual connections to cloud A and cloud B. Stores keep using MPLS to the data centers, and use a local internet VPN as backup. Inside each cloud a pair of virtual routers (VNFs) terminates the connections and applies the same routing policy as on-premises.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming a VPN gives guaranteed performance. IPsec protects traffic, but it still rides the best-effort internet. Latency-sensitive traffic such as voice or database replication needs a private WAN or exchange connection.</p></div>

<div class="exam"><p><b>Exam trap.</b> The intercloud exchange's selling point is <b>connecting to multiple cloud providers through one private connection</b> and switching providers easily. A private WAN's selling point is QoS and SLA; internet VPN's is cheap, fast and secure.</p></div>

<div class="scn"><h4>Choppy calls after the migration</h4><p>A company moved its call-control servers to IaaS and connected them with an IPsec VPN over the office internet link. Every afternoon, when staff started large uploads, calls became choppy. The VPN was healthy, but the internet path could not prioritise voice. Moving voice traffic to a dedicated private connection with QoS, and keeping the VPN as backup, solved it.</p><p><b>Lesson:</b> encryption is not quality. Choose the connectivity model based on the traffic's needs.</p></div>

<div class="iv"><p class="q">"How would you connect an enterprise to a public cloud?"</p><p>Compare the four options with trade-offs: internet (SaaS, simple), site-to-site IPsec VPN (secure, cheap, fast to deploy, no QoS), private WAN or dedicated link (predictable, SLA, costly, slow to provision) and intercloud exchange (one link to many clouds, easy to switch). Recommend VPN as backup to a private option for critical traffic, and mention running virtual routers or firewalls (NFV) inside the cloud to terminate the connection.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Internet: simplest, SaaS-friendly, no QoS; internet VPN: IPsec over the internet, cheap and quick, still no QoS.</li>
<li>Private WAN or dedicated link: predictable and SLA-backed, but expensive, slow to set up and hard to move.</li>
<li>Intercloud exchange: one private link to a provider that connects to many clouds; switching clouds is easy.</li>
<li>NFV runs routers, firewalls and load balancers as software (VNFs) on standard servers; parts are VNF, NFVI and MANO.</li>
<li>In the cloud, a VNF is often the VPN endpoint or firewall of your virtual network.</li>
</ul></div>
`,hi:`
<p>Jo company apna warehouse doosre shehar mein le jaati hai use decide karna padta hai ki maal wahan kaise jaayega. Woh public roads use kar sakti hai (sasta, har jagah available, par traffic jam uske control mein nahi), usi road par maal ko locked armoured truck mein rakh sakti hai (zyada safe, phir bhi public traffic), ya private rail line kiraye par le sakti hai (predictable aur tez, par mehenga aur set up karne mein dheema). Enterprise ko public cloud se jodne mein bilkul yahi choices hoti hain.</p>

<h3>Option 1: public internet</h3>
<p>Sabse simple raasta: users aur branches apne normal internet connection se cloud services tak pahunchte hain. <b>SaaS</b> ke liye yahi normal design hai; application khud traffic ko TLS (HTTPS) se encrypt karti hai.</p>
<ul>
<li>Pros: koi extra setup nahi, kahin se bhi kaam karta hai, sasta, providers badalna aasaan.</li>
<li>Cons: internet par koi QoS ya latency guarantee nahi, aur private resources (IaaS VMs) tak ke traffic ko extra protection chahiye.</li>
</ul>

<h3>Option 2: internet VPN</h3>
<p><b>Site-to-site IPsec VPN</b> internet par enterprise router ya firewall aur cloud ke andar ke VPN gateway (provider ki VPN service ya wahan aapka chalaya virtual router) ke beech encrypted tunnel banata hai. Remote workers isi tarah <b>remote-access VPN</b> use kar sakte hain. Tunnel cloud ke private subnets ko bas ek aur site jaisa bana deta hai.</p>
<ul>
<li>Pros: confidentiality aur integrity, existing internet links reuse hote hain, jaldi set up.</li>
<li>Cons: phir bhi internet QoS nahi; encryption overhead; bandwidth internet link aur VPN gateway se limited.</li>
</ul>
<pre class="out">R1# show ip route 10.200.0.0
Routing entry for 10.200.0.0/16
  Known via "static", distance 1, metric 0 (connected)
  Routing Descriptor Blocks:
<span class="hl">  * directly connected, via Tunnel1</span>
      Route metric is 0, traffic share count is 1</pre>
<p>Yahan branch router cloud ki private range 10.200.0.0/16 ka sab kuch Tunnel1 mein bhejta hai, jo cloud VPN gateway tak ka IPsec tunnel hai. IPsec khud security concepts module mein padhaya jaata hai.</p>

<h3>Option 3: private WAN</h3>
<p>Enterprise apne existing <b>private WAN</b> ko, jaise carrier ki MPLS VPN ya leased Ethernet WAN service, cloud provider tak extend karta hai. Kai providers <b>dedicated connection</b> product dete hain jismein aapke carrier ya colocation site ka circuit seedha provider ke edge par land karta hai.</p>
<ul>
<li>Pros: predictable latency aur bandwidth, carrier SLAs aur QoS, traffic kabhi public internet cross nahi karta.</li>
<li>Cons: mehenga, provision hone mein hafte lagte hain, aapko specific locations se baandh deta hai; doosre cloud par jaane ka matlab naye circuits.</li>
</ul>

<h3>Option 4: intercloud exchange</h3>
<p><b>Intercloud exchange</b> ek third-party provider hai, aam taur par bade colocation data center mein, jo pehle se kai cloud providers se juda hota hai. Enterprise exchange tak <b>ek</b> private link khareedta hai, phir uske through kisi bhi cloud tak virtual connections banata hai.</p>
<ul>
<li>Pros: ek circuit kai clouds tak pahunchta hai; cloud badalna ya jodna software change hai; WAN jaisa private aur predictable.</li>
<li>Cons: ek aur provider aur contract; exchange location aapki sites se reachable honi chahiye.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 280" role="img" aria-label="Cloud connectivity options">
<rect x="20" y="110" width="120" height="50" rx="8" fill="#bae6fd"/><text x="80" y="133" text-anchor="middle" class="svg-ink" font-size="13">Enterprise</text><text x="80" y="150" text-anchor="middle" class="svg-muted" font-size="12">HQ aur branches</text>
<rect x="500" y="30" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="57" text-anchor="middle" class="svg-ink" font-size="13">Cloud A</text>
<rect x="500" y="200" width="120" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="227" text-anchor="middle" class="svg-ink" font-size="13">Cloud B</text>
<rect x="250" y="20" width="140" height="36" rx="8" fill="#e2e8f0"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="12">Internet (+ VPN)</text>
<rect x="250" y="116" width="140" height="36" rx="8" fill="#fde68a"/><text x="320" y="139" text-anchor="middle" class="svg-ink" font-size="12">Private WAN (MPLS)</text>
<rect x="250" y="212" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="235" text-anchor="middle" class="svg-ink" font-size="12">Intercloud exchange</text>
<line x1="140" y1="120" x2="250" y2="40" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="390" y1="38" x2="500" y2="50" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="140" y1="135" x2="250" y2="135" stroke="#64748b" stroke-width="3"/><line x1="390" y1="134" x2="500" y2="60" stroke="#64748b" stroke-width="3"/>
<line x1="140" y1="150" x2="250" y2="228" stroke="#64748b" stroke-width="3"/><line x1="390" y1="226" x2="500" y2="70" stroke="#64748b" stroke-width="2"/><line x1="390" y1="232" x2="500" y2="222" stroke="#64748b" stroke-width="2"/>
<text x="320" y="272" text-anchor="middle" class="svg-muted" font-size="12">ek exchange link kai clouds tak pahunchta hai</text>
</svg><p class="cap">Cloud tak teen raaste: VPN ke saath internet, private WAN, ya intercloud exchange tak ek link jo kai clouds tak failta hai.</p></div>

<table class="cmp"><tr><th></th><th>Internet</th><th>Internet VPN</th><th>Private WAN</th><th>Intercloud exchange</th></tr>
<tr><td>Security</td><td>app-level (TLS)</td><td>IPsec encryption</td><td>private network</td><td>private network</td></tr>
<tr><td>QoS / SLA</td><td>nahi</td><td>nahi</td><td>haan</td><td>haan</td></tr>
<tr><td>Cost / setup time</td><td>kam / kuch nahi</td><td>kam / ghante</td><td>zyada / hafte</td><td>medium / din se hafte</td></tr>
<tr><td>Cloud provider badalna</td><td>aasaan</td><td>aasaan</td><td>mushkil</td><td>aasaan</td></tr></table>

<h3>Network functions virtualization (NFV)</h3>
<p>Routers, firewalls, load balancers aur WAN optimisers pehle dedicated appliances hote the. <b>NFV</b> in <b>network functions ko software ki tarah</b> chalata hai, standard x86 servers par VMs ya containers ke roop mein. Har ek ek <b>VNF</b> (virtual network function) hai. ETSI NFV framework teen hisson ke naam deta hai: VNFs, <b>NFVI</b> (servers, hypervisors aur virtual networks jin par woh chalte hain) aur <b>MANO</b> (management and orchestration, jo unhe deploy aur scale karta hai).</p>
<p>Examples: Cisco Catalyst 8000V (virtual IOS XE router), virtual ASA ya Secure Firewall Threat Defense Virtual, aur virtual load balancers. Cloud mein aap physical router install nahi kar sakte, isliye VNF aksar aapke virtual network ke andar <b>hi</b> VPN endpoint ya firewall hota hai. Branches par ek <b>uCPE</b> server router, firewall aur WAN optimiser ki jagah le sakta hai.</p>

<div class="eg"><p><b>Worked example.</b> 200 stores aur do clouds wala ek retailer. Stores ke paas pehle se MPLS plus internet hai. Design: dono data centers ek ek 10 Gbps private link se intercloud exchange tak jaate hain, cloud A aur cloud B tak virtual connections ke saath. Stores data centers tak MPLS use karte rehte hain, aur backup ke liye local internet VPN. Har cloud ke andar virtual routers (VNFs) ka ek pair connections terminate karta hai aur on-premises jaisi hi routing policy apply karta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Yeh maan lena ki VPN guaranteed performance deta hai. IPsec traffic ko protect karta hai, par woh phir bhi best-effort internet par chalta hai. Voice ya database replication jaise latency-sensitive traffic ko private WAN ya exchange connection chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Intercloud exchange ka selling point hai <b>ek private connection se kai cloud providers tak judna</b> aur providers aasaani se badalna. Private WAN ka selling point QoS aur SLA hai; internet VPN ka sasta, tez aur secure.</p></div>

<div class="scn"><h4>Migration ke baad toot-ti calls</h4><p>Ek company ne apne call-control servers IaaS par move kiye aur office internet link par IPsec VPN se joda. Har dopahar, jab staff bade uploads shuru karta, calls toot-ne lagti. VPN healthy tha, par internet path voice ko priority nahi de sakta tha. Voice traffic ko QoS wale dedicated private connection par le jaane se, aur VPN ko backup rakhne se, problem solve hui.</p><p><b>Seekh:</b> encryption quality nahi hai. Connectivity model traffic ki zaroorat ke hisaab se chuno.</p></div>

<div class="iv"><p class="q">"Aap enterprise ko public cloud se kaise jodoge?"</p><p>Chaaron options ko trade-offs ke saath compare karo: internet (SaaS, simple), site-to-site IPsec VPN (secure, sasta, jaldi deploy, QoS nahi), private WAN ya dedicated link (predictable, SLA, mehenga, provision mein dheema) aur intercloud exchange (ek link se kai clouds, badalna aasaan). Critical traffic ke liye private option ke saath VPN ko backup recommend karo, aur connection terminate karne ke liye cloud ke andar virtual routers ya firewalls (NFV) chalana mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Internet: sabse simple, SaaS-friendly, QoS nahi; internet VPN: internet par IPsec, sasta aur jaldi, phir bhi QoS nahi.</li>
<li>Private WAN ya dedicated link: predictable aur SLA-backed, par mehenga, set up mein dheema aur move karna mushkil.</li>
<li>Intercloud exchange: ek provider tak ek private link jo kai clouds se juda hai; clouds badalna aasaan.</li>
<li>NFV routers, firewalls aur load balancers ko standard servers par software (VNFs) ki tarah chalata hai; hisse hain VNF, NFVI aur MANO.</li>
<li>Cloud mein VNF aksar aapke virtual network ka VPN endpoint ya firewall hota hai.</li>
</ul></div>
`}};export{e as default};