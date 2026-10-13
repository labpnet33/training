var e={id:`multicloud-defense`,h:{en:`Cisco cloud security portfolio and Multicloud Defense`,hi:`Cisco cloud security portfolio aur Multicloud Defense`},body:{en:`
<p>Imagine a company with offices in four different cities, each with its own building manager, its own guard company and its own rule book. Visitors get different treatment in every office, and nobody can answer "who entered our buildings yesterday?". A sensible company hires one security firm with one rule book for all four cities. Multicloud environments have the same problem: each provider has its own security groups, its own firewall service and its own logs. <b>Cisco Multicloud Defense</b> is the "one security firm, one rule book" answer for network security across public clouds.</p>

<h3>The Cisco cloud security map</h3>
<p>The exam expects you to place each Cisco product in the right part of the picture:</p>
<table class="cmp"><tr><th>Need</th><th>Cisco product</th><th>Where it acts</th></tr>
<tr><td>Network security for traffic in and out of public cloud VPCs/VNets</td><td><b>Multicloud Defense</b></td><td>Auto-scaling gateways in the customer's cloud accounts</td></tr>
<tr><td>Full NGFW in the cloud with the same policy as on-premises</td><td><b>Secure Firewall Threat Defense Virtual</b> (and ASA Virtual)</td><td>Virtual appliances, managed by Management Center or Security Cloud Control</td></tr>
<tr><td>Microsegmentation and workload visibility</td><td><b>Secure Workload</b></td><td>Agents on workloads, cloud connectors (chapter 7)</td></tr>
<tr><td>Users reaching internet, SaaS and private apps securely</td><td><b>Secure Access</b> (SSE: SWG, CASB, ZTNA, FWaaS, DLP) and <b>Umbrella</b> DNS security</td><td>Cloud-delivered, next module (sec-sse)</td></tr>
<tr><td>Strong authentication and device trust for cloud apps</td><td><b>Duo</b></td><td>Identity layer, SSO and MFA</td></tr>
<tr><td>Kernel-level enforcement in every workload</td><td><b>Hypershield</b>, Isovalent (Cilium, Tetragon)</td><td>eBPF in hosts and Kubernetes (chapter 8)</td></tr>
<tr><td>Detection, investigation and response across all of these</td><td><b>XDR</b> and <b>Splunk</b></td><td>Analytics and SIEM (chapter 11)</td></tr>
</table>

<h3>Multicloud Defense architecture</h3>
<p>There are two parts. The <b>controller</b> is SaaS, run by Cisco. You onboard each cloud account by granting the controller an IAM role, and it then <b>discovers</b> VPCs/VNets, subnets, instances and tags and shows traffic visibility from flow logs, even before you deploy anything. The <b>gateways</b> are the data plane. The controller deploys them into your cloud accounts as auto-scaling groups behind cloud load balancers, so capacity grows with traffic and a failed instance is replaced automatically.</p>
<ul>
<li><b>Ingress gateway</b>: acts as a reverse proxy in front of published applications. TLS termination, WAF, IPS and antivirus for traffic arriving from the internet.</li>
<li><b>Egress and east-west gateway</b>: acts as a forward proxy or transparent hop for traffic leaving workloads. FQDN and URL filtering, TLS decryption, IPS, DLP-style inspection, and segmentation between VPCs.</li>
</ul>
<p>Two deployment models exist. In the <b>centralised (hub)</b> model, gateways sit in a security VPC attached to the provider's transit gateway or hub, and spoke VPCs route through it. In the <b>distributed</b> model, gateways sit inside each application VPC. Hub is easier to operate; distributed avoids hair-pinning for very high-throughput applications.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Multicloud Defense hub model">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Controller (SaaS)</text>
<rect x="230" y="90" width="180" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="113" text-anchor="middle" class="svg-ink" font-size="13">Security VPC</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">gateways (auto-scale)</text>
<rect x="10" y="170" width="170" height="45" rx="8" fill="#bae6fd"/><text x="95" y="198" text-anchor="middle" class="svg-ink" font-size="13">App VPC (AWS)</text>
<rect x="235" y="170" width="170" height="45" rx="8" fill="#bae6fd"/><text x="320" y="198" text-anchor="middle" class="svg-ink" font-size="13">App VNet (Azure)</text>
<rect x="460" y="170" width="170" height="45" rx="8" fill="#bae6fd"/><text x="545" y="198" text-anchor="middle" class="svg-ink" font-size="13">App VPC (GCP)</text>
<rect x="490" y="90" width="140" height="55" rx="8" fill="#e2e8f0"/><text x="560" y="122" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="320" y1="50" x2="320" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="95" y1="170" x2="280" y2="145" stroke="#64748b" stroke-width="2"/><line x1="320" y1="170" x2="320" y2="145" stroke="#64748b" stroke-width="2"/><line x1="545" y1="170" x2="370" y2="145" stroke="#64748b" stroke-width="2"/><line x1="410" y1="117" x2="490" y2="117" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The controller manages policy (dashed); traffic flows through gateways in the customer's own accounts.</p></div>

<h3>Policy with tags, not IP addresses</h3>
<p>Cloud IP addresses change every time an auto-scaling group replaces an instance. Multicloud Defense therefore builds address objects from <b>cloud tags</b> and resource attributes. A rule that says "instances tagged <code>app=payroll</code> may reach <code>api.bank.example</code> on 443, everything else to the internet is denied" keeps working when instances come and go. The same rule set can be applied to gateways in all clouds.</p>
<pre class="out">Rule set: egress-prod (applied to AWS, Azure, GCP gateways)
#  Source              Destination                Service  Action
1  tag app=payroll     fqdn api.bank.example      tcp/443  Allow, decrypt, IPS
2  tag env=prod        url-category Malware       any      <span class="hl">Deny</span>
3  tag env=prod        fqdn *.updates.example     tcp/443  Allow
4  any                 any                        any      <span class="hl">Deny, log</span></pre>

<div class="eg"><p><b>Worked example.</b> An application has 3 web instances in AWS and 2 in Azure. Without a central tool, the team maintains two provider firewall policies with 40 rules each and two log formats. With Multicloud Defense they maintain one rule set of about 25 tag-based rules, the gateways scale from 2 to 6 instances on a sale day without anyone editing a rule, and all logs arrive in one place for Splunk.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Deploying gateways but forgetting to change the route tables, so traffic never passes through them. Writing rules with instance IPs that break at the next scale event. Turning on TLS decryption without excluding certificate-pinned or privacy-sensitive destinations.</p></div>
<div class="exam"><p><b>Exam traps.</b> Multicloud Defense = SaaS controller + auto-scaling gateways in the customer's cloud, covering ingress, egress and east-west. Secure Workload = microsegmentation enforced on the workload. Secure Access = user-to-app security from the cloud (SSE). Do not mix these up.</p></div>

<div class="scn"><h4>Two clouds, two rule books</h4><p>A media company ran its video platform in one cloud and its billing system in another. A pen test found that the billing VMs could reach any internet destination on any port, while the video VMs were tightly controlled, because two different teams wrote two different policies. The company deployed Multicloud Defense in the hub model in both clouds, imported the video team's rules as the baseline, converted IP objects into tag-based objects and applied one egress rule set everywhere. The next pen test found the same, consistent egress policy in both clouds, and every denied connection appeared in the SIEM with the same fields.</p><p><b>Lesson:</b> in multicloud, consistency is a security control. One policy, many enforcement points.</p></div>

<div class="iv"><p class="q">"How would you secure egress from workloads spread across AWS, Azure and GCP?"</p><p>Describe a central policy with distributed enforcement: Cisco Multicloud Defense discovers assets, deploys auto-scaling gateways in a hub or per-VPC model, and applies one tag-based rule set with FQDN/URL filtering, TLS decryption and IPS. Mention route changes to force traffic through the gateways, default deny with logging, and sending logs to the SIEM. Contrast it with per-provider security groups, which remain a useful first layer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the map: Multicloud Defense, Threat Defense Virtual, Secure Workload, Secure Access, Duo, Hypershield, XDR, Splunk.</li>
<li>Multicloud Defense = SaaS controller plus auto-scaling gateways in your own accounts.</li>
<li>Ingress gateways reverse-proxy published apps; egress/east-west gateways filter outbound and inter-VPC traffic.</li>
<li>Centralised (hub) or distributed deployment; route tables must send traffic through the gateways.</li>
<li>Write policy with cloud tags so it survives auto-scaling.</li>
</ul></div>
`,hi:`
<p>Ek company socho jiske chaar alag shehron mein offices hain, har ek ka apna building manager, apni guard company aur apni rule book. Har office mein visitors ke saath alag treatment hota hai, aur koi jawab nahi de sakta ki "kal hamari buildings mein kaun aaya?". Samajhdaar company chaaron shehron ke liye ek security firm aur ek rule book rakhti hai. Multicloud environments mein bhi yahi problem hai: har provider ke apne security groups, apni firewall service aur apne logs hain. <b>Cisco Multicloud Defense</b> public clouds ke across network security ke liye "ek security firm, ek rule book" wala jawab hai.</p>

<h3>Cisco cloud security map</h3>
<p>Exam expect karta hai ki aap har Cisco product ko picture ke sahi hisse mein rakh sako:</p>
<table class="cmp"><tr><th>Zaroorat</th><th>Cisco product</th><th>Kahan kaam karta hai</th></tr>
<tr><td>Public cloud VPCs/VNets ke andar aur bahar traffic ke liye network security</td><td><b>Multicloud Defense</b></td><td>Customer ke cloud accounts mein auto-scaling gateways</td></tr>
<tr><td>Cloud mein poora NGFW, on-premises jaisi hi policy ke saath</td><td><b>Secure Firewall Threat Defense Virtual</b> (aur ASA Virtual)</td><td>Virtual appliances, Management Center ya Security Cloud Control se managed</td></tr>
<tr><td>Microsegmentation aur workload visibility</td><td><b>Secure Workload</b></td><td>Workloads par agents, cloud connectors (chapter 7)</td></tr>
<tr><td>Users ka internet, SaaS aur private apps tak secure pahunchna</td><td><b>Secure Access</b> (SSE: SWG, CASB, ZTNA, FWaaS, DLP) aur <b>Umbrella</b> DNS security</td><td>Cloud-delivered, agla module (sec-sse)</td></tr>
<tr><td>Cloud apps ke liye strong authentication aur device trust</td><td><b>Duo</b></td><td>Identity layer, SSO aur MFA</td></tr>
<tr><td>Har workload mein kernel-level enforcement</td><td><b>Hypershield</b>, Isovalent (Cilium, Tetragon)</td><td>Hosts aur Kubernetes mein eBPF (chapter 8)</td></tr>
<tr><td>In sab ke across detection, investigation aur response</td><td><b>XDR</b> aur <b>Splunk</b></td><td>Analytics aur SIEM (chapter 11)</td></tr>
</table>

<h3>Multicloud Defense architecture</h3>
<p>Do hisse hain. <b>Controller</b> SaaS hai, Cisco chalata hai. Aap har cloud account ko controller ko ek IAM role de kar onboard karte ho, aur phir woh VPCs/VNets, subnets, instances aur tags <b>discover</b> karta hai aur flow logs se traffic visibility dikhata hai, kuch bhi deploy karne se pehle hi. <b>Gateways</b> data plane hain. Controller unhe aapke cloud accounts mein cloud load balancers ke peeche auto-scaling groups ke roop mein deploy karta hai, isliye capacity traffic ke saath badhti hai aur fail hua instance apne aap replace hota hai.</p>
<ul>
<li><b>Ingress gateway</b>: published applications ke aage reverse proxy ki tarah kaam karta hai. Internet se aane wale traffic ke liye TLS termination, WAF, IPS aur antivirus.</li>
<li><b>Egress aur east-west gateway</b>: workloads se nikalne wale traffic ke liye forward proxy ya transparent hop. FQDN aur URL filtering, TLS decryption, IPS, DLP-style inspection, aur VPCs ke beech segmentation.</li>
</ul>
<p>Do deployment models hain. <b>Centralised (hub)</b> model mein gateways ek security VPC mein hote hain jo provider ke transit gateway ya hub se juda hota hai, aur spoke VPCs usse route karte hain. <b>Distributed</b> model mein gateways har application VPC ke andar hote hain. Hub chalana aasaan hai; distributed bahut high-throughput applications ke liye hair-pinning se bachata hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Multicloud Defense hub model">
<rect x="230" y="10" width="180" height="40" rx="8" fill="#fde68a"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Controller (SaaS)</text>
<rect x="230" y="90" width="180" height="55" rx="8" fill="#ddd6fe"/><text x="320" y="113" text-anchor="middle" class="svg-ink" font-size="13">Security VPC</text><text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">gateways (auto-scale)</text>
<rect x="10" y="170" width="170" height="45" rx="8" fill="#bae6fd"/><text x="95" y="198" text-anchor="middle" class="svg-ink" font-size="13">App VPC (AWS)</text>
<rect x="235" y="170" width="170" height="45" rx="8" fill="#bae6fd"/><text x="320" y="198" text-anchor="middle" class="svg-ink" font-size="13">App VNet (Azure)</text>
<rect x="460" y="170" width="170" height="45" rx="8" fill="#bae6fd"/><text x="545" y="198" text-anchor="middle" class="svg-ink" font-size="13">App VPC (GCP)</text>
<rect x="490" y="90" width="140" height="55" rx="8" fill="#e2e8f0"/><text x="560" y="122" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<line x1="320" y1="50" x2="320" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="95" y1="170" x2="280" y2="145" stroke="#64748b" stroke-width="2"/><line x1="320" y1="170" x2="320" y2="145" stroke="#64748b" stroke-width="2"/><line x1="545" y1="170" x2="370" y2="145" stroke="#64748b" stroke-width="2"/><line x1="410" y1="117" x2="490" y2="117" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Controller policy manage karta hai (dashed); traffic customer ke apne accounts ke gateways se hokar jaata hai.</p></div>

<h3>Policy tags se, IP addresses se nahi</h3>
<p>Jab bhi auto-scaling group instance replace karta hai, cloud IP addresses badal jaate hain. Isliye Multicloud Defense address objects <b>cloud tags</b> aur resource attributes se banata hai. Ek rule jo kehta hai "<code>app=payroll</code> tag wale instances <code>api.bank.example</code> tak 443 par ja sakte hain, internet ki taraf baaki sab deny" instances ke aane-jaane par bhi kaam karta rehta hai. Wahi rule set sab clouds ke gateways par apply ho sakta hai.</p>
<pre class="out">Rule set: egress-prod (applied to AWS, Azure, GCP gateways)
#  Source              Destination                Service  Action
1  tag app=payroll     fqdn api.bank.example      tcp/443  Allow, decrypt, IPS
2  tag env=prod        url-category Malware       any      <span class="hl">Deny</span>
3  tag env=prod        fqdn *.updates.example     tcp/443  Allow
4  any                 any                        any      <span class="hl">Deny, log</span></pre>

<div class="eg"><p><b>Worked example.</b> Ek application ke AWS mein 3 web instances aur Azure mein 2 hain. Central tool ke bina team do provider firewall policies maintain karti hai jinmein 40-40 rules hain aur do log formats. Multicloud Defense ke saath woh lagbhag 25 tag-based rules ka ek rule set maintain karti hai, sale ke din gateways bina kisi rule edit ke 2 se 6 instances tak scale hote hain, aur saare logs Splunk ke liye ek jagah aate hain.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Gateways deploy karna lekin route tables badalna bhool jaana, isliye traffic kabhi unse guzarta hi nahi. Instance IPs se rules likhna jo agle scale event par toot jaate hain. Certificate-pinned ya privacy-sensitive destinations ko exclude kiye bina TLS decryption on karna.</p></div>
<div class="exam"><p><b>Exam traps.</b> Multicloud Defense = SaaS controller + customer ke cloud mein auto-scaling gateways, jo ingress, egress aur east-west cover karte hain. Secure Workload = workload par enforce hone wala microsegmentation. Secure Access = cloud se user-to-app security (SSE). Inhe mix mat karo.</p></div>

<div class="scn"><h4>Do clouds, do rule books</h4><p>Ek media company apna video platform ek cloud mein aur billing system doosre cloud mein chalati thi. Pen test mein pata chala ki billing VMs kisi bhi internet destination tak kisi bhi port par ja sakte the, jabki video VMs tightly controlled the, kyunki do alag teams ne do alag policies likhi thi. Company ne dono clouds mein hub model mein Multicloud Defense deploy kiya, video team ke rules ko baseline ke roop mein import kiya, IP objects ko tag-based objects mein badla aur har jagah ek egress rule set apply kiya. Agle pen test mein dono clouds mein wahi consistent egress policy mili, aur har denied connection SIEM mein same fields ke saath dikha.</p><p><b>Seekh:</b> multicloud mein consistency khud ek security control hai. Ek policy, kai enforcement points.</p></div>

<div class="iv"><p class="q">"AWS, Azure aur GCP mein faile workloads ka egress kaise secure karoge?"</p><p>Central policy aur distributed enforcement describe karo: Cisco Multicloud Defense assets discover karta hai, hub ya per-VPC model mein auto-scaling gateways deploy karta hai, aur FQDN/URL filtering, TLS decryption aur IPS ke saath ek tag-based rule set apply karta hai. Traffic ko gateways se guzaarne ke liye route changes, logging ke saath default deny, aur logs SIEM ko bhejna mention karo. Ise per-provider security groups se contrast karo, jo ek useful pehli layer bane rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Map jaano: Multicloud Defense, Threat Defense Virtual, Secure Workload, Secure Access, Duo, Hypershield, XDR, Splunk.</li>
<li>Multicloud Defense = SaaS controller plus aapke apne accounts mein auto-scaling gateways.</li>
<li>Ingress gateways published apps ko reverse-proxy karte hain; egress/east-west gateways outbound aur inter-VPC traffic filter karte hain.</li>
<li>Centralised (hub) ya distributed deployment; route tables ko traffic gateways se bhejna chahiye.</li>
<li>Policy cloud tags se likho taaki auto-scaling mein bhi bachi rahe.</li>
</ul></div>
`}};export{e as default};