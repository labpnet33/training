var e={id:`planes-components`,h:{en:`The four planes and the boxes that do the work`,hi:`Chaar planes aur kaam karne wale boxes`},body:{en:`
<p>Catalyst SD-WAN splits the work of running a WAN into four <b>planes</b>. A plane is just a group of jobs. Each plane is carried out by one kind of component. If you remember the four planes and their components, you can already understand 80 percent of any SD-WAN diagram or conversation.</p>

<h3>An analogy: an airport</h3>
<p>Think of an airline's operation. The <b>reception and security desk</b> checks who you are and tells you where to go (orchestration). The <b>airline head office</b> plans the schedule, hires crews and keeps the records (management). The <b>air traffic control tower</b> tells every aircraft which route to take (control). The <b>aircraft</b> carry the passengers (data). Notice that air traffic control never carries a single passenger, and the head office never flies a plane. Each part has one clear job. The same is true in SD-WAN.</p>

<h3>The four planes and the four components</h3>
<table class="cmp"><tr><th>Plane</th><th>Component (current name)</th><th>Older name you will still hear</th><th>Job in one sentence</th></tr>
<tr><td>Orchestration</td><td><b>SD-WAN Validator</b></td><td>vBond</td><td>The front door: authenticates every device first and tells it where the other controllers are.</td></tr>
<tr><td>Management</td><td><b>SD-WAN Manager</b></td><td>vManage</td><td>The single screen and API: configuration, templates, policies, monitoring, software upgrades.</td></tr>
<tr><td>Control</td><td><b>SD-WAN Controller</b></td><td>vSmart</td><td>The brain of the overlay: learns routes from every site and distributes them with the policy.</td></tr>
<tr><td>Data</td><td><b>WAN edge</b> routers</td><td>cEdge, vEdge</td><td>The routers at branches and data centres that build tunnels and forward user traffic.</td></tr></table>
<p>Together, the first three (Validator, Manager, Controller) are called the <b>control components</b>. You will often hear "the controllers" used loosely for all three. The product was renamed from Viptela to Cisco SD-WAN and then to Catalyst SD-WAN, which is why old names (vBond, vSmart, vManage) remain in command output, APIs and many interviews. You must know both sets.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Four planes of Catalyst SD-WAN">
<rect x="20" y="15" width="600" height="46" rx="8" fill="#fde68a"/><text x="30" y="36" class="svg-ink" font-size="13">Orchestration plane</text><text x="30" y="52" class="svg-muted" font-size="11">authenticate and introduce</text>
<rect x="440" y="23" width="160" height="30" rx="8" fill="#fff"/><text x="520" y="43" text-anchor="middle" class="svg-ink" font-size="12">SD-WAN Validator</text>
<rect x="20" y="69" width="600" height="46" rx="8" fill="#bae6fd"/><text x="30" y="90" class="svg-ink" font-size="13">Management plane</text><text x="30" y="106" class="svg-muted" font-size="11">configure, monitor, upgrade</text>
<rect x="440" y="77" width="160" height="30" rx="8" fill="#fff"/><text x="520" y="97" text-anchor="middle" class="svg-ink" font-size="12">SD-WAN Manager</text>
<rect x="20" y="123" width="600" height="46" rx="8" fill="#ddd6fe"/><text x="30" y="144" class="svg-ink" font-size="13">Control plane</text><text x="30" y="160" class="svg-muted" font-size="11">routes, keys, policy</text>
<rect x="440" y="131" width="160" height="30" rx="8" fill="#fff"/><text x="520" y="151" text-anchor="middle" class="svg-ink" font-size="12">SD-WAN Controller</text>
<rect x="20" y="177" width="600" height="110" rx="8" fill="#bbf7d0"/><text x="30" y="198" class="svg-ink" font-size="13">Data plane</text><text x="30" y="214" class="svg-muted" font-size="11">user traffic in tunnels</text>
<rect x="190" y="205" width="110" height="34" rx="8" fill="#fff"/><text x="245" y="227" text-anchor="middle" class="svg-ink" font-size="12">WAN edge: DC</text>
<rect x="330" y="205" width="110" height="34" rx="8" fill="#fff"/><text x="385" y="227" text-anchor="middle" class="svg-ink" font-size="12">WAN edge: Pune</text>
<rect x="470" y="205" width="130" height="34" rx="8" fill="#fff"/><text x="535" y="227" text-anchor="middle" class="svg-ink" font-size="12">WAN edge: Delhi</text>
<line x1="300" y1="222" x2="330" y2="222" stroke="#16a34a" stroke-width="3"/><line x1="440" y1="222" x2="470" y2="222" stroke="#16a34a" stroke-width="3"/>
<text x="320" y="268" text-anchor="middle" class="svg-muted" font-size="11">Control components never carry user traffic; WAN edges do.</text>
</svg><p class="cap">Each plane has one component type. The three upper planes are the control components; the lowest plane is where user packets travel.</p></div>

<h3>What each component does, in plain words</h3>
<p><b>SD-WAN Validator.</b> When a router starts, it does not yet know any controller. It knows one address (or name): the Validator's. The Validator checks that the device is on the list of devices the company has authorised, tells it the addresses of the Manager and the Controllers, and helps it learn its own public address if it is behind a NAT device. After that the router ends its conversation with the Validator. This component must be reachable from every branch, so it sits somewhere with a public address.</p>
<p><b>SD-WAN Manager.</b> This is what an administrator logs into. It stores the list of authorised devices, the device templates and configuration groups, the policies, the software images and the monitoring data (statistics). It pushes configuration to the routers. It has a web GUI and a REST API for automation.</p>
<p><b>SD-WAN Controller.</b> It receives routing information from every WAN edge, applies the central <b>control policy</b> and sends the result to the other edges. It also distributes the encryption keys of the tunnels and the data policies. Think of it as a route reflector with a policy engine. It does <b>not</b> forward user traffic.</p>
<p><b>WAN edge.</b> A router, physical or virtual, at a branch, data centre or in a public cloud. It connects the local LAN to one or more transports, builds the encrypted tunnels to other edges, measures the tunnels and forwards traffic. Cisco WAN edges today are mostly Catalyst 8000 Series and ISR routers running IOS XE in <b>controller mode</b>; the older Viptela vEdge routers are still found in networks.</p>

<h3>How they talk</h3>
<p>Every edge keeps secure <b>control connections</b> to the Controller and the Manager (these use DTLS or TLS and carry configuration and routing information). User data is different: it flows directly from edge to edge in IPsec tunnels and never passes through a controller. This separation is why the controllers can sit in a cloud or a remote data centre without becoming a bottleneck, and why branches keep forwarding for a while even if the controllers become unreachable.</p>

<div class="eg"><p><b>Worked example.</b> A company has 500 branches. The control components run in two data centres: one Manager, two Controllers and two Validators. Every branch edge keeps a connection to a Controller and to the Manager. A branch user in Pune opens a file on a server in Delhi: the packet goes Pune edge to Delhi edge directly through an IPsec tunnel. The controllers did their work earlier when they told Pune edge how to reach the Delhi prefix. None of the file's bytes touched them.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Believing that the Manager is "the SD-WAN" and everything stops if it is down. If the Manager fails, you lose the ability to change configuration and see monitoring, but the overlay keeps forwarding. If the Controllers fail, edges keep working with the last routes they learned for a limited time (a graceful-restart timer), but new changes and new sites stop. Know which failure hurts what.</p></div>

<div class="scn"><h4>The Manager upgrade night</h4><p>A services company upgraded its SD-WAN Manager on a Saturday night. For forty minutes the GUI was unavailable. Support teams worried, but traffic across the 300 sites was unaffected, and when the Manager came back every edge reconnected on its own. The only visible effect was a gap in the monitoring graphs for those minutes.</p><p><b>Lesson:</b> management plane downtime does not mean forwarding downtime. Keeping the planes separate is a deliberate design choice.</p></div>

<div class="iv"><p class="q">"Name the Catalyst SD-WAN components and the plane each belongs to."</p><p>Strong answer: Validator (vBond) for orchestration; Manager (vManage) for management; Controller (vSmart) for control; WAN edges (cEdge/vEdge) for the data plane. Add one fact about each: the Validator authenticates and introduces devices, the Manager holds configuration and monitoring, the Controller reflects routes and policy and does not forward user data, and edges build IPsec tunnels and run BFD.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four planes: orchestration, management, control, data.</li>
<li>Components: Validator (vBond), Manager (vManage), Controller (vSmart), WAN edges (cEdge, vEdge).</li>
<li>The Validator authenticates and introduces; the Manager configures and monitors; the Controller distributes routes and policy.</li>
<li>User traffic flows edge to edge in IPsec tunnels, never through the controllers.</li>
<li>If a control component fails, the overlay keeps forwarding for a while; plan which failure hurts what.</li>
</ul></div>
`,hi:`
<p>Catalyst SD-WAN WAN chalane ke kaam ko chaar <b>planes</b> mein baant-ta hai. Plane bas kaamon ka ek group hai. Har plane ek tarah ka component karta hai. Agar aapko chaar planes aur unke components yaad hain, to aap kisi bhi SD-WAN diagram ya baatcheet ka 80 percent pehle hi samajh sakte ho.</p>

<h3>Ek analogy: airport</h3>
<p>Ek airline ke operation ke baare mein socho. <b>Reception aur security desk</b> check karta hai ki aap kaun ho aur kahan jaana hai (orchestration). <b>Airline head office</b> schedule banata hai, crew hire karta hai aur records rakhta hai (management). <b>Air traffic control tower</b> har aircraft ko batata hai ki kaunsa route lena hai (control). <b>Aircraft</b> passengers ko le jaate hain (data). Dhyaan do ki air traffic control ek bhi passenger nahi le jaata, aur head office kabhi plane nahi udata. Har hisse ka ek saaf kaam hai. SD-WAN mein bhi yahi sach hai.</p>

<h3>Chaar planes aur chaar components</h3>
<table class="cmp"><tr><th>Plane</th><th>Component (current name)</th><th>Purana naam jo ab bhi sunoge</th><th>Ek sentence mein kaam</th></tr>
<tr><td>Orchestration</td><td><b>SD-WAN Validator</b></td><td>vBond</td><td>Front door: har device ko sabse pehle authenticate karta hai aur batata hai ki baaki controllers kahan hain.</td></tr>
<tr><td>Management</td><td><b>SD-WAN Manager</b></td><td>vManage</td><td>Single screen aur API: configuration, templates, policies, monitoring, software upgrades.</td></tr>
<tr><td>Control</td><td><b>SD-WAN Controller</b></td><td>vSmart</td><td>Overlay ka dimaag: har site se routes seekhta hai aur policy ke saath baant-ta hai.</td></tr>
<tr><td>Data</td><td><b>WAN edge</b> routers</td><td>cEdge, vEdge</td><td>Branches aur data centres ke routers jo tunnels banate hain aur user traffic forward karte hain.</td></tr></table>
<p>Pehle teen (Validator, Manager, Controller) milkar <b>control components</b> kehlate hain. Aap aksar "the controllers" teeno ke liye dheele tareeke se sunoge. Product ka naam Viptela se Cisco SD-WAN aur phir Catalyst SD-WAN ho gaya, isiliye puraane naam (vBond, vSmart, vManage) command output, APIs aur bahut se interviews mein rehte hain. Dono sets aane chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 300" role="img" aria-label="Catalyst SD-WAN ke chaar planes">
<rect x="20" y="15" width="600" height="46" rx="8" fill="#fde68a"/><text x="30" y="36" class="svg-ink" font-size="13">Orchestration plane</text><text x="30" y="52" class="svg-muted" font-size="11">authenticate aur introduce</text>
<rect x="440" y="23" width="160" height="30" rx="8" fill="#fff"/><text x="520" y="43" text-anchor="middle" class="svg-ink" font-size="12">SD-WAN Validator</text>
<rect x="20" y="69" width="600" height="46" rx="8" fill="#bae6fd"/><text x="30" y="90" class="svg-ink" font-size="13">Management plane</text><text x="30" y="106" class="svg-muted" font-size="11">configure, monitor, upgrade</text>
<rect x="440" y="77" width="160" height="30" rx="8" fill="#fff"/><text x="520" y="97" text-anchor="middle" class="svg-ink" font-size="12">SD-WAN Manager</text>
<rect x="20" y="123" width="600" height="46" rx="8" fill="#ddd6fe"/><text x="30" y="144" class="svg-ink" font-size="13">Control plane</text><text x="30" y="160" class="svg-muted" font-size="11">routes, keys, policy</text>
<rect x="440" y="131" width="160" height="30" rx="8" fill="#fff"/><text x="520" y="151" text-anchor="middle" class="svg-ink" font-size="12">SD-WAN Controller</text>
<rect x="20" y="177" width="600" height="110" rx="8" fill="#bbf7d0"/><text x="30" y="198" class="svg-ink" font-size="13">Data plane</text><text x="30" y="214" class="svg-muted" font-size="11">tunnels mein user traffic</text>
<rect x="190" y="205" width="110" height="34" rx="8" fill="#fff"/><text x="245" y="227" text-anchor="middle" class="svg-ink" font-size="12">WAN edge: DC</text>
<rect x="330" y="205" width="110" height="34" rx="8" fill="#fff"/><text x="385" y="227" text-anchor="middle" class="svg-ink" font-size="12">WAN edge: Pune</text>
<rect x="470" y="205" width="130" height="34" rx="8" fill="#fff"/><text x="535" y="227" text-anchor="middle" class="svg-ink" font-size="12">WAN edge: Delhi</text>
<line x1="300" y1="222" x2="330" y2="222" stroke="#16a34a" stroke-width="3"/><line x1="440" y1="222" x2="470" y2="222" stroke="#16a34a" stroke-width="3"/>
<text x="320" y="268" text-anchor="middle" class="svg-muted" font-size="11">Control components user traffic nahi le jaate; WAN edges le jaate hain.</text>
</svg><p class="cap">Har plane ka ek component type hai. Upar ke teen planes control components hain; sabse neeche wala plane woh hai jahan user packets chalte hain.</p></div>

<h3>Har component kya karta hai, saaf shabdon mein</h3>
<p><b>SD-WAN Validator.</b> Jab router start hota hai to use abhi koi controller nahi pata. Use ek hi address (ya naam) pata hota hai: Validator ka. Validator check karta hai ki device company ki authorised devices ki list mein hai ya nahi, use Manager aur Controllers ke addresses batata hai, aur agar device NAT ke peeche hai to use apna public address seekhne mein madad karta hai. Uske baad router Validator se baatcheet khatam kar deta hai. Yeh component har branch se reachable hona chahiye, isliye woh aisi jagah rehta hai jahan public address ho.</p>
<p><b>SD-WAN Manager.</b> Yahan administrator login karta hai. Woh authorised devices ki list, device templates aur configuration groups, policies, software images aur monitoring data (statistics) rakhta hai. Woh routers ko configuration push karta hai. Uska web GUI aur automation ke liye REST API hai.</p>
<p><b>SD-WAN Controller.</b> Woh har WAN edge se routing information leta hai, central <b>control policy</b> lagata hai aur result baaki edges ko bhejta hai. Woh tunnels ki encryption keys aur data policies bhi distribute karta hai. Ise policy engine wala route reflector samjho. Woh user traffic forward <b>nahi</b> karta.</p>
<p><b>WAN edge.</b> Ek router, physical ya virtual, branch, data centre ya public cloud mein. Woh local LAN ko ek ya zyada transports se jodta hai, doosre edges tak encrypted tunnels banata hai, tunnels ko measure karta hai aur traffic forward karta hai. Aaj ke Cisco WAN edges zyada tar Catalyst 8000 Series aur ISR routers hain jo IOS XE ko <b>controller mode</b> mein chalate hain; purane Viptela vEdge routers abhi bhi networks mein milte hain.</p>

<h3>Woh kaise baat karte hain</h3>
<p>Har edge Controller aur Manager se secure <b>control connections</b> rakhta hai (yeh DTLS ya TLS use karte hain aur configuration aur routing information le jaate hain). User data alag hota hai: woh seedha edge se edge IPsec tunnels mein jaata hai aur kabhi controller se nahi guzarta. Yahi separation wajah hai ki controllers cloud ya door ke data centre mein baith sakte hain bina bottleneck bane, aur controllers unreachable ho jaayein to bhi branches kuch der forward karti rehti hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek company ki 500 branches hain. Control components do data centres mein chalte hain: ek Manager, do Controllers aur do Validators. Har branch edge ek Controller aur Manager se connection rakhta hai. Pune ka branch user Delhi ke server par file kholta hai: packet Pune edge se Delhi edge tak seedha IPsec tunnel se jaata hai. Controllers ne apna kaam pehle hi kar diya tha jab unhone Pune edge ko Delhi prefix tak pahunchne ka tareeka bataya. File ka ek bhi byte unse nahi guzra.</p></div>

<div class="warn"><p><b>Beginners ki common galti.</b> Yeh maan lena ki Manager hi "SD-WAN" hai aur woh down ho to sab ruk jaata hai. Agar Manager fail ho, to configuration badalne aur monitoring dekhne ki ability chali jaati hai, par overlay forward karta rehta hai. Agar Controllers fail hon, to edges pichhle seekhe hue routes ke saath limited samay tak (graceful-restart timer) kaam karte rehte hain, par naye changes aur naye sites ruk jaate hain. Jaano ki kaunsa failure kya nuksaan karta hai.</p></div>

<div class="scn"><h4>Manager upgrade ki raat</h4><p>Ek services company ne Saturday raat SD-WAN Manager upgrade kiya. Chaalis minute tak GUI unavailable raha. Support teams ghabrayi, par 300 sites ka traffic unaffected raha, aur Manager wapas aane par har edge apne aap reconnect ho gaya. Sirf itna dikha ki un minutes ke monitoring graphs mein gap tha.</p><p><b>Seekh:</b> management plane downtime ka matlab forwarding downtime nahi hai. Planes ko alag rakhna ek soch-samajh kar liya design choice hai.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN ke components ke naam batao aur har ek kaunse plane ka hai."</p><p>Strong answer: Validator (vBond) orchestration ke liye; Manager (vManage) management ke liye; Controller (vSmart) control ke liye; WAN edges (cEdge/vEdge) data plane ke liye. Har ek ke baare mein ek fact jodo: Validator devices ko authenticate aur introduce karta hai, Manager configuration aur monitoring rakhta hai, Controller routes aur policy reflect karta hai aur user data forward nahi karta, aur edges IPsec tunnels banate hain aur BFD chalate hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar planes: orchestration, management, control, data.</li>
<li>Components: Validator (vBond), Manager (vManage), Controller (vSmart), WAN edges (cEdge, vEdge).</li>
<li>Validator authenticate aur introduce karta hai; Manager configure aur monitor karta hai; Controller routes aur policy baant-ta hai.</li>
<li>User traffic edge se edge IPsec tunnels mein chalta hai, kabhi controllers se nahi.</li>
<li>Agar koi control component fail ho, to overlay kuch der forward karta rehta hai; plan karo ki kaunsa failure kya nuksaan karta hai.</li>
</ul></div>
`}};export{e as default};