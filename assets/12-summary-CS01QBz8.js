var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Think of this chapter as the checklist a pilot runs before take-off: short, complete, and in the right order. If you can tick every box below, you are ready for the Catalyst Center questions on ENCOR and for the "tell me about controllers" part of an interview.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="245" y="75" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="14">Catalyst Center</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">management plane</text>
<rect x="20" y="15" width="150" height="40" rx="8" fill="#fde68a"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="13">Design</text>
<rect x="20" y="145" width="150" height="40" rx="8" fill="#fde68a"/><text x="95" y="170" text-anchor="middle" class="svg-ink" font-size="13">Policy</text>
<rect x="245" y="10" width="150" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Provision</text>
<rect x="470" y="15" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="545" y="40" text-anchor="middle" class="svg-ink" font-size="13">Assurance</text>
<rect x="470" y="145" width="150" height="40" rx="8" fill="#fed7aa"/><text x="545" y="170" text-anchor="middle" class="svg-ink" font-size="13">Platform / API</text>
<line x1="170" y1="35" x2="245" y2="85" stroke="#64748b"/><line x1="170" y1="165" x2="245" y2="115" stroke="#64748b"/><line x1="320" y1="50" x2="320" y2="75" stroke="#64748b"/><line x1="470" y1="35" x2="395" y2="85" stroke="#64748b"/><line x1="470" y1="165" x2="395" y2="115" stroke="#64748b"/>
</svg><p class="cap">Five workflows around one controller. Every exam question fits one of these boxes.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain what Catalyst Center (formerly DNA Center) is, which plane it belongs to, and why the network keeps forwarding if it fails.</li>
<li>Name the five workflows and give two tasks for each.</li>
<li>Describe the IBN loop: translate, activate, assure, correct; and northbound versus southbound interfaces.</li>
<li>Build a site hierarchy (Global, Area, Building, Floor) and explain settings inheritance, IP pool reservation, golden images and network profiles.</li>
<li>Explain group-based access control (scalable groups, contracts, policy matrix, ISE enforcement) and virtual networks.</li>
<li>Discover devices by IP range with CLI and SNMP credentials, and diagnose each discovery failure message.</li>
<li>Describe PnP onboarding: option 43, DNS pnpserver, PnP Connect, Unclaimed / Planned / Provisioned.</li>
<li>Deploy a template with variables, preview it, verify the result on the device and read a compliance report.</li>
<li>Read device, client and network health and calculate the percentage.</li>
<li>Use issues and suggested actions, and run Path Trace with the real protocol and port.</li>
<li>Walk a token-based Intent API call and interpret status codes and JSON payloads, including RESTCONF basics.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Intent</dt><dd>The business outcome you want, expressed without device syntax.</dd>
<dt>Assurance</dt><dd>Continuous comparison of telemetry with intent: health, issues, Path Trace.</dd>
<dt>Health score</dt><dd>1–10 per device or client; Good 8–10, Fair 4–7, Poor 1–3.</dd>
<dt>Issue</dt><dd>A detected problem with priority P1–P4, impact and suggested actions.</dd>
<dt>Path Trace</dt><dd>Hop-by-hop L2/L3 path computation with drop point, ACL trace and stats.</dd>
<dt>PnP</dt><dd>Plug and Play: zero-touch Day-0 onboarding of unconfigured devices.</dd>
<dt>SWIM</dt><dd>Software Image Management: golden image, pre-check, distribute, activate.</dd>
<dt>Template Hub</dt><dd>Where Velocity or Jinja2 templates are written, versioned and deployed.</dd>
<dt>Compliance</dt><dd>Check of devices against the intended state (templates, image, startup vs running, advisories).</dd>
<dt>Scalable group / SGT</dt><dd>Role tag used by group-based policy; enforced with SGACLs via ISE.</dd>
<dt>Virtual network</dt><dd>A VRF used for macro-segmentation.</dd>
<dt>Intent API</dt><dd>Northbound REST API; token in X-Auth-Token; paths under /dna/intent/api/.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Name</td><td>Catalyst Center = DNA Center renamed; SD-WAN Manager = vManage, a different controller</td></tr>
<tr><td>Plane</td><td>Management plane; devices keep control and data planes</td></tr>
<tr><td>HA</td><td>Three-node cluster</td></tr>
<tr><td>Workflows</td><td>Design, Policy, Provision, Assurance, Platform</td></tr>
<tr><td>Hierarchy</td><td>Global → Area → Building → Floor</td></tr>
<tr><td>Discovery</td><td>IP range/CIDR, CDP, LLDP; needs CLI + SNMP credentials</td></tr>
<tr><td>PnP</td><td>DHCP option 43, DNS pnpserver, cloud PnP Connect</td></tr>
<tr><td>Templates</td><td>Velocity or Jinja2; Day-0 and Day-N; attached via network profiles</td></tr>
<tr><td>Health</td><td>Device 1–10; network/client health = % of Good members</td></tr>
<tr><td>Issues</td><td>P1 highest … P4 lowest</td></tr>
<tr><td>API auth</td><td>POST /dna/system/api/v1/auth/token → header X-Auth-Token</td></tr>
<tr><td>Codes</td><td>200 OK, 201 Created, 202 Accepted, 204 No Content, 400, 401, 403, 404, 409, 500</td></tr></table>

