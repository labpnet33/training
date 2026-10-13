var e=`<svg viewBox="0 0 640 230" role="img" aria-label="Azure Firewall rule processing order: DNAT, then network, then application rules, then default deny">
<rect x="20" y="30" width="130" height="60" rx="10" fill="#fed7aa" stroke="#64748b"/><text x="85" y="56" text-anchor="middle" class="svg-ink" font-size="13">1. DNAT rules</text><text x="85" y="75" text-anchor="middle" class="svg-muted" font-size="11">inbound translate</text>
<rect x="175" y="30" width="130" height="60" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="240" y="56" text-anchor="middle" class="svg-ink" font-size="13">2. Network rules</text><text x="240" y="75" text-anchor="middle" class="svg-muted" font-size="11">IP, port, protocol</text>
<rect x="330" y="30" width="140" height="60" rx="10" fill="#bbf7d0" stroke="#64748b"/><text x="400" y="56" text-anchor="middle" class="svg-ink" font-size="13">3. Application rules</text><text x="400" y="75" text-anchor="middle" class="svg-muted" font-size="11">FQDN, HTTP(S)</text>
<rect x="495" y="30" width="125" height="60" rx="10" fill="#fecaca" stroke="#64748b"/><text x="557" y="56" text-anchor="middle" class="svg-ink" font-size="13">4. Default deny</text><text x="557" y="75" text-anchor="middle" class="svg-muted" font-size="11">nothing matched</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="60" x2="175" y2="60"/><line x1="305" y1="60" x2="330" y2="60"/><line x1="470" y1="60" x2="495" y2="60"/></g>
<rect x="20" y="130" width="600" height="80" rx="10" fill="#e2e8f0" stroke="#64748b"/>
<text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="12">Firewall Policy &gt; Rule collection group (priority) &gt; Rule collection (priority, Allow or Deny) &gt; Rules</text>
<text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="11">lower number = evaluated first; first match wins inside a type; the policy can be shared by many firewalls</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="11">Network rules match first: if one allows the flow, application rules are not checked</text>
</svg>`,t={id:`azure-firewall`,h:{en:`Azure Firewall: SKUs, policy and the three rule types`,hi:`Azure Firewall: SKUs, policy aur teen rule types`},body:{en:`
<h3>The security guard at the hub</h3>
<p>Imagine the hub as a building lobby with a guard. Every visitor going between floors (spokes), to the street (internet) or to head office (on-premises) must pass the guard, who checks a list. <b>Azure Firewall</b> is that guard: a managed, stateful firewall service you place in the hub VNet. Microsoft runs the instances and scales them; you write the rules.</p>

<h3>Where it lives</h3>
<ul>
<li>It needs a dedicated subnet named exactly <code>AzureFirewallSubnet</code>, at least /26. In our design: 10.0.1.0/26. The firewall takes a private IP from it (Azure reserves the first addresses, so expect 10.0.1.4).</li>
<li>It needs at least one Standard SKU public IP for its data path, except in forced-tunnelling designs.</li>
<li>The Basic SKU, and any firewall using forced tunnelling, also needs a management subnet named <code>AzureFirewallManagementSubnet</code> (/26) with its own public IP (verify exact requirements before publishing).</li>
</ul>

<h3>The three SKUs</h3>
<table class="cmp"><tr><th>SKU</th><th>Intended for</th><th>Notable features</th></tr>
<tr><td>Basic</td><td>Small and medium businesses, low throughput</td><td>Core network and application rules, threat intelligence in alert mode (verify limits)</td></tr>
<tr><td>Standard</td><td>Most production hubs</td><td>FQDN filtering, FQDN tags, service tags, threat-intelligence deny, DNS proxy, availability zones</td></tr>
<tr><td>Premium</td><td>Regulated and high-security workloads</td><td>Everything in Standard plus TLS inspection, IDPS (signature-based intrusion detection and prevention), URL filtering, web categories</td></tr></table>
<p>Exact throughput numbers and feature gaps change; check the current SKU comparison before you design (verify before publishing). Billing is hourly per deployed firewall plus a charge per GB of data processed; the rates differ per SKU (verify before publishing).</p>

<div class="dia">`+e+`<p class="cap">Processing order. DNAT is evaluated first, then network rules, then application rules. Anything not matched is denied.</p></div>

<h3>Firewall Policy: where the rules really live</h3>
<p>Modern deployments attach a <b>Firewall Policy</b> to the firewall instead of writing rules on the firewall itself. A policy is a separate resource, so one policy can serve several firewalls, can inherit from a parent (base) policy, and can be deployed with Infrastructure as Code. Rules are organised as:</p>
<ol>
<li><b>Rule collection group</b>, with a priority (100 to 65000). Three default groups exist: DNAT, Network and Application.</li>
<li><b>Rule collection</b>, with a priority and an action: Allow or Deny (DNAT collections translate).</li>
<li><b>Rules</b> inside the collection.</li>
</ol>
<p>Lower priority numbers are processed first. Across types, DNAT runs before network, and network before application. A flow that matches an allow network rule never reaches the application rules.</p>

<h3>The rule types</h3>
<dl class="terms">
<dt>DNAT rule</dt><dd>Translates an inbound destination (firewall public IP and port) to a private IP and port in a spoke, for example public:443 to 10.1.1.10:443. Traffic is allowed implicitly by a matching DNAT rule. Use sparingly; exposing workloads directly is rarely the best design.</dd>
<dt>Network rule</dt><dd>Matches source, destination (IP, range, service tag or FQDN), protocol (TCP, UDP, ICMP, any) and port. Use for non-HTTP traffic such as SSH, RDP, SQL, DNS, and for spoke-to-spoke flows.</dd>
<dt>Application rule</dt><dd>Matches by FQDN or FQDN tag for HTTP, HTTPS and MSSQL. Example: allow *.windowsupdate.example only for the WindowsUpdate tag. For HTTPS it reads the SNI name, no decryption needed (Premium can inspect the content).</dd>
</dl>
<pre class="code"><span class="c"># policy, a rule collection group, one allow-network collection (parameters: confirm with --help)</span>
az network firewall policy create -g rg-hub -n fwp-hub --sku Standard
az network firewall policy rule-collection-group create -g rg-hub --policy-name fwp-hub -n rcg-net --priority 200
az network firewall policy rule-collection-group collection add-filter-collection -g rg-hub --policy-name fwp-hub --rule-collection-group-name rcg-net --name allow-spoke1-to-spoke2 --collection-priority 1000 --action Allow --rule-name web --rule-type NetworkRule --ip-protocols TCP --source-addresses 10.1.0.0/16 --destination-addresses 10.2.0.0/16 --destination-ports 443</pre>

<h3>Logs and safety features</h3>
<p>Turn on diagnostic settings to send firewall logs to a Log Analytics workspace (resource-specific tables are preferred, verify the current table names). Without logs you cannot prove which rule allowed or denied a flow. <b>Threat intelligence</b> filtering can alert on or deny traffic to and from known malicious IPs and domains. <b>DNS proxy</b> lets the firewall answer DNS for spokes, which also makes FQDNs in network rules work.</p>
<pre class="out"><span class="c">Illustrative output (log query result, not exact schema)</span>
Time             Action   Source:Port        Destination:Port   Rule
10:42:11         <span class="hl">Deny</span>     10.1.1.4:51022     10.2.1.4:1433      Default deny
10:42:40         Allow    10.1.1.4:51030     10.2.1.4:443       allow-spoke1-to-spoke2</pre>

<div class="warn"><p><b>Common mistakes:</b> naming the subnet anything but AzureFirewallSubnet, making it smaller than /26, putting a rule in a low-priority collection that a higher one already denies, and forgetting that the firewall costs money every hour it exists, traffic or not.</p></div>
<div class="exam"><p><b>Exam trap:</b> order is DNAT, network, application. Also remember: network rules cannot filter by URL path, and only Premium inspects TLS or does IDPS.</p></div>

<div class="scn"><h4>The rule that worked on Tuesday</h4><p>A developer reported that an app in spoke1 could no longer reach a SaaS API. The firewall log showed Deny at the default rule. A new network rule collection at priority 150 had been added by another team with action Deny for "any to any on 443" as a quick block; it sat before the application-rule allow. The fix was to narrow the deny to the intended destination and re-order the priorities, then retest.</p><p><b>Lesson:</b> read the log, find the matching rule, and check priorities across groups before editing rules.</p></div>

<div class="iv"><p class="q">"Explain how Azure Firewall evaluates rules."</p><p>DNAT first, then network, then application, within groups ordered by priority number (lowest first), default deny at the end. Mention Firewall Policy, rule collection groups, and that a matching network allow ends processing.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Subnet must be AzureFirewallSubnet, /26 or larger.</li>
<li>SKUs: Basic, Standard, Premium; only Premium has TLS inspection and IDPS.</li>
<li>Use Firewall Policy: groups, collections, rules, lower number first.</li>
<li>Order: DNAT, network, application, then default deny.</li>
<li>Enable diagnostic logs, and remember the hourly meter.</li>
</ul></div>
`,hi:`
<h3>Hub ka security guard</h3>
<p>Hub ko ek building ki lobby samjho jahan guard khada hai. Floors (spokes) ke beech, street (internet) tak ya head office (on-premises) tak jaane wala har visitor guard se guzrta hai, jo ek list check karta hai. <b>Azure Firewall</b> wahi guard hai: ek managed, stateful firewall service jo aap hub VNet mein rakhte ho. Instances Microsoft chalata aur scale karta hai; rules aap likhte ho.</p>

<h3>Yeh kahan rehta hai</h3>
<ul>
<li>Ise ek dedicated subnet chahiye jiska naam bilkul <code>AzureFirewallSubnet</code> ho, kam se kam /26. Hamare design mein: 10.0.1.0/26. Firewall ise private IP leta hai (Azure shuruaati addresses reserve karta hai, isliye 10.0.1.4 expect karo).</li>
<li>Data path ke liye kam se kam ek Standard SKU public IP chahiye, forced-tunnelling designs ke alawa.</li>
<li>Basic SKU, aur forced tunnelling use karne wale har firewall ko <code>AzureFirewallManagementSubnet</code> (/26) naam ka management subnet aur uska apna public IP bhi chahiye (publish se pehle exact requirements verify karo).</li>
</ul>

<h3>Teen SKUs</h3>
<table class="cmp"><tr><th>SKU</th><th>Kiske liye</th><th>Khaas features</th></tr>
<tr><td>Basic</td><td>Chhote aur medium business, kam throughput</td><td>Core network aur application rules, threat intelligence alert mode mein (limits verify karo)</td></tr>
<tr><td>Standard</td><td>Zyadatar production hubs</td><td>FQDN filtering, FQDN tags, service tags, threat-intelligence deny, DNS proxy, availability zones</td></tr>
<tr><td>Premium</td><td>Regulated aur high-security workloads</td><td>Standard ka sab kuch plus TLS inspection, IDPS (signature-based intrusion detection aur prevention), URL filtering, web categories</td></tr></table>
<p>Exact throughput numbers aur feature gaps badalte rehte hain; design se pehle current SKU comparison dekho (verify before publishing). Billing deployed firewall ke hisaab se hourly plus per GB processed hoti hai; rates SKU ke hisaab se alag hain (verify before publishing).</p>

<div class="dia">`+e+`<p class="cap">Processing order. Pehle DNAT, phir network rules, phir application rules. Jo match nahi hua woh deny.</p></div>

<h3>Firewall Policy: rules asal mein yahan rehte hain</h3>
<p>Modern deployments firewall par rules likhne ki jagah firewall se ek <b>Firewall Policy</b> attach karte hain. Policy alag resource hai, isliye ek policy kai firewalls ko serve kar sakti hai, parent (base) policy se inherit kar sakti hai, aur Infrastructure as Code se deploy ho sakti hai. Rules is tarah organise hote hain:</p>
<ol>
<li><b>Rule collection group</b>, priority ke saath (100 se 65000). Teen default groups hote hain: DNAT, Network aur Application.</li>
<li><b>Rule collection</b>, priority aur action ke saath: Allow ya Deny (DNAT collections translate karte hain).</li>
<li>Collection ke andar <b>Rules</b>.</li>
</ol>
<p>Kam priority number pehle process hota hai. Types ke beech DNAT network se pehle, aur network application se pehle chalta hai. Jo flow allow network rule se match ho jaye woh application rules tak nahi pahunchta.</p>

<h3>Rule types</h3>
<dl class="terms">
<dt>DNAT rule</dt><dd>Inbound destination (firewall public IP aur port) ko spoke ke private IP aur port mein translate karta hai, jaise public:443 se 10.1.1.10:443. Matching DNAT rule traffic ko implicitly allow karta hai. Kam use karo; workloads ko seedha expose karna aksar best design nahi hota.</dd>
<dt>Network rule</dt><dd>Source, destination (IP, range, service tag ya FQDN), protocol (TCP, UDP, ICMP, any) aur port se match karta hai. SSH, RDP, SQL, DNS jaise non-HTTP traffic aur spoke-to-spoke flows ke liye use karo.</dd>
<dt>Application rule</dt><dd>HTTP, HTTPS aur MSSQL ke liye FQDN ya FQDN tag se match karta hai. Example: WindowsUpdate tag ke liye hi windows update FQDNs allow karo. HTTPS ke liye woh SNI naam padhta hai, decrypt karne ki zaroorat nahi (Premium content inspect kar sakta hai).</dd>
</dl>
<pre class="code"><span class="c"># policy, ek rule collection group, ek allow-network collection (parameters: --help se confirm karo)</span>
az network firewall policy create -g rg-hub -n fwp-hub --sku Standard
az network firewall policy rule-collection-group create -g rg-hub --policy-name fwp-hub -n rcg-net --priority 200
az network firewall policy rule-collection-group collection add-filter-collection -g rg-hub --policy-name fwp-hub --rule-collection-group-name rcg-net --name allow-spoke1-to-spoke2 --collection-priority 1000 --action Allow --rule-name web --rule-type NetworkRule --ip-protocols TCP --source-addresses 10.1.0.0/16 --destination-addresses 10.2.0.0/16 --destination-ports 443</pre>

<h3>Logs aur safety features</h3>
<p>Firewall logs Log Analytics workspace mein bhejne ke liye diagnostic settings on karo (resource-specific tables behtar hain, current table names verify karo). Logs ke bina aap prove nahi kar sakte ki kis rule ne flow allow ya deny kiya. <b>Threat intelligence</b> filtering known malicious IPs aur domains ke traffic par alert ya deny kar sakti hai. <b>DNS proxy</b> firewall ko spokes ke liye DNS answer karne deta hai, jisse network rules mein FQDN bhi kaam karte hain.</p>
<pre class="out"><span class="c">Illustrative output (log query result, exact schema nahi)</span>
Time             Action   Source:Port        Destination:Port   Rule
10:42:11         <span class="hl">Deny</span>     10.1.1.4:51022     10.2.1.4:1433      Default deny
10:42:40         Allow    10.1.1.4:51030     10.2.1.4:443       allow-spoke1-to-spoke2</pre>

<div class="warn"><p><b>Common mistakes:</b> subnet ka naam AzureFirewallSubnet ke alawa kuch rakhna, /26 se chhota banana, aisi low-priority collection mein rule daalna jise higher collection pehle hi deny kar chuki hai, aur yeh bhoolna ki firewall har ghante paisa leta hai, traffic ho ya na ho.</p></div>
<div class="exam"><p><b>Exam trap:</b> order DNAT, network, application hai. Yeh bhi yaad rakho: network rules URL path se filter nahi kar sakte, aur sirf Premium TLS inspect karta hai ya IDPS karta hai.</p></div>

<div class="scn"><h4>Jo rule Tuesday ko chal raha tha</h4><p>Ek developer ne report kiya ki spoke1 ka app ab ek SaaS API tak nahi pahunch raha. Firewall log mein default rule par Deny dikha. Doosri team ne priority 150 par ek naya network rule collection quick block ke liye "any to any on 443" Deny action ke saath add kiya tha, jo application-rule allow se pehle baitha tha. Fix: deny ko intended destination tak narrow karna, priorities re-order karna, aur retest.</p><p><b>Lesson:</b> log padho, matching rule dhundo, aur rules edit karne se pehle groups ke across priorities check karo.</p></div>

<div class="iv"><p class="q">"Azure Firewall rules ko kaise evaluate karta hai, samjhao."</p><p>Pehle DNAT, phir network, phir application, groups priority number (sabse kam pehle) se ordered, aakhir mein default deny. Firewall Policy, rule collection groups ka zikr karo, aur yeh ki matching network allow processing khatam kar deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Subnet AzureFirewallSubnet hona chahiye, /26 ya bada.</li>
<li>SKUs: Basic, Standard, Premium; sirf Premium mein TLS inspection aur IDPS.</li>
<li>Firewall Policy use karo: groups, collections, rules, kam number pehle.</li>
<li>Order: DNAT, network, application, phir default deny.</li>
<li>Diagnostic logs on karo, aur hourly meter yaad rakho.</li>
</ul></div>
`}};export{t as default};