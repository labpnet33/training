var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="{{aria}}">
<rect x="220" y="20" width="200" height="110" rx="8" fill="#ddd6fe"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Hub 10.0.0.0/16</text>
<rect x="245" y="60" width="150" height="50" rx="6" fill="#fde68a"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">NVA / Firewall</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.4 IP forwarding</text>
<rect x="10" y="160" width="190" height="90" rx="8" fill="#bbf7d0"/><text x="105" y="182" text-anchor="middle" class="svg-ink" font-size="13">Spoke1 10.1.0.0/16</text><text x="105" y="205" text-anchor="middle" class="svg-muted" font-size="12">vm-s1 10.1.1.4</text><text x="105" y="225" text-anchor="middle" class="svg-accent" font-size="12">UDR 10.2.0.0/16 to 10.0.1.4</text>
<rect x="440" y="160" width="190" height="90" rx="8" fill="#bae6fd"/><text x="535" y="182" text-anchor="middle" class="svg-ink" font-size="13">Spoke2 10.2.0.0/16</text><text x="535" y="205" text-anchor="middle" class="svg-muted" font-size="12">vm-s2 10.2.1.4</text><text x="535" y="225" text-anchor="middle" class="svg-accent" font-size="12">UDR 10.1.0.0/16 to 10.0.1.4</text>
<line x1="105" y1="160" x2="290" y2="110" stroke="#16a34a" stroke-width="3"/><line x1="535" y1="160" x2="350" y2="110" stroke="#16a34a" stroke-width="3"/>
<text x="150" y="128" class="svg-muted" font-size="12">1</text><text x="470" y="128" class="svg-muted" font-size="12">2</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">{{n}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Hub and spoke with an NVA`,n:`1 spoke1 to hub, 2 hub to spoke2`,cap:`Spoke-to-spoke through a central appliance: peering links to the hub, UDRs in the spokes, forwarding on the hub appliance.`}),r=e(t,{aria:`Hub and spoke with an NVA`,n:`1 spoke1 se hub, 2 hub se spoke2`,cap:`Central appliance ke through spoke-to-spoke: hub se peering links, spokes mein UDRs, hub appliance par forwarding.`}),i={id:`nva-and-forced-tunnelling`,h:{en:`NVAs, IP forwarding, hub-and-spoke and forced tunnelling`,hi:`NVAs, IP forwarding, hub-and-spoke aur forced tunnelling`},body:{en:`
<h3>Why send traffic through an appliance?</h3>
<p>Peering is non-transitive and gives no inspection. Many organisations want all spoke-to-spoke and spoke-to-internet traffic to pass through a central <b>firewall or network virtual appliance (NVA)</b> in a hub VNet, so they can log it, filter it and apply policy once. That is the <b>hub-and-spoke</b> design. Three ingredients make it work: peering with the right flags, a UDR in each spoke, and forwarding on the appliance.</p>
`+n+`
<h3>The three ingredients</h3>
<ol>
<li><b>Peering.</b> Spoke and hub peered in both directions. On the hub's link to each spoke and on the spoke's link to the hub, enable <code>--allow-forwarded-traffic</code> so packets that were not originated by the sender are accepted.</li>
<li><b>UDRs in the spokes.</b> Spoke1 gets 10.2.0.0/16 with next hop virtual appliance 10.0.1.4; Spoke2 gets 10.1.0.0/16 next hop 10.0.1.4. Often also 0.0.0.0/0 to the appliance for internet egress.</li>
<li><b>Forwarding on the appliance.</b> A normal VM drops packets that are not addressed to it. For a router or firewall you must enable <b>IP forwarding</b> on its network interface in Azure <b>and</b> enable routing in its operating system.</li>
</ol>
<pre class="code"><span class="c"># 1. Azure side: the NIC accepts packets not addressed to its own IP</span>
az network nic update -g nk-rg -n nva1VMNic --ip-forwarding true

<span class="c"># 2. OS side (Linux example): turn on routing, then check it</span>
sudo sysctl -w net.ipv4.ip_forward=1
cat /proc/sys/net/ipv4/ip_forward</pre>
<pre class="out">Illustrative output
1</pre>
<div class="warn"><b>The two-switch trap.</b> IP forwarding has two switches: the Azure NIC setting and the OS setting. Turning on only one means the appliance silently drops transit packets. This is the most common failure in NVA labs.</div>