<h3>Command cheat-sheet (lab controller shell)</h3>
<pre class="code">center discover 10.99.0.0/24 cli netadmin NK@dmin1 snmp nkro   <span class="c">! onboard</span>
center inventory                                                <span class="c">! managed devices</span>
center health  |  center health DSW1  |  center clients         <span class="c">! scores</span>
center issues  |  center issues #2B80                           <span class="c">! detail + actions</span>
center pathtrace PC2 SRV tcp 80                                 <span class="c">! real port</span>
center template preview NTP-Baseline ASW1 ntp_server=10.255.0.1
center template apply Banner-Standard switches site=Pune_Campus
center compliance                                               <span class="c">! drift check</span>
center api get /api/v1/issues                                   <span class="c">! northbound JSON</span></pre>
<pre class="out">Device-side proof:  show port-security interface Gi0/3  |  show ip ospf neighbor
                    show access-lists WAN-IN  |  <span class="hl">show ntp status</span></pre>

<div class="eg"><p><b>Worked example: a 30-second exam answer.</b> "A NOC engineer sees 60% network health and a P1 issue. What next?" Open the P1 issue, read the likely cause and impacted devices, run the suggested show commands, run Path Trace if clients are affected, fix on the device, and confirm the issue resolves and health rises. 60% means 3 of 5 devices Good, so two devices need attention.</p></div>

<div class="warn"><p><b>Last-minute mistakes to avoid.</b> Calling the northbound API "the way devices are configured". Averaging health scores. Treating 202 as finished or 401 as a permissions problem. Forgetting that PnP needs a device with no startup config.</p></div>
<div class="exam"><p><b>Exam trap round-up.</b> Watch for old names (DNA Center, Template Editor), for the difference between 201 and 204, between 401 and 403, and for scenario answers that trace with ICMP when the complaint is about a TCP application.</p></div>

<div class="scn"><h4>The interview that turned on one sentence</h4><p>A candidate for a NOC lead role was asked "Catalyst Center says the network is 100% healthy but users cannot reach payroll. Is Catalyst Center wrong?" She answered that health measures device KPIs, not every flow, and walked through Client 360, application health and a TCP 443 Path Trace with ACL trace. She got the job; the previous candidate had answered "restart the controller".</p><p><b>Lesson:</b> knowing what each tool measures, and what it cannot see, is what separates operators from engineers.</p></div>

