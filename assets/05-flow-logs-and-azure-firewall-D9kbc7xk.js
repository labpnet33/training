var e=`<svg viewBox="0 0 640 270" role="img" aria-label="NSG versus Azure Firewall in a hub design">
<rect x="10" y="95" width="90" height="60" rx="8" fill="#e2e8f0"/><text x="55" y="130" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="140" y="10" width="490" height="250" rx="10" fill="#bae6fd"/><text x="154" y="30" class="svg-ink" font-size="13">VNet</text>
<rect x="160" y="75" width="150" height="110" rx="8" fill="#fed7aa"/><text x="235" y="100" text-anchor="middle" class="svg-ink" font-size="13">Azure Firewall</text><text x="235" y="120" text-anchor="middle" class="svg-muted" font-size="11">AzureFirewallSubnet</text><text x="235" y="140" text-anchor="middle" class="svg-muted" font-size="11">FQDN rules, threat intel</text><text x="235" y="158" text-anchor="middle" class="svg-muted" font-size="11">central, stateful</text>
<rect x="350" y="45" width="260" height="80" rx="8" fill="#fde68a"/><text x="480" y="70" text-anchor="middle" class="svg-ink" font-size="13">snet-web + NSG</text><text x="480" y="92" text-anchor="middle" class="svg-muted" font-size="11">ports and addresses, per tier</text>
<rect x="350" y="145" width="260" height="80" rx="8" fill="#ddd6fe"/><text x="480" y="170" text-anchor="middle" class="svg-ink" font-size="13">snet-app + NSG</text><text x="480" y="192" text-anchor="middle" class="svg-muted" font-size="11">UDR 0.0.0.0/0 to firewall</text>
<line x1="100" y1="125" x2="160" y2="125" stroke="#64748b" stroke-width="2"/><line x1="310" y1="95" x2="350" y2="85" stroke="#64748b" stroke-width="2"/><line x1="310" y1="160" x2="350" y2="180" stroke="#64748b" stroke-width="2"/>
<rect x="160" y="205" width="150" height="45" rx="8" fill="#bbf7d0"/><text x="235" y="232" text-anchor="middle" class="svg-ink" font-size="12">Flow logs to storage</text>
</svg>`,t={id:`flow-logs-and-azure-firewall`,h:{en:`Flow logs, Network Watcher and when you need Azure Firewall`,hi:`Flow logs, Network Watcher aur kab Azure Firewall chahiye`},body:{en:`
<h3>Seeing what the NSG did</h3>
<p>Rules say what should happen. Logs say what did happen. Two Azure features help: <b>flow logs</b> record the connections that were allowed or denied, and <b>Network Watcher</b> tests a single flow on demand.</p>

<h3>NSG flow logs and the change to virtual network flow logs</h3>
<p><b>NSG flow logs</b> record information about IP traffic seen by an NSG: source and destination, ports, protocol, direction and whether the rule allowed or denied it. They are stored as JSON files in a storage account, and can be analysed with <b>Traffic Analytics</b>, which needs a Log Analytics workspace.</p>
<p>Microsoft announced the retirement of NSG flow logs. As far as we know, creating new NSG flow logs was blocked from 30 June 2025 and existing ones are scheduled to stop on 30 September 2027 (<b>verify these dates on the Microsoft announcement before publishing</b>). The replacement is <b>virtual network flow logs</b>, which are enabled on a VNet, a subnet or a NIC rather than on an NSG, and which log the traffic for the scope even when no NSG is attached (verify details). So for any new design, learn the virtual network flow log and treat the NSG flow log as a legacy you may still meet in existing environments and exam material.</p>
<table class="cmp"><tr><th>Feature</th><th>NSG flow logs (legacy)</th><th>Virtual network flow logs</th></tr>
<tr><td>Enabled on</td><td>An NSG</td><td>A VNet, subnet or NIC</td></tr>
<tr><td>Shows NSG rule that decided</td><td>Yes</td><td>Shows flow state and counts; rule-level fields can differ (verify)</td></tr>
<tr><td>Status</td><td>Retiring; new creation blocked (verify)</td><td>Recommended</td></tr>
<tr><td>Cost</td><td>Log storage plus Traffic Analytics processing (verify)</td><td>Log storage plus Traffic Analytics processing (verify)</td></tr>
</table>
<pre class="code"><span class="c"># virtual network flow log (check az network watcher flow-log create -h for your CLI version)</span>
az network watcher flow-log create -g rg-nk-lab -n fl-vnet-nk --location centralindia \\
  --vnet vnet-nk --storage-account stnkflowlogs123 --enabled true</pre>
<p>Flow log creation needs a storage account and Network Watcher in the region. The exact parameters differ between CLI versions (verify before publishing). Remember that logs cost storage money, so set a retention period and delete test logs.</p>
<p>Illustrative record (simplified, not exact JSON):</p>
<pre class="out">time=2026-01-12T10:21:05Z  src=203.0.113.50:50000  dst=10.10.1.4:443  proto=TCP  dir=Inbound  decision=<span class="hl">Allowed</span>
time=2026-01-12T10:21:09Z  src=203.0.113.77:41233  dst=10.10.1.4:22   proto=TCP  dir=Inbound  decision=<span class="hl">Denied</span></pre>

<h3>Network Watcher: on-demand checks</h3>
<ul>
<li><b>IP flow verify</b>: would this 5-tuple be allowed or denied, and by which rule.</li>
<li><b>Effective security rules</b>: the combined rules for a NIC.</li>
<li><b>Next hop</b>: where a packet would go.</li>
<li><b>Connection troubleshoot</b>: an end-to-end test between a VM and a destination.</li>
<li><b>NSG diagnostics</b>: evaluates a flow through every NSG on its path (verify wording and availability).</li>
</ul>

<h3>When an NSG is not enough: Azure Firewall</h3>
<p>An NSG filters on addresses, ports and protocols. Real designs also need rules such as "allow outbound HTTPS only to update sites by name", central logging, threat intelligence or TLS inspection. <b>Azure Firewall</b> is a managed, stateful, cloud-native firewall service that you deploy into its own subnet named <code>AzureFirewallSubnet</code> (at least /26; verify), usually in a hub VNet, and make the default next hop with a user-defined route.</p>
<table class="cmp"><tr><th>Question</th><th>NSG</th><th>Azure Firewall</th></tr>
<tr><td>Layer</td><td>3 and 4</td><td>3 to 7: FQDN and URL categories (some features Premium only), network and application rules</td></tr>
<tr><td>Scope</td><td>Per subnet or NIC</td><td>Central, for many VNets via routing</td></tr>
<tr><td>Extras</td><td>Service tags and ASGs</td><td>Threat intelligence, DNAT and SNAT, IDPS and TLS inspection in Premium (verify)</td></tr>
<tr><td>SKUs</td><td>None</td><td>Basic, Standard, Premium (verify features per SKU)</td></tr>
<tr><td>Cost</td><td>Free to create</td><td>Hourly fee plus data processed; considerable for a personal lab (verify pricing)</td></tr>
</table>
<div class="dia">`+e+`<p class="cap">NSGs filter per tier; a central Azure Firewall inspects and controls egress by name; flow logs record the decisions.</p></div>
<p>Use them together: NSGs for fast tier-to-tier port control, the firewall for the perimeter and FQDN control. Related services you may hear: <b>Azure DDoS Protection</b> for volumetric attacks, and <b>Web Application Firewall</b> on Application Gateway or Front Door for HTTP attacks; each has its own module in a full course.</p>

<div class="eg"><p><b>Worked example.</b> A company wants app VMs to download updates only from a few vendor sites. An NSG cannot allow a site by name; it would need IP ranges that change. The team puts Azure Firewall in the hub, adds an application rule that allows the vendor FQDNs on 443, and adds a UDR 0.0.0.0/0 to the firewall on the app subnet. Flow logs and firewall logs show what was allowed.</p></div>

<div class="warn"><p><b>Common mistake.</b> Deploying Azure Firewall in a personal lab and leaving it running. It bills by the hour from the moment it is created. Practise in a free simulation, or delete it the same hour.</p></div>

<div class="exam"><p><b>Exam trap.</b> NSG: layers 3 and 4, free, subnet or NIC. Azure Firewall: managed stateful firewall with FQDN filtering, centrally deployed. Flow logs need a storage account. NSG flow logs are being retired in favour of virtual network flow logs (verify dates).</p></div>

<div class="scn"><h4>The bill from a test firewall</h4><p>A student deployed Azure Firewall to try rules and went on holiday. The budget alert at 80 percent reached her phone on day four. She deleted the resource group. The cost report showed the firewall hours and a small log storage charge.</p><p><b>Lesson:</b> hourly appliances must have an end time, written down before you create them.</p></div>

<div class="iv"><p class="q">"When would you use Azure Firewall instead of only NSGs?"</p><p>When you need FQDN or URL-based egress control, central policy across many VNets, threat intelligence, or deeper logging. NSGs stay for simple per-subnet port filtering. Mention cost and that the firewall needs routes to be effective.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow logs show allowed and denied connections; they need storage and cost money.</li>
<li>NSG flow logs are being retired; use virtual network flow logs (verify dates).</li>
<li>Network Watcher: IP flow verify, effective rules, next hop, connection troubleshoot.</li>
<li>Azure Firewall adds FQDN filtering and central control; NSGs stay at layers 3 and 4.</li>
<li>Firewalls bill hourly: delete lab ones promptly.</li>
</ul></div>
`,hi:`
<h3>Dekhna ki NSG ne kya kiya</h3>
<p>Rules batate hain ki kya hona chahiye. Logs batate hain ki kya hua. Do Azure features madad karte hain: <b>flow logs</b> woh connections record karte hain jo allow ya deny hue, aur <b>Network Watcher</b> demand par ek flow test karta hai.</p>

<h3>NSG flow logs aur virtual network flow logs mein badlav</h3>
<p><b>NSG flow logs</b> NSG ke dekhe IP traffic ki jaankari record karte hain: source aur destination, ports, protocol, direction aur rule ne allow kiya ya deny. Woh storage account mein JSON files ki tarah store hote hain, aur <b>Traffic Analytics</b> se analyse ho sakte hain, jise Log Analytics workspace chahiye.</p>
<p>Microsoft ne NSG flow logs ki retirement announce ki. Jahan tak hum jaante hain, naye NSG flow logs banana 30 June 2025 se blocked tha aur maujooda ke 30 September 2027 ko band hone ka schedule hai (<b>publish karne se pehle Microsoft announcement par yeh dates verify karo</b>). Replacement <b>virtual network flow logs</b> hain, jo NSG par nahi balki VNet, subnet ya NIC par enable hote hain, aur scope ka traffic log karte hain chahe koi NSG attached na ho (details verify karo). Isliye har naye design ke liye virtual network flow log seekho aur NSG flow log ko legacy maano jo aap maujooda environments aur exam material mein mil sakta hai.</p>
<table class="cmp"><tr><th>Feature</th><th>NSG flow logs (legacy)</th><th>Virtual network flow logs</th></tr>
<tr><td>Enable hota hai</td><td>NSG par</td><td>VNet, subnet ya NIC par</td></tr>
<tr><td>Decide karne wala NSG rule dikhata hai</td><td>Haan</td><td>Flow state aur counts dikhata hai; rule-level fields alag ho sakte hain (verify)</td></tr>
<tr><td>Status</td><td>Retire ho raha hai; naya creation blocked (verify)</td><td>Recommended</td></tr>
<tr><td>Cost</td><td>Log storage plus Traffic Analytics processing (verify)</td><td>Log storage plus Traffic Analytics processing (verify)</td></tr>
</table>
<pre class="code"><span class="c"># virtual network flow log (apne CLI version ke liye az network watcher flow-log create -h check karo)</span>
az network watcher flow-log create -g rg-nk-lab -n fl-vnet-nk --location centralindia \\
  --vnet vnet-nk --storage-account stnkflowlogs123 --enabled true</pre>
<p>Flow log creation ke liye storage account aur region mein Network Watcher chahiye. Exact parameters CLI versions ke beech alag hote hain (verify before publishing). Yaad rakho logs storage ke paise lete hain, isliye retention period set karo aur test logs delete karo.</p>
<p>Illustrative record (simplified, exact JSON nahi):</p>
<pre class="out">time=2026-01-12T10:21:05Z  src=203.0.113.50:50000  dst=10.10.1.4:443  proto=TCP  dir=Inbound  decision=<span class="hl">Allowed</span>
time=2026-01-12T10:21:09Z  src=203.0.113.77:41233  dst=10.10.1.4:22   proto=TCP  dir=Inbound  decision=<span class="hl">Denied</span></pre>

<h3>Network Watcher: on-demand checks</h3>
<ul>
<li><b>IP flow verify</b>: yeh 5-tuple allow hoga ya deny, aur kaun se rule se.</li>
<li><b>Effective security rules</b>: NIC ke combined rules.</li>
<li><b>Next hop</b>: packet kahan jayega.</li>
<li><b>Connection troubleshoot</b>: VM aur destination ke beech end-to-end test.</li>
<li><b>NSG diagnostics</b>: flow ko path ke har NSG se evaluate karta hai (wording aur availability verify karo).</li>
</ul>

<h3>Jab NSG kaafi nahi: Azure Firewall</h3>
<p>NSG addresses, ports aur protocols par filter karta hai. Real designs ko aise rules bhi chahiye jaise "outbound HTTPS sirf update sites ko naam se allow karo", central logging, threat intelligence ya TLS inspection. <b>Azure Firewall</b> managed, stateful, cloud-native firewall service hai jo aap apne subnet <code>AzureFirewallSubnet</code> mein deploy karte ho (kam se kam /26; verify), aam taur par hub VNet mein, aur user-defined route se default next hop banate ho.</p>
<table class="cmp"><tr><th>Sawal</th><th>NSG</th><th>Azure Firewall</th></tr>
<tr><td>Layer</td><td>3 aur 4</td><td>3 se 7: FQDN aur URL categories (kuch features sirf Premium mein), network aur application rules</td></tr>
<tr><td>Scope</td><td>Per subnet ya NIC</td><td>Central, routing ke zariye kai VNets ke liye</td></tr>
<tr><td>Extras</td><td>Service tags aur ASGs</td><td>Threat intelligence, DNAT aur SNAT, Premium mein IDPS aur TLS inspection (verify)</td></tr>
<tr><td>SKUs</td><td>Koi nahi</td><td>Basic, Standard, Premium (SKU ke hisaab se features verify karo)</td></tr>
<tr><td>Cost</td><td>Banana free</td><td>Hourly fee plus data processed; personal lab ke liye kaafi (pricing verify karo)</td></tr>
</table>
<div class="dia">`+e+`<p class="cap">NSGs tier ke hisaab se filter karte hain; central Azure Firewall egress ko naam se inspect aur control karta hai; flow logs decisions record karte hain.</p></div>
<p>Inhe saath use karo: tier-to-tier port control ke liye NSGs, perimeter aur FQDN control ke liye firewall. Aur services jo suni hongi: volumetric attacks ke liye <b>Azure DDoS Protection</b>, aur HTTP attacks ke liye Application Gateway ya Front Door par <b>Web Application Firewall</b>; poore course mein har ek ka apna module hota hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek company chahti hai ki app VMs sirf kuch vendor sites se updates download karein. NSG site ko naam se allow nahi kar sakta; use IP ranges chahiye jo badalti rehti hain. Team hub mein Azure Firewall rakhti hai, vendor FQDNs ko 443 par allow karne wala application rule add karti hai, aur app subnet par firewall ki taraf UDR 0.0.0.0/0 add karti hai. Flow logs aur firewall logs dikhate hain kya allow hua.</p></div>

<div class="warn"><p><b>Common mistake.</b> Personal lab mein Azure Firewall deploy karke use chalta chhod dena. Woh create hone ke pal se hi hourly bill karta hai. Free simulation mein practice karo, ya usi ghante delete karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> NSG: layers 3 aur 4, free, subnet ya NIC. Azure Firewall: FQDN filtering wala managed stateful firewall, centrally deployed. Flow logs ko storage account chahiye. NSG flow logs virtual network flow logs ke favour mein retire ho rahe hain (dates verify karo).</p></div>

<div class="scn"><h4>Test firewall ka bill</h4><p>Ek student ne rules try karne ke liye Azure Firewall deploy kiya aur chhutti par chali gayi. 80 percent par budget alert chauthe din uske phone par pahuncha. Usne resource group delete kiya. Cost report ne firewall hours aur chhota log storage charge dikhaya.</p><p><b>Lesson:</b> hourly appliances ka end time hona chahiye, create karne se pehle likha hua.</p></div>

<div class="iv"><p class="q">"Sirf NSGs ke bajay Azure Firewall kab use karoge?"</p><p>Jab FQDN ya URL-based egress control, kai VNets par central policy, threat intelligence ya deeper logging chahiye. Simple per-subnet port filtering ke liye NSGs rehte hain. Cost ka zikr karo aur yeh ki firewall ko routes chahiye tabhi effective hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Flow logs allowed aur denied connections dikhate hain; storage chahiye aur paise lagte hain.</li>
<li>NSG flow logs retire ho rahe hain; virtual network flow logs use karo (dates verify karo).</li>
<li>Network Watcher: IP flow verify, effective rules, next hop, connection troubleshoot.</li>
<li>Azure Firewall FQDN filtering aur central control jodta hai; NSGs layers 3 aur 4 par rehte hain.</li>
<li>Firewalls hourly bill karte hain: lab wale jaldi delete karo.</li>
</ul></div>
`}};export{t as default};