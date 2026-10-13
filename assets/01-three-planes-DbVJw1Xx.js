var e={id:`three-planes`,h:{en:`The three planes and the Versa headend`,hi:`Teen planes aur Versa headend`},body:{en:`
<div class="note"><p><b>What you will learn.</b> Why SD-WAN splits a network into a management plane, a control plane and a data plane; which Versa product owns which plane; what the headend and the branch are; and how the three labs of this module (<code>vs-headend-link</code>, <code>vs-analytics-logs</code>, <code>vs-transport-domain</code>) fit together.</p><p><b>Prerequisites.</b> The previous module (versa-start): underlay versus overlay, WAN circuits, and what an SD-WAN branch is. You do not need to know any Versa CLI yet.</p></div>

<p>Think of an airline. The <b>head office</b> decides the timetable, hires the crew and prints the reports. The <b>air traffic control tower</b> tells each pilot which route to fly and where the other planes are. The <b>aircraft</b> carry the passengers. If the head office computers crash for an hour, planes keep flying. If the tower fails, planes are in trouble. If one aircraft fails, only its passengers suffer. Versa SD-WAN is built exactly like this, and each role is a different box.</p>

<h3>Three planes</h3>
<dl class="terms">
<dt>Management plane</dt><dd>Where humans and automation <b>configure and monitor</b> the network: GUI, REST API, templates, software upgrades, reports. In Versa this is <b>Versa Director</b> (configuration) and <b>Versa Analytics</b> (logs and reports).</dd>
<dt>Control plane</dt><dd>Where devices <b>learn who is where</b>: which sites exist, which prefixes live behind them, which tunnels to build, who is trusted. In Versa this is the <b>Versa Controller</b>, which authenticates branches, runs IKE for the tunnels and distributes routes with <b>MP-BGP</b>.</dd>
<dt>Data plane</dt><dd>Where user packets are <b>forwarded, inspected and encrypted</b>. In Versa this is the <b>VOS</b> (Versa Operating System) running on every branch, hub and also inside the Controller.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Versa planes and components">
<rect x="20" y="15" width="600" height="80" rx="10" fill="#ddd6fe"/><text x="35" y="38" class="svg-accent" font-size="13">MANAGEMENT PLANE (humans, API, reports)</text>
<rect x="60" y="48" width="150" height="38" rx="8" fill="#fff"/><text x="135" y="72" text-anchor="middle" class="svg-ink" font-size="13">Director  .10</text>
<rect x="245" y="48" width="150" height="38" rx="8" fill="#fff"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">Analytics  .30</text>
<rect x="430" y="48" width="150" height="38" rx="8" fill="#fff"/><text x="505" y="72" text-anchor="middle" class="svg-ink" font-size="13">Concerto (optional)</text>
<rect x="20" y="115" width="600" height="70" rx="10" fill="#bbf7d0"/><text x="35" y="138" class="svg-accent" font-size="13">CONTROL PLANE</text>
<rect x="245" y="144" width="150" height="34" rx="8" fill="#fff"/><text x="320" y="166" text-anchor="middle" class="svg-ink" font-size="13">Controller  .20</text>
<rect x="20" y="205" width="600" height="80" rx="10" fill="#bae6fd"/><text x="35" y="228" class="svg-accent" font-size="13">DATA PLANE (VOS / FlexVNF)</text>
<rect x="60" y="240" width="140" height="36" rx="8" fill="#fff"/><text x="130" y="263" text-anchor="middle" class="svg-ink" font-size="13">Branch1 Delhi</text>
<rect x="250" y="240" width="140" height="36" rx="8" fill="#fff"/><text x="320" y="263" text-anchor="middle" class="svg-ink" font-size="13">Branch2 Bengaluru</text>
<rect x="440" y="240" width="140" height="36" rx="8" fill="#fff"/><text x="510" y="263" text-anchor="middle" class="svg-ink" font-size="13">Branch3 Kolkata</text>
<line x1="135" y1="86" x2="300" y2="144" stroke="#64748b" stroke-width="2"/><line x1="320" y1="86" x2="320" y2="144" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="300" y1="178" x2="140" y2="240" stroke="#64748b" stroke-width="2"/><line x1="320" y1="178" x2="320" y2="240" stroke="#64748b" stroke-width="2"/><line x1="340" y1="178" x2="500" y2="240" stroke="#64748b" stroke-width="2"/>
<text x="320" y="312" text-anchor="middle" class="svg-muted" font-size="12">Mumbai headend = Director + Controller + Analytics. Branches = VOS CPE.</text>
</svg><p class="cap">The three planes mapped to Versa products. Addresses are the Mumbai lab headend (198.51.100.0/24).</p></div>

<h3>Why separate them?</h3>
<p>Old WANs put everything in each router: you configured each box by hand, each box ran its own routing protocol, each box forwarded. That does not scale to hundreds of branches. Separation gives you:</p>
<ul>
<li><b>One place to configure</b>. A change is made once in the Director and pushed to many devices.</li>
<li><b>One place to learn routes and policy</b>. The Controller tells every branch about every other branch. Branches do not need a full mesh of manual tunnels.</li>
<li><b>Survivability</b>. If the Director or Analytics is down, the branches keep forwarding with their last configuration. If the Controller is briefly down, existing tunnels and routes keep working for a while, but new sites and changes cannot be learned.</li>
<li><b>Independent scaling</b>. You add Controllers for more sites and Analytics nodes for more logs, without touching the branches.</li>
</ul>

<h3>Headend and branch</h3>
<p>The <b>headend</b> is the group of central components in a data centre or cloud: Director, Controller(s), Analytics, and often a hub VOS. The <b>branch</b> (also called CPE, customer premises equipment) is the VOS device at a site. In the course lab the headend is in Mumbai on <code>198.51.100.0/24</code>: Director <code>198.51.100.10</code>, Controller <code>198.51.100.20</code>, Analytics <code>198.51.100.30</code>. Three branches (Delhi 101, Bengaluru 102, Kolkata 103) belong to the organization <code>Acme</code>.</p>

<div class="eg"><p><b>Which plane?</b> Task: "change the voice SLA latency from 150 ms to 120 ms on 200 branches" is a <b>management</b> task (Director template). Task: "Kolkata's LAN 10.1.3.0/24 must be known by Delhi" is <b>control</b> (MP-BGP via the Controller). Task: "this packet must leave via MPLS and be encrypted" is <b>data plane</b> (VOS).</p></div>

<h3>The three labs of this module</h3>
<ul>
<li><b>vs-headend-link</b>: teach the Controller where its Director is, and register the Controller in the Director.</li>
<li><b>vs-analytics-logs</b>: enable the log collector, register Analytics in the Director, set the log-exporter on Branch1.</li>
<li><b>vs-transport-domain</b>: a ticket where the MPLS tunnel is down; you must find which component owns the fault.</li>
</ul>

<div class="note"><p><b>Course model.</b> The lab uses a simplified Versa-style CLI. Real Versa has a large GUI (Director workflows) plus a Junos-like CLI on each VOS. The ideas are real; some commands and outputs are simplified, and we say so where it matters.</p></div>

<div class="warn"><p><b>Common mistake.</b> Believing the Director forwards traffic or builds tunnels. It does not. The Director never sits in the data path. Tunnels are made by the branches and the Controller.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which component distributes SD-WAN routes?" is the Controller (MP-BGP), not the Director. "Which component pushes configuration templates?" is the Director, not the Controller.</p></div>

<div class="scn"><h4>Director outage on a Monday</h4><p>A managed-service provider lost its Director for three hours after a datastore fault. Engineers panicked, but monitoring showed all branches still forwarding and all overlays Established. Only new onboarding and template changes were blocked, and historical reports stayed available from Analytics. Service was restored with no customer impact.</p><p><b>Lesson:</b> because management, control and data planes are separate, a management-plane failure is an inconvenience, not an outage.</p></div>

<div class="iv"><p class="q">"Explain the Versa SD-WAN architecture in one minute."</p><p>Name three planes: Director for management (templates, workflows, API), Controller for control (IKE trust, MP-BGP route and policy distribution), VOS branches for data plane; Analytics for logs and reports; optional Concerto above. Add that the Director is not in the data path, which is why branches survive its failure.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management = Director and Analytics; control = Controller; data = VOS.</li>
<li>Headend is central; branches (CPE) run VOS.</li>
<li>Separation gives central configuration, scalable routing and survivability.</li>
<li>The Director never forwards user traffic.</li>
<li>The lab CLI is a simplified model of real Versa.</li>
</ul></div>
`,hi:`
<div class="note"><p><b>Is chapter mein aap kya seekhoge.</b> SD-WAN network ko management plane, control plane aur data plane mein kyun baantta hai; kaunsa Versa product kaunsa plane own karta hai; headend aur branch kya hain; aur is module ke teen labs (<code>vs-headend-link</code>, <code>vs-analytics-logs</code>, <code>vs-transport-domain</code>) kaise jud'te hain.</p><p><b>Prerequisites.</b> Pichla module (versa-start): underlay vs overlay, WAN circuits aur SD-WAN branch kya hota hai. Abhi Versa CLI aana zaroori nahi hai.</p></div>

<p>Ek airline socho. <b>Head office</b> timetable decide karta hai, crew hire karta hai aur reports banata hai. <b>Air traffic control tower</b> har pilot ko batata hai kaunsa route lena hai aur baaki planes kahan hain. <b>Aircraft</b> passengers ko le jaate hain. Agar head office ke computers ek ghante ke liye band ho jaayein, planes udte rehte hain. Tower fail ho to planes mushkil mein aate hain. Ek aircraft fail ho to sirf uske passengers pareshan hote hain. Versa SD-WAN bilkul aise hi bana hai, aur har role alag box hai.</p>

<h3>Teen planes</h3>
<dl class="terms">
<dt>Management plane</dt><dd>Jahan insaan aur automation network ko <b>configure aur monitor</b> karte hain: GUI, REST API, templates, software upgrade, reports. Versa mein yeh <b>Versa Director</b> (configuration) aur <b>Versa Analytics</b> (logs aur reports) hai.</dd>
<dt>Control plane</dt><dd>Jahan devices <b>seekhte hain kaun kahan hai</b>: kaunse sites hain, kaunse prefixes unke peeche hain, kaunse tunnels banane hain, kis par trust karna hai. Versa mein yeh <b>Versa Controller</b> hai, jo branches ko authenticate karta hai, tunnels ke liye IKE chalata hai aur <b>MP-BGP</b> se routes distribute karta hai.</dd>
<dt>Data plane</dt><dd>Jahan user packets <b>forward, inspect aur encrypt</b> hote hain. Versa mein yeh <b>VOS</b> (Versa Operating System) hai jo har branch, hub aur Controller ke andar bhi chalta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="Versa planes and components">
<rect x="20" y="15" width="600" height="80" rx="10" fill="#ddd6fe"/><text x="35" y="38" class="svg-accent" font-size="13">MANAGEMENT PLANE (insaan, API, reports)</text>
<rect x="60" y="48" width="150" height="38" rx="8" fill="#fff"/><text x="135" y="72" text-anchor="middle" class="svg-ink" font-size="13">Director  .10</text>
<rect x="245" y="48" width="150" height="38" rx="8" fill="#fff"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="13">Analytics  .30</text>
<rect x="430" y="48" width="150" height="38" rx="8" fill="#fff"/><text x="505" y="72" text-anchor="middle" class="svg-ink" font-size="13">Concerto (optional)</text>
<rect x="20" y="115" width="600" height="70" rx="10" fill="#bbf7d0"/><text x="35" y="138" class="svg-accent" font-size="13">CONTROL PLANE</text>
<rect x="245" y="144" width="150" height="34" rx="8" fill="#fff"/><text x="320" y="166" text-anchor="middle" class="svg-ink" font-size="13">Controller  .20</text>
<rect x="20" y="205" width="600" height="80" rx="10" fill="#bae6fd"/><text x="35" y="228" class="svg-accent" font-size="13">DATA PLANE (VOS / FlexVNF)</text>
<rect x="60" y="240" width="140" height="36" rx="8" fill="#fff"/><text x="130" y="263" text-anchor="middle" class="svg-ink" font-size="13">Branch1 Delhi</text>
<rect x="250" y="240" width="140" height="36" rx="8" fill="#fff"/><text x="320" y="263" text-anchor="middle" class="svg-ink" font-size="13">Branch2 Bengaluru</text>
<rect x="440" y="240" width="140" height="36" rx="8" fill="#fff"/><text x="510" y="263" text-anchor="middle" class="svg-ink" font-size="13">Branch3 Kolkata</text>
<line x1="135" y1="86" x2="300" y2="144" stroke="#64748b" stroke-width="2"/><line x1="320" y1="86" x2="320" y2="144" stroke="#64748b" stroke-dasharray="4 4"/>
<line x1="300" y1="178" x2="140" y2="240" stroke="#64748b" stroke-width="2"/><line x1="320" y1="178" x2="320" y2="240" stroke="#64748b" stroke-width="2"/><line x1="340" y1="178" x2="500" y2="240" stroke="#64748b" stroke-width="2"/>
<text x="320" y="312" text-anchor="middle" class="svg-muted" font-size="12">Mumbai headend = Director + Controller + Analytics. Branches = VOS CPE.</text>
</svg><p class="cap">Teen planes aur Versa products ka mapping. Addresses Mumbai lab headend (198.51.100.0/24) ke hain.</p></div>

<h3>Inhe alag kyun karte hain?</h3>
<p>Purane WANs mein har router ke andar sab kuch hota tha: har box haath se configure hota tha, har box apna routing protocol chalata tha, har box forward karta tha. Yeh sau-sau branches par scale nahi karta. Separation se milta hai:</p>
<ul>
<li><b>Configure karne ki ek jagah</b>. Change Director mein ek baar hota hai aur kai devices par push hota hai.</li>
<li><b>Routes aur policy seekhne ki ek jagah</b>. Controller har branch ko baaki sab branches ke baare mein batata hai. Manual tunnels ki full mesh nahi chahiye.</li>
<li><b>Survivability</b>. Director ya Analytics down ho to branches last configuration se forward karte rehte hain. Controller thodi der down ho to existing tunnels aur routes kuch der chalte hain, lekin naye sites aur changes learn nahi ho sakte.</li>
<li><b>Alag scaling</b>. Zyada sites ke liye Controllers aur zyada logs ke liye Analytics nodes badhao, branches ko chhue bina.</li>
</ul>

<h3>Headend aur branch</h3>
<p><b>Headend</b> data centre ya cloud mein rakhe central components ka group hai: Director, Controller(s), Analytics, aur aksar ek hub VOS. <b>Branch</b> (CPE, customer premises equipment) site par VOS device hota hai. Course lab mein headend Mumbai mein <code>198.51.100.0/24</code> par hai: Director <code>198.51.100.10</code>, Controller <code>198.51.100.20</code>, Analytics <code>198.51.100.30</code>. Teen branches (Delhi 101, Bengaluru 102, Kolkata 103) organization <code>Acme</code> ke hain.</p>

<div class="eg"><p><b>Kaunsa plane?</b> Task: "200 branches par voice SLA latency 150 ms se 120 ms karo" yeh <b>management</b> task hai (Director template). Task: "Kolkata ka LAN 10.1.3.0/24 Delhi ko pata hona chahiye" yeh <b>control</b> hai (Controller ke through MP-BGP). Task: "yeh packet MPLS se jaaye aur encrypted ho" yeh <b>data plane</b> hai (VOS).</p></div>

<h3>Is module ke teen labs</h3>
<ul>
<li><b>vs-headend-link</b>: Controller ko uska Director batao, aur Controller ko Director mein register karo.</li>
<li><b>vs-analytics-logs</b>: log collector enable karo, Analytics ko Director mein register karo, Branch1 par log-exporter set karo.</li>
<li><b>vs-transport-domain</b>: ticket jahan MPLS tunnel down hai; aapko dhundna hai ki fault kaunsa component own karta hai.</li>
</ul>

<div class="note"><p><b>Course model.</b> Lab ek simplified Versa-style CLI use karta hai. Real Versa mein bada GUI (Director workflows) aur har VOS par Junos jaisi CLI hoti hai. Ideas real hain; kuch commands aur outputs simplified hain, aur jahan zaroori hai hum bata denge.</p></div>

<div class="warn"><p><b>Common mistake.</b> Yeh sochna ki Director traffic forward karta hai ya tunnels banata hai. Aisa nahi hai. Director data path mein kabhi nahi hota. Tunnels branches aur Controller banate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "SD-WAN routes kaun distribute karta hai?" Answer Controller (MP-BGP), Director nahi. "Configuration templates kaun push karta hai?" Director, Controller nahi.</p></div>

<div class="scn"><h4>Monday ko Director outage</h4><p>Ek managed-service provider ka Director datastore fault se teen ghante down raha. Engineers ghabra gaye, lekin monitoring ne dikhaya ki saare branches forward kar rahe the aur saare overlays Established the. Sirf naya onboarding aur template changes ruke, aur purani reports Analytics se milti rahi. Service bina customer impact ke wapas aa gayi.</p><p><b>Lesson:</b> management, control aur data planes alag hain, isliye management-plane failure takleef hai, outage nahi.</p></div>

<div class="iv"><p class="q">"Versa SD-WAN architecture ek minute mein samjhao."</p><p>Teen planes bolo: Director management ke liye (templates, workflows, API), Controller control ke liye (IKE trust, MP-BGP route aur policy distribution), VOS branches data plane; Analytics logs aur reports ke liye; upar optional Concerto. Add karo ki Director data path mein nahi hota, isliye branches uske fail hone par bhi chalte rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Management = Director aur Analytics; control = Controller; data = VOS.</li>
<li>Headend central hai; branches (CPE) VOS chalate hain.</li>
<li>Separation se central configuration, scalable routing aur survivability milti hai.</li>
<li>Director user traffic kabhi forward nahi karta.</li>
<li>Lab CLI real Versa ka simplified model hai.</li>
</ul></div>
`}};export{e as default};