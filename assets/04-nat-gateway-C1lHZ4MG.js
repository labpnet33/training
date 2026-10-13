var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="{{aria}}">
<rect x="10" y="10" width="140" height="150" rx="8" fill="#bbf7d0"/><text x="80" y="32" text-anchor="middle" class="svg-ink" font-size="13">app-1</text><text x="80" y="50" text-anchor="middle" class="svg-muted" font-size="12">10.60.1.4</text>
<rect x="250" y="10" width="170" height="150" rx="8" fill="#fde68a"/><text x="335" y="32" text-anchor="middle" class="svg-ink" font-size="13">NAT Gateway</text><text x="335" y="52" text-anchor="middle" class="svg-muted" font-size="12">{{tbl}}</text>
<text x="335" y="78" text-anchor="middle" class="svg-ink" font-size="12">10.60.1.4:50123</text><text x="335" y="94" text-anchor="middle" class="svg-accent" font-size="12">= 203.0.113.50:1024</text>
<text x="335" y="118" text-anchor="middle" class="svg-ink" font-size="12">10.60.1.5:50123</text><text x="335" y="134" text-anchor="middle" class="svg-accent" font-size="12">= 203.0.113.50:1025</text>
<rect x="520" y="10" width="110" height="150" rx="8" fill="#fed7aa"/><text x="575" y="32" text-anchor="middle" class="svg-ink" font-size="13">Mirror</text><text x="575" y="50" text-anchor="middle" class="svg-muted" font-size="12">198.51.100.20:443</text>
<line x1="150" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="420" y1="85" x2="520" y2="85" stroke="#64748b" stroke-width="2"/>
<text x="200" y="76" text-anchor="middle" class="svg-accent" font-size="12">1</text><text x="470" y="76" text-anchor="middle" class="svg-accent" font-size="12">2</text>
<text x="200" y="104" text-anchor="middle" class="svg-muted" font-size="12">{{s1}}</text><text x="470" y="104" text-anchor="middle" class="svg-muted" font-size="12">{{s2}}</text>
<rect x="10" y="180" width="620" height="70" rx="8" fill="#f1f5f9" stroke="#94a3b8"/>
<text x="320" y="204" text-anchor="middle" class="svg-ink" font-size="12">{{n1}}</text><text x="320" y="224" text-anchor="middle" class="svg-ink" font-size="12">{{n2}}</text><text x="320" y="242" text-anchor="middle" class="svg-muted" font-size="12">{{n3}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`NAT Gateway SNAT translation table`,tbl:`translation table`,s1:`src 10.60.1.4:50123`,s2:`src 203.0.113.50:1024`,n1:`Reply from 198.51.100.20:443 to 203.0.113.50:1024 is matched in the table`,n2:`and forwarded to 10.60.1.4:50123. A new connection from the internet has no entry: dropped.`,n3:`Same public IP, different source ports: that is how many VMs share one address.`,cap:`Many private VMs share one public IP; the NAT Gateway tells their connections apart by the translated source port.`}),r=e(t,{aria:`NAT Gateway SNAT translation table`,tbl:`translation table`,s1:`src 10.60.1.4:50123`,s2:`src 203.0.113.50:1024`,n1:`198.51.100.20:443 se 203.0.113.50:1024 par aaya reply table mein match hota hai`,n2:`aur 10.60.1.4:50123 ko forward hota hai. Internet se naya connection: entry nahi, drop.`,n3:`Public IP wahi, source ports alag: isi tarah kai VMs ek address share karte hain.`,cap:`Kai private VMs ek public IP share karte hain; NAT Gateway unke connections ko translated source port se alag pehchanta hai.`}),i={id:`nat-gateway`,h:{en:`NAT Gateway: how it works`,hi:`NAT Gateway: kaise kaam karta hai`},body:{en:`
<h3>Building blocks</h3>
<p>An Azure NAT Gateway is a managed resource with just a few settings. Because it is managed, it has no instances to patch, no routes to maintain and no high-availability pair to configure.</p>
<dl class="terms">
<dt>NAT Gateway resource</dt><dd>Named object in a resource group and region. It is <b>attached to one or more subnets</b> of the same virtual network. One subnet can have only one NAT Gateway.</dd>
<dt>Public IP address(es)</dt><dd>Standard SKU, static public IPs attached to the gateway. Up to 16 addresses can be attached in total (verify limits).</dd>
<dt>Public IP prefix</dt><dd>A contiguous block you reserve (for example a /31 = 2 addresses, /30 = 4). Useful when a partner allow-lists one range instead of many addresses.</dd>
<dt>Idle timeout</dt><dd>How long a connection with no traffic keeps its translation entry. Default 4 minutes and configurable up to 120 minutes (verify).</dd>
<dt>Availability zone</dt><dd>You can leave the gateway with no zone, or place it in a single zone. A NAT Gateway in a zone is a zonal resource. A newer SKU (StandardV2) offers zone-redundant operation (verify current availability and pricing).</dd>
</dl>
`+n+`
<h3>Packet flow, step by step</h3>
<ol>
<li>app-1 (10.60.1.4) opens a TCP connection to 198.51.100.20 port 443 from source port 50123.</li>
<li>Because the subnet has a NAT Gateway, outbound internet traffic is sent to it (no route table entry is needed; the platform handles it, unless a UDR overrides the default route).</li>
<li>The gateway chooses one of its public IPs and a free SNAT port, writes an entry in its table, and sends the packet out with source 203.0.113.50:1024.</li>
<li>The reply returns to 203.0.113.50:1024, the table is looked up, and the packet is delivered to 10.60.1.4:50123.</li>
<li>After the idle timeout without traffic (or when the connection closes), the entry and its SNAT port are released.</li>
</ol>

<h3>Properties that exam and design questions love</h3>
<ul>
<li><b>Outbound only.</b> It cannot accept connections that begin on the internet. Return traffic of outbound flows is allowed.</li>
<li><b>Subnet-wide.</b> Every VM and every VM scale set instance in the subnet uses it. There is no per-VM switch.</li>
<li><b>TCP and UDP.</b> ICMP is not handled for internet destinations (verify), so a ping to the internet does not prove the NAT works. Use TCP tests such as curl.</li>
<li><b>Large SNAT pool.</b> Each public IP offers about 64,512 SNAT ports (verify), shared dynamically across the subnet, which is why NAT Gateway rarely exhausts compared with older methods.</li>
<li><b>Standard SKU only.</b> It cannot be combined with Basic public IPs or Basic Load Balancer in the same subnet.</li>
<li><b>Not for gateway subnets.</b> It cannot be associated with GatewaySubnet.</li>
<li><b>IPv4 outbound.</b> IPv6 is not supported at the time of writing (verify).</li>
</ul>

<h3>NAT Gateway versus Azure Firewall</h3>
<table class="cmp"><tr><th>Question</th><th>NAT Gateway</th><th>Azure Firewall</th></tr>
<tr><td>Main job</td><td>Give a subnet a stable outbound IP and many SNAT ports</td><td>Inspect and filter traffic (network, application, FQDN, threat intel)</td></tr>
<tr><td>Filtering</td><td>None. Use NSGs</td><td>Rules by IP, port, FQDN, URL category (tier dependent)</td></tr>
<tr><td>Routing</td><td>Attach to subnet, no UDR</td><td>Needs a UDR with next hop virtual appliance</td></tr>
<tr><td>Inbound</td><td>No</td><td>Yes, via DNAT rules</td></tr>
<tr><td>Cost structure</td><td>Hourly resource fee plus per GB plus public IPs (verify)</td><td>Hourly deployment fee plus per GB; much higher base cost (verify)</td></tr></table>
<p>They combine well: Azure Firewall filters, and a NAT Gateway on the <b>AzureFirewallSubnet</b> supplies extra SNAT ports and a stable IP set for the firewall's own egress.</p>

<div class="eg"><b>Worked example.</b> A /31 prefix 203.0.113.48/31 holds two addresses: 203.0.113.48 and 203.0.113.49. Attach it to the gateway. Capacity is roughly 2 x 64,512 SNAT ports. The partner allow-lists one CIDR, 203.0.113.48/31, and you can grow later only by creating a bigger prefix (a prefix cannot be resized).</div>

<div class="warn"><b>Common mistakes.</b> Expecting ping to work; creating the public IP as Basic; forgetting that the public IP and the NAT Gateway must be in the same region; attaching the gateway to the wrong subnet, so the VM subnet has no outbound at all.</div>
<div class="exam"><b>Exam trap.</b> "Which resource do you change to give a subnet NAT Gateway?" The <b>subnet's association</b> (the NAT gateway property on the subnet), not its route table.</div>

<div class="scn"><h4>The partner that wanted one range</h4><p>A bank partner only accepted a single /30 range of source addresses. The team had four separate Standard public IPs on a NAT Gateway and could not hand over a range. They created a /30 public IP prefix, replaced the four addresses with the prefix on the gateway and shared 203.0.113.48/30. The change took five minutes and required no VM restart.</p><p><b>Lesson:</b> plan prefix sizing early; individual IPs cannot be merged into a prefix afterwards.</p></div>

<div class="iv"><p class="q">"Can a NAT Gateway be used for inbound traffic?"</p><p>No. It is outbound only; only return traffic of connections started from the subnet is allowed. For inbound use a public IP, Standard Load Balancer, Application Gateway or Front Door. Mention that SNAT ports are shared across the subnet and that you can scale by adding IPs or a prefix.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT Gateway attaches to subnets and uses static Standard public IPs or a prefix.</li>
<li>It translates source IP and port; a table maps replies back to the right VM.</li>
<li>Outbound only, TCP and UDP, idle timeout 4 minutes by default (verify).</li>
<li>Each public IP gives about 64,512 SNAT ports (verify); add IPs to scale.</li>
<li>Use Azure Firewall when you must filter egress, NAT Gateway when you only need a stable address.</li>
</ul></div>
`,hi:`
<h3>Building blocks</h3>
<p>Azure NAT Gateway ek managed resource hai jisme bas kuch settings hain. Managed hone ki wajah se na patch karne ko instances, na maintain karne ko routes, na high-availability pair configure karna padta hai.</p>
<dl class="terms">
<dt>NAT Gateway resource</dt><dd>Resource group aur region mein naam wala object. Yeh usi virtual network ke <b>ek ya zyada subnets se attach</b> hota hai. Ek subnet par sirf ek NAT Gateway ho sakta hai.</dd>
<dt>Public IP address(es)</dt><dd>Standard SKU, static public IPs jo gateway se attach hote hain. Kul milakar 16 tak addresses attach ho sakte hain (limits verify karo).</dd>
<dt>Public IP prefix</dt><dd>Aapka reserve kiya hua contiguous block (jaise /31 = 2 addresses, /30 = 4). Tab kaam aata hai jab partner kai addresses ki jagah ek range allow-list karta hai.</dd>
<dt>Idle timeout</dt><dd>Bina traffic ke connection ki translation entry kitni der rehti hai. Default 4 minute aur 120 minute tak configurable (verify).</dd>
<dt>Availability zone</dt><dd>Gateway ko bina zone ke chhod sakte ho, ya ek zone mein rakh sakte ho. Zone wala NAT Gateway zonal resource hota hai. Naya SKU (StandardV2) zone-redundant operation deta hai (current availability aur pricing verify karo).</dd>
</dl>
`+r+`
<h3>Packet flow, step by step</h3>
<ol>
<li>app-1 (10.60.1.4) source port 50123 se 198.51.100.20 port 443 par TCP connection kholta hai.</li>
<li>Subnet par NAT Gateway hone ki wajah se outbound internet traffic uske paas jaata hai (route table entry nahi chahiye; platform sambhalta hai, jab tak UDR default route override na kare).</li>
<li>Gateway apne public IPs mein se ek aur free SNAT port chunta hai, table mein entry likhta hai, aur packet ko source 203.0.113.50:1024 ke saath bhejta hai.</li>
<li>Reply 203.0.113.50:1024 par aata hai, table dekhi jaati hai, aur packet 10.60.1.4:50123 ko deliver hota hai.</li>
<li>Bina traffic ke idle timeout (ya connection close hone) ke baad entry aur uska SNAT port release ho jaata hai.</li>
</ol>

<h3>Properties jo exam aur design questions mein aati hain</h3>
<ul>
<li><b>Outbound only.</b> Internet se shuru hone wale connections accept nahi karta. Outbound flows ka return traffic allowed hai.</li>
<li><b>Subnet-wide.</b> Subnet ke har VM aur VM scale set instance use karta hai. Per-VM switch nahi hai.</li>
<li><b>TCP aur UDP.</b> Internet destinations ke liye ICMP handle nahi hota (verify), isliye internet ko ping NAT ko prove nahi karta. curl jaise TCP tests use karo.</li>
<li><b>Bada SNAT pool.</b> Har public IP lagbhag 64,512 SNAT ports deta hai (verify), jo subnet mein dynamically share hote hain, isliye purane methods ke muqable NAT Gateway mein exhaustion kam hota hai.</li>
<li><b>Sirf Standard SKU.</b> Same subnet mein Basic public IPs ya Basic Load Balancer ke saath combine nahi hota.</li>
<li><b>Gateway subnets ke liye nahi.</b> GatewaySubnet se associate nahi ho sakta.</li>
<li><b>IPv4 outbound.</b> Likhte waqt IPv6 supported nahi hai (verify).</li>
</ul>

<h3>NAT Gateway versus Azure Firewall</h3>
<table class="cmp"><tr><th>Sawal</th><th>NAT Gateway</th><th>Azure Firewall</th></tr>
<tr><td>Main kaam</td><td>Subnet ko stable outbound IP aur bahut SNAT ports dena</td><td>Traffic inspect aur filter karna (network, application, FQDN, threat intel)</td></tr>
<tr><td>Filtering</td><td>Nahi. NSGs use karo</td><td>IP, port, FQDN, URL category ke rules (tier par depend)</td></tr>
<tr><td>Routing</td><td>Subnet se attach, UDR nahi</td><td>Next hop virtual appliance wala UDR chahiye</td></tr>
<tr><td>Inbound</td><td>Nahi</td><td>Haan, DNAT rules se</td></tr>
<tr><td>Cost structure</td><td>Hourly resource fee plus per GB plus public IPs (verify)</td><td>Hourly deployment fee plus per GB; base cost kaafi zyada (verify)</td></tr></table>
<p>Dono saath achhe chalte hain: Azure Firewall filter karta hai, aur <b>AzureFirewallSubnet</b> par NAT Gateway firewall ke apne egress ke liye extra SNAT ports aur stable IP set deta hai.</p>

<div class="eg"><b>Worked example.</b> /31 prefix 203.0.113.48/31 mein do addresses hain: 203.0.113.48 aur 203.0.113.49. Ise gateway se attach karo. Capacity lagbhag 2 x 64,512 SNAT ports. Partner ek CIDR 203.0.113.48/31 allow-list karta hai, aur aap baad mein sirf bada prefix banakar badh sakte ho (prefix resize nahi hota).</div>

<div class="warn"><b>Common mistakes.</b> Ping chalne ki ummeed karna; public IP ko Basic banana; bhoolna ki public IP aur NAT Gateway ek hi region mein hone chahiye; gateway ko galat subnet se attach karna jisse VM subnet ka outbound hi nahi rehta.</div>
<div class="exam"><b>Exam trap.</b> "Subnet ko NAT Gateway dene ke liye kya badalte ho?" <b>Subnet ka association</b> (subnet par NAT gateway property), route table nahi.</div>

<div class="scn"><h4>Partner jo ek range chahta tha</h4><p>Ek bank partner source addresses ki sirf ek /30 range accept karta tha. Team ke NAT Gateway par chaar alag Standard public IPs the aur range nahi de sakte the. Unhone /30 public IP prefix banaya, gateway par chaar addresses ki jagah prefix lagaya aur 203.0.113.48/30 share kiya. Change paanch minute mein hua aur VM restart nahi chahiye tha.</p><p><b>Lesson:</b> prefix sizing pehle se plan karo; individual IPs baad mein prefix mein merge nahi hote.</p></div>

<div class="iv"><p class="q">"Kya NAT Gateway inbound traffic ke liye use ho sakta hai?"</p><p>Nahi. Yeh outbound only hai; sirf subnet se shuru hue connections ka return traffic allowed hai. Inbound ke liye public IP, Standard Load Balancer, Application Gateway ya Front Door use karo. Batao ki SNAT ports subnet mein share hote hain aur IPs ya prefix jodkar scale kar sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT Gateway subnets se attach hota hai aur static Standard public IPs ya prefix use karta hai.</li>
<li>Yeh source IP aur port translate karta hai; table replies ko sahi VM tak wapas mapta hai.</li>
<li>Outbound only, TCP aur UDP, idle timeout default 4 minute (verify).</li>
<li>Har public IP lagbhag 64,512 SNAT ports deta hai (verify); scale ke liye IPs jodo.</li>
<li>Egress filter karna ho to Azure Firewall, sirf stable address chahiye to NAT Gateway.</li>
</ul></div>
`}};export{i as default};