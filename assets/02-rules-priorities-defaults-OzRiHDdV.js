var e=`<svg viewBox="0 0 640 280" role="img" aria-label="NSG rule evaluation order">
<text x="320" y="20" text-anchor="middle" class="svg-ink" font-size="13">Inbound rules of nsg-web, evaluated top to bottom</text>
<rect x="20" y="35" width="600" height="36" rx="6" fill="#bbf7d0"/><text x="34" y="58" class="svg-ink" font-size="12">100  AllowHttps     TCP 443   Internet to *      Allow</text>
<rect x="20" y="77" width="600" height="36" rx="6" fill="#bbf7d0"/><text x="34" y="100" class="svg-ink" font-size="12">110  AllowAdminSsh  TCP 22    198.51.100.10 to *  Allow</text>
<rect x="20" y="119" width="600" height="36" rx="6" fill="#e2e8f0"/><text x="34" y="142" class="svg-muted" font-size="12">65000  AllowVnetInBound               VirtualNetwork to VirtualNetwork  Allow (default)</text>
<rect x="20" y="161" width="600" height="36" rx="6" fill="#e2e8f0"/><text x="34" y="184" class="svg-muted" font-size="12">65001  AllowAzureLoadBalancerInBound  AzureLoadBalancer to *            Allow (default)</text>
<rect x="20" y="203" width="600" height="36" rx="6" fill="#fed7aa"/><text x="34" y="226" class="svg-ink" font-size="12">65500  DenyAllInBound                  * to *                            Deny (default)</text>
<text x="320" y="265" text-anchor="middle" class="svg-accent" font-size="12">Lower number first. First match wins. Defaults cannot be deleted, but can be overridden.</text>
</svg>`,t={id:`rules-priorities-defaults`,h:{en:`NSG rules, priorities, stateful behaviour and the default rules`,hi:`NSG rules, priorities, stateful behaviour aur default rules`},body:{en:`
<h3>Anatomy of a rule</h3>
<p>Every NSG rule has the same fields. Learn them once and every portal screen and CLI command makes sense.</p>
<table class="cmp"><tr><th>Field</th><th>Meaning</th><th>Examples</th></tr>
<tr><td>Name</td><td>Unique inside the NSG</td><td>AllowHttps</td></tr>
<tr><td>Priority</td><td>100 to 4096; lower is evaluated first; must be unique per direction</td><td>100, 110, 4000</td></tr>
<tr><td>Direction</td><td>Inbound or Outbound</td><td>Inbound</td></tr>
<tr><td>Access</td><td>Allow or Deny</td><td>Allow</td></tr>
<tr><td>Protocol</td><td>Tcp, Udp, Icmp, Esp, Ah or Any</td><td>Tcp</td></tr>
<tr><td>Source and source port range</td><td>IP, CIDR, service tag, ASG or Any; ports are usually *</td><td>Internet, *</td></tr>
<tr><td>Destination and destination port range</td><td>IP, CIDR, service tag, ASG or Any; the service port</td><td>*, 443</td></tr>
</table>
<p>Ports can be a single number (443), a range (1024-2048), a comma list (80,443) or *. The source port is almost always <code>*</code> because clients use random high ports.</p>

<h3>Priority and first match</h3>
<p>Azure reads the inbound rules for the traffic direction in priority order, from 100 upward. The <b>first rule that matches stops evaluation</b>. If rule 100 denies a flow, a later rule 200 that allows it never takes effect. Leave gaps (100, 110, 120 or 100, 200, 300) so you can insert rules later. You cannot use the same priority twice in the same direction.</p>

<h3>Stateful: the return path takes care of itself</h3>
<p>When an inbound rule allows a connection, the response traffic of that flow is allowed back out, even if no outbound rule mentions it. The reverse also holds. So you write rules for the direction in which a connection starts. If you think about Windows Firewall or AWS network ACLs, stop expecting a mirror rule; Azure NSGs do not need one. Existing connections can persist for a time after you change a rule (verify behaviour before publishing).</p>

<h3>The default rules</h3>
<p>Every NSG is created with six default rules that you cannot delete or edit, but can override with a lower priority number:</p>
<table class="cmp"><tr><th>Priority</th><th>Name</th><th>Direction</th><th>What it does</th></tr>
<tr><td>65000</td><td>AllowVnetInBound</td><td>Inbound</td><td>Allows traffic from VirtualNetwork to VirtualNetwork</td></tr>
<tr><td>65001</td><td>AllowAzureLoadBalancerInBound</td><td>Inbound</td><td>Allows Azure load balancer health probes</td></tr>
<tr><td>65500</td><td>DenyAllInBound</td><td>Inbound</td><td>Denies everything else</td></tr>
<tr><td>65000</td><td>AllowVnetOutBound</td><td>Outbound</td><td>VirtualNetwork to VirtualNetwork</td></tr>
<tr><td>65001</td><td>AllowInternetOutBound</td><td>Outbound</td><td>Allows traffic to the Internet</td></tr>
<tr><td>65500</td><td>DenyAllOutBound</td><td>Outbound</td><td>Denies everything else</td></tr>
</table>
<p>Two consequences are worth underlining. First, by default <b>VMs in the same VNet can talk to each other</b> because of AllowVnetInBound. To isolate tiers, add a Deny rule with a lower number. Second, <b>outbound to the Internet is allowed</b> by default, so lock down egress deliberately if you need to.</p>

<div class="dia">`+e+`<p class="cap">A small inbound rule set. Custom rules live below 65000; defaults live above.</p></div>

<h3>Create an NSG and rules</h3>
<pre class="code">az network nsg create -g rg-nk-lab -n nsg-web --location centralindia

az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowHttps \\
  --priority 100 --direction Inbound --access Allow --protocol Tcp \\
  --source-address-prefixes Internet --source-port-ranges "*" \\
  --destination-address-prefixes "*" --destination-port-ranges 443

az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowAdminSsh \\
  --priority 110 --direction Inbound --access Allow --protocol Tcp \\
  --source-address-prefixes 198.51.100.10 --source-port-ranges "*" \\
  --destination-address-prefixes "*" --destination-port-ranges 22</pre>
<pre class="code">az network nsg rule list -g rg-nk-lab --nsg-name nsg-web --output table
az network nsg show -g rg-nk-lab -n nsg-web --query "defaultSecurityRules[].{name:name, pri:priority, dir:direction, access:access}" --output table</pre>
<p>Illustrative output:</p>
<pre class="out">Name         Priority  Access  Protocol  Direction  SourcePrefix     DestPorts
-----------  --------  ------  --------  ---------  ---------------  ---------
AllowHttps   <span class="hl">100</span>       Allow   Tcp       Inbound    Internet         443
AllowAdminSsh 110      Allow   Tcp       Inbound    198.51.100.10    22</pre>

<div class="eg"><p><b>Worked example.</b> A packet arrives for TCP port 8080 from 203.0.113.50 to vm-web. Rule 100 (port 443) does not match. Rule 110 (port 22 from the admin) does not match. 65000 AllowVnetInBound does not match because the source is not in the VirtualNetwork tag. 65001 does not match. 65500 DenyAllInBound matches, so the packet is dropped. To allow it you would add a rule such as priority 120 allow TCP 8080.</p></div>

<div class="warn"><p><b>Common mistake.</b> Adding an Allow rule with a higher number than a conflicting Deny. Priority 300 allow does nothing if priority 200 denies the same traffic. Another: using the wrong direction. A rule for inbound traffic to a web server is Inbound, with the server port as the <b>destination</b> port.</p></div>

<div class="exam"><p><b>Exam trap.</b> Priority range 100 to 4096; defaults at 65000, 65001, 65500; you cannot delete defaults. NSG rules are stateful, unlike AWS NACLs. A rule needs a unique priority per direction.</p></div>

<div class="scn"><h4>The allow that never worked</h4><p>An engineer added "allow TCP 8080" at priority 500 but the app was still unreachable. Another rule at priority 400, written months earlier, denied all traffic from the Internet tag to the subnet. He changed the new rule to priority 300, tested again and it worked. He also deleted the unused old deny.</p><p><b>Lesson:</b> read all rules in priority order before you add one.</p></div>

<div class="iv"><p class="q">"What are the default rules of an NSG and can you remove them?"</p><p>Allow VNet in and out, allow Azure load balancer in, allow Internet out, and deny all in and out as a last rule. They sit at 65000 to 65500, cannot be deleted, and are overridden by lower numbers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A rule is a 5-tuple plus direction, access and priority (100 to 4096).</li>
<li>Lowest number first; first match wins.</li>
<li>NSGs are stateful: no mirror rule for return traffic.</li>
<li>Defaults at 65000, 65001, 65500 allow VNet traffic and Internet out, deny the rest.</li>
<li>Leave priority gaps and review all rules in order.</li>
</ul></div>
`,hi:`
<h3>Rule ki anatomy</h3>
<p>Har NSG rule ke fields same hote hain. Ek baar seekh lo to har portal screen aur CLI command samajh aati hai.</p>
<table class="cmp"><tr><th>Field</th><th>Matlab</th><th>Examples</th></tr>
<tr><td>Name</td><td>NSG ke andar unique</td><td>AllowHttps</td></tr>
<tr><td>Priority</td><td>100 se 4096; chhota pehle evaluate hota hai; har direction mein unique hona chahiye</td><td>100, 110, 4000</td></tr>
<tr><td>Direction</td><td>Inbound ya Outbound</td><td>Inbound</td></tr>
<tr><td>Access</td><td>Allow ya Deny</td><td>Allow</td></tr>
<tr><td>Protocol</td><td>Tcp, Udp, Icmp, Esp, Ah ya Any</td><td>Tcp</td></tr>
<tr><td>Source aur source port range</td><td>IP, CIDR, service tag, ASG ya Any; ports aam taur par *</td><td>Internet, *</td></tr>
<tr><td>Destination aur destination port range</td><td>IP, CIDR, service tag, ASG ya Any; service port</td><td>*, 443</td></tr>
</table>
<p>Ports ek number (443), range (1024-2048), comma list (80,443) ya * ho sakte hain. Source port lagbhag hamesha <code>*</code> hota hai kyunki clients random high ports use karte hain.</p>

<h3>Priority aur first match</h3>
<p>Azure traffic direction ke inbound rules ko priority order mein, 100 se upar padhta hai. <b>Pehla rule jo match kare evaluation rok deta hai</b>. Agar rule 100 flow deny karta hai, to baad ka rule 200 jo allow karta hai kabhi asar nahi karta. Gaps chhodo (100, 110, 120 ya 100, 200, 300) taki baad mein rules insert kar sako. Ek direction mein same priority do baar use nahi kar sakte.</p>

<h3>Stateful: return path apne aap sambhal leta hai</h3>
<p>Jab inbound rule connection allow karta hai, us flow ka response traffic bahar bhi allow ho jata hai, chahe koi outbound rule uska zikr na kare. Ulta bhi sach hai. Isliye aap us direction ke rules likhte ho jisme connection shuru hota hai. Agar Windows Firewall ya AWS network ACLs ke baare mein sochte ho to mirror rule ki umeed chhodo; Azure NSGs ko uski zaroorat nahi. Rule badalne ke baad maujooda connections kuch der tak rehte ho sakte hain (behaviour publish karne se pehle verify karo).</p>

<h3>Default rules</h3>
<p>Har NSG chhe default rules ke saath banta hai jinhe aap delete ya edit nahi kar sakte, lekin chhote priority number se override kar sakte ho:</p>
<table class="cmp"><tr><th>Priority</th><th>Name</th><th>Direction</th><th>Kya karta hai</th></tr>
<tr><td>65000</td><td>AllowVnetInBound</td><td>Inbound</td><td>VirtualNetwork se VirtualNetwork ka traffic allow karta hai</td></tr>
<tr><td>65001</td><td>AllowAzureLoadBalancerInBound</td><td>Inbound</td><td>Azure load balancer health probes allow karta hai</td></tr>
<tr><td>65500</td><td>DenyAllInBound</td><td>Inbound</td><td>Baaki sab deny karta hai</td></tr>
<tr><td>65000</td><td>AllowVnetOutBound</td><td>Outbound</td><td>VirtualNetwork se VirtualNetwork</td></tr>
<tr><td>65001</td><td>AllowInternetOutBound</td><td>Outbound</td><td>Internet ka traffic allow karta hai</td></tr>
<tr><td>65500</td><td>DenyAllOutBound</td><td>Outbound</td><td>Baaki sab deny karta hai</td></tr>
</table>
<p>Do nateeje underline karne layak hain. Pehla, default mein <b>ek hi VNet ke VMs ek doosre se baat kar sakte hain</b> AllowVnetInBound ki wajah se. Tiers isolate karne ke liye chhote number ka Deny rule add karo. Doosra, <b>Internet ka outbound default mein allowed hai</b>, isliye zaroorat ho to egress jaan-boojh kar lock karo.</p>

<div class="dia">`+e+`<p class="cap">Chhota inbound rule set. Custom rules 65000 se neeche rehte hain; defaults upar.</p></div>

<h3>NSG aur rules banao</h3>
<pre class="code">az network nsg create -g rg-nk-lab -n nsg-web --location centralindia

az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowHttps \\
  --priority 100 --direction Inbound --access Allow --protocol Tcp \\
  --source-address-prefixes Internet --source-port-ranges "*" \\
  --destination-address-prefixes "*" --destination-port-ranges 443

az network nsg rule create -g rg-nk-lab --nsg-name nsg-web -n AllowAdminSsh \\
  --priority 110 --direction Inbound --access Allow --protocol Tcp \\
  --source-address-prefixes 198.51.100.10 --source-port-ranges "*" \\
  --destination-address-prefixes "*" --destination-port-ranges 22</pre>
<pre class="code">az network nsg rule list -g rg-nk-lab --nsg-name nsg-web --output table
az network nsg show -g rg-nk-lab -n nsg-web --query "defaultSecurityRules[].{name:name, pri:priority, dir:direction, access:access}" --output table</pre>
<p>Illustrative output:</p>
<pre class="out">Name         Priority  Access  Protocol  Direction  SourcePrefix     DestPorts
-----------  --------  ------  --------  ---------  ---------------  ---------
AllowHttps   <span class="hl">100</span>       Allow   Tcp       Inbound    Internet         443
AllowAdminSsh 110      Allow   Tcp       Inbound    198.51.100.10    22</pre>

<div class="eg"><p><b>Worked example.</b> vm-web ke liye 203.0.113.50 se TCP port 8080 ka packet aata hai. Rule 100 (port 443) match nahi karta. Rule 110 (admin se port 22) match nahi karta. 65000 AllowVnetInBound match nahi karta kyunki source VirtualNetwork tag mein nahi. 65001 match nahi karta. 65500 DenyAllInBound match karta hai, isliye packet drop hota hai. Allow karne ke liye priority 120 allow TCP 8080 jaisa rule add karoge.</p></div>

<div class="warn"><p><b>Common mistake.</b> Conflicting Deny se bade number ka Allow rule add karna. Agar priority 200 same traffic deny karta hai to priority 300 allow kuch nahi karta. Ek aur: galat direction. Web server ke inbound traffic ka rule Inbound hota hai, server port <b>destination</b> port ke roop mein.</p></div>

<div class="exam"><p><b>Exam trap.</b> Priority range 100 se 4096; defaults 65000, 65001, 65500 par; defaults delete nahi kar sakte. NSG rules stateful hain, AWS NACLs ke ulat. Har direction mein rule ko unique priority chahiye.</p></div>

<div class="scn"><h4>Allow jo kabhi chala nahi</h4><p>Ek engineer ne priority 500 par "allow TCP 8080" add kiya lekin app phir bhi unreachable thi. Priority 400 par mahino pehle likha doosra rule Internet tag se subnet tak saara traffic deny karta tha. Usne naye rule ko priority 300 kiya, dobara test kiya aur chal gaya. Usne purana unused deny bhi delete kiya.</p><p><b>Lesson:</b> rule add karne se pehle saare rules priority order mein padho.</p></div>

<div class="iv"><p class="q">"NSG ke default rules kaun se hain aur kya unhe hata sakte ho?"</p><p>VNet in aur out allow, Azure load balancer in allow, Internet out allow, aur aakhri rule ke roop mein deny all in aur out. Woh 65000 se 65500 par hain, delete nahi ho sakte, aur chhote numbers se override hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule 5-tuple plus direction, access aur priority (100 se 4096) hai.</li>
<li>Sabse chhota number pehle; pehla match jeetta hai.</li>
<li>NSGs stateful hain: return traffic ke liye mirror rule nahi.</li>
<li>65000, 65001, 65500 ke defaults VNet traffic aur Internet out allow karte hain, baaki deny.</li>
<li>Priority gaps chhodo aur saare rules order mein review karo.</li>
</ul></div>
`}};export{t as default};