<div class="iv"><p class="q">"Summarise Catalyst Center in two minutes."</p><p>Formerly DNA Center; Cisco's controller and management plane for campus, branch and wireless, and for SD-Access. Design (sites, settings, pools, images, profiles), Policy (groups, VNs, app QoS with ISE), Provision (discovery, PnP, templates, SWIM, compliance), Assurance (health 1–10, issues P1–P4, Path Trace, sensors, AI baselines), Platform (Intent REST API with tokens, events and webhooks). Close with a story: using Path Trace on the real port to find an ACL that ping could not see.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five workflows: Design, Policy, Provision, Assurance, Platform.</li>
<li>Onboard with discovery or PnP; standardise with settings, templates and compliance.</li>
<li>Health: device 1–10, network and client as percentages of Good.</li>
<li>Issues from P1 down; Path Trace with the real protocol and port.</li>
<li>API: token, X-Auth-Token, JSON response lists, and the status codes 2xx/4xx/5xx.</li>
</ul></div>
`,hi:`
<p>Is chapter ko woh checklist samjho jo pilot take-off se pehle chalata hai: chhoti, poori, aur sahi order mein. Agar aap neeche ka har box tick kar sakte ho, to aap ENCOR ke Catalyst Center questions aur interview ke "controllers ke baare mein batao" part ke liye ready ho.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module map">
<rect x="245" y="75" width="150" height="50" rx="10" fill="#bbf7d0"/><text x="320" y="97" text-anchor="middle" class="svg-ink" font-size="14">Catalyst Center</text><text x="320" y="114" text-anchor="middle" class="svg-muted" font-size="12">management plane</text>
<rect x="20" y="15" width="150" height="40" rx="8" fill="#fde68a"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="13">Design</text>
<rect x="20" y="145" width="150" height="40" rx="8" fill="#fde68a"/><text x="95" y="170" text-anchor="middle" class="svg-ink" font-size="13">Policy</text>
<rect x="245" y="10" width="150" height="40" rx="8" fill="#bae6fd"/><text x="320" y="35" text-anchor="middle" class="svg-ink" font-size="13">Provision</text>
<rect x="470" y="15" width="150" height="40" rx="8" fill="#ddd6fe"/><text x="545" y="40" text-anchor="middle" class="svg-ink" font-size="13">Assurance</text>
<rect x="470" y="145" width="150" height="40" rx="8" fill="#fed7aa"/><text x="545" y="170" text-anchor="middle" class="svg-ink" font-size="13">Platform / API</text>
<line x1="170" y1="35" x2="245" y2="85" stroke="#64748b"/><line x1="170" y1="165" x2="245" y2="115" stroke="#64748b"/><line x1="320" y1="50" x2="320" y2="75" stroke="#64748b"/><line x1="470" y1="35" x2="395" y2="85" stroke="#64748b"/><line x1="470" y1="165" x2="395" y2="115" stroke="#64748b"/>
</svg><p class="cap">Ek controller ke aas-paas paanch workflows. Har exam question inmein se kisi ek box mein fit hota hai.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki Catalyst Center (pehle DNA Center) kya hai, kaunse plane mein aata hai, aur fail hone par bhi network forward kyun karta rehta hai.</li>
<li>Paanch workflows ke naam lo aur har ek ke do tasks batao.</li>
<li>IBN loop describe karo: translate, activate, assure, correct; aur northbound versus southbound interfaces.</li>
<li>Site hierarchy banao (Global, Area, Building, Floor) aur settings inheritance, IP pool reservation, golden images aur network profiles samjhao.</li>
<li>Group-based access control (scalable groups, contracts, policy matrix, ISE enforcement) aur virtual networks samjhao.</li>
<li>CLI aur SNMP credentials ke saath IP range se devices discover karo, aur har discovery failure message diagnose karo.</li>
<li>PnP onboarding describe karo: option 43, DNS pnpserver, PnP Connect, Unclaimed / Planned / Provisioned.</li>
<li>Variables wala template deploy karo, preview karo, device par result verify karo aur compliance report padho.</li>
<li>Device, client aur network health padho aur percentage calculate karo.</li>
<li>Issues aur suggested actions use karo, aur asli protocol aur port ke saath Path Trace chalao.</li>
<li>Token-based Intent API call walk karo aur status codes aur JSON payloads interpret karo, RESTCONF basics samet.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Intent</dt><dd>Woh business outcome jo aap chahte ho, device syntax ke bina.</dd>
<dt>Assurance</dt><dd>Telemetry ka intent se lagataar comparison: health, issues, Path Trace.</dd>
<dt>Health score</dt><dd>Har device ya client ka 1–10; Good 8–10, Fair 4–7, Poor 1–3.</dd>
<dt>Issue</dt><dd>Pakdi gayi problem, priority P1–P4, impact aur suggested actions ke saath.</dd>
<dt>Path Trace</dt><dd>Hop-by-hop L2/L3 path computation, drop point, ACL trace aur stats ke saath.</dd>
<dt>PnP</dt><dd>Plug and Play: unconfigured devices ka zero-touch Day-0 onboarding.</dd>
<dt>SWIM</dt><dd>Software Image Management: golden image, pre-check, distribute, activate.</dd>
<dt>Template Hub</dt><dd>Jahan Velocity ya Jinja2 templates likhe, version aur deploy hote hain.</dd>
<dt>Compliance</dt><dd>Devices ka intended state se check (templates, image, startup vs running, advisories).</dd>
<dt>Scalable group / SGT</dt><dd>Group-based policy ka role tag; ISE ke through SGACLs se enforce.</dd>
<dt>Virtual network</dt><dd>Macro-segmentation ke liye use hone wala VRF.</dd>
<dt>Intent API</dt><dd>Northbound REST API; token X-Auth-Token mein; paths /dna/intent/api/ ke neeche.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Naam</td><td>Catalyst Center = renamed DNA Center; SD-WAN Manager = vManage, alag controller</td></tr>
<tr><td>Plane</td><td>Management plane; devices control aur data planes rakhte hain</td></tr>
<tr><td>HA</td><td>Three-node cluster</td></tr>
<tr><td>Workflows</td><td>Design, Policy, Provision, Assurance, Platform</td></tr>
<tr><td>Hierarchy</td><td>Global → Area → Building → Floor</td></tr>
<tr><td>Discovery</td><td>IP range/CIDR, CDP, LLDP; CLI + SNMP credentials chahiye</td></tr>
<tr><td>PnP</td><td>DHCP option 43, DNS pnpserver, cloud PnP Connect</td></tr>
<tr><td>Templates</td><td>Velocity ya Jinja2; Day-0 aur Day-N; network profiles se attach</td></tr>
<tr><td>Health</td><td>Device 1–10; network/client health = Good members ka %</td></tr>
<tr><td>Issues</td><td>P1 sabse ooncha … P4 sabse neecha</td></tr>
<tr><td>API auth</td><td>POST /dna/system/api/v1/auth/token → header X-Auth-Token</td></tr>
<tr><td>Codes</td><td>200 OK, 201 Created, 202 Accepted, 204 No Content, 400, 401, 403, 404, 409, 500</td></tr></table>

