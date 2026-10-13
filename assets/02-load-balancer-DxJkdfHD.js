var e=(e,t)=>e.replace(/\{\{(\w+)\}\}/g,(e,n)=>t[n]),t=`<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="{{aria}}">
<rect x="10" y="90" width="90" height="50" rx="6" fill="#fed7aa"/><text x="55" y="120" text-anchor="middle" class="svg-ink" font-size="13">{{client}}</text>
<rect x="140" y="70" width="170" height="90" rx="8" fill="#fde68a"/><text x="225" y="92" text-anchor="middle" class="svg-ink" font-size="13">Load Balancer</text><text x="225" y="112" text-anchor="middle" class="svg-muted" font-size="12">frontend 203.0.113.20:80</text><text x="225" y="132" text-anchor="middle" class="svg-muted" font-size="12">rule 80 to 80</text><text x="225" y="150" text-anchor="middle" class="svg-accent" font-size="12">probe TCP 80</text>
<rect x="400" y="20" width="230" height="200" rx="8" fill="#f1f5f9" stroke="#94a3b8"/><text x="515" y="40" text-anchor="middle" class="svg-muted" font-size="12">{{pool}}</text>
<rect x="420" y="55" width="190" height="42" rx="6" fill="#bbf7d0"/><text x="515" y="80" text-anchor="middle" class="svg-ink" font-size="13">web-1 10.30.2.4</text>
<rect x="420" y="108" width="190" height="42" rx="6" fill="#bbf7d0"/><text x="515" y="133" text-anchor="middle" class="svg-ink" font-size="13">web-2 10.30.2.5</text>
<rect x="420" y="161" width="190" height="42" rx="6" fill="#fecaca"/><text x="515" y="186" text-anchor="middle" class="svg-ink" font-size="13">web-3 {{down}}</text>
<line x1="100" y1="115" x2="140" y2="115" stroke="#64748b" stroke-width="2"/><line x1="310" y1="100" x2="420" y2="76" stroke="#64748b" stroke-width="2"/><line x1="310" y1="115" x2="420" y2="129" stroke="#64748b" stroke-width="2"/><line x1="310" y1="130" x2="420" y2="182" stroke="#dc2626" stroke-width="2" stroke-dasharray="5 4"/>
<text x="320" y="245" text-anchor="middle" class="svg-muted" font-size="12">{{n}}</text>
</svg><p class="cap">{{cap}}</p></div>`,n=e(t,{aria:`Load Balancer with probe and backend pool`,client:`Client`,pool:`Backend pool`,down:`probe failed`,n:`Probe fails: web-3 gets no new connections until it answers again`,cap:`The pieces of a Load Balancer: frontend, rule, probe and backend pool.`}),r=e(t,{aria:`Load Balancer with probe and backend pool`,client:`Client`,pool:`Backend pool`,down:`probe fail`,n:`Probe fail: web-3 ko naye connections nahi milte jab tak woh dobara jawab na de`,cap:`Load Balancer ke hisse: frontend, rule, probe aur backend pool.`}),i={id:`load-balancer`,h:{en:`Azure Load Balancer (layer 4)`,hi:`Azure Load Balancer (layer 4)`},body:{en:`
<h3>What it is</h3>
<p>Azure Load Balancer is a high-performance <b>layer-4</b> service. It looks only at IP addresses, protocol (TCP or UDP) and ports, never at HTTP content. It is not a proxy: it does not terminate connections; it forwards packets to a chosen backend, so the backend sees the client's source IP and the load balancer adds almost no latency. It can be <b>public</b> (a public frontend IP, for internet traffic) or <b>internal</b> (a private frontend IP inside a VNet, for tiers such as a database or an internal API).</p>

<h3>The five parts</h3>
<dl class="terms">
<dt>Frontend IP configuration</dt><dd>The address clients connect to: a public IP (Standard SKU) or a private IP from a subnet. One load balancer can have several.</dd>
<dt>Backend pool</dt><dd>The VMs or VM scale set instances (by NIC or IP) that receive traffic, in one VNet.</dd>
<dt>Health probe</dt><dd>A periodic check: TCP connect, or HTTP or HTTPS GET to a path expecting 200. Instances that fail are removed from rotation for <b>new</b> connections. Probes come from the platform address 168.63.129.16, so NSGs must allow the <code>AzureLoadBalancer</code> service tag.</dd>
<dt>Load-balancing rule</dt><dd>Maps frontend IP and port to the backend pool and port, with a probe, a distribution mode, idle timeout and options such as floating IP.</dd>
<dt>Inbound NAT rule and outbound rule</dt><dd>Inbound NAT rule forwards a specific frontend port to one VM (for example port 50001 to SSH on vm-1). Outbound rules control SNAT for the pool (see the outbound module).</dd>
</dl>
`+n+`
<h3>Distribution mode</h3>
<p>The default is a <b>5-tuple hash</b> (source IP, source port, destination IP, destination port, protocol). The same flow always lands on the same backend, but different connections from the same client may go to different backends. With <b>session persistence</b> (also called source IP affinity) the hash uses 2 values (client IP and destination IP) or 3 (plus protocol), so one client sticks to one backend. This is not an "even" round-robin; spread depends on the hash, so with few clients, load may look uneven.</p>

<h3>SKU: use Standard</h3>
<ul>
<li><b>Standard</b>: zone-redundant or zonal frontends, up to 1,000 backend instances (verify), secure by default (<b>closed to inbound unless an NSG allows it</b>), SLA, HA ports, outbound rules, diagnostics. Hourly rule charge plus data processed (verify the pricing structure).</li>
<li><b>Basic</b>: retired; Microsoft announced retirement on 30 September 2025 (verify). Do not design new systems with it, and migrate old ones.</li>
<li>A newer <b>Gateway</b> SKU chains NVAs transparently, and a <b>global tier</b> offers cross-region load balancing (mention only; verify details).</li>
</ul>
<div class="warn"><b>Secure by default means closed.</b> A Standard public Load Balancer with a healthy pool still shows timeouts until the backend subnet or NIC has an NSG that allows the port (for example TCP 80 from the Internet tag) and the probe. Forgetting the NSG is the number-one beginner failure.</div>

<h3>HA ports</h3>
<p>An internal Standard Load Balancer rule with protocol <b>All</b>, frontend port 0 and backend port 0 is an <b>HA ports</b> rule: it load balances every TCP and UDP flow on every port. Its main use is a pair of network virtual appliances (firewalls) in a hub: all traffic from spokes is sent by UDR to the load balancer frontend IP and spread across active appliances with a probe checking their health. Floating IP (direct server return) is used for clustered services such as SQL Always On listeners that need the same IP on the backend.</p>

<pre class="code"><span class="c"># Public Standard Load Balancer with a frontend, pool, probe and rule</span>
az network public-ip create -g nk-lb-rg -n nk-lb-pip --sku Standard
az network lb create -g nk-lb-rg -n nk-lb --sku Standard --public-ip-address nk-lb-pip \\
  --frontend-ip-name fe --backend-pool-name be
az network lb probe create -g nk-lb-rg --lb-name nk-lb -n hp80 --protocol tcp --port 80
az network lb rule create -g nk-lb-rg --lb-name nk-lb -n r80 --protocol tcp --frontend-port 80 --backend-port 80 \\
  --frontend-ip-name fe --backend-pool-name be --probe-name hp80 --idle-timeout 4

<span class="c"># Source IP affinity on a rule</span>
az network lb rule update -g nk-lb-rg --lb-name nk-lb -n r80 --load-distribution SourceIP</pre>

<h3>Idle timeout and limits</h3>
<p>Idle timeout defaults to 4 minutes and can be raised (up to 30 minutes, verify); TCP keep-alives or TCP reset on idle help long-lived sessions. An internal Load Balancer cannot be used by a backend VM to reach its <b>own</b> frontend IP (the "hairpin" case): the flow fails when the selected backend is the sender itself.</p>

<div class="eg"><b>Worked example.</b> The probe checks TCP 80 every 5 seconds and marks a VM unhealthy after 2 consecutive failures (illustrative values; verify defaults). If web-3's service stops at 12:00:00, it is removed from rotation around 12:00:10. Existing TCP connections to web-3 may continue until they end or reset; new connections go to web-1 and web-2.</div>

<div class="exam"><b>Exam trap.</b> The probe source is the platform address 168.63.129.16, represented by the <code>AzureLoadBalancer</code> service tag. A deny-all NSG without allowing it makes every instance look unhealthy, so no traffic flows.</div>

<div class="scn"><h4>Healthy VMs, dead service</h4><p>A new public Load Balancer returned timeouts although both VMs ran nginx. The engineer saw backend health at 0 percent. The VM subnet NSG had a custom deny-all inbound rule above the defaults; it blocked the probe from 168.63.129.16 as well as client traffic. Adding allow rules for the AzureLoadBalancer tag and for TCP 80 brought the pool to 100 percent healthy.</p><p><b>Lesson:</b> check the probe path and the NSG first; the application is often fine.</p></div>

<div class="iv"><p class="q">"What is HA ports and when do you use it?"</p><p>A rule on an internal Standard Load Balancer with protocol All and port 0 that balances all flows on all ports. Used to load balance and fail over network virtual appliances such as firewalls in a hub, with UDRs sending spoke traffic to the load balancer frontend IP. Mention health probes and symmetric flow.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Load Balancer is layer 4: frontend, pool, probe, rule; public or internal.</li>
<li>Standard SKU is secure by default: an NSG must allow traffic and the probe.</li>
<li>Default distribution is a 5-tuple hash; source IP affinity makes clients sticky.</li>
<li>HA ports balance all ports for NVAs; floating IP is for clustered services.</li>
<li>Basic SKU is retired (verify date).</li>
</ul></div>
`,hi:`
<h3>Yeh kya hai</h3>
<p>Azure Load Balancer high-performance <b>layer-4</b> service hai. Yeh sirf IP addresses, protocol (TCP ya UDP) aur ports dekhta hai, HTTP content kabhi nahi. Yeh proxy nahi hai: connections terminate nahi karta; packets ko chune hue backend ko forward karta hai, isliye backend ko client ka source IP dikhta hai aur load balancer lagbhag koi latency nahi jodta. Yeh <b>public</b> (public frontend IP, internet traffic ke liye) ya <b>internal</b> (VNet ke andar private frontend IP, database ya internal API jaisi tiers ke liye) ho sakta hai.</p>

<h3>Paanch hisse</h3>
<dl class="terms">
<dt>Frontend IP configuration</dt><dd>Woh address jis se clients connect karte hain: public IP (Standard SKU) ya subnet ka private IP. Ek load balancer ke kai ho sakte hain.</dd>
<dt>Backend pool</dt><dd>Woh VMs ya VM scale set instances (NIC ya IP se) jo traffic paate hain, ek VNet mein.</dd>
<dt>Health probe</dt><dd>Periodic check: TCP connect, ya path par HTTP ya HTTPS GET jisme 200 expected ho. Fail hone wale instances <b>naye</b> connections ke liye rotation se hat jaate hain. Probes platform address 168.63.129.16 se aate hain, isliye NSGs ko <code>AzureLoadBalancer</code> service tag allow karna chahiye.</dd>
<dt>Load-balancing rule</dt><dd>Frontend IP aur port ko backend pool aur port se map karta hai, probe, distribution mode, idle timeout aur floating IP jaise options ke saath.</dd>
<dt>Inbound NAT rule aur outbound rule</dt><dd>Inbound NAT rule ek khaas frontend port ko ek VM ko forward karta hai (jaise port 50001 se vm-1 ka SSH). Outbound rules pool ka SNAT control karte hain (outbound module dekho).</dd>
</dl>
`+r+`
<h3>Distribution mode</h3>
<p>Default <b>5-tuple hash</b> hai (source IP, source port, destination IP, destination port, protocol). Wahi flow hamesha wahi backend par jaata hai, par ek hi client ke alag connections alag backends par ja sakte hain. <b>Session persistence</b> (source IP affinity) ke saath hash 2 values (client IP aur destination IP) ya 3 (plus protocol) use karta hai, isliye ek client ek backend se chipka rehta hai. Yeh "barabar" round-robin nahi hai; spread hash par depend karta hai, isliye kam clients ho to load uneven dikh sakta hai.</p>

<h3>SKU: Standard use karo</h3>
<ul>
<li><b>Standard</b>: zone-redundant ya zonal frontends, 1,000 tak backend instances (verify), secure by default (<b>inbound band jab tak NSG allow na kare</b>), SLA, HA ports, outbound rules, diagnostics. Hourly rule charge plus data processed (pricing structure verify karo).</li>
<li><b>Basic</b>: retire; Microsoft ne 30 September 2025 ko retirement announce kiya (verify). Naye systems ismein design mat karo, aur purane migrate karo.</li>
<li>Naya <b>Gateway</b> SKU NVAs ko transparently chain karta hai, aur <b>global tier</b> cross-region load balancing deta hai (sirf zikr; details verify karo).</li>
</ul>
<div class="warn"><b>Secure by default matlab closed.</b> Healthy pool wala Standard public Load Balancer tab tak timeouts dikhata hai jab tak backend subnet ya NIC par aisa NSG na ho jo port (jaise Internet tag se TCP 80) aur probe allow kare. NSG bhool jaana beginners ki number-one failure hai.</div>

<h3>HA ports</h3>
<p>Internal Standard Load Balancer ka rule jisme protocol <b>All</b>, frontend port 0 aur backend port 0 ho, <b>HA ports</b> rule hai: yeh har port ke har TCP aur UDP flow ko load balance karta hai. Iska mukhya use hub mein network virtual appliances (firewalls) ki jodi hai: spokes ka saara traffic UDR se load balancer frontend IP ko bheja jaata hai aur probe se unki health check karke active appliances mein baanta jaata hai. Floating IP (direct server return) SQL Always On listeners jaisi clustered services ke liye hai jinhe backend par wahi IP chahiye.</p>

<pre class="code"><span class="c"># Frontend, pool, probe aur rule ke saath public Standard Load Balancer</span>
az network public-ip create -g nk-lb-rg -n nk-lb-pip --sku Standard
az network lb create -g nk-lb-rg -n nk-lb --sku Standard --public-ip-address nk-lb-pip \\
  --frontend-ip-name fe --backend-pool-name be
az network lb probe create -g nk-lb-rg --lb-name nk-lb -n hp80 --protocol tcp --port 80
az network lb rule create -g nk-lb-rg --lb-name nk-lb -n r80 --protocol tcp --frontend-port 80 --backend-port 80 \\
  --frontend-ip-name fe --backend-pool-name be --probe-name hp80 --idle-timeout 4

<span class="c"># Rule par source IP affinity</span>
az network lb rule update -g nk-lb-rg --lb-name nk-lb -n r80 --load-distribution SourceIP</pre>

<h3>Idle timeout aur limits</h3>
<p>Idle timeout default 4 minute hai aur badhaya ja sakta hai (30 minute tak, verify); lambe sessions ke liye TCP keep-alives ya TCP reset on idle madad karte hain. Internal Load Balancer ka backend VM apne <b>khud ke</b> frontend IP tak nahi pahunch sakta ("hairpin" case): jab chuna hua backend sender khud ho to flow fail hota hai.</p>

<div class="eg"><b>Worked example.</b> Probe har 5 second mein TCP 80 check karta hai aur 2 lagataar failures ke baad VM ko unhealthy mark karta hai (illustrative values; defaults verify karo). web-3 ki service 12:00:00 par ruke to woh lagbhag 12:00:10 par rotation se hat jaata hai. web-3 ke maujooda TCP connections khatam ya reset hone tak chal sakte hain; naye connections web-1 aur web-2 ko jaate hain.</div>

<div class="exam"><b>Exam trap.</b> Probe source platform address 168.63.129.16 hai, jo <code>AzureLoadBalancer</code> service tag se represent hota hai. Ise allow kiye bina deny-all NSG har instance ko unhealthy dikhata hai, isliye traffic nahi chalta.</div>

<div class="scn"><h4>Healthy VMs, dead service</h4><p>Naya public Load Balancer timeouts de raha tha jabki dono VMs par nginx chal raha tha. Engineer ne backend health 0 percent dekhi. VM subnet NSG mein defaults ke upar custom deny-all inbound rule tha; usne 168.63.129.16 se probe ko bhi client traffic ki tarah block kiya. AzureLoadBalancer tag aur TCP 80 ke liye allow rules jodne se pool 100 percent healthy ho gaya.</p><p><b>Lesson:</b> pehle probe path aur NSG check karo; application aksar theek hota hai.</p></div>

<div class="iv"><p class="q">"HA ports kya hai aur kab use karte hain?"</p><p>Internal Standard Load Balancer ka rule jisme protocol All aur port 0 hota hai jo saare ports ke saare flows balance karta hai. Hub mein firewalls jaise network virtual appliances ko load balance aur fail over karne ke liye, UDRs se spoke traffic load balancer frontend IP ko bhejkar. Health probes aur symmetric flow ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Load Balancer layer 4 hai: frontend, pool, probe, rule; public ya internal.</li>
<li>Standard SKU secure by default hai: NSG ko traffic aur probe allow karna padega.</li>
<li>Default distribution 5-tuple hash hai; source IP affinity clients ko sticky banati hai.</li>
<li>HA ports NVAs ke liye saare ports balance karta hai; floating IP clustered services ke liye.</li>
<li>Basic SKU retire hai (date verify karo).</li>
</ul></div>
`}};export{i as default};