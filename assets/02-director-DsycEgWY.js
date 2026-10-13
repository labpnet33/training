var e={id:`director`,h:{en:`Versa Director: management and orchestration`,hi:`Versa Director: management aur orchestration`},body:{en:`
<p>If the network is a hotel chain, the Director is the <b>central operations manual and the manager's console</b>. It holds the standard room layout (templates), knows which hotel follows which layout (device groups), and sends instructions to every hotel. It does not check in guests; the hotels do.</p>

<h3>What the Director does</h3>
<ul>
<li><b>Device inventory and onboarding.</b> It knows each VOS device by <b>serial number</b>, and runs the onboarding workflow (zero-touch, ZTP).</li>
<li><b>Templates.</b> A <b>device template</b> is a reusable configuration: organization, WAN interfaces and their transport, LAN interface, SLA profiles, forwarding profiles, SD-WAN policy, log export. Real Versa templates are very rich (security, routing, QoS); the course model keeps the SD-WAN essentials.</li>
<li><b>Device groups.</b> A group links devices to a template. In the lab the group <code>BRANCHES</code> uses the template <code>BR-DUAL</code>.</li>
<li><b>Bind data.</b> Values that differ per device: site-id, LAN address, WAN addresses and gateways. Template plus bind data gives the final configuration of one device.</li>
<li><b>Workflows.</b> Guided wizards in the GUI for adding devices, deploying them, and staging. Deploying a workflow pushes the generated configuration to the device.</li>
<li><b>Multitenancy and RBAC.</b> One Director manages many <b>organizations</b> (tenants). Role-based access control gives, for example, a provider operator full rights, and a customer operator rights only for their own organization.</li>
<li><b>Northbound API.</b> A REST API lets other systems (ticketing, automation, Concerto, Python scripts) drive the Director. Everything the GUI does can be done through it.</li>
<li><b>Monitoring and software.</b> Device status, alarms, software image and security-package upgrades.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Director object model">
<rect x="20" y="20" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">Template BR-DUAL</text><text x="105" y="59" text-anchor="middle" class="svg-muted" font-size="12">org, WANs, LAN, policy</text>
<rect x="235" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Device group</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="12">BRANCHES</text>
<rect x="450" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="535" y="42" text-anchor="middle" class="svg-ink" font-size="13">Device Branch1</text><text x="535" y="59" text-anchor="middle" class="svg-muted" font-size="12">serial VOS-BR1-0001</text>
<line x1="190" y1="45" x2="235" y2="45" stroke="#64748b" stroke-width="2"/><line x1="405" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="450" y="110" width="170" height="50" rx="8" fill="#fde68a"/><text x="535" y="132" text-anchor="middle" class="svg-ink" font-size="13">Bind data</text><text x="535" y="149" text-anchor="middle" class="svg-muted" font-size="12">site-id 101, 10.1.1.1/24</text>
<line x1="535" y1="70" x2="535" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="235" y="190" width="170" height="44" rx="8" fill="#fed7aa"/><text x="320" y="216" text-anchor="middle" class="svg-ink" font-size="13">Workflow deploy</text>
<line x1="405" y1="212" x2="535" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="235" y1="212" x2="105" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="320" y="252" text-anchor="middle" class="svg-muted" font-size="12">template + bind data = device configuration, pushed by the workflow</text>
</svg><p class="cap">Template, group, device, bind data and the deploy workflow.</p></div>

<h3>High availability and sizing</h3>
<p>A production Director is deployed as an <b>active-standby pair</b> (two Directors with configuration synchronised and a failover mechanism). Director has a <b>northbound</b> interface for users and APIs and a <b>southbound</b> interface towards the devices it manages; chapter 7 explains why these are separate. Directors are normally placed in the data centre or private cloud, never behind the branches.</p>

<h3>Director in the lab CLI</h3>
<p>In the lab the Director is <code>Director-1</code> at <code>198.51.100.10</code>. The statements you will use in this module:</p>
<pre class="code"><span class="c">! on Director-1</span>
configure
set director controllers Controller-1 address 198.51.100.20
set director analytics address 198.51.100.30
commit
exit
show controllers
show analytics
show templates
show device-groups
show devices brief</pre>
<pre class="out">admin@Director-1-cli&gt; show controllers
Controller      Address         Reachable
Controller-1    198.51.100.20   <span class="hl">yes</span>

admin@Director-1-cli&gt; show analytics
Analytics: 198.51.100.30
Reachable: yes</pre>

<div class="note"><p><b>Course model.</b> The real Director GUI has far more pages, and devices are managed through NETCONF over SSH from the Director's southbound interface. The lab reduces this to a few objects and a <code>Reachable</code> check. The meaning is the same: a registered node that the Director can reach is manageable.</p></div>

<div class="eg"><p><b>Worked example.</b> 120 branches need a new SLA: voice latency 120 ms. In the Director you change the SLA profile in one template; all 120 devices in the group get a new revision when you deploy. Without a Director you would log in 120 times. If two branches have a manual local change that conflicts, the pushed template lines are shown read-only on the branch (as in the lab), so the Director stays the single source of truth.</p></div>

<div class="warn"><p><b>Common mistake.</b> Editing configuration directly on a managed branch. The next template deploy may overwrite or conflict with it. Change the template or bind data in the Director instead.</p></div>

<div class="exam"><p><b>Exam trap.</b> A template does not contain site-specific values such as the site-id; those are bind data. Also the Director is a management node, so it is not a BGP route reflector for SD-WAN routes.</p></div>

<div class="scn"><h4>One typo, two hundred branches</h4><p>An engineer pasted a wrong SLA latency (15 ms instead of 150 ms) into the shared template and deployed. Every branch marked its Internet circuit as failing SLA, and traffic jumped to MPLS. Because the change was in one template, fixing it took one edit and one deploy. The review process afterwards required a second approver for template changes.</p><p><b>Lesson:</b> templates give power and blast radius in equal measure. Use staging groups and review.</p></div>

<div class="iv"><p class="q">"What is the difference between a template and bind data?"</p><p>A template is the common configuration for a device group, bind data is the per-device variable set (site-id, addresses, gateways). Template plus bind data is rendered into the device configuration and pushed by a workflow. Mention that missing bind data blocks deployment.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The Director owns inventory, templates, device groups, bind data, workflows and the REST API.</li>
<li>Multitenancy and RBAC let one Director serve many organizations safely.</li>
<li>Production Directors run as an active-standby pair.</li>
<li>Pushed template configuration is the source of truth; do not edit it on the branch.</li>
<li>Lab commands: <code>set director controllers</code>, <code>set director analytics</code>, <code>show controllers</code>.</li>
</ul></div>
`,hi:`
<p>Agar network ek hotel chain hai, to Director <b>central operations manual aur manager ka console</b> hai. Isme standard room layout (templates) hai, pata hai kaunsa hotel kaunsa layout follow karta hai (device groups), aur har hotel ko instructions bhejta hai. Yeh guests ko check-in nahi karta; hotels karte hain.</p>

<h3>Director kya karta hai</h3>
<ul>
<li><b>Device inventory aur onboarding.</b> Yeh har VOS device ko <b>serial number</b> se jaanta hai, aur onboarding workflow (zero-touch, ZTP) chalata hai.</li>
<li><b>Templates.</b> <b>Device template</b> reusable configuration hai: organization, WAN interfaces aur unka transport, LAN interface, SLA profiles, forwarding profiles, SD-WAN policy, log export. Real Versa templates bahut rich hote hain (security, routing, QoS); course model SD-WAN essentials rakhta hai.</li>
<li><b>Device groups.</b> Group devices ko template se jodta hai. Lab mein group <code>BRANCHES</code> template <code>BR-DUAL</code> use karta hai.</li>
<li><b>Bind data.</b> Woh values jo har device ke liye alag hoti hain: site-id, LAN address, WAN addresses aur gateways. Template plus bind data se ek device ki final configuration banti hai.</li>
<li><b>Workflows.</b> GUI mein guided wizards: devices add karna, deploy karna, staging. Workflow deploy karne se generated configuration device par push hoti hai.</li>
<li><b>Multitenancy aur RBAC.</b> Ek Director kai <b>organizations</b> (tenants) manage karta hai. Role-based access control se, jaise, provider operator ko full rights aur customer operator ko sirf apni organization ke rights milte hain.</li>
<li><b>Northbound API.</b> REST API se doosre systems (ticketing, automation, Concerto, Python scripts) Director ko chala sakte hain. GUI jo kuch karta hai woh API se bhi ho sakta hai.</li>
<li><b>Monitoring aur software.</b> Device status, alarms, software image aur security-package upgrades.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Director object model">
<rect x="20" y="20" width="170" height="50" rx="8" fill="#ddd6fe"/><text x="105" y="42" text-anchor="middle" class="svg-ink" font-size="13">Template BR-DUAL</text><text x="105" y="59" text-anchor="middle" class="svg-muted" font-size="12">org, WANs, LAN, policy</text>
<rect x="235" y="20" width="170" height="50" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Device group</text><text x="320" y="59" text-anchor="middle" class="svg-muted" font-size="12">BRANCHES</text>
<rect x="450" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="535" y="42" text-anchor="middle" class="svg-ink" font-size="13">Device Branch1</text><text x="535" y="59" text-anchor="middle" class="svg-muted" font-size="12">serial VOS-BR1-0001</text>
<line x1="190" y1="45" x2="235" y2="45" stroke="#64748b" stroke-width="2"/><line x1="405" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/>
<rect x="450" y="110" width="170" height="50" rx="8" fill="#fde68a"/><text x="535" y="132" text-anchor="middle" class="svg-ink" font-size="13">Bind data</text><text x="535" y="149" text-anchor="middle" class="svg-muted" font-size="12">site-id 101, 10.1.1.1/24</text>
<line x1="535" y1="70" x2="535" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="235" y="190" width="170" height="44" rx="8" fill="#fed7aa"/><text x="320" y="216" text-anchor="middle" class="svg-ink" font-size="13">Workflow deploy</text>
<line x1="405" y1="212" x2="535" y2="160" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/><line x1="235" y1="212" x2="105" y2="70" stroke="#64748b" stroke-width="2" stroke-dasharray="4 4"/>
<text x="320" y="252" text-anchor="middle" class="svg-muted" font-size="12">template + bind data = device configuration, workflow se push</text>
</svg><p class="cap">Template, group, device, bind data aur deploy workflow.</p></div>

<h3>High availability aur sizing</h3>
<p>Production Director <b>active-standby pair</b> mein deploy hota hai (do Directors, configuration synchronised aur failover mechanism ke saath). Director ka ek <b>northbound</b> interface users aur APIs ke liye hota hai aur ek <b>southbound</b> interface un devices ki taraf jinhe woh manage karta hai; chapter 7 batayega ki yeh alag kyun hain. Directors aam taur par data centre ya private cloud mein lagte hain, branches ke peeche kabhi nahi.</p>

<h3>Lab CLI mein Director</h3>
<p>Lab mein Director <code>Director-1</code> hai, <code>198.51.100.10</code> par. Is module mein aap yeh statements use karoge:</p>
<pre class="code"><span class="c">! on Director-1</span>
configure
set director controllers Controller-1 address 198.51.100.20
set director analytics address 198.51.100.30
commit
exit
show controllers
show analytics
show templates
show device-groups
show devices brief</pre>
<pre class="out">admin@Director-1-cli&gt; show controllers
Controller      Address         Reachable
Controller-1    198.51.100.20   <span class="hl">yes</span>

admin@Director-1-cli&gt; show analytics
Analytics: 198.51.100.30
Reachable: yes</pre>

<div class="note"><p><b>Course model.</b> Real Director GUI mein bahut zyada pages hain, aur devices Director ke southbound interface se NETCONF over SSH ke through manage hote hain. Lab ise kuch objects aur ek <code>Reachable</code> check tak simple karta hai. Matlab wahi hai: register kiya hua node jo Director tak reachable ho, manageable hai.</p></div>

<div class="eg"><p><b>Worked example.</b> 120 branches ko naya SLA chahiye: voice latency 120 ms. Director mein ek template ka SLA profile badalte ho; deploy karte hi group ke saare 120 devices ko nayi revision milti hai. Director ke bina 120 baar login karna padta. Agar do branches par manual local change conflict kare, to pushed template lines branch par read-only dikhti hain (lab ki tarah), isliye Director single source of truth rehta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Managed branch par seedha configuration edit karna. Agla template deploy ise overwrite kar sakta hai ya conflict kar sakta hai. Iske bajay Director mein template ya bind data badlo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Template mein site-id jaisi site-specific values nahi hoti; woh bind data hain. Aur Director management node hai, isliye SD-WAN routes ke liye BGP route reflector nahi hai.</p></div>

<div class="scn"><h4>Ek typo, do sau branches</h4><p>Ek engineer ne shared template mein galat SLA latency (150 ms ki jagah 15 ms) paste karke deploy kar diya. Har branch ne apna Internet circuit SLA fail mark kiya aur traffic MPLS par chala gaya. Change ek template mein tha, isliye fix ek edit aur ek deploy mein ho gaya. Baad mein process mein template changes ke liye doosra approver zaroori kiya gaya.</p><p><b>Lesson:</b> templates mein power aur blast radius barabar hote hain. Staging groups aur review use karo.</p></div>

<div class="iv"><p class="q">"Template aur bind data mein kya fark hai?"</p><p>Template device group ki common configuration hai, bind data per-device variable set hai (site-id, addresses, gateways). Template plus bind data render hokar device configuration banti hai aur workflow se push hoti hai. Yeh bhi bolo ki missing bind data deployment rok deta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Director inventory, templates, device groups, bind data, workflows aur REST API own karta hai.</li>
<li>Multitenancy aur RBAC se ek Director kai organizations ko safely serve karta hai.</li>
<li>Production Directors active-standby pair mein chalte hain.</li>
<li>Pushed template configuration source of truth hai; branch par edit mat karo.</li>
<li>Lab commands: <code>set director controllers</code>, <code>set director analytics</code>, <code>show controllers</code>.</li>
</ul></div>
`}};export{e as default};