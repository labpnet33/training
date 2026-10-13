var e={id:`controllers`,h:{en:`Controllers: Nexus Dashboard, NDFC, Insights and the ACI REST API`,hi:`Controllers: Nexus Dashboard, NDFC, Insights aur ACI REST API`},body:{en:`
<p>An airport does not let each pilot decide their own route and altitude. A control tower sees every aircraft, applies the rules, and gives each one clear instructions. A <b>fabric controller</b> is the control tower of a data center network: it knows every switch, holds the intended design, generates the configuration, pushes it, and warns you when a device drifts from what it should be. Scripts automate tasks; controllers automate a whole fabric.</p>

<h3>Nexus Dashboard: the platform</h3>
<p><b>Cisco Nexus Dashboard (ND)</b> is a cluster (physical or virtual appliances) that hosts the data center operations services:</p>
<ul>
<li><b>Nexus Dashboard Fabric Controller (NDFC)</b>, formerly <b>DCNM</b> (Data Center Network Manager): builds and manages NX-OS fabrics, including VXLAN EVPN, classic LAN and SAN.</li>
<li><b>Nexus Dashboard Insights (NDI)</b>: assurance and analytics using telemetry from ACI and NX-OS fabrics.</li>
<li><b>Nexus Dashboard Orchestrator (NDO)</b>: defines policy across several ACI or NDFC fabrics (multi-site).</li>
</ul>
<p>In the newest releases these services are merged into one unified Nexus Dashboard experience, but the functions and the exam concepts stay the same.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Nexus Dashboard services">
<rect x="10" y="10" width="620" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="14">Nexus Dashboard cluster (platform)</text>
<rect x="10" y="58" width="195" height="50" rx="8" fill="#bae6fd"/><text x="107" y="80" text-anchor="middle" class="svg-ink" font-size="13">Fabric Controller</text><text x="107" y="98" text-anchor="middle" class="svg-muted" font-size="12">build and deploy</text>
<rect x="222" y="58" width="195" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">Insights</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">assure and analyse</text>
<rect x="435" y="58" width="195" height="50" rx="8" fill="#ddd6fe"/><text x="532" y="80" text-anchor="middle" class="svg-ink" font-size="13">Orchestrator</text><text x="532" y="98" text-anchor="middle" class="svg-muted" font-size="12">multi-site policy</text>
<rect x="60" y="140" width="220" height="44" rx="8" fill="#e2e8f0"/><text x="170" y="167" text-anchor="middle" class="svg-ink" font-size="13">NX-OS VXLAN EVPN fabric</text>
<rect x="360" y="140" width="220" height="44" rx="8" fill="#e2e8f0"/><text x="470" y="167" text-anchor="middle" class="svg-ink" font-size="13">ACI fabric (APIC)</text>
<line x1="107" y1="108" x2="170" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="108" x2="170" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="108" x2="470" y2="140" stroke="#64748b" stroke-width="2"/><line x1="532" y1="108" x2="470" y2="140" stroke="#64748b" stroke-width="2"/><line x1="532" y1="108" x2="170" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One platform, three roles: build (NDFC), assure (Insights), orchestrate across sites (Orchestrator).</p></div>

<h3>NDFC fabric builder: templates do the design work</h3>
<p>In NDFC you create a <b>fabric</b> from a <b>fabric template</b>. The most important one is <b>Data Center VXLAN EVPN</b> (called "Easy Fabric" in older releases). You fill in a form with design values and NDFC generates the full, consistent configuration for every switch. Other templates include BGP Fabric (eBGP-routed designs), Enhanced Classic LAN (traditional three-tier), External Connectivity Network (routers and firewalls outside the fabric) and VXLAN EVPN Multi-Site.</p>
<table class="cmp"><tr><th>Template setting</th><th>Example value</th></tr>
<tr><td>BGP ASN</td><td>65001</td></tr>
<tr><td>Underlay routing protocol</td><td>OSPF (or IS-IS)</td></tr>
<tr><td>Replication mode for BUM traffic</td><td>Multicast (or ingress replication)</td></tr>
<tr><td>Anycast gateway MAC</td><td>2020.0000.00aa</td></tr>
<tr><td>Underlay loopback and link subnets</td><td>10.2.0.0/22, 10.4.0.0/16</td></tr>
<tr><td>Layer 2 and Layer 3 VNI ranges</td><td>30000-49000, 50000-59000</td></tr>
</table>

<h3>From empty switches to a running fabric</h3>
<ol>
<li><b>Create the fabric</b> from the template and save the settings.</li>
<li><b>Add switches</b>: discover them with a seed IP and credentials, or let brand-new switches boot with POAP and appear in the bootstrap list (next chapter).</li>
<li><b>Assign roles</b>: spine, leaf, border, border gateway.</li>
<li><b>Recalculate and Deploy</b>: NDFC computes the configuration, shows the <b>pending configuration</b> per switch for review, then pushes it.</li>
<li><b>Create overlay VRFs and Networks</b> (VLAN, VNI, gateway IP), attach them to leaves and ports, and deploy.</li>
</ol>
<p>Afterwards NDFC keeps checking <b>configuration compliance</b>. If someone changes a switch by hand, NDFC marks it <b>Out-of-Sync</b> and shows the difference; you either redeploy the intent or accept the change into NDFC (for example as a freeform policy). NDFC also has a REST API, and the <b>cisco.dcnm</b> Ansible collection drives it (inventory, VRFs, networks, interfaces).</p>

<div class="eg"><p><b>Worked example.</b> A new fabric has 2 spines and 8 leaves. With the Data Center VXLAN EVPN template, NDFC allocates 10 router-ID loopbacks, 8 VTEP loopbacks, and 16 point-to-point uplinks (8 leaves x 2 spines), each a /30 or /31 from the link pool, configures OSPF, BGP EVPN with the spines as route reflectors, NVE interfaces and multicast for BUM traffic. That is roughly 2,000 lines of configuration generated and deployed consistently in a few minutes, where manual work would take days and would almost certainly contain mistakes.</p></div>

<h3>Nexus Dashboard Insights, at concept level</h3>
<p>Insights collects streaming and flow telemetry, logs and configuration snapshots, and turns them into answers: <b>anomalies</b> (interface errors, resource exhaustion, routing or endpoint problems), <b>advisories</b> (field notices, security advisories and end-of-life notices that match your hardware and software), <b>compliance</b> checks against rules you define, <b>delta analysis</b> (what changed between two snapshots), <b>pre-change analysis</b> (the impact of a planned change before you deploy it) and <b>flow analytics</b> (latency and drops per flow).</p>

<h3>ACI: everything is a REST API</h3>
<p>In ACI the APIC GUI itself is only a client of the <b>APIC REST API</b>. Every tenant, EPG or contract is a managed object in the <b>management information tree (MIT)</b>, with a class (for example <code>fvTenant</code>) and a DN (for example <code>uni/tn-PROD</code>). You log in with POST <code>/api/aaaLogin.json</code>, receive a token that is sent as the <code>APIC-cookie</code>, then query with <code>/api/mo/uni/tn-PROD.json</code> or <code>/api/class/fvTenant.json</code> and configure by POSTing JSON or XML to <code>/api/mo/uni.json</code>.</p>
<pre class="code">{ "fvTenant": { "attributes": { "name": "PROD", "descr": "production" } } }</pre>
<p>Helpful tools: the <b>API Inspector</b> in the GUI shows the exact calls the GUI makes, so you can copy them; <b>Visore</b> browses objects; right-click <b>Save As</b> exports any object as JSON or XML. For Python, the <b>Cobra SDK</b> (acicobra and acimodel packages) mirrors the complete object model, while the <b>ACI Toolkit</b> offers simpler classes for common objects such as Tenant, AppProfile and EPG.</p>
<pre class="code">from cobra.mit.access import MoDirectory
from cobra.mit.session import LoginSession
from cobra.mit.request import ConfigRequest
from cobra.model.fv import Tenant

apic = scheme + '://' + apic_host          <span class="c"># built from parts, not hard-coded</span>
md = MoDirectory(LoginSession(apic, 'admin', password))
md.login()
tn = Tenant(md.lookupByDn('uni'), name='PROD')
cfg = ConfigRequest()
cfg.addMo(tn)
md.commit(cfg)</pre>

<div class="warn"><p><b>Common mistakes.</b> Making manual CLI changes on NDFC-managed switches and being surprised when a redeploy overwrites them. Deploying without reviewing the pending configuration. Treating Insights anomalies as noise instead of tuning them. In ACI, scripting against the wrong DN because the name was guessed instead of copied from the API Inspector.</p></div>
<div class="exam"><p><b>Exam trap.</b> NDFC is the new name of DCNM and runs on Nexus Dashboard; Insights is assurance, Orchestrator is multi-site. ACI's API is REST over the MIT with aaaLogin, <code>/api/mo</code> (by DN) and <code>/api/class</code> (by class). Cobra = full model SDK; ACI Toolkit = simplified.</p></div>

<div class="scn"><h4>The out-of-sync leaf</h4><p>After a night incident, an engineer changed the MTU on two uplinks of LEAF-05 by hand to test a theory, and forgot to revert. The next morning NDFC showed LEAF-05 as Out-of-Sync. The day team opened the switch's pending configuration and saw that NDFC wanted to set MTU 9216 back on Ethernet1/49 and 1/50. They confirmed the theory had been wrong, deployed the intent, and the leaf returned to In-Sync. Later that week Insights flagged the same uplinks with CRC errors, and a dirty fiber was replaced, which was the real root cause.</p><p><b>Lesson:</b> a controller is also a safety net: compliance shows drift, and assurance points to the real fault.</p></div>

<div class="iv"><p class="q">"What does NDFC give you compared with configuring a VXLAN EVPN fabric by hand?"</p><p>Strong answer: template-driven design (ASN, underlay, replication, pools), automatic resource allocation, consistent generated configuration, review of pending changes before deployment, overlay VRF and Network provisioning, POAP-based bootstrap and ongoing compliance with Out-of-Sync detection. Mention that it is the former DCNM and runs on Nexus Dashboard, alongside Insights for assurance and Orchestrator for multi-site.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nexus Dashboard hosts NDFC (build), Insights (assurance) and Orchestrator (multi-site).</li>
<li>NDFC, formerly DCNM, builds fabrics from templates such as Data Center VXLAN EVPN.</li>
<li>Workflow: create fabric, add switches, assign roles, recalculate and deploy, then VRFs and Networks.</li>
<li>Compliance flags manual drift as Out-of-Sync; Insights finds anomalies and advisories.</li>
<li>ACI is fully REST: aaaLogin, <code>/api/mo</code> and <code>/api/class</code>; Cobra and ACI Toolkit for Python.</li>
</ul></div>
`,hi:`
<p>Airport har pilot ko apna route aur altitude khud tay nahi karne deta. Control tower har aircraft ko dekhta hai, rules lagata hai, aur har ek ko saaf instructions deta hai. <b>Fabric controller</b> data center network ka control tower hai: woh har switch ko jaanta hai, intended design rakhta hai, configuration generate karta hai, push karta hai, aur aapko warn karta hai jab koi device apni sahi state se bhatak jaaye. Scripts tasks ko automate karti hain; controllers poore fabric ko automate karte hain.</p>

<h3>Nexus Dashboard: platform</h3>
<p><b>Cisco Nexus Dashboard (ND)</b> ek cluster hai (physical ya virtual appliances) jo data center operations services host karta hai:</p>
<ul>
<li><b>Nexus Dashboard Fabric Controller (NDFC)</b>, pehle <b>DCNM</b> (Data Center Network Manager): NX-OS fabrics banata aur manage karta hai, jismein VXLAN EVPN, classic LAN aur SAN shaamil hain.</li>
<li><b>Nexus Dashboard Insights (NDI)</b>: ACI aur NX-OS fabrics ki telemetry se assurance aur analytics.</li>
<li><b>Nexus Dashboard Orchestrator (NDO)</b>: kai ACI ya NDFC fabrics ke paar policy define karta hai (multi-site).</li>
</ul>
<p>Sabse nayi releases mein yeh services ek unified Nexus Dashboard experience mein mil gayi hain, lekin functions aur exam concepts same rehte hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Nexus Dashboard services">
<rect x="10" y="10" width="620" height="36" rx="8" fill="#fde68a"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="14">Nexus Dashboard cluster (platform)</text>
<rect x="10" y="58" width="195" height="50" rx="8" fill="#bae6fd"/><text x="107" y="80" text-anchor="middle" class="svg-ink" font-size="13">Fabric Controller</text><text x="107" y="98" text-anchor="middle" class="svg-muted" font-size="12">banao aur deploy</text>
<rect x="222" y="58" width="195" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="80" text-anchor="middle" class="svg-ink" font-size="13">Insights</text><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">assure aur analyse</text>
<rect x="435" y="58" width="195" height="50" rx="8" fill="#ddd6fe"/><text x="532" y="80" text-anchor="middle" class="svg-ink" font-size="13">Orchestrator</text><text x="532" y="98" text-anchor="middle" class="svg-muted" font-size="12">multi-site policy</text>
<rect x="60" y="140" width="220" height="44" rx="8" fill="#e2e8f0"/><text x="170" y="167" text-anchor="middle" class="svg-ink" font-size="13">NX-OS VXLAN EVPN fabric</text>
<rect x="360" y="140" width="220" height="44" rx="8" fill="#e2e8f0"/><text x="470" y="167" text-anchor="middle" class="svg-ink" font-size="13">ACI fabric (APIC)</text>
<line x1="107" y1="108" x2="170" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="108" x2="170" y2="140" stroke="#64748b" stroke-width="2"/><line x1="320" y1="108" x2="470" y2="140" stroke="#64748b" stroke-width="2"/><line x1="532" y1="108" x2="470" y2="140" stroke="#64748b" stroke-width="2"/><line x1="532" y1="108" x2="170" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek platform, teen roles: banana (NDFC), assure karna (Insights), sites ke paar orchestrate karna (Orchestrator).</p></div>

<h3>NDFC fabric builder: templates design ka kaam karte hain</h3>
<p>NDFC mein aap ek <b>fabric template</b> se <b>fabric</b> banate ho. Sabse zaroori template <b>Data Center VXLAN EVPN</b> hai (purani releases mein "Easy Fabric" kehte the). Aap design values ke saath ek form bharte ho aur NDFC har switch ke liye poora, consistent configuration generate karta hai. Dusre templates mein BGP Fabric (eBGP-routed designs), Enhanced Classic LAN (traditional three-tier), External Connectivity Network (fabric ke bahar routers aur firewalls) aur VXLAN EVPN Multi-Site shaamil hain.</p>
<table class="cmp"><tr><th>Template setting</th><th>Example value</th></tr>
<tr><td>BGP ASN</td><td>65001</td></tr>
<tr><td>Underlay routing protocol</td><td>OSPF (ya IS-IS)</td></tr>
<tr><td>BUM traffic ke liye replication mode</td><td>Multicast (ya ingress replication)</td></tr>
<tr><td>Anycast gateway MAC</td><td>2020.0000.00aa</td></tr>
<tr><td>Underlay loopback aur link subnets</td><td>10.2.0.0/22, 10.4.0.0/16</td></tr>
<tr><td>Layer 2 aur Layer 3 VNI ranges</td><td>30000-49000, 50000-59000</td></tr>
</table>

<h3>Khaali switches se chalte fabric tak</h3>
<ol>
<li>Template se <b>fabric banao</b> aur settings save karo.</li>
<li><b>Switches add karo</b>: seed IP aur credentials se discover karo, ya bilkul naye switches ko POAP se boot hone do aur bootstrap list mein aane do (agla chapter).</li>
<li><b>Roles assign karo</b>: spine, leaf, border, border gateway.</li>
<li><b>Recalculate and Deploy</b>: NDFC configuration compute karta hai, review ke liye har switch ka <b>pending configuration</b> dikhata hai, phir push karta hai.</li>
<li><b>Overlay VRFs aur Networks banao</b> (VLAN, VNI, gateway IP), unhe leaves aur ports se attach karo, aur deploy karo.</li>
</ol>
<p>Uske baad NDFC <b>configuration compliance</b> check karta rehta hai. Agar koi switch ko haath se badalta hai, NDFC use <b>Out-of-Sync</b> mark karta hai aur farak dikhata hai; aap ya to intent redeploy karte ho ya change ko NDFC mein accept karte ho (jaise freeform policy ki tarah). NDFC ka REST API bhi hai, aur <b>cisco.dcnm</b> Ansible collection use chalati hai (inventory, VRFs, networks, interfaces).</p>

<div class="eg"><p><b>Worked example.</b> Naye fabric mein 2 spines aur 8 leaves hain. Data Center VXLAN EVPN template ke saath NDFC 10 router-ID loopbacks, 8 VTEP loopbacks, aur 16 point-to-point uplinks (8 leaves x 2 spines) allocate karta hai, har ek link pool se /30 ya /31, OSPF configure karta hai, spines ko route reflectors bana kar BGP EVPN, NVE interfaces aur BUM traffic ke liye multicast. Yeh lagbhag 2,000 lines configuration hai jo kuch minutes mein consistent tarah generate aur deploy hoti hai, jabki manual kaam mein din lagte aur galtiyan lagbhag pakki hoti.</p></div>

<h3>Nexus Dashboard Insights, concept level par</h3>
<p>Insights streaming aur flow telemetry, logs aur configuration snapshots collect karta hai, aur unhe answers mein badalta hai: <b>anomalies</b> (interface errors, resource khatam hona, routing ya endpoint problems), <b>advisories</b> (field notices, security advisories aur end-of-life notices jo aapke hardware aur software se match karte hain), aapke define kiye rules ke against <b>compliance</b> checks, <b>delta analysis</b> (do snapshots ke beech kya badla), <b>pre-change analysis</b> (planned change ka impact deploy karne se pehle) aur <b>flow analytics</b> (har flow ki latency aur drops).</p>

<h3>ACI: sab kuch REST API hai</h3>
<p>ACI mein APIC GUI khud sirf <b>APIC REST API</b> ka ek client hai. Har tenant, EPG ya contract <b>management information tree (MIT)</b> mein ek managed object hai, ek class (jaise <code>fvTenant</code>) aur ek DN (jaise <code>uni/tn-PROD</code>) ke saath. Aap POST <code>/api/aaaLogin.json</code> se login karte ho, ek token milta hai jo <code>APIC-cookie</code> ki tarah bheja jaata hai, phir <code>/api/mo/uni/tn-PROD.json</code> ya <code>/api/class/fvTenant.json</code> se query karte ho aur <code>/api/mo/uni.json</code> par JSON ya XML POST karke configure karte ho.</p>
<pre class="code">{ "fvTenant": { "attributes": { "name": "PROD", "descr": "production" } } }</pre>
<p>Kaam ke tools: GUI mein <b>API Inspector</b> woh exact calls dikhata hai jo GUI karta hai, taaki aap copy kar sako; <b>Visore</b> objects browse karta hai; right-click <b>Save As</b> kisi bhi object ko JSON ya XML mein export karta hai. Python ke liye <b>Cobra SDK</b> (acicobra aur acimodel packages) poore object model ko mirror karta hai, jabki <b>ACI Toolkit</b> Tenant, AppProfile aur EPG jaise common objects ke liye simple classes deta hai.</p>
<pre class="code">from cobra.mit.access import MoDirectory
from cobra.mit.session import LoginSession
from cobra.mit.request import ConfigRequest
from cobra.model.fv import Tenant

apic = scheme + '://' + apic_host          <span class="c"># parts se bana, hard-coded nahi</span>
md = MoDirectory(LoginSession(apic, 'admin', password))
md.login()
tn = Tenant(md.lookupByDn('uni'), name='PROD')
cfg = ConfigRequest()
cfg.addMo(tn)
md.commit(cfg)</pre>

<div class="warn"><p><b>Common galtiyan.</b> NDFC-managed switches par manual CLI changes karna aur hairaan hona jab redeploy unhe overwrite kar de. Pending configuration review kiye bina deploy karna. Insights anomalies ko tune karne ki jagah noise samajhna. ACI mein galat DN par script chalana kyunki naam API Inspector se copy karne ki jagah guess kiya gaya tha.</p></div>
<div class="exam"><p><b>Exam trap.</b> NDFC DCNM ka naya naam hai aur Nexus Dashboard par chalta hai; Insights assurance hai, Orchestrator multi-site hai. ACI ka API MIT par REST hai, aaaLogin, <code>/api/mo</code> (DN se) aur <code>/api/class</code> (class se) ke saath. Cobra = full model SDK; ACI Toolkit = simplified.</p></div>

<div class="scn"><h4>Out-of-sync leaf</h4><p>Raat ke ek incident ke baad ek engineer ne ek theory test karne ke liye LEAF-05 ke do uplinks par MTU haath se badla, aur wapas karna bhool gaya. Agli subah NDFC ne LEAF-05 ko Out-of-Sync dikhaya. Day team ne switch ka pending configuration khola aur dekha ki NDFC Ethernet1/49 aur 1/50 par MTU 9216 wapas set karna chahta tha. Unhone confirm kiya ki theory galat thi, intent deploy kiya, aur leaf In-Sync par wapas aa gaya. Usi hafte baad mein Insights ne unhi uplinks par CRC errors flag kiye, aur ek gandi fiber badli gayi, jo asli root cause tha.</p><p><b>Seekh:</b> controller ek safety net bhi hai: compliance drift dikhata hai, aur assurance asli fault ki taraf ishaara karta hai.</p></div>

<div class="iv"><p class="q">"VXLAN EVPN fabric ko haath se configure karne ki tulna mein NDFC aapko kya deta hai?"</p><p>Strong answer: template-driven design (ASN, underlay, replication, pools), automatic resource allocation, consistent generated configuration, deployment se pehle pending changes ka review, overlay VRF aur Network provisioning, POAP-based bootstrap aur Out-of-Sync detection ke saath lagataar compliance. Batao ki yeh pehle DCNM tha aur Nexus Dashboard par chalta hai, assurance ke liye Insights aur multi-site ke liye Orchestrator ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Nexus Dashboard NDFC (build), Insights (assurance) aur Orchestrator (multi-site) host karta hai.</li>
<li>NDFC, pehle DCNM, Data Center VXLAN EVPN jaise templates se fabrics banata hai.</li>
<li>Workflow: fabric banao, switches add karo, roles assign karo, recalculate and deploy, phir VRFs aur Networks.</li>
<li>Compliance manual drift ko Out-of-Sync flag karta hai; Insights anomalies aur advisories dhoondhta hai.</li>
<li>ACI poora REST hai: aaaLogin, <code>/api/mo</code> aur <code>/api/class</code>; Python ke liye Cobra aur ACI Toolkit.</li>
</ul></div>
`}};export{e as default};