<h3>Command cheat-sheet (lab controller shell)</h3>
<pre class="code">center discover 10.99.0.0/24 cli netadmin NK@dmin1 snmp nkro   <span class="c">! onboard</span>
center inventory                                                <span class="c">! managed devices</span>
center health  |  center health DSW1  |  center clients         <span class="c">! scores</span>
center issues  |  center issues #2B80                           <span class="c">! detail + actions</span>
center pathtrace PC2 SRV tcp 80                                 <span class="c">! asli port</span>
center template preview NTP-Baseline ASW1 ntp_server=10.255.0.1
center template apply Banner-Standard switches site=Pune_Campus
center compliance                                               <span class="c">! drift check</span>
center api get /api/v1/issues                                   <span class="c">! northbound JSON</span></pre>
<pre class="out">Device-side proof:  show port-security interface Gi0/3  |  show ip ospf neighbor
                    show access-lists WAN-IN  |  <span class="hl">show ntp status</span></pre>

<div class="eg"><p><b>Worked example: 30 second ka exam answer.</b> "NOC engineer ko 60% network health aur ek P1 issue dikhta hai. Aage kya?" P1 issue kholo, likely cause aur impacted devices padho, suggested show commands chalao, clients affected hon to Path Trace chalao, device par fix karo, aur confirm karo ki issue resolve hua aur health badhi. 60% ka matlab 5 mein se 3 devices Good, to do devices par dhyan dena hai.</p></div>

<div class="warn"><p><b>Last-minute galtiyan jo bachni hain.</b> Northbound API ko "devices configure karne ka tareeka" kehna. Health scores ka average nikalna. 202 ko finished ya 401 ko permissions problem samajhna. Bhool jaana ki PnP ko bina startup config wala device chahiye.</p></div>
<div class="exam"><p><b>Exam trap round-up.</b> Purane naamon (DNA Center, Template Editor), 201 aur 204 ke farak, 401 aur 403 ke farak, aur un scenario answers par dhyan do jo TCP application ki shikayat par ICMP se trace karte hain.</p></div>

<div class="scn"><h4>Woh interview jo ek sentence par palta</h4><p>NOC lead role ke ek candidate se poocha gaya "Catalyst Center kehta hai network 100% healthy hai par users payroll tak nahi pahunch pa rahe. Kya Catalyst Center galat hai?" Usne jawab diya ki health device KPIs measure karta hai, har flow nahi, aur Client 360, application health aur ACL trace ke saath TCP 443 Path Trace walk kiya. Use job mil gayi; pichhle candidate ne jawab diya tha "controller restart karo".</p><p><b>Lesson:</b> har tool kya measure karta hai, aur kya nahi dekh sakta, yeh jaanna hi operators ko engineers se alag karta hai.</p></div>

<div class="iv"><p class="q">"Catalyst Center ko do minute mein summarise karo."</p><p>Pehle DNA Center; campus, branch aur wireless ke liye, aur SD-Access ke liye Cisco ka controller aur management plane. Design (sites, settings, pools, images, profiles), Policy (groups, VNs, ISE ke saath app QoS), Provision (discovery, PnP, templates, SWIM, compliance), Assurance (health 1–10, issues P1–P4, Path Trace, sensors, AI baselines), Platform (tokens wala Intent REST API, events aur webhooks). Ek kahaani se close karo: asli port par Path Trace se woh ACL dhoondhna jo ping nahi dekh saka.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch workflows: Design, Policy, Provision, Assurance, Platform.</li>
<li>Discovery ya PnP se onboard karo; settings, templates aur compliance se standardise karo.</li>
<li>Health: device 1–10, network aur client Good ke percentages ke roop mein.</li>
<li>Issues P1 se neeche; Path Trace asli protocol aur port ke saath.</li>
<li>API: token, X-Auth-Token, JSON response lists, aur status codes 2xx/4xx/5xx.</li>
</ul></div>
`}};export{e as default};