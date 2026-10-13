var e={id:`summary`,h:{en:`How the track is laid out, summary and exam checklist`,hi:`Track ka layout, summary aur exam checklist`},body:{en:`
<p>This last chapter does two jobs. First it shows how the rest of the Cisco Catalyst SD-WAN track is laid out, so you know where each idea you met here gets its full treatment. Then it gives you a revision sheet: a can-do checklist, a mini glossary and the facts that examiners and interviewers repeat most.</p>

<h3>The map of the track</h3>
<p>The track follows the official blueprint of exam 300-415 ENSDWI v1.2. Each blueprint domain has one or more modules. Later modules include hands-on labs in the simulator, where you will type real commands against a working SD-WAN fabric; this starter module does not.</p>
<table class="cmp"><tr><th>Blueprint domain</th><th>Module</th><th>What you will master</th></tr>
<tr><td>Start here</td><td>SD-WAN from zero (this module)</td><td>Why, what, the four planes, the vocabulary</td></tr>
<tr><td>Architecture</td><td>Planes, components and the overlay</td><td>Components in depth, TLOCs, colours, OMP, BFD, VPNs, reading a live fabric</td></tr>
<tr><td>Controller deployment</td><td>Manager, Controller and Validator, certificates and control connections</td><td>Deployment models, bootstrap, certificates, onboarding order, high availability, backup, control-connection troubleshooting</td></tr>
<tr><td>Router deployment</td><td>WAN edge onboarding; templates and configuration groups</td><td>Bootstrap, tunnel interfaces, device and feature templates, CLI templates</td></tr>
<tr><td>Policies</td><td>Centralized control policy; data policy and application-aware routing; DIA and Cloud OnRamp</td><td>Topology control, VPN membership, service chaining, SLA classes, path steering, local breakout</td></tr>
<tr><td>Security and QoS</td><td>SD-WAN security; QoS</td><td>IPsec keys, firewall, IPS, DNS security, classification, queuing, shaping</td></tr>
<tr><td>Management and operations</td><td>Operations; troubleshooting</td><td>Monitoring, upgrades, alarms, control, data-plane and policy fault finding</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Track roadmap">
<rect x="10" y="20" width="85" height="50" rx="8" fill="#fde68a"/><text x="52" y="42" text-anchor="middle" class="svg-ink" font-size="11">Start</text><text x="52" y="58" text-anchor="middle" class="svg-muted" font-size="10">zero</text>
<rect x="105" y="20" width="85" height="50" rx="8" fill="#bae6fd"/><text x="147" y="42" text-anchor="middle" class="svg-ink" font-size="11">Architecture</text><text x="147" y="58" text-anchor="middle" class="svg-muted" font-size="10">20%</text>
<rect x="200" y="20" width="85" height="50" rx="8" fill="#bae6fd"/><text x="242" y="42" text-anchor="middle" class="svg-ink" font-size="11">Controllers</text><text x="242" y="58" text-anchor="middle" class="svg-muted" font-size="10">15%</text>
<rect x="295" y="20" width="85" height="50" rx="8" fill="#ddd6fe"/><text x="337" y="42" text-anchor="middle" class="svg-ink" font-size="11">Routers</text><text x="337" y="58" text-anchor="middle" class="svg-muted" font-size="10">20%</text>
<rect x="390" y="20" width="85" height="50" rx="8" fill="#ddd6fe"/><text x="432" y="42" text-anchor="middle" class="svg-ink" font-size="11">Policies</text><text x="432" y="58" text-anchor="middle" class="svg-muted" font-size="10">20%</text>
<rect x="485" y="20" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="520" y="42" text-anchor="middle" class="svg-ink" font-size="11">Security</text><text x="520" y="58" text-anchor="middle" class="svg-muted" font-size="10">15%</text>
<rect x="565" y="20" width="65" height="50" rx="8" fill="#bbf7d0"/><text x="597" y="42" text-anchor="middle" class="svg-ink" font-size="11">Ops</text><text x="597" y="58" text-anchor="middle" class="svg-muted" font-size="10">10%</text>
<path d="M95 45 L105 45 M190 45 L200 45 M285 45 L295 45 M380 45 L390 45 M475 45 L485 45 M555 45 L565 45" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Percentages show the approximate weight of each domain in the exam blueprint</text>
<text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">Suggested path: left to right, finishing with troubleshooting and a mock exam</text>
</svg><p class="cap">The track in the order we recommend. Percentages are the approximate blueprint weights of each domain.</p></div>

<h3>Can-do checklist</h3>
<p>You have finished this module when you can honestly tick every line.</p>
<ul>
<li>I can describe a classic MPLS hub-and-spoke WAN and list four or more of its problems.</li>
<li>I can explain what SD-WAN changes: overlay on any transport, central policy, zero-touch, application-aware routing, cloud access and segmentation.</li>
<li>I can name the four planes and the component for each, using both new and old names.</li>
<li>I can say which components forward user traffic (only WAN edges) and which do not.</li>
<li>I can narrate how a new branch router joins the network, in order.</li>
<li>I can define TLOC, colour, system IP, site ID, VPN, OMP, BFD, template and policy.</li>
<li>I can describe the main roles, the exam, and my plan for the next module.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Overlay / underlay</dt><dd>Overlay: the tunnels and policy the business controls. Underlay: the carrier lines beneath them.</dd>
<dt>Validator (vBond)</dt><dd>Authenticates devices and introduces them to the other controllers.</dd>
<dt>Manager (vManage)</dt><dd>Configuration, templates, policy, monitoring and the authorised device list.</dd>
<dt>Controller (vSmart)</dt><dd>Reflects OMP routes and applies control policy. Never forwards user data.</dd>
<dt>WAN edge (cEdge, vEdge)</dt><dd>Router that builds tunnels and forwards traffic.</dd>
<dt>TLOC</dt><dd>System IP + colour + encapsulation. A transport attachment.</dd>
<dt>OMP</dt><dd>Overlay routing protocol between edges and Controllers.</dd>
<dt>BFD</dt><dd>Tunnel liveness and quality measurement.</dd>
<dt>ZTP / PnP</dt><dd>Zero-touch provisioning with the Plug and Play service.</dd>
<dt>DIA</dt><dd>Direct Internet Access: local internet breakout at the branch.</dd>
</dl>

<h3>Most-tested facts</h3>
<div class="exam"><p><b>Remember for the exam and interviews.</b></p><ul>
<li>Control plane = Controller (vSmart); management = Manager (vManage); orchestration = Validator (vBond); data = WAN edges.</li>
<li>Control components do not carry user traffic; user traffic flows edge to edge in IPsec tunnels.</li>
<li>The Validator is contacted first; its connection to an edge is temporary.</li>
<li>VPN 0 is transport, VPN 512 is management, the others are service VPNs.</li>
<li>Control connections use DTLS by default (UDP); TLS is optional.</li>
<li>Organization name must match everywhere (case-sensitive) and the clock must be correct for certificates.</li>
<li>If the Manager is down, the overlay keeps forwarding; configuration and monitoring are lost.</li>
</ul></div>

<div class="warn"><p><b>Common mistakes to avoid from now on.</b> Calling an SD-WAN "VPN" an encrypted tunnel; saying the Controller forwards traffic; assuming SD-WAN removes the need for routing; ignoring the clock and organization name when a device will not join.</p></div>

<div class="scn"><h4>From interview to first week</h4><p>A new joiner on an SD-WAN NOC was handed a ticket: "Store 118 offline". She did not touch anything first. She asked three questions that she had learned in this module: does the Manager still show the device and its control connection; if not, does the router have an underlay address and a path to the Validator; if yes, is the problem tunnels or policy? Within five minutes she had narrowed the problem to a failed broadband modem and handed the carrier ticket to the right team.</p><p><b>Lesson:</b> a simple mental model of the planes turns a scary-looking outage into an ordered checklist.</p></div>

<div class="iv"><p class="q">"Summarise how Catalyst SD-WAN works in two minutes."</p><p>Strong answer: four planes. Edges at each site connect to any mix of transports and build IPsec tunnels with BFD to other edges (data plane). A Controller distributes routes, TLOCs and keys using OMP and applies control policy (control plane). The Manager holds configuration, templates, policies and monitoring (management plane). The Validator authenticates every device and introduces it to the Manager and Controllers (orchestration plane). Policies use measured loss, latency and jitter to steer applications; VPNs separate segments; DIA and Cloud OnRamp give direct cloud access.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN replaces box-by-box, single-transport WANs with a centrally managed encrypted overlay.</li>
<li>Four planes and four components: orchestration (Validator), management (Manager), control (Controller), data (WAN edges).</li>
<li>Zero-touch onboarding follows a fixed order: underlay, Validator, Manager, Controller, tunnels.</li>
<li>Vocabulary to own: TLOC, colour, VPN, OMP, BFD, template, policy, system IP, site ID.</li>
<li>Next: the architecture module, where the same ideas appear with real commands and a live fabric.</li>
</ul></div>
`,hi:`
<p>Yeh aakhri chapter do kaam karta hai. Pehle yeh dikhata hai ki Cisco Catalyst SD-WAN track ka baaki hissa kaise laid out hai, taaki aap jaano ki yahan mile har idea ka poora treatment kahan hoga. Phir yeh aapko ek revision sheet deta hai: can-do checklist, mini glossary aur woh facts jo examiners aur interviewers sabse zyada dohrate hain.</p>

<h3>Track ka map</h3>
<p>Track exam 300-415 ENSDWI v1.2 ke official blueprint ko follow karta hai. Har blueprint domain ke ek ya zyada modules hain. Baad ke modules mein simulator mein hands-on labs hain, jahan aap ek working SD-WAN fabric par asli commands type karoge; yeh starter module mein nahi hain.</p>
<table class="cmp"><tr><th>Blueprint domain</th><th>Module</th><th>Aap kya master karoge</th></tr>
<tr><td>Start here</td><td>SD-WAN from zero (yeh module)</td><td>Kyun, kya, chaar planes, vocabulary</td></tr>
<tr><td>Architecture</td><td>Planes, components aur overlay</td><td>Components gehrai mein, TLOCs, colours, OMP, BFD, VPNs, live fabric padhna</td></tr>
<tr><td>Controller deployment</td><td>Manager, Controller aur Validator, certificates aur control connections</td><td>Deployment models, bootstrap, certificates, onboarding order, high availability, backup, control-connection troubleshooting</td></tr>
<tr><td>Router deployment</td><td>WAN edge onboarding; templates aur configuration groups</td><td>Bootstrap, tunnel interfaces, device aur feature templates, CLI templates</td></tr>
<tr><td>Policies</td><td>Centralized control policy; data policy aur application-aware routing; DIA aur Cloud OnRamp</td><td>Topology control, VPN membership, service chaining, SLA classes, path steering, local breakout</td></tr>
<tr><td>Security aur QoS</td><td>SD-WAN security; QoS</td><td>IPsec keys, firewall, IPS, DNS security, classification, queuing, shaping</td></tr>
<tr><td>Management aur operations</td><td>Operations; troubleshooting</td><td>Monitoring, upgrades, alarms, control, data-plane aur policy fault finding</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Track roadmap">
<rect x="10" y="20" width="85" height="50" rx="8" fill="#fde68a"/><text x="52" y="42" text-anchor="middle" class="svg-ink" font-size="11">Start</text><text x="52" y="58" text-anchor="middle" class="svg-muted" font-size="10">zero</text>
<rect x="105" y="20" width="85" height="50" rx="8" fill="#bae6fd"/><text x="147" y="42" text-anchor="middle" class="svg-ink" font-size="11">Architecture</text><text x="147" y="58" text-anchor="middle" class="svg-muted" font-size="10">20%</text>
<rect x="200" y="20" width="85" height="50" rx="8" fill="#bae6fd"/><text x="242" y="42" text-anchor="middle" class="svg-ink" font-size="11">Controllers</text><text x="242" y="58" text-anchor="middle" class="svg-muted" font-size="10">15%</text>
<rect x="295" y="20" width="85" height="50" rx="8" fill="#ddd6fe"/><text x="337" y="42" text-anchor="middle" class="svg-ink" font-size="11">Routers</text><text x="337" y="58" text-anchor="middle" class="svg-muted" font-size="10">20%</text>
<rect x="390" y="20" width="85" height="50" rx="8" fill="#ddd6fe"/><text x="432" y="42" text-anchor="middle" class="svg-ink" font-size="11">Policies</text><text x="432" y="58" text-anchor="middle" class="svg-muted" font-size="10">20%</text>
<rect x="485" y="20" width="70" height="50" rx="8" fill="#bbf7d0"/><text x="520" y="42" text-anchor="middle" class="svg-ink" font-size="11">Security</text><text x="520" y="58" text-anchor="middle" class="svg-muted" font-size="10">15%</text>
<rect x="565" y="20" width="65" height="50" rx="8" fill="#bbf7d0"/><text x="597" y="42" text-anchor="middle" class="svg-ink" font-size="11">Ops</text><text x="597" y="58" text-anchor="middle" class="svg-muted" font-size="10">10%</text>
<path d="M95 45 L105 45 M190 45 L200 45 M285 45 L295 45 M380 45 L390 45 M475 45 L485 45 M555 45 L565 45" stroke="#64748b" stroke-width="2"/>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="13">Percentages exam blueprint mein har domain ka lagbhag weight dikhate hain</text>
<text x="320" y="132" text-anchor="middle" class="svg-muted" font-size="12">Suggested path: left se right, ant mein troubleshooting aur mock exam</text>
</svg><p class="cap">Track us order mein jo hum recommend karte hain. Percentages har domain ke lagbhag blueprint weights hain.</p></div>

<h3>Can-do checklist</h3>
<p>Aap yeh module tab poora karte ho jab har line ko imaandari se tick kar sako.</p>
<ul>
<li>Main classic MPLS hub-and-spoke WAN describe kar sakta hoon aur uski chaar ya zyada problems ginwa sakta hoon.</li>
<li>Main explain kar sakta hoon ki SD-WAN kya badalta hai: kisi bhi transport par overlay, central policy, zero-touch, application-aware routing, cloud access aur segmentation.</li>
<li>Main chaar planes aur har ek ka component naya aur purana naam dono se bata sakta hoon.</li>
<li>Main bata sakta hoon ki kaun se components user traffic forward karte hain (sirf WAN edges) aur kaun se nahi.</li>
<li>Main order mein sunaa sakta hoon ki naya branch router network mein kaise join hota hai.</li>
<li>Main TLOC, colour, system IP, site ID, VPN, OMP, BFD, template aur policy define kar sakta hoon.</li>
<li>Main main roles, exam, aur agle module ka apna plan describe kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Overlay / underlay</dt><dd>Overlay: tunnels aur policy jo business control karta hai. Underlay: unke neeche ki carrier lines.</dd>
<dt>Validator (vBond)</dt><dd>Devices ko authenticate karta hai aur baaki controllers se introduce karta hai.</dd>
<dt>Manager (vManage)</dt><dd>Configuration, templates, policy, monitoring aur authorised device list.</dd>
<dt>Controller (vSmart)</dt><dd>OMP routes reflect karta hai aur control policy lagata hai. User data kabhi forward nahi karta.</dd>
<dt>WAN edge (cEdge, vEdge)</dt><dd>Router jo tunnels banata aur traffic forward karta hai.</dd>
<dt>TLOC</dt><dd>System IP + colour + encapsulation. Ek transport attachment.</dd>
<dt>OMP</dt><dd>Edges aur Controllers ke beech overlay routing protocol.</dd>
<dt>BFD</dt><dd>Tunnel liveness aur quality measurement.</dd>
<dt>ZTP / PnP</dt><dd>Plug and Play service ke saath zero-touch provisioning.</dd>
<dt>DIA</dt><dd>Direct Internet Access: branch par local internet breakout.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<div class="exam"><p><b>Exam aur interviews ke liye yaad rakho.</b></p><ul>
<li>Control plane = Controller (vSmart); management = Manager (vManage); orchestration = Validator (vBond); data = WAN edges.</li>
<li>Control components user traffic carry nahi karte; user traffic edge se edge IPsec tunnels mein chalta hai.</li>
<li>Validator se sabse pehle contact hota hai; edge ke saath uska connection temporary hota hai.</li>
<li>VPN 0 transport hai, VPN 512 management hai, baaki service VPNs.</li>
<li>Control connections default mein DTLS (UDP) use karte hain; TLS optional hai.</li>
<li>Organization name har jagah match hona chahiye (case-sensitive) aur certificates ke liye clock sahi hona chahiye.</li>
<li>Agar Manager down hai, overlay forward karta rehta hai; configuration aur monitoring chale jaate hain.</li>
</ul></div>

<div class="warn"><p><b>Ab se bachne wali common galtiyan.</b> SD-WAN "VPN" ko encrypted tunnel kehna; yeh kehna ki Controller traffic forward karta hai; yeh maanna ki SD-WAN routing ki zaroorat khatam kar deta hai; device join na ho to clock aur organization name ignore karna.</p></div>

<div class="scn"><h4>Interview se pehle hafte tak</h4><p>SD-WAN NOC mein ek nayi joiner ko ticket mila: "Store 118 offline". Usne pehle kuch chhuaa nahi. Usne teen sawaal pooche jo usne is module mein seekhe the: kya Manager abhi bhi device aur uska control connection dikha raha hai; agar nahi, to kya router ke paas underlay address aur Validator tak path hai; agar haan, to problem tunnels ki hai ya policy ki? Paanch minute mein usne problem ko ek kharab broadband modem tak narrow kar liya aur carrier ticket sahi team ko de diya.</p><p><b>Seekh:</b> planes ka simple mental model darawne dikhne wale outage ko ordered checklist bana deta hai.</p></div>

<div class="iv"><p class="q">"Do minute mein Catalyst SD-WAN kaise kaam karta hai summarise kijiye."</p><p>Strong answer: chaar planes. Har site ke edges transports ke kisi bhi mix se jurte hain aur doosre edges tak BFD ke saath IPsec tunnels banate hain (data plane). Controller OMP se routes, TLOCs aur keys baant-ta hai aur control policy lagata hai (control plane). Manager configuration, templates, policies aur monitoring rakhta hai (management plane). Validator har device ko authenticate karta hai aur Manager aur Controllers se introduce karta hai (orchestration plane). Policies naape gaye loss, latency aur jitter se applications ko steer karti hain; VPNs segments alag karte hain; DIA aur Cloud OnRamp direct cloud access dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN box-by-box, single-transport WANs ko centrally managed encrypted overlay se replace karta hai.</li>
<li>Chaar planes aur chaar components: orchestration (Validator), management (Manager), control (Controller), data (WAN edges).</li>
<li>Zero-touch onboarding fixed order follow karta hai: underlay, Validator, Manager, Controller, tunnels.</li>
<li>Jo vocabulary apni karni hai: TLOC, colour, VPN, OMP, BFD, template, policy, system IP, site ID.</li>
<li>Aage: architecture module, jahan wahi ideas asli commands aur live fabric ke saath aate hain.</li>
</ul></div>
`}};export{e as default};