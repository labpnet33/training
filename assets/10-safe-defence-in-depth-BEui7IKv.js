var e={id:`safe`,h:{en:`Cisco SAFE and defence in depth: places in the network and secure domains`,hi:`Cisco SAFE aur defence in depth: places in the network aur secure domains`},body:{en:`
<p>A city planner does not design security one house at a time. They think in districts (airport, harbour, business centre, suburbs) and in services every district needs (police, fire, lighting, cameras, rules). <b>Cisco SAFE</b> is a planning method like that for enterprise security: it divides the network into <b>places</b> and asks which <b>security domains</b> each place needs, so nothing is forgotten and the same design language is used everywhere.</p>

<h3>What SAFE is</h3>
<p>SAFE is Cisco's security reference architecture: a set of guides and a simple model called the <b>SAFE Key</b>. It starts from the business (who does what, where) and ends with tested designs. It is vendor-neutral in method, even though the example designs use Cisco products.</p>

<h3>Places in the network (PINs)</h3>
<table class="cmp"><tr><th>PIN</th><th>What it is</th><th>Typical threats</th></tr>
<tr><td><b>Branch</b></td><td>Small sites, shops, clinics</td><td>Endpoint malware, weak local security, direct internet access</td></tr>
<tr><td><b>Campus</b></td><td>Large offices and buildings</td><td>Unauthorised devices, phishing, lateral movement</td></tr>
<tr><td><b>Data center</b></td><td>Where applications and data run</td><td>Data exfiltration, server exploitation, east-west spread</td></tr>
<tr><td><b>Edge</b></td><td>Where the network meets the internet and partners</td><td>DDoS, exploitation of exposed services, web attacks</td></tr>
<tr><td><b>Cloud</b></td><td>IaaS, PaaS and SaaS</td><td>Misconfiguration, stolen API keys, shadow IT</td></tr>
<tr><td><b>WAN</b></td><td>Links between sites, including SD-WAN</td><td>Interception, man-in-the-middle, unauthorised access</td></tr>
</table>

<h3>Secure domains</h3>
<dl class="terms">
<dt>Management</dt><dd>Centralised administration of devices and policy, secure management protocols, logging, change control.</dd>
<dt>Security intelligence</dt><dd>Global threat knowledge (Talos) delivered to every enforcement point: reputation, signatures, feeds.</dd>
<dt>Compliance</dt><dd>Meeting internal policy and external rules such as PCI DSS, HIPAA or data-protection law.</dd>
<dt>Segmentation</dt><dd>Separating users, devices and applications: VLANs and VRFs, TrustSec SGTs, micro-segmentation, firewall zones.</dd>
<dt>Threat defense</dt><dd>Visibility and protection against attacks: NGFW, IPS, malware defence, EDR, NDR, XDR.</dd>
<dt>Secure services</dt><dd>Technologies that deliver secure services: access control and identity, VPN and encryption, secure web and e-mail.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="SAFE key">
<rect x="220" y="95" width="200" height="70" rx="35" fill="#ddd6fe"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">Secure domains</text><text x="320" y="143" text-anchor="middle" class="svg-muted" font-size="12">apply in every place</text>
<rect x="30" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Branch</text>
<rect x="245" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Campus</text>
<rect x="460" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">Data center</text>
<rect x="30" y="200" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="105" y="225" text-anchor="middle" class="svg-ink" font-size="13">Edge</text>
<rect x="245" y="200" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">Cloud</text>
<rect x="460" y="200" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="535" y="225" text-anchor="middle" class="svg-ink" font-size="13">WAN</text>
<line x1="105" y1="60" x2="250" y2="105" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="60" x2="320" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="535" y1="60" x2="390" y2="105" stroke="#64748b" stroke-width="1.5"/>
<line x1="105" y1="200" x2="250" y2="155" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="200" x2="320" y2="165" stroke="#64748b" stroke-width="1.5"/><line x1="535" y1="200" x2="390" y2="155" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">The SAFE Key: six places in the network, each protected by the same six secure domains.</p></div>

<h3>From business flow to design</h3>
<p>SAFE works in three steps. <b>Capability</b>: describe the business flows (for example "a cashier in a branch sends a card payment to the data center"), the threats against each flow, and the security capabilities that stop them. <b>Architecture</b>: arrange those capabilities logically per PIN. <b>Design</b>: choose products and validated configurations. Because capabilities are defined before products, you can see gaps and duplicates clearly.</p>

<div class="eg"><p><b>Worked example: the branch card payment flow.</b></p>
<table class="cmp"><tr><th>Threat</th><th>Capability</th><th>Domain</th><th>Example</th></tr>
<tr><td>Rogue device plugged into the till port</td><td>Network access control</td><td>Secure services</td><td>ISE with 802.1X or MAB</td></tr>
<tr><td>Malware on the till</td><td>Anti-malware, EDR</td><td>Threat defense</td><td>Secure Endpoint</td></tr>
<tr><td>Card data seen by other branch devices</td><td>Segmentation</td><td>Segmentation</td><td>Separate VLAN, SGT policy</td></tr>
<tr><td>Interception across the WAN</td><td>VPN encryption</td><td>Secure services</td><td>SD-WAN IPsec</td></tr>
<tr><td>Exploit against the payment server</td><td>IPS</td><td>Threat defense</td><td>Secure Firewall with Talos rules</td></tr>
<tr><td>Proving PCI controls to auditors</td><td>Logging, reporting</td><td>Compliance and management</td><td>Central logging, change records</td></tr>
</table></div>

<h3>Defence in depth and the attack continuum</h3>
<p><b>Defence in depth</b> means independent layers, so one failure does not become a breach. Cisco often describes controls across the <b>attack continuum</b>: <b>before</b> an attack (discover, harden, enforce policy), <b>during</b> (detect, block, defend) and <b>after</b> (scope, contain, remediate). Follow one laptop user through the layers:</p>
<ol><li>Phishing-resistant MFA (Duo) proves identity.</li><li>Device posture is checked.</li><li>ZTNA grants access to one application only.</li><li>DNS and web security in Secure Access block malicious destinations.</li><li>NGFW and IPS at the data center inspect the traffic.</li><li>Micro-segmentation limits what the application server can talk to.</li><li>EDR on the host catches malware that got through.</li><li>Logs flow to XDR and the SIEM, which correlate and trigger response.</li></ol>

<div class="warn"><p><b>Common mistakes.</b> Stacking three products that do the same thing at one layer and calling it defence in depth; layers must be <b>independent</b>. Designing per product instead of per business flow. Protecting the campus and data center and forgetting the cloud PIN.</p></div>

<div class="exam"><p><b>Exam traps.</b> Memorise the six PINs (branch, campus, data center, edge, cloud, WAN) and the six secure domains (management, security intelligence, compliance, segmentation, threat defense, secure services). "Secure services" is a domain, not a PIN. Before, during and after is the attack continuum, not the SAFE Key.</p></div>

<div class="scn"><h4>The layer that mattered</h4><p>A user in a branch opened a malicious attachment that the e-mail gateway had not yet classified. The endpoint agent blocked the first payload, but a second stage tried to call its command-and-control domain; Secure Access blocked the DNS request as a newly seen malicious domain, and XDR linked both events to the same host within minutes. The SOC isolated the laptop. Three different layers, each from a different SAFE domain, each caught part of the attack.</p><p><b>Lesson:</b> no single layer is perfect; independent layers turn a likely breach into a routine ticket.</p></div>

<div class="iv"><p class="q">"What is Cisco SAFE and how would you use it on a new branch design?"</p><p>Describe SAFE as Cisco's security reference architecture built on the SAFE Key: places in the network and secure domains. Explain the method: start from business flows at the branch, list threats per flow, choose capabilities per domain (segmentation, threat defense, secure services, security intelligence, management, compliance), then map to products and validated designs. Finish with defence in depth across before, during and after.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SAFE = Cisco security reference architecture; the SAFE Key = places in the network x secure domains.</li>
<li>PINs: branch, campus, data center, edge, cloud, WAN.</li>
<li>Secure domains: management, security intelligence, compliance, segmentation, threat defense, secure services.</li>
<li>Method: business flows, threats, capabilities, then architecture and product design.</li>
<li>Defence in depth needs independent layers across before, during and after an attack.</li>
</ul></div>
`,hi:`
<p>City planner security ek ek ghar karke design nahi karta. Woh districts mein sochta hai (airport, harbour, business centre, suburbs) aur un services mein jo har district ko chahiye (police, fire, lighting, cameras, rules). <b>Cisco SAFE</b> enterprise security ke liye aisa hi planning method hai: yeh network ko <b>places</b> mein baantta hai aur poochta hai ki har place ko kaunse <b>security domains</b> chahiye, taaki kuch bhoola na jaaye aur har jagah same design language use ho.</p>

<h3>SAFE kya hai</h3>
<p>SAFE Cisco ka security reference architecture hai: guides ka set aur ek simple model jise <b>SAFE Key</b> kehte hain. Yeh business se shuru hota hai (kaun kya karta hai, kahan) aur tested designs par khatam hota hai. Method mein yeh vendor-neutral hai, halanki example designs Cisco products use karte hain.</p>

<h3>Places in the network (PINs)</h3>
<table class="cmp"><tr><th>PIN</th><th>Kya hai</th><th>Typical threats</th></tr>
<tr><td><b>Branch</b></td><td>Chhoti sites, dukaanein, clinics</td><td>Endpoint malware, kamzor local security, direct internet access</td></tr>
<tr><td><b>Campus</b></td><td>Bade offices aur buildings</td><td>Unauthorised devices, phishing, lateral movement</td></tr>
<tr><td><b>Data center</b></td><td>Jahan applications aur data chalte hain</td><td>Data exfiltration, server exploitation, east-west failaav</td></tr>
<tr><td><b>Edge</b></td><td>Jahan network internet aur partners se milta hai</td><td>DDoS, exposed services ka exploitation, web attacks</td></tr>
<tr><td><b>Cloud</b></td><td>IaaS, PaaS aur SaaS</td><td>Misconfiguration, chori ki API keys, shadow IT</td></tr>
<tr><td><b>WAN</b></td><td>Sites ke beech links, SD-WAN samet</td><td>Interception, man-in-the-middle, unauthorised access</td></tr>
</table>

<h3>Secure domains</h3>
<dl class="terms">
<dt>Management</dt><dd>Devices aur policy ka centralised administration, secure management protocols, logging, change control.</dd>
<dt>Security intelligence</dt><dd>Global threat knowledge (Talos) har enforcement point tak: reputation, signatures, feeds.</dd>
<dt>Compliance</dt><dd>Internal policy aur PCI DSS, HIPAA ya data-protection law jaise external rules poore karna.</dd>
<dt>Segmentation</dt><dd>Users, devices aur applications ko alag karna: VLANs aur VRFs, TrustSec SGTs, micro-segmentation, firewall zones.</dd>
<dt>Threat defense</dt><dd>Attacks ke khilaaf visibility aur protection: NGFW, IPS, malware defence, EDR, NDR, XDR.</dd>
<dt>Secure services</dt><dd>Secure services dene wali technologies: access control aur identity, VPN aur encryption, secure web aur e-mail.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="SAFE key">
<rect x="220" y="95" width="200" height="70" rx="35" fill="#ddd6fe"/><text x="320" y="125" text-anchor="middle" class="svg-ink" font-size="13">Secure domains</text><text x="320" y="143" text-anchor="middle" class="svg-muted" font-size="12">har place mein lagu</text>
<rect x="30" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Branch</text>
<rect x="245" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Campus</text>
<rect x="460" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">Data center</text>
<rect x="30" y="200" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="105" y="225" text-anchor="middle" class="svg-ink" font-size="13">Edge</text>
<rect x="245" y="200" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="320" y="225" text-anchor="middle" class="svg-ink" font-size="13">Cloud</text>
<rect x="460" y="200" width="150" height="40" rx="8" fill="#bbf7d0"/><text x="535" y="225" text-anchor="middle" class="svg-ink" font-size="13">WAN</text>
<line x1="105" y1="60" x2="250" y2="105" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="60" x2="320" y2="95" stroke="#64748b" stroke-width="1.5"/><line x1="535" y1="60" x2="390" y2="105" stroke="#64748b" stroke-width="1.5"/>
<line x1="105" y1="200" x2="250" y2="155" stroke="#64748b" stroke-width="1.5"/><line x1="320" y1="200" x2="320" y2="165" stroke="#64748b" stroke-width="1.5"/><line x1="535" y1="200" x2="390" y2="155" stroke="#64748b" stroke-width="1.5"/>
</svg><p class="cap">SAFE Key: network ke chhe places, har ek same chhe secure domains se protected.</p></div>

<h3>Business flow se design tak</h3>
<p>SAFE teen steps mein kaam karta hai. <b>Capability</b>: business flows describe karo (jaise "branch ka cashier card payment data center ko bhejta hai"), har flow ke khilaaf threats, aur unhe rokne wali security capabilities. <b>Architecture</b>: un capabilities ko har PIN ke hisaab se logically arrange karo. <b>Design</b>: products aur validated configurations chuno. Kyunki capabilities products se pehle define hoti hain, aap gaps aur duplicates saaf dekh sakte ho.</p>

<div class="eg"><p><b>Worked example: branch card payment flow.</b></p>
<table class="cmp"><tr><th>Threat</th><th>Capability</th><th>Domain</th><th>Example</th></tr>
<tr><td>Till port mein rogue device lagaya</td><td>Network access control</td><td>Secure services</td><td>802.1X ya MAB ke saath ISE</td></tr>
<tr><td>Till par malware</td><td>Anti-malware, EDR</td><td>Threat defense</td><td>Secure Endpoint</td></tr>
<tr><td>Card data doosre branch devices ko dikhe</td><td>Segmentation</td><td>Segmentation</td><td>Alag VLAN, SGT policy</td></tr>
<tr><td>WAN par interception</td><td>VPN encryption</td><td>Secure services</td><td>SD-WAN IPsec</td></tr>
<tr><td>Payment server par exploit</td><td>IPS</td><td>Threat defense</td><td>Talos rules ke saath Secure Firewall</td></tr>
<tr><td>Auditors ko PCI controls saabit karna</td><td>Logging, reporting</td><td>Compliance aur management</td><td>Central logging, change records</td></tr>
</table></div>

<h3>Defence in depth aur attack continuum</h3>
<p><b>Defence in depth</b> ka matlab independent layers, taaki ek failure breach na bane. Cisco aksar controls ko <b>attack continuum</b> par describe karta hai: attack se <b>pehle</b> (discover, harden, policy enforce), <b>dauraan</b> (detect, block, defend) aur <b>baad mein</b> (scope, contain, remediate). Ek laptop user ko layers se follow karo:</p>
<ol><li>Phishing-resistant MFA (Duo) identity saabit karta hai.</li><li>Device posture check hota hai.</li><li>ZTNA sirf ek application ka access deta hai.</li><li>Secure Access mein DNS aur web security malicious destinations block karti hai.</li><li>Data center par NGFW aur IPS traffic inspect karte hain.</li><li>Micro-segmentation limit karta hai ki application server kisse baat kar sakta hai.</li><li>Host par EDR woh malware pakadta hai jo andar aa gaya.</li><li>Logs XDR aur SIEM mein jaate hain, jo correlate karke response trigger karte hain.</li></ol>

<div class="warn"><p><b>Common galtiyan.</b> Ek hi layer par same kaam karne wale teen products laga kar use defence in depth kehna; layers <b>independent</b> honi chahiye. Business flow ki jagah product ke hisaab se design karna. Campus aur data center protect karna aur cloud PIN bhool jaana.</p></div>

<div class="exam"><p><b>Exam traps.</b> Chhe PINs (branch, campus, data center, edge, cloud, WAN) aur chhe secure domains (management, security intelligence, compliance, segmentation, threat defense, secure services) yaad karo. "Secure services" domain hai, PIN nahi. Before, during aur after attack continuum hai, SAFE Key nahi.</p></div>

<div class="scn"><h4>Woh layer jo kaam aayi</h4><p>Branch ke ek user ne malicious attachment khola jise e-mail gateway ne abhi classify nahi kiya tha. Endpoint agent ne pehla payload block kiya, par ek second stage ne apne command-and-control domain ko call karne ki koshish ki; Secure Access ne DNS request ko newly seen malicious domain maan kar block kiya, aur XDR ne minutes mein dono events ko same host se joda. SOC ne laptop isolate kiya. Teen alag layers, har ek alag SAFE domain se, har ek ne attack ka hissa pakda.</p><p><b>Seekh:</b> koi single layer perfect nahi; independent layers sambhavit breach ko routine ticket bana deti hain.</p></div>

<div class="iv"><p class="q">"Cisco SAFE kya hai aur naye branch design par aap ise kaise use karoge?"</p><p>SAFE ko Cisco ka security reference architecture batao jo SAFE Key par bana hai: places in the network aur secure domains. Method samjhao: branch ke business flows se shuru karo, har flow ke threats list karo, har domain ke liye capabilities chuno (segmentation, threat defense, secure services, security intelligence, management, compliance), phir products aur validated designs se map karo. Before, during aur after par defence in depth ke saath khatam karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SAFE = Cisco security reference architecture; SAFE Key = places in the network x secure domains.</li>
<li>PINs: branch, campus, data center, edge, cloud, WAN.</li>
<li>Secure domains: management, security intelligence, compliance, segmentation, threat defense, secure services.</li>
<li>Method: business flows, threats, capabilities, phir architecture aur product design.</li>
<li>Defence in depth ko attack ke pehle, dauraan aur baad independent layers chahiye.</li>
</ul></div>
`}};export{e as default};