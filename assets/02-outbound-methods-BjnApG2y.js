var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="{{aria}}">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">{{title}}</text>
<rect x="60" y="34" width="520" height="38" rx="6" fill="#fed7aa"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">{{l1}}</text>
<rect x="90" y="80" width="460" height="38" rx="6" fill="#fde68a"/><text x="320" y="104" text-anchor="middle" class="svg-ink" font-size="13">{{l2}}</text>
<rect x="120" y="126" width="400" height="38" rx="6" fill="#bae6fd"/><text x="320" y="150" text-anchor="middle" class="svg-ink" font-size="13">{{l3}}</text>
<rect x="150" y="172" width="340" height="38" rx="6" fill="#ddd6fe"/><text x="320" y="196" text-anchor="middle" class="svg-ink" font-size="13">{{l4}}</text>
<rect x="180" y="218" width="280" height="38" rx="6" fill="#e2e8f0"/><text x="320" y="242" text-anchor="middle" class="svg-ink" font-size="13">{{l5}}</text>
<text x="610" y="58" text-anchor="end" class="svg-accent" font-size="12">{{top}}</text><text x="610" y="242" text-anchor="end" class="svg-muted" font-size="12">{{bot}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Outbound method precedence ladder`,title:`Which outbound method wins (verify exact order)`,l1:`UDR next hop: firewall or NVA (routing decides first)`,l2:`NAT Gateway on the subnet`,l3:`Public IP on the VM NIC`,l4:`Standard Load Balancer outbound rule or rule SNAT`,l5:`Default outbound access (implicit, retiring)`,top:`strongest`,bot:`weakest`,cap:`When several outbound methods exist, Azure uses the strongest one. Treat the exact order as something to verify against current documentation.`}),r=e(t,{aria:`Outbound method precedence ladder`,title:`Kaunsa outbound method jeetta hai (exact order verify karo)`,l1:`UDR next hop: firewall ya NVA (routing pehle decide karti hai)`,l2:`Subnet par NAT Gateway`,l3:`VM NIC par public IP`,l4:`Standard LB outbound rule ya rule SNAT`,l5:`Default outbound access (implicit, retire)`,top:`sabse strong`,bot:`sabse weak`,cap:`Kai outbound methods hon to Azure sabse strong wala use karta hai. Exact order ko current documentation se verify karne wali cheez maano.`}),i={id:`outbound-methods`,h:{en:`Four ways out: choosing an outbound method`,hi:`Bahar jaane ke chaar raaste: outbound method chunna`},body:{en:`
<h3>The problem in one sentence</h3>
<p>A VM with only a private address such as 10.60.1.4 cannot talk to the internet by itself, because private RFC1918 addresses are not routable there. Something must translate the source address to a public one. Azure gives you several things that can do this job, and they behave differently. Choosing well is the heart of this module.</p>

<h3>The methods</h3>
<dl class="terms">
<dt>Default outbound access</dt><dd>An implicit public IP that Azure assigns from its own pool to a VM that has no other outbound method. You do not own it, cannot see it as a resource and it can change. Being retired for new VNets (verify date and state).</dd>
<dt>Public IP on the VM</dt><dd>An instance-level public IP attached to the NIC. Outbound traffic uses it for SNAT. Simple, but the VM is now also reachable from the internet unless an NSG blocks it, and every VM needs its own address.</dd>
<dt>Standard Load Balancer outbound</dt><dd>A public Standard Load Balancer can SNAT outbound traffic of its backend pool, either through the SNAT of a load-balancing rule or through explicit <b>outbound rules</b> that give you control over the number of ports per VM.</dd>
<dt>NAT Gateway</dt><dd>A subnet-level managed service with one or more static public IPs or a public IP prefix. The recommended method for most outbound-only needs.</dd>
<dt>Firewall or NVA via a user-defined route</dt><dd>A UDR sends 0.0.0.0/0 to Azure Firewall or a network virtual appliance, which inspects and then SNATs. Used when you must filter or log egress by FQDN or URL.</dd>
</dl>
`+n+`
<h3>Precedence: what happens when several exist</h3>
<p>Two layers are involved. First <b>routing</b> picks a next hop: if a user-defined route sends 0.0.0.0/0 to a firewall or appliance, traffic goes there and that device does the NAT. Second, for traffic that is routed to the internet, Azure chooses the SNAT source. In general a NAT Gateway on the subnet takes precedence over the VM's own public IP and over load balancer outbound rules, and all of these beat default outbound access (verify the exact current order in the Azure documentation before relying on it in a design review).</p>

<div class="eg"><b>Worked example.</b> Subnet 10.60.1.0/24 holds app-1 and app-2. app-2 also has its own public IP 198.51.100.77 (a documentation address). Without a NAT Gateway, app-2 goes out as 198.51.100.77 and app-1 uses the implicit address. After you attach a NAT Gateway with public IP 203.0.113.50 to the subnet, both VMs go out as 203.0.113.50. The public IP on app-2 still accepts inbound traffic if the NSG allows it, but outbound now uses the gateway. That is a classic surprise: "why did my allow-listed address change?"</div>

<h3>Standard Load Balancer outbound rules</h3>
<p>A Standard public Load Balancer can provide outbound SNAT in two ways. The load-balancing rule itself gives SNAT unless you disable it with the option <code>disable-outbound-snat</code>. An <b>outbound rule</b> is the explicit and recommended form: you choose the frontend IPs, the backend pool, the protocol, the idle timeout and the number of SNAT ports allocated to each backend instance. Fixed port allocation is predictable but wastes ports for idle VMs; automatic allocation by pool size scales the ports down as the pool grows. Both can hit exhaustion (next chapters).</p>
<pre class="code"><span class="c"># Illustrative: an explicit outbound rule on a Standard LB</span>
az network lb outbound-rule create -g nk-rg --lb-name nk-lb -n out1 \\
  --frontend-ip-configs fe-out --address-pool be --protocol All \\
  --outbound-ports 10000 --idle-timeout 15</pre>

<h3>Why NAT Gateway is usually the answer</h3>
<table class="cmp"><tr><th>Need</th><th>Best fit</th></tr>
<tr><td>Simple stable egress IP for a subnet</td><td>NAT Gateway</td></tr>
<tr><td>Backend pool already behind a public LB</td><td>LB outbound rule, or NAT Gateway on the subnet</td></tr>
<tr><td>Inspect and filter egress by domain or URL</td><td>Azure Firewall or NVA with UDR</td></tr>
<tr><td>One VM, quick test</td><td>Public IP on the NIC (with NSG)</td></tr>
<tr><td>Anything long-lived on a new VNet</td><td>Not default outbound access</td></tr></table>

<div class="warn"><b>Common mistakes.</b> Mixing methods without noticing precedence; leaving a public IP on a VM "just in case" and then wondering why the outbound IP is not the NAT Gateway's; assuming default outbound access still exists in a newly created subnet.</div>
<div class="exam"><b>Exam trap.</b> Questions often ask which method needs <b>no</b> route table change and works per subnet: NAT Gateway. And which gives the VM an address you do not own: default outbound access.</div>

<div class="scn"><h4>The allow-list that stopped matching</h4><p>A partner API allow-listed 198.51.100.77, the public IP of one VM. A new NAT Gateway was attached to the shared subnet for compliance; suddenly the partner API refused all calls. The engineer ran an outside what-is-my-IP check from the VM and saw 203.0.113.50, the NAT Gateway address. The fix was to give the partner the NAT Gateway's address, not to remove it.</p><p><b>Lesson:</b> attaching a NAT Gateway changes the outbound source address for every VM in the subnet, even those with their own public IP.</p></div>

<div class="iv"><p class="q">"A VM has a public IP and the subnet has a NAT Gateway. Which one is used for outbound?"</p><p>Say that the NAT Gateway takes precedence for outbound connections, while the VM's public IP can still be used for inbound if the NSG allows it. Add that you would confirm with a what-is-my-IP call and by reading current Microsoft documentation (verify).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five outbound options: default access, VM public IP, LB outbound, NAT Gateway, firewall or NVA via UDR.</li>
<li>Routing (UDR) decides the next hop first; then the strongest SNAT method applies.</li>
<li>NAT Gateway is the usual recommendation for a stable outbound IP per subnet.</li>
<li>LB outbound rules let you tune SNAT ports per VM.</li>
<li>Mixing methods changes the visible source IP; always test from inside the VM.</li>
</ul></div>
`,hi:`
<h3>Problem ek line mein</h3>
<p>Sirf private address wala VM, jaise 10.60.1.4, khud internet se baat nahi kar sakta kyunki private RFC1918 addresses wahan route nahi hote. Kisi ko source address public mein translate karna padega. Azure kai cheezein deta hai jo yeh kaam kar sakti hain, aur woh alag tarah behave karti hain. Sahi chunna is module ka dil hai.</p>

<h3>Methods</h3>
<dl class="terms">
<dt>Default outbound access</dt><dd>Implicit public IP jo Azure apne pool se us VM ko deta hai jiske paas koi aur outbound method nahi. Aap uske maalik nahi, use resource ki tarah dekh nahi sakte aur woh badal sakta hai. Naye VNets ke liye retire ho raha hai (date aur state verify karo).</dd>
<dt>VM par public IP</dt><dd>NIC par lagaya instance-level public IP. Outbound traffic SNAT ke liye use karta hai. Simple hai, par ab VM internet se reachable bhi hai jab tak NSG block na kare, aur har VM ko apna address chahiye.</dd>
<dt>Standard Load Balancer outbound</dt><dd>Public Standard Load Balancer apne backend pool ka outbound traffic SNAT kar sakta hai, ya to load-balancing rule ke SNAT se ya explicit <b>outbound rules</b> se, jo har VM ke ports ki sankhya par control dete hain.</dd>
<dt>NAT Gateway</dt><dd>Subnet-level managed service, ek ya zyada static public IPs ya public IP prefix ke saath. Zyadatar outbound-only zarooraton ke liye recommended method.</dd>
<dt>UDR ke through Firewall ya NVA</dt><dd>UDR 0.0.0.0/0 ko Azure Firewall ya network virtual appliance ko bhejta hai, jo inspect karke SNAT karta hai. Tab use hota hai jab egress ko FQDN ya URL se filter ya log karna ho.</dd>
</dl>
`+r+`
<h3>Precedence: kai hon to kya hota hai</h3>
<p>Do layers shamil hain. Pehle <b>routing</b> next hop chunti hai: agar user-defined route 0.0.0.0/0 ko firewall ya appliance ko bheje to traffic wahan jaata hai aur woh device NAT karta hai. Doosra, jo traffic internet ke liye route hua usme Azure SNAT source chunta hai. Aam taur par subnet par NAT Gateway VM ke apne public IP aur load balancer outbound rules par precedence leta hai, aur yeh sab default outbound access se upar hain (design review mein rely karne se pehle current Azure documentation mein exact order verify karo).</p>

<div class="eg"><b>Worked example.</b> Subnet 10.60.1.0/24 mein app-1 aur app-2 hain. app-2 ke paas apna public IP 198.51.100.77 (documentation address) bhi hai. NAT Gateway ke bina app-2 198.51.100.77 se nikalta hai aur app-1 implicit address se. Subnet par public IP 203.0.113.50 wala NAT Gateway attach karne ke baad dono VMs 203.0.113.50 se nikalte hain. app-2 ka public IP NSG allow kare to inbound abhi bhi accept karta hai, par outbound ab gateway use karta hai. Yeh classic surprise hai: "mera allow-listed address kyun badal gaya?"</div>

<h3>Standard Load Balancer outbound rules</h3>
<p>Standard public Load Balancer do tareeke se outbound SNAT de sakta hai. Load-balancing rule khud SNAT deta hai jab tak aap <code>disable-outbound-snat</code> option se band na karo. <b>Outbound rule</b> explicit aur recommended form hai: aap frontend IPs, backend pool, protocol, idle timeout aur har backend instance ko diye gaye SNAT ports ki sankhya chunte ho. Fixed port allocation predictable hai par idle VMs ke ports waste karta hai; pool size ke hisaab se automatic allocation pool badhne par ports ghatata hai. Dono exhaustion tak pahunch sakte hain (agle chapters).</p>
<pre class="code"><span class="c"># Illustrative: Standard LB par explicit outbound rule</span>
az network lb outbound-rule create -g nk-rg --lb-name nk-lb -n out1 \\
  --frontend-ip-configs fe-out --address-pool be --protocol All \\
  --outbound-ports 10000 --idle-timeout 15</pre>

<h3>NAT Gateway aksar jawab kyun hai</h3>
<table class="cmp"><tr><th>Zaroorat</th><th>Best fit</th></tr>
<tr><td>Subnet ke liye simple stable egress IP</td><td>NAT Gateway</td></tr>
<tr><td>Backend pool pehle se public LB ke peeche</td><td>LB outbound rule, ya subnet par NAT Gateway</td></tr>
<tr><td>Egress ko domain ya URL se inspect aur filter karna</td><td>UDR ke saath Azure Firewall ya NVA</td></tr>
<tr><td>Ek VM, quick test</td><td>NIC par public IP (NSG ke saath)</td></tr>
<tr><td>Naye VNet par koi bhi long-lived cheez</td><td>Default outbound access nahi</td></tr></table>

<div class="warn"><b>Common mistakes.</b> Precedence dekhe bina methods mix karna; VM par "just in case" public IP chhod dena aur phir sochna ki outbound IP NAT Gateway ka kyun nahi; maan lena ki naye subnet mein default outbound access abhi bhi hai.</div>
<div class="exam"><b>Exam trap.</b> Aksar poochte hain kaunsa method <b>bina</b> route table change ke per subnet kaam karta hai: NAT Gateway. Aur kaunsa VM ko aisa address deta hai jo aapka nahi: default outbound access.</div>

<div class="scn"><h4>Allow-list jo match hona band ho gayi</h4><p>Partner API ne 198.51.100.77, ek VM ka public IP, allow-list kiya tha. Compliance ke liye shared subnet par naya NAT Gateway attach hua; achanak partner API ne saare calls refuse kar diye. Engineer ne VM ke andar se bahar ka what-is-my-IP check chalaya aur 203.0.113.50, NAT Gateway ka address, dekha. Fix yeh tha ki partner ko NAT Gateway ka address do, use hatao nahi.</p><p><b>Lesson:</b> NAT Gateway attach karne se subnet ke har VM ka outbound source address badal jaata hai, unka bhi jinke paas apna public IP hai.</p></div>

<div class="iv"><p class="q">"VM ke paas public IP hai aur subnet par NAT Gateway hai. Outbound ke liye kaunsa use hota hai?"</p><p>Kaho ki outbound connections ke liye NAT Gateway precedence leta hai, jabki VM ka public IP NSG allow kare to inbound ke liye abhi bhi use ho sakta hai. Jodo ki aap what-is-my-IP call se aur current Microsoft documentation padhkar confirm karoge (verify).</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch outbound options: default access, VM public IP, LB outbound, NAT Gateway, UDR ke through firewall ya NVA.</li>
<li>Routing (UDR) pehle next hop decide karti hai; phir sabse strong SNAT method lagta hai.</li>
<li>Subnet ke liye stable outbound IP ke liye NAT Gateway aam recommendation hai.</li>
<li>LB outbound rules se har VM ke SNAT ports tune hote hain.</li>
<li>Methods mix karne se dikhne wala source IP badalta hai; hamesha VM ke andar se test karo.</li>
</ul></div>
`}};export{i as default};