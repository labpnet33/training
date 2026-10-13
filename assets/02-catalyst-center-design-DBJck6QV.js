var e={id:`catalyst-center`,h:{en:`Catalyst Center design: intent, templates, zero-touch and image management`,hi:`Catalyst Center design: intent, templates, zero-touch aur image management`},body:{en:`
<p>Chapter 1 gave you the interfaces. This chapter shows the product most enterprises use to apply them at scale: <b>Cisco Catalyst Center</b> (formerly Cisco DNA Center). It is an on-premises controller appliance that turns business intent into device configuration and then measures whether the network delivers it.</p>

<h3>The customer case: Meridian Health Network</h3>
<p>Meridian Health runs 3 hospitals and 40 clinics, about 6,500 staff, and 900 access switches plus wireless controllers. The CIO's brief: "Open a new clinic in 10 days, not 10 weeks, with no engineer on site." Budget: USD 650,000 including appliances. <b>Requirements:</b> zero-touch onboarding of switches, one approved software version per model, clinical-device segmentation, and a health score the service desk can read. <b>Constraints:</b> medical devices cannot reboot during clinic hours; the clinics have only a basic DHCP server on the branch router; auditors demand proof of which software every switch runs.</p>

<h3>Analogy: a franchise head office</h3>
<p>A burger chain does not let each shop invent its own recipe. Head office defines the menu (policy), ships a standard kit to a new shop (provisioning), checks every shop's quality scores (assurance) and updates all recipes together (software image management). Catalyst Center is head office for the network.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Catalyst Center workflow">
<rect x="10" y="10" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="80" y="40" text-anchor="middle" class="svg-ink" font-size="13">1 Design</text>
<rect x="170" y="10" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="240" y="40" text-anchor="middle" class="svg-ink" font-size="13">2 Policy</text>
<rect x="330" y="10" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="400" y="40" text-anchor="middle" class="svg-ink" font-size="13">3 Provision</text>
<rect x="490" y="10" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">4 Assurance</text>
<line x1="150" y1="35" x2="170" y2="35" stroke="#64748b" stroke-width="2"/><line x1="310" y1="35" x2="330" y2="35" stroke="#64748b" stroke-width="2"/><line x1="470" y1="35" x2="490" y2="35" stroke="#64748b" stroke-width="2"/>
<rect x="215" y="110" width="210" height="50" rx="10" fill="#bae6fd"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center cluster</text>
<line x1="320" y1="60" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="200" width="120" height="44" rx="10" fill="#bbf7d0"/><text x="70" y="226" text-anchor="middle" class="svg-ink" font-size="13">New switch</text>
<rect x="170" y="200" width="120" height="44" rx="10" fill="#fde68a"/><text x="230" y="226" text-anchor="middle" class="svg-ink" font-size="13">DHCP opt 43</text>
<rect x="350" y="200" width="120" height="44" rx="10" fill="#bbf7d0"/><text x="410" y="226" text-anchor="middle" class="svg-ink" font-size="13">Fabric switch</text>
<rect x="510" y="200" width="120" height="44" rx="10" fill="#fed7aa"/><text x="570" y="226" text-anchor="middle" class="svg-ink" font-size="13">Telemetry</text>
<line x1="130" y1="222" x2="170" y2="222" stroke="#64748b" stroke-width="2"/><line x1="230" y1="200" x2="290" y2="160" stroke="#64748b" stroke-width="2"/><line x1="380" y1="160" x2="410" y2="200" stroke="#64748b" stroke-width="2"/><line x1="470" y1="222" x2="510" y2="222" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">Purple: the four workflow stages. Blue: the controller. Green: devices. Yellow: discovery helper. Orange: data flowing back.</p></div>

<h3>The building blocks you must know</h3>
<ul>
<li><b>Design:</b> the site hierarchy (area, building, floor), network settings (AAA, DHCP, DNS, NTP, syslog servers), IP pools and device credentials, inherited down the hierarchy.</li>
<li><b>Policy:</b> group-based policy and virtual networks for segmentation, and application policy for QoS.</li>
<li><b>Provision:</b> pushes configuration and templates to devices, including SD-Access fabric roles.</li>
<li><b>Assurance:</b> health scores for network, client and application, with issue detection and guided remediation.</li>
<li><b>Templates:</b> the Template Editor builds parameterised CLI templates in Velocity language. Day-0 templates run during onboarding; Day-N templates handle later changes.</li>
<li><b>Plug and Play (PnP):</b> a new device with no configuration finds the controller and onboards itself.</li>
<li><b>SWIM (Software Image Management):</b> import images, mark one a <b>golden image</b> per device family, then distribute (copy) and activate (reload) separately.</li>
</ul>

<h3>How zero-touch discovery works</h3>
<p>A factory-default switch asks DHCP for an address. It learns the controller through one of three methods: <b>DHCP option 43</b> carrying the controller address, a <b>DNS lookup</b> of the name pnpserver in the local domain, or the <b>Cisco cloud redirection service</b> (Plug and Play Connect), where the device is pre-registered to your account. The switch contacts the controller, receives its Day-0 template and golden image, and shows up as Planned then Onboarded.</p>

<h3>Options and trade-offs for Meridian</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Engineer travels with a laptop</td><td>No new tooling</td><td>Slow, costly, inconsistent</td></tr>
<tr><td>Pre-stage switches at HQ, ship them</td><td>Fast on site</td><td>Staging labour, config drifts while in transit</td></tr>
<tr><td>PnP with option 43 or DNS</td><td>Zero touch, same process everywhere</td><td>Needs DHCP changes and reachability to the controller</td></tr>
<tr><td>PnP Connect cloud redirect</td><td>No DHCP change, works from any ISP</td><td>Needs internet from the clinic, device serials registered</td></tr>
</table>
<p><b>Chosen design:</b> PnP Connect for clinics (basic DHCP, cannot be changed quickly), option 43 inside the hospitals. A 3-node cluster at the main hospital for high availability, because a single node has no HA; a second site holds a disaster-recovery cluster. One golden image per switch family, distributed in clinic off-hours, and activated only in the approved window because activation reloads the switch. Templates keep AAA, NTP and syslog identical everywhere.</p>

<pre class="out">Switch# show pnp status
PnP Agent Status: <span class="hl">Active</span>
Server: pnp-server.example (192.0.2.30) port 443
Last discovery method: DHCP option 43
Work-request: Image install pending, Config pending</pre>

<div class="warn"><p><b>Common mistake.</b> Treating Catalyst Center as a one-time install. It becomes the source of intent: if engineers still change devices by CLI, the controller reports configuration drift and assurance data stops matching reality.</p></div>
<div class="exam"><p><b>Exam trap.</b> Distribute and activate are separate SWIM steps. A three-node cluster gives high availability; disaster recovery needs a separate site. Day-0 templates are for onboarding, Day-N for ongoing change.</p></div>

<div class="scn"><h4>Post-mortem: the clinic that never onboarded</h4><p>Clinic 17 shipped three switches. Nothing appeared in the controller. The engineer found the clinic router handed out DHCP leases without option 43 and its DNS server could not resolve the PnP name. The switches had never been registered in PnP Connect. Fix: register serial numbers when the purchase order is raised, and add a checklist item "DHCP option 43 or DNS or cloud redirect confirmed" to the clinic build.</p><p><b>Lesson:</b> zero-touch needs three things designed in advance: an IP address, a way to find the controller, and a route to it.</p></div>

<div class="iv"><p class="q">"How does a new switch find Catalyst Center?"</p><p>It gets an address by DHCP and then uses option 43, a DNS record for the PnP name, or the cloud redirection service. I would pick based on who controls DHCP at the site, and I would confirm the switch has a route to the controller on the enterprise port.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Catalyst Center workflow: Design, Policy, Provision, Assurance.</li>
<li>PnP discovery: DHCP option 43, DNS, or cloud redirection.</li>
<li>SWIM uses a golden image per family; distribute first, activate in the window.</li>
<li>Use Day-0 templates for onboarding and Day-N for change; keep CLI changes out to avoid drift.</li>
<li>Cluster for HA, a second site for disaster recovery.</li>
</ul></div>
`,hi:`
<p>Chapter 1 ne aapko interfaces diye. Yeh chapter woh product dikhata hai jo zyada tar enterprises unhe scale par apply karne ke liye use karte hain: <b>Cisco Catalyst Center</b> (pehle Cisco DNA Center). Yeh on-premises controller appliance hai jo business intent ko device configuration mein badalta hai aur phir measure karta hai ki network woh deliver kar raha hai ya nahi.</p>

<h3>Customer case: Meridian Health Network</h3>
<p>Meridian Health 3 hospitals aur 40 clinics chalata hai, lagbhag 6,500 staff, 900 access switches aur wireless controllers. CIO ka brief: "Naya clinic 10 hafte nahi, 10 din mein kholo, site par engineer ke bina." Budget: appliances sahit USD 650,000. <b>Requirements:</b> switches ka zero-touch onboarding, har model ke liye ek approved software version, clinical-device segmentation, aur ek health score jo service desk padh sake. <b>Constraints:</b> medical devices clinic hours mein reboot nahi ho sakte; clinics mein branch router par sirf basic DHCP server hai; auditors proof maangte hain ki har switch kaunsa software chala raha hai.</p>

<h3>Analogy: franchise ka head office</h3>
<p>Burger chain har shop ko apni recipe banane nahi deti. Head office menu define karta hai (policy), naye shop ko standard kit bhejta hai (provisioning), har shop ke quality scores check karta hai (assurance) aur saari recipes ek saath update karta hai (software image management). Catalyst Center network ka head office hai.</p>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Catalyst Center workflow">
<rect x="10" y="10" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="80" y="40" text-anchor="middle" class="svg-ink" font-size="13">1 Design</text>
<rect x="170" y="10" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="240" y="40" text-anchor="middle" class="svg-ink" font-size="13">2 Policy</text>
<rect x="330" y="10" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="400" y="40" text-anchor="middle" class="svg-ink" font-size="13">3 Provision</text>
<rect x="490" y="10" width="140" height="50" rx="10" fill="#ddd6fe"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="13">4 Assurance</text>
<line x1="150" y1="35" x2="170" y2="35" stroke="#64748b" stroke-width="2"/><line x1="310" y1="35" x2="330" y2="35" stroke="#64748b" stroke-width="2"/><line x1="470" y1="35" x2="490" y2="35" stroke="#64748b" stroke-width="2"/>
<rect x="215" y="110" width="210" height="50" rx="10" fill="#bae6fd"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Catalyst Center cluster</text>
<line x1="320" y1="60" x2="320" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="10" y="200" width="120" height="44" rx="10" fill="#bbf7d0"/><text x="70" y="226" text-anchor="middle" class="svg-ink" font-size="13">Naya switch</text>
<rect x="170" y="200" width="120" height="44" rx="10" fill="#fde68a"/><text x="230" y="226" text-anchor="middle" class="svg-ink" font-size="13">DHCP opt 43</text>
<rect x="350" y="200" width="120" height="44" rx="10" fill="#bbf7d0"/><text x="410" y="226" text-anchor="middle" class="svg-ink" font-size="13">Fabric switch</text>
<rect x="510" y="200" width="120" height="44" rx="10" fill="#fed7aa"/><text x="570" y="226" text-anchor="middle" class="svg-ink" font-size="13">Telemetry</text>
<line x1="130" y1="222" x2="170" y2="222" stroke="#64748b" stroke-width="2"/><line x1="230" y1="200" x2="290" y2="160" stroke="#64748b" stroke-width="2"/><line x1="380" y1="160" x2="410" y2="200" stroke="#64748b" stroke-width="2"/><line x1="470" y1="222" x2="510" y2="222" stroke="#64748b" stroke-width="2" stroke-dasharray="4 3"/>
</svg><p class="cap">Purple: chaar workflow stages. Blue: controller. Green: devices. Yellow: discovery helper. Orange: wapas aane wala data.</p></div>

<h3>Building blocks jo aapko aane chahiye</h3>
<ul>
<li><b>Design:</b> site hierarchy (area, building, floor), network settings (AAA, DHCP, DNS, NTP, syslog servers), IP pools aur device credentials, jo hierarchy mein neeche inherit hote hain.</li>
<li><b>Policy:</b> segmentation ke liye group-based policy aur virtual networks, aur QoS ke liye application policy.</li>
<li><b>Provision:</b> devices par configuration aur templates push karta hai, SD-Access fabric roles sahit.</li>
<li><b>Assurance:</b> network, client aur application ke health scores, issue detection aur guided remediation ke saath.</li>
<li><b>Templates:</b> Template Editor Velocity language mein parameterised CLI templates banata hai. Day-0 templates onboarding ke dauraan chalte hain; Day-N templates baad ke changes handle karte hain.</li>
<li><b>Plug and Play (PnP):</b> bina configuration wala naya device controller dhundh kar khud onboard ho jaata hai.</li>
<li><b>SWIM (Software Image Management):</b> images import karo, har device family ke liye ek ko <b>golden image</b> mark karo, phir distribute (copy) aur activate (reload) alag-alag karo.</li>
</ul>

<h3>Zero-touch discovery kaise kaam karta hai</h3>
<p>Factory-default switch DHCP se address maangta hai. Woh controller ko teen tarikon se dhundhta hai: controller address wala <b>DHCP option 43</b>, local domain mein pnpserver naam ka <b>DNS lookup</b>, ya <b>Cisco cloud redirection service</b> (Plug and Play Connect), jahan device aapke account mein pehle se registered hota hai. Switch controller se contact karta hai, apna Day-0 template aur golden image paata hai, aur Planned se Onboarded dikhta hai.</p>

<h3>Meridian ke options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Engineer laptop leke travel kare</td><td>Naya tooling nahi</td><td>Slow, mehnga, inconsistent</td></tr>
<tr><td>HQ par switches pre-stage karke bhejo</td><td>Site par fast</td><td>Staging labour, transit mein config drift</td></tr>
<tr><td>Option 43 ya DNS ke saath PnP</td><td>Zero touch, har jagah same process</td><td>DHCP change aur controller tak reachability chahiye</td></tr>
<tr><td>PnP Connect cloud redirect</td><td>DHCP change nahi, kisi bhi ISP se chalta hai</td><td>Clinic se internet chahiye, device serials register karne padte hain</td></tr>
</table>
<p><b>Chosen design:</b> clinics ke liye PnP Connect (basic DHCP, jaldi badal nahi sakte), hospitals ke andar option 43. Main hospital mein high availability ke liye 3-node cluster, kyunki single node mein HA nahi hota; disaster recovery cluster doosri site par. Har switch family ke liye ek golden image, clinic off-hours mein distribute, aur sirf approved window mein activate kyunki activation switch ko reload karta hai. Templates AAA, NTP aur syslog ko har jagah identical rakhte hain.</p>

<pre class="out">Switch# show pnp status
PnP Agent Status: <span class="hl">Active</span>
Server: pnp-server.example (192.0.2.30) port 443
Last discovery method: DHCP option 43
Work-request: Image install pending, Config pending</pre>

<div class="warn"><p><b>Common mistake.</b> Catalyst Center ko one-time install samajhna. Yeh intent ka source ban jaata hai: agar engineers abhi bhi CLI se devices badalte hain, to controller configuration drift report karta hai aur assurance data reality se match nahi karta.</p></div>
<div class="exam"><p><b>Exam trap.</b> SWIM mein distribute aur activate alag steps hain. Three-node cluster high availability deta hai; disaster recovery ke liye alag site chahiye. Day-0 templates onboarding ke liye, Day-N ongoing change ke liye.</p></div>

<div class="scn"><h4>Post-mortem: woh clinic jo onboard hi nahi hua</h4><p>Clinic 17 ko teen switches bheje gaye. Controller mein kuch nahi dikha. Engineer ne dekha ki clinic router bina option 43 ke DHCP leases de raha tha aur uska DNS server PnP naam resolve nahi kar pa raha tha. Switches PnP Connect mein register hi nahi hue the. Fix: purchase order banate waqt serial numbers register karo, aur clinic build mein checklist item jodo "DHCP option 43 ya DNS ya cloud redirect confirmed".</p><p><b>Seekh:</b> zero-touch ke liye teen cheezein pehle se design karni padti hain: IP address, controller dhundhne ka tareeka, aur us tak route.</p></div>

<div class="iv"><p class="q">"Naya switch Catalyst Center ko kaise dhundhta hai?"</p><p>Woh DHCP se address leta hai aur phir option 43, PnP naam ka DNS record, ya cloud redirection service use karta hai. Main site par DHCP kiske control mein hai, uske hisaab se chunta, aur confirm karta ki switch ke paas enterprise port par controller tak route hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Catalyst Center workflow: Design, Policy, Provision, Assurance.</li>
<li>PnP discovery: DHCP option 43, DNS, ya cloud redirection.</li>
<li>SWIM mein har family ke liye golden image; pehle distribute, window mein activate.</li>
<li>Onboarding ke liye Day-0 templates, change ke liye Day-N; drift se bachne ke liye CLI changes band rakho.</li>
<li>HA ke liye cluster, disaster recovery ke liye doosri site.</li>
</ul></div>
`}};export{e as default};