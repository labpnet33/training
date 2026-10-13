var e=`<svg viewBox="0 0 640 250" role="img" aria-label="NSG troubleshooting flow">
<rect x="10" y="10" width="190" height="46" rx="8" fill="#bae6fd"/><text x="105" y="38" text-anchor="middle" class="svg-ink" font-size="13">1 Write the 5-tuple</text>
<rect x="225" y="10" width="190" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="13">2 Which NSGs apply?</text>
<rect x="440" y="10" width="190" height="46" rx="8" fill="#ddd6fe"/><text x="535" y="38" text-anchor="middle" class="svg-ink" font-size="13">3 Effective rules</text>
<rect x="10" y="90" width="190" height="46" rx="8" fill="#fde68a"/><text x="105" y="118" text-anchor="middle" class="svg-ink" font-size="13">4 IP flow verify</text>
<rect x="225" y="90" width="190" height="46" rx="8" fill="#fed7aa"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="13">5 Priority and direction</text>
<rect x="440" y="90" width="190" height="46" rx="8" fill="#e2e8f0"/><text x="535" y="118" text-anchor="middle" class="svg-ink" font-size="13">6 Route, public IP, DNS</text>
<rect x="120" y="170" width="400" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="198" text-anchor="middle" class="svg-ink" font-size="13">7 Guest firewall, service listening, flow logs</text>
<g stroke="#64748b" stroke-width="2"><line x1="200" y1="33" x2="225" y2="33"/><line x1="415" y1="33" x2="440" y2="33"/><line x1="535" y1="56" x2="535" y2="90"/><line x1="440" y1="113" x2="415" y2="113"/><line x1="225" y1="113" x2="200" y2="113"/><line x1="320" y1="136" x2="320" y2="170"/></g>
</svg>`,t={id:`troubleshooting`,h:{en:`Troubleshooting workflow: from "it is blocked" to the exact rule`,hi:`Troubleshooting workflow: "block ho raha hai" se exact rule tak`},body:{en:`
<h3>Never debug a vague complaint</h3>
<p>"The server is not reachable" cannot be solved. "TCP 443 from 203.0.113.50 to 10.10.1.4 times out" can. Turn every ticket into a 5-tuple first, then follow a fixed order.</p>

<div class="dia">`+e+`<p class="cap">Seven steps. Most tickets end by step 4.</p></div>

<h3>1. Write the 5-tuple</h3>
<p>Source IP, source port (usually random), destination IP, destination port, protocol, plus direction. Decide whether the traffic comes from the Internet, another subnet, another VNet or on-premises, because that changes which tags and routes matter.</p>

<h3>2. Which NSGs apply?</h3>
<pre class="code">az network vnet subnet show -g rg-nk-lab --vnet-name vnet-nk -n snet-web --query networkSecurityGroup.id
az network nic show -g rg-nk-lab -n vm-webVMNic --query networkSecurityGroup.id</pre>
<p>A <code>null</code> result means no NSG there. Remember inbound is subnet then NIC; outbound is NIC then subnet. Both ends matter: the source VM's outbound rules and the destination's inbound rules.</p>

<h3>3. Effective rules</h3>
<pre class="code">az network nic list-effective-nsg -g rg-nk-lab -n vm-webVMNic --output table</pre>
<p>Read the combined list in priority order for the direction you care about. Look for a deny with a smaller number than your allow.</p>

<h3>4. IP flow verify</h3>
<pre class="code">az network watcher test-ip-flow -g rg-nk-lab --vm vm-web --direction Inbound --protocol TCP --local 10.10.1.4:443 --remote 203.0.113.50:50000</pre>
<pre class="out">Access: <span class="hl">Deny</span>
RuleName: defaultSecurityRules/DenyAllInBound</pre>
<p>If the rule is a default deny, you simply never added an allow. If it is your own rule, fix the priority or the match. If the result is Allow, the NSG is not your problem.</p>

<h3>5. Priority, direction and match mistakes</h3>
<ul>
<li>Allow at a higher number than a deny that matches.</li>
<li>Wrong direction (a rule for outbound that should be inbound).</li>
<li>The port put in the <b>source</b> field instead of destination.</li>
<li>Protocol Tcp when the application uses Udp, or ICMP for ping (ping is ICMP and is allowed within the VNet by default but not from the Internet).</li>
<li>Source set to a service tag that does not contain the real client, for example VirtualNetwork when the client is on the Internet.</li>
<li>An ASG rule where the NIC is not a member, or the ASG is in a different VNet.</li>
</ul>

<h3>6. Not the NSG after all: route, public IP, DNS</h3>
<p>If IP flow verify says Allow but the connection fails, check: a user-defined route sending the traffic to a firewall that drops it; a Standard public IP not associated; Basic or Standard SKU mismatch with a load balancer; DNS returning the wrong address; asymmetric routing (traffic goes in directly and replies through a firewall, which has no state for it).</p>

<h3>7. Guest OS and the application</h3>
<p>Is the service listening on the port? Is ufw, iptables or Windows Firewall blocking? For Linux, check <code>ss -tlnp</code> inside the VM. Enable flow logs only if you need history; otherwise on-demand tools are enough and free.</p>

<h3>Worked tickets</h3>
<ol>
<li><b>"HTTPS to the web VM times out."</b> Subnet NSG allows 443, but a NIC NSG denies. Remove the NIC NSG or add the allow.</li>
<li><b>"Web VM cannot reach the database on 1433."</b> A deny VirtualNetwork to VirtualNetwork at priority 200 sits above an allow at 300. Reorder.</li>
<li><b>"Load balancer health probe fails."</b> A custom deny for all inbound at a low number blocks AzureLoadBalancer. Allow the tag above it.</li>
<li><b>"SSH worked yesterday."</b> The home IP changed and the allow rule has the old /32. Update it.</li>
<li><b>"Rule is deleted but old connections still work."</b> Existing flows may live until they end or time out (verify behaviour).</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ticket: "app VM 10.10.2.4 cannot call db VM 10.10.3.4 on TCP 1433". Step 1: source 10.10.2.4, destination 10.10.3.4:1433, TCP. Step 2: snet-data has nsg-data, no NIC NSG. Step 3 and 4: IP flow verify on the db VM, inbound, shows Deny, rule DenyVnetAll at priority 150. Step 5: the allow for the app subnet is at 200, so the deny wins. She changes the allow to priority 120 and the test returns Allow.</p></div>

<div class="warn"><p><b>Common mistake.</b> Opening the port to "Any" to test, then forgetting it. Use IP flow verify to test instead. If you must open temporarily, set a calendar reminder and a tag with an expiry date.</p></div>

<div class="exam"><p><b>Exam trap.</b> A health probe source is 168.63.129.16 (the AzureLoadBalancer tag). Blocking it makes a load-balanced app look dead. Ping is ICMP, which needs its own rule from the Internet.</p></div>

<div class="scn"><h4>The probe that failed</h4><p>After a security review added a "deny all inbound" at priority 200 to the subnet, a load-balanced app went unhealthy. The load balancer's probes come from the AzureLoadBalancer tag and the new deny sat above the default allow at 65001. The engineer added an allow for the tag at priority 150, and the backend became healthy.</p><p><b>Lesson:</b> a deny-all you write yourself must be placed with the defaults in mind.</p></div>

<div class="iv"><p class="q">"A connection is blocked and you suspect an NSG. What is your method?"</p><p>Define the 5-tuple, find every NSG on both ends, check effective rules, run IP flow verify to name the rule, then fix priority or scope. If the NSG allows, move to routes, public IP, DNS and the guest OS.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Turn the complaint into a 5-tuple and a direction.</li>
<li>Check both subnet and NIC NSGs at both ends.</li>
<li>IP flow verify names the deciding rule.</li>
<li>Most failures are priority order, direction or a hidden second NSG.</li>
<li>If the NSG allows, look at routes, DNS, public IP and the OS.</li>
</ul></div>
`,hi:`
<h3>Vague complaint ko kabhi debug mat karo</h3>
<p>"Server reachable nahi hai" solve nahi ho sakta. "203.0.113.50 se 10.10.1.4 par TCP 443 time out ho raha hai" ho sakta hai. Har ticket ko pehle 5-tuple banao, phir fixed order follow karo.</p>

<div class="dia">`+e+`<p class="cap">Saat steps. Zyadatar tickets step 4 tak khatam ho jaate hain.</p></div>

<h3>1. 5-tuple likho</h3>
<p>Source IP, source port (aam taur par random), destination IP, destination port, protocol, plus direction. Decide karo ki traffic Internet, doosre subnet, doosre VNet ya on-premises se aa raha hai, kyunki isse badalta hai ki kaun se tags aur routes matter karte hain.</p>

<h3>2. Kaun se NSGs lagte hain?</h3>
<pre class="code">az network vnet subnet show -g rg-nk-lab --vnet-name vnet-nk -n snet-web --query networkSecurityGroup.id
az network nic show -g rg-nk-lab -n vm-webVMNic --query networkSecurityGroup.id</pre>
<p><code>null</code> result ka matlab wahan koi NSG nahi. Yaad rakho inbound subnet phir NIC hai; outbound NIC phir subnet hai. Dono ends matter karte hain: source VM ke outbound rules aur destination ke inbound rules.</p>

<h3>3. Effective rules</h3>
<pre class="code">az network nic list-effective-nsg -g rg-nk-lab -n vm-webVMNic --output table</pre>
<p>Jis direction ki aapko parwah hai uski combined list priority order mein padho. Apne allow se chhote number wala deny dhundho.</p>

<h3>4. IP flow verify</h3>
<pre class="code">az network watcher test-ip-flow -g rg-nk-lab --vm vm-web --direction Inbound --protocol TCP --local 10.10.1.4:443 --remote 203.0.113.50:50000</pre>
<pre class="out">Access: <span class="hl">Deny</span>
RuleName: defaultSecurityRules/DenyAllInBound</pre>
<p>Agar rule default deny hai to aapne kabhi allow add hi nahi kiya. Agar woh aapka apna rule hai to priority ya match fix karo. Agar result Allow hai to NSG aapki problem nahi.</p>

<h3>5. Priority, direction aur match ki galtiyan</h3>
<ul>
<li>Match karne wale deny se bade number par allow.</li>
<li>Galat direction (outbound ka rule jo inbound hona chahiye).</li>
<li>Port destination ki jagah <b>source</b> field mein daal diya.</li>
<li>Protocol Tcp jabki application Udp use karti hai, ya ping ke liye ICMP (ping ICMP hai aur VNet ke andar default mein allowed hai lekin Internet se nahi).</li>
<li>Source aise service tag par set hai jisme asli client nahi, jaise VirtualNetwork jab client Internet par hai.</li>
<li>ASG rule jahan NIC member nahi, ya ASG doosre VNet mein hai.</li>
</ul>

<h3>6. Aakhir NSG nahi: route, public IP, DNS</h3>
<p>Agar IP flow verify Allow kehta hai lekin connection fail hota hai, to check karo: user-defined route jo traffic ko aise firewall par bhejta hai jo drop karta hai; Standard public IP associated nahi; load balancer ke saath Basic ya Standard SKU mismatch; DNS galat address de raha hai; asymmetric routing (traffic seedha andar aata hai aur replies firewall se jaate hain, jiske paas uska state nahi).</p>

<h3>7. Guest OS aur application</h3>
<p>Kya service port par listen kar rahi hai? Kya ufw, iptables ya Windows Firewall block kar raha hai? Linux ke liye VM ke andar <code>ss -tlnp</code> check karo. Flow logs sirf tab enable karo jab history chahiye; warna on-demand tools kaafi aur free hain.</p>

<h3>Worked tickets</h3>
<ol>
<li><b>"Web VM par HTTPS time out."</b> Subnet NSG 443 allow karta hai, lekin NIC NSG deny karta hai. NIC NSG hatao ya allow add karo.</li>
<li><b>"Web VM database tak 1433 par nahi pahunch pa raha."</b> Priority 200 par VirtualNetwork se VirtualNetwork ka deny 300 ke allow ke upar baitha hai. Reorder karo.</li>
<li><b>"Load balancer health probe fail ho raha hai."</b> Chhote number par custom deny all inbound AzureLoadBalancer ko block karta hai. Uske upar tag ka allow lagao.</li>
<li><b>"SSH kal chal raha tha."</b> Home IP badal gaya aur allow rule mein purana /32 hai. Update karo.</li>
<li><b>"Rule delete hai lekin purane connections chal rahe hain."</b> Maujooda flows tab tak reh sakte hain jab tak khatam ya time out na ho (behaviour verify karo).</li>
</ol>

<div class="eg"><p><b>Worked example.</b> Ticket: "app VM 10.10.2.4 db VM 10.10.3.4 ko TCP 1433 par call nahi kar pa raha". Step 1: source 10.10.2.4, destination 10.10.3.4:1433, TCP. Step 2: snet-data par nsg-data hai, NIC NSG nahi. Step 3 aur 4: db VM par IP flow verify, inbound, Deny dikhata hai, rule DenyVnetAll priority 150 par. Step 5: app subnet ka allow 200 par hai, isliye deny jeetta hai. Woh allow ko priority 120 karti hai aur test Allow deta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Test ke liye port "Any" ko khol dena, phir bhool jana. Test ke liye IP flow verify use karo. Agar temporary kholna hi ho to calendar reminder aur expiry date wala tag lagao.</p></div>

<div class="exam"><p><b>Exam trap.</b> Health probe ka source 168.63.129.16 (AzureLoadBalancer tag) hai. Ise block karne se load-balanced app mara hua dikhta hai. Ping ICMP hai, jise Internet se apna rule chahiye.</p></div>

<div class="scn"><h4>Probe jo fail hua</h4><p>Security review ne subnet par priority 200 ka "deny all inbound" add kiya, uske baad load-balanced app unhealthy ho gayi. Load balancer ke probes AzureLoadBalancer tag se aate hain aur naya deny 65001 ke default allow ke upar tha. Engineer ne priority 150 par tag ka allow add kiya, aur backend healthy ho gaya.</p><p><b>Lesson:</b> apna likha deny-all defaults ko dhyan mein rakhkar rakho.</p></div>

<div class="iv"><p class="q">"Connection blocked hai aur aapko NSG par shak hai. Aapka method kya hai?"</p><p>5-tuple define karo, dono ends ke har NSG dhundho, effective rules check karo, rule ka naam jaanne ke liye IP flow verify chalao, phir priority ya scope fix karo. Agar NSG allow karta hai to routes, public IP, DNS aur guest OS dekho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Complaint ko 5-tuple aur direction mein badlo.</li>
<li>Dono ends par subnet aur NIC NSGs check karo.</li>
<li>IP flow verify decide karne wale rule ka naam batata hai.</li>
<li>Zyadatar failures priority order, direction ya chhupa hua doosra NSG hote hain.</li>
<li>Agar NSG allow karta hai to routes, DNS, public IP aur OS dekho.</li>
</ul></div>
`}};export{t as default};