<h3>Azure Firewall instead of a DIY appliance</h3>
<p>For production, Azure Firewall (a managed service in a subnet that must be named <b>AzureFirewallSubnet</b>) replaces a hand-built NVA: it is highly available, scales, and has built-in rules. It bills <b>hourly while deployed plus per GB</b>, with a high base cost (verify the SKU pricing structure) so never leave one running in a practice subscription. Third-party NVAs are normally deployed in pairs behind a Standard internal Load Balancer with HA ports (see the load-balancing module) for resilience.</p>

<h3>Symmetric routing</h3>
<p>A stateful firewall expects to see both directions of a flow. If spoke1 sends via the firewall but the reply returns directly (because the destination subnet has no UDR), the firewall sees only half of the flow and drops it. So <b>UDRs must exist on both sides</b>. This asymmetric path is a classic cause of "ping works one way".</p>

<h3>Forced tunnelling</h3>
<p><b>Forced tunnelling</b> means sending <b>all internet-bound traffic</b> (0.0.0.0/0) to on-premises or to a central inspection point instead of straight out to the internet. In Azure you do it with a UDR for 0.0.0.0/0 whose next hop is <b>virtual network gateway</b> (to on-premises over VPN or ExpressRoute) or <b>virtual appliance</b> (an NVA or Azure Firewall). Reasons: compliance requires egress via the corporate proxy; you want to keep a single egress IP set; or you want to inspect everything.</p>
<pre class="code"><span class="c"># Send all internet-bound traffic from subnet sn-app to the firewall</span>
az network route-table create -g nk-rg -n rt-app
az network route-table route create -g nk-rg --route-table-name rt-app -n default-to-fw \\
  --address-prefix 0.0.0.0/0 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4
az network vnet subnet update -g nk-rg --vnet-name vnet-spoke1 -n sn-app --route-table rt-app</pre>
<p>Side effects to plan for: Azure platform services and updates will go through the same path, so the firewall needs rules for them; a NAT Gateway on the spoke subnet will be bypassed for traffic that goes to the firewall (put the NAT Gateway on the firewall's subnet instead); and a 0.0.0.0/0 UDR on the GatewaySubnet is not allowed in most designs (verify).</p>

<div class="eg"><b>Worked example.</b> vm-s1 (10.1.1.4) pings vm-s2 (10.2.1.4). Hop 1: UDR in spoke1 matches 10.2.0.0/16 and sends to 10.0.1.4. Hop 2: NVA, with IP forwarding on both layers, routes it out the same NIC. Hop 3: hub-to-spoke2 peering delivers it, because the system route for the peered spoke2 range exists in the hub. The reply returns with the same logic through the NVA because spoke2 has a UDR for 10.1.0.0/16.</div>

<div class="exam"><b>Exam trap.</b> Allow forwarded traffic on the peering is <b>not</b> the same as IP forwarding on the NIC. Peering flag: accept packets that were forwarded. NIC flag: let the NVA forward packets not addressed to it. You need both for hub-and-spoke through an NVA.</div>

<div class="scn"><h4>One-way ping</h4><p>After building hub-and-spoke, spoke1 could ping spoke2 only for the first packet; replies never arrived. The engineer used Network Watcher next hop in both directions and found that spoke2 had no UDR back to spoke1, so the reply went directly via peering and bypassed the firewall, where the stateful session never saw the return. Adding the missing UDR in spoke2 fixed it.</p><p><b>Lesson:</b> routes through a stateful appliance must be symmetric.</p></div>

<div class="iv"><p class="q">"Design spoke-to-spoke connectivity through a central firewall."</p><p>Hub-and-spoke: peer each spoke to the hub with allow forwarded traffic; deploy Azure Firewall (or NVAs behind an internal Standard Load Balancer) in the hub; in each spoke add a UDR for the other spokes (or 0.0.0.0/0) with next hop virtual appliance and the firewall IP; enable IP forwarding on NVA NICs and in the OS; ensure symmetric routing; place a NAT Gateway on the firewall subnet for SNAT scale.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hub-and-spoke through an appliance needs peering flags, spoke UDRs and forwarding on the appliance.</li>
<li>IP forwarding has two switches: Azure NIC and OS.</li>
<li>Forced tunnelling is a 0.0.0.0/0 UDR to a gateway or appliance.</li>
<li>Routes through stateful firewalls must be symmetric.</li>
<li>Azure Firewall bills hourly: never leave it running in a lab.</li>
</ul></div>
`,hi:`
<h3>Traffic ko appliance se kyun guzarein?</h3>
<p>Peering non-transitive hai aur inspection nahi deti. Kai organisations chahti hain ki saara spoke-to-spoke aur spoke-to-internet traffic hub VNet ke central <b>firewall ya network virtual appliance (NVA)</b> se guzre, taaki ek jagah log, filter aur policy lag sake. Yahi <b>hub-and-spoke</b> design hai. Teen cheezein ise chalati hain: sahi flags ke saath peering, har spoke mein UDR, aur appliance par forwarding.</p>
`+r+`
<h3>Teen ingredients</h3>
<ol>
<li><b>Peering.</b> Spoke aur hub dono directions mein peered. Hub ke har spoke ke link par aur spoke ke hub ke link par <code>--allow-forwarded-traffic</code> enable karo taaki jo packets sender ne originate nahi kiye woh bhi accept hon.</li>
<li><b>Spokes mein UDRs.</b> Spoke1 ko 10.2.0.0/16 next hop virtual appliance 10.0.1.4 ke saath; Spoke2 ko 10.1.0.0/16 next hop 10.0.1.4. Aksar internet egress ke liye 0.0.0.0/0 bhi appliance ko.</li>
<li><b>Appliance par forwarding.</b> Normal VM woh packets drop kar deta hai jo uske address par nahi hain. Router ya firewall ke liye Azure mein uski network interface par <b>IP forwarding</b> <b>aur</b> uske operating system mein routing enable karna zaroori hai.</li>
</ol>
<pre class="code"><span class="c"># 1. Azure side: NIC apne IP ke alawa addressed packets bhi accept kare</span>
az network nic update -g nk-rg -n nva1VMNic --ip-forwarding true

<span class="c"># 2. OS side (Linux example): routing on karo, phir check karo</span>
sudo sysctl -w net.ipv4.ip_forward=1
cat /proc/sys/net/ipv4/ip_forward</pre>
<pre class="out">Illustrative output
1</pre>
<div class="warn"><b>Do-switch trap.</b> IP forwarding ke do switches hain: Azure NIC setting aur OS setting. Sirf ek on karne par appliance transit packets chupchaap drop karta hai. NVA labs mein yeh sabse common failure hai.</div>

<h3>DIY appliance ki jagah Azure Firewall</h3>
<p>Production ke liye Azure Firewall (managed service, aise subnet mein jiska naam <b>AzureFirewallSubnet</b> hona zaroori hai) hand-built NVA ki jagah leta hai: highly available, scale hota hai aur built-in rules hain. Yeh <b>deployed rehne tak hourly plus per GB</b> bill karta hai, base cost bahut zyada hai (SKU pricing structure verify karo), isliye practice subscription mein kabhi chalta mat chhodo. Third-party NVAs aam taur par resilience ke liye Standard internal Load Balancer ke peeche HA ports ke saath pairs mein lagte hain (load-balancing module dekho).</p>

<h3>Symmetric routing</h3>
<p>Stateful firewall flow ki dono directions dekhna chahta hai. Spoke1 firewall se bheje par reply seedha lautta hai (kyunki destination subnet par UDR nahi), to firewall ko flow ka sirf aadha hissa dikhta hai aur woh use drop kar deta hai. Isliye <b>UDRs dono taraf hone chahiye</b>. Yeh asymmetric path "ping ek taraf chalta hai" ki classic wajah hai.</p>

<h3>Forced tunnelling</h3>
<p><b>Forced tunnelling</b> ka matlab <b>saara internet-bound traffic</b> (0.0.0.0/0) seedha internet ki jagah on-premises ya central inspection point ko bhejna. Azure mein yeh 0.0.0.0/0 ke UDR se hota hai jiska next hop <b>virtual network gateway</b> (VPN ya ExpressRoute se on-premises) ya <b>virtual appliance</b> (NVA ya Azure Firewall) ho. Wajahein: compliance ke liye egress corporate proxy se; ek hi egress IP set rakhna; ya sab kuch inspect karna.</p>
<pre class="code"><span class="c"># sn-app subnet ka saara internet-bound traffic firewall ko bhejo</span>
az network route-table create -g nk-rg -n rt-app
az network route-table route create -g nk-rg --route-table-name rt-app -n default-to-fw \\
  --address-prefix 0.0.0.0/0 --next-hop-type VirtualAppliance --next-hop-ip-address 10.0.1.4
az network vnet subnet update -g nk-rg --vnet-name vnet-spoke1 -n sn-app --route-table rt-app</pre>
<p>Side effects jinka plan karo: Azure platform services aur updates bhi usi path se jayenge, isliye firewall mein unke rules chahiye; spoke subnet ka NAT Gateway un traffic ke liye bypass hoga jo firewall ko jaata hai (NAT Gateway firewall ke subnet par lagao); aur GatewaySubnet par 0.0.0.0/0 UDR zyadatar designs mein allowed nahi (verify).</p>

<div class="eg"><b>Worked example.</b> vm-s1 (10.1.1.4) vm-s2 (10.2.1.4) ko ping karta hai. Hop 1: spoke1 ka UDR 10.2.0.0/16 match karke 10.0.1.4 ko bhejta hai. Hop 2: NVA, dono layers par IP forwarding on, use usi NIC se bahar route karta hai. Hop 3: hub-to-spoke2 peering use deliver karti hai, kyunki hub mein peered spoke2 range ka system route hai. Reply bhi isi logic se NVA ke through lautta hai kyunki spoke2 mein 10.1.0.0/16 ka UDR hai.</div>

<div class="exam"><b>Exam trap.</b> Peering par allow forwarded traffic NIC par IP forwarding <b>nahi</b> hai. Peering flag: forwarded packets accept karo. NIC flag: NVA ko woh packets forward karne do jo uske address par nahi. NVA ke through hub-and-spoke ke liye dono chahiye.</div>

<div class="scn"><h4>Ek taraf ka ping</h4><p>Hub-and-spoke banane ke baad spoke1 spoke2 ko sirf pehle packet ke liye ping kar paya; replies kabhi nahi aaye. Engineer ne dono directions mein Network Watcher next hop use kiya aur dekha ki spoke2 mein spoke1 ke liye UDR nahi tha, isliye reply seedha peering se gayi aur firewall ko bypass kiya, jahan stateful session ne return dekha hi nahi. Spoke2 mein missing UDR jodne se theek hua.</p><p><b>Lesson:</b> stateful appliance ke through routes symmetric hone chahiye.</p></div>

<div class="iv"><p class="q">"Central firewall ke through spoke-to-spoke connectivity design karo."</p><p>Hub-and-spoke: har spoke ko hub se allow forwarded traffic ke saath peer karo; hub mein Azure Firewall (ya internal Standard Load Balancer ke peeche NVAs) deploy karo; har spoke mein doosre spokes (ya 0.0.0.0/0) ke liye UDR next hop virtual appliance aur firewall IP ke saath; NVA NICs aur OS mein IP forwarding enable karo; symmetric routing pakki karo; SNAT scale ke liye firewall subnet par NAT Gateway lagao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Appliance ke through hub-and-spoke ko peering flags, spoke UDRs aur appliance par forwarding chahiye.</li>
<li>IP forwarding ke do switches: Azure NIC aur OS.</li>
<li>Forced tunnelling gateway ya appliance ko 0.0.0.0/0 UDR hai.</li>
<li>Stateful firewalls ke through routes symmetric hone chahiye.</li>
<li>Azure Firewall hourly bill karta hai: lab mein kabhi chalta mat chhodo.</li>
</ul></div>
`}};export{i as default};