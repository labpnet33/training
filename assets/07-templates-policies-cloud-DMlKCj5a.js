var e={id:`templates-policies`,h:{en:`Templates, configuration groups, policies and Cloud OnRamp`,hi:`Templates, configuration groups, policies aur Cloud OnRamp`},body:{en:`
<p>A restaurant chain does not let every branch chef invent the menu. Head office writes <b>recipes</b> (templates) with blanks for local details (the branch name, the local supplier), and <b>house rules</b> (policies): some apply inside each kitchen (how to store food), others are global (which supplier to prefer when one is late). SD-WAN configuration works exactly like that.</p>

<h3>Templates: the classic way</h3>
<ul>
<li><b>Feature templates</b> describe one piece of configuration: System (system-ip, site-id, hostname as variables), VPN 0 transport, VPN 512 management, service VPNs, interfaces, OMP, BFD, NTP, AAA, banner, security.</li>
<li>A <b>device template</b> is a stack of feature templates for one device model (or a raw <b>CLI template</b>). Device-specific values are <b>variables</b>, filled per device in the GUI or from a CSV file.</li>
<li>When a device template is attached, the device is managed by the Manager: local CLI changes are not allowed and would be overwritten on the next push.</li>
</ul>
<h3>Configuration groups: the newer way</h3>
<p>Recent releases add <b>configuration groups</b>: reusable <b>feature profiles</b> (System, Transport and Management, Service, CLI) shared by many devices, with device-specific values asked for in a guided workflow. <b>Policy groups</b> similarly bundle application priority, SLA and security settings. Templates still exist, but configuration groups are the recommended workflow for new deployments. Both solve the same problem: one design, hundreds of identical branches, only the variables differ.</p>

<div class="eg"><p><b>Worked example: the lab bug.</b> EDGE2 was staged by copying EDGE1's configuration, so it inherited system-ip 10.255.0.11 and a hand-typed org name NK-Fabric. With a device template, system-ip and site-id would be variables (EDGE1: 10.255.0.11 / 100, EDGE2: 10.255.0.12 / 200) and organization-name comes from the Manager's settings, so neither mistake could happen. In the lab you can fix EDGE2 from CTRL's <b>Templates</b> page or by CLI.</p></div>

<h3>The four kinds of policy</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Where each policy type acts">
<rect x="10" y="10" width="300" height="95" rx="8" fill="#bae6fd"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="14">Centralised control policy</text><text x="160" y="55" text-anchor="middle" class="svg-muted" font-size="12">acts on OMP routes and TLOCs</text><text x="160" y="75" text-anchor="middle" class="svg-muted" font-size="12">runs on the Controller</text><text x="160" y="95" text-anchor="middle" class="svg-muted" font-size="12">topology, preference</text>
<rect x="330" y="10" width="300" height="95" rx="8" fill="#ddd6fe"/><text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="14">Centralised data policy</text><text x="480" y="55" text-anchor="middle" class="svg-muted" font-size="12">acts on packets / flows</text><text x="480" y="75" text-anchor="middle" class="svg-muted" font-size="12">pushed to edges by Controller</text><text x="480" y="95" text-anchor="middle" class="svg-muted" font-size="12">drop, DIA, service chain</text>
<rect x="10" y="115" width="300" height="95" rx="8" fill="#fde68a"/><text x="160" y="137" text-anchor="middle" class="svg-ink" font-size="14">App-aware routing</text><text x="160" y="160" text-anchor="middle" class="svg-muted" font-size="12">SLA classes, preferred colour</text><text x="160" y="180" text-anchor="middle" class="svg-muted" font-size="12">pushed to edges by Controller</text><text x="160" y="200" text-anchor="middle" class="svg-muted" font-size="12">uses BFD statistics</text>
<rect x="330" y="115" width="300" height="95" rx="8" fill="#bbf7d0"/><text x="480" y="137" text-anchor="middle" class="svg-ink" font-size="14">Localised policy</text><text x="480" y="160" text-anchor="middle" class="svg-muted" font-size="12">QoS, ACLs, route policy</text><text x="480" y="180" text-anchor="middle" class="svg-muted" font-size="12">configured on the edge itself</text><text x="480" y="200" text-anchor="middle" class="svg-muted" font-size="12">via template or config group</text>
</svg><p class="cap">Centralised policies live on the Controller; localised policy lives in each device's configuration.</p></div>
<dl class="terms">
<dt>Centralised control policy</dt><dd>Changes what the Controller <b>advertises in OMP</b>: which TLOCs a site learns (hub-and-spoke instead of full mesh), route and TLOC preference, which service route to use, route leaking between VPNs. Applied to a site list in the <code>in</code> or <code>out</code> direction relative to the Controller. Edges never see the policy itself, only its effect.</dd>
<dt>Centralised data policy</dt><dd>Per-flow rules pushed to edges: match on 5-tuple, DSCP or application; actions such as accept, drop, count, set next hop or TLOC, <b>service chaining</b> through a firewall, or <b>NAT to VPN 0</b> for <b>direct internet access (DIA)</b>. Applied to a site list and VPN list, from-service, from-tunnel or all.</dd>
<dt>Application-aware routing</dt><dd>SLA-based path choice (previous chapter).</dd>
<dt>Localised policy</dt><dd>Lives in the device configuration: QoS (class maps, queues, shaping, re-marking), access lists on interfaces, and route policy for OSPF or BGP on the service side.</dd>
</dl>

<pre class="code"><span class="c">! Centralised control policy: spokes only learn the hub's TLOCs (hub-and-spoke)</span>
policy
 lists
  site-list SPOKES
   site-id 200-299
  tloc-list HUB-TLOCS
   tloc 10.255.0.11 color mpls encap ipsec
 control-policy HUB-SPOKE
  sequence 10
   match route
    prefix-list _AnyIpv4PrefixList
   action accept
    set
     tloc-list HUB-TLOCS
  sequence 20
   match tloc
    site-list SPOKES
   action reject
  default-action accept
apply-policy
 site-list SPOKES
  control-policy HUB-SPOKE out</pre>
<p>Sequence 10 rewrites every route sent to spokes so its next hop is the hub's TLOC; sequence 20 hides spoke TLOCs from other spokes, so no spoke-to-spoke tunnels or BFD sessions are built. That is how large fabrics escape the n(n-1)/2 tunnel problem.</p>

<h3>Cloud OnRamp</h3>
<ul>
<li><b>Cloud OnRamp for SaaS</b>: edges probe popular SaaS applications from every exit (local DIA circuits and gateway sites), compute a quality score from loss and latency, and send each application out of the best exit.</li>
<li><b>Cloud OnRamp for Multicloud (IaaS)</b>: the Manager automates virtual WAN edges (Catalyst 8000V) and cloud-native transit constructs in public clouds so cloud workloads become ordinary sites in the fabric.</li>
<li><b>Cloud OnRamp for Colocation</b>: regional hubs built in colocation facilities with virtualised network services.</li>
<li>Related: <b>secure internet gateway</b> integration automatically builds tunnels from edges to a cloud security service for DIA traffic.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Writing a control policy that rejects TLOCs but forgetting a <code>default-action accept</code>, which silently removes every route. Applying a data policy in the wrong direction (from-tunnel instead of from-service). Editing an attached device by CLI and losing the change at the next template push.</p></div>

<div class="exam"><p><b>Exam traps.</b> Control policy = OMP routes and TLOCs, executed on the Controller. Data policy = packets, executed on edges. Localised policy = QoS, ACLs and route policy on the device. DIA is done with a centralised data policy (or NAT settings) pointing traffic to VPN 0.</p></div>

<div class="scn"><h4>The accidental full mesh</h4><p>A bank with 600 branches migrated to SD-WAN with default settings. The branch routers, small ISR models, hit their tunnel scale limits: 599 remote sites times two colours meant over a thousand BFD sessions each, and CPU sat at 90%. The design team added a centralised control policy that advertised only the two data-centre hubs' TLOCs to branches, with dynamic on-demand tunnels for the few branch pairs that really talked. BFD sessions per branch dropped to four.</p><p><b>Lesson:</b> full mesh is the default, not a requirement. Control policy shapes the overlay topology.</p></div>

<div class="iv"><p class="q">"What is the difference between centralised control policy and centralised data policy?"</p><p>Strong answer: control policy manipulates OMP routing information on the Controller: which routes and TLOCs each site receives and with what preference, so it shapes the topology (hub-and-spoke, regional meshes, traffic engineering). Data policy is pushed to edges and acts on flows: drop, service chain, set TLOC, or NAT to VPN 0 for direct internet access. Add that app-aware routing is a third, SLA-based centralised policy and that localised policy (QoS, ACLs) lives on the device.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Feature and device templates (with variables) or configuration groups deliver identical, error-free branch configs.</li>
<li>Control policy shapes OMP (topology, preference) on the Controller.</li>
<li>Data policy acts on flows at the edges (drop, DIA, service chaining).</li>
<li>Localised policy = QoS, ACLs, route policy on the device.</li>
<li>Cloud OnRamp optimises SaaS, extends the fabric into IaaS clouds and colocation hubs.</li>
</ul></div>
`,hi:`
<p>Restaurant chain har branch ke chef ko menu khud banane nahi deti. Head office <b>recipes</b> (templates) likhta hai jinme local details ke liye khaali jagah hoti hai (branch ka naam, local supplier), aur <b>house rules</b> (policies): kuch har kitchen ke andar lagte hain (khana kaise store karna), kuch global hote hain (supplier late ho to kaunsa prefer karna). SD-WAN configuration bilkul aise hi kaam karti hai.</p>

<h3>Templates: classic tareeka</h3>
<ul>
<li><b>Feature templates</b> configuration ka ek hissa describe karte hain: System (system-ip, site-id, hostname variables ki tarah), VPN 0 transport, VPN 512 management, service VPNs, interfaces, OMP, BFD, NTP, AAA, banner, security.</li>
<li><b>Device template</b> ek device model ke liye feature templates ka stack hai (ya raw <b>CLI template</b>). Device-specific values <b>variables</b> hoti hain, jo GUI mein ya CSV file se har device ke liye bhari jaati hain.</li>
<li>Jab device template attach hota hai, device Manager se managed hota hai: local CLI changes allowed nahi hote aur agle push par overwrite ho jaate.</li>
</ul>
<h3>Configuration groups: naya tareeka</h3>
<p>Naye releases <b>configuration groups</b> jodte hain: reusable <b>feature profiles</b> (System, Transport and Management, Service, CLI) jo kai devices share karte hain, aur device-specific values ek guided workflow mein poochi jaati hain. <b>Policy groups</b> isi tarah application priority, SLA aur security settings ko bundle karte hain. Templates ab bhi hain, par naye deployments ke liye configuration groups recommended workflow hain. Dono ek hi problem solve karte hain: ek design, sainkdon identical branches, sirf variables alag.</p>

<div class="eg"><p><b>Worked example: lab ka bug.</b> EDGE2 ko EDGE1 ki configuration copy karke stage kiya gaya, isliye use system-ip 10.255.0.11 aur haath se type kiya org name NK-Fabric mila. Device template ke saath system-ip aur site-id variables hote (EDGE1: 10.255.0.11 / 100, EDGE2: 10.255.0.12 / 200) aur organization-name Manager ki settings se aata, isliye dono mein se koi galti ho hi nahi sakti thi. Lab mein aap EDGE2 ko CTRL ke <b>Templates</b> page se ya CLI se theek kar sakte ho.</p></div>

<h3>Chaar tarah ki policy</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Har policy type kahan kaam karti hai">
<rect x="10" y="10" width="300" height="95" rx="8" fill="#bae6fd"/><text x="160" y="32" text-anchor="middle" class="svg-ink" font-size="14">Centralised control policy</text><text x="160" y="55" text-anchor="middle" class="svg-muted" font-size="12">OMP routes aur TLOCs par</text><text x="160" y="75" text-anchor="middle" class="svg-muted" font-size="12">Controller par chalti hai</text><text x="160" y="95" text-anchor="middle" class="svg-muted" font-size="12">topology, preference</text>
<rect x="330" y="10" width="300" height="95" rx="8" fill="#ddd6fe"/><text x="480" y="32" text-anchor="middle" class="svg-ink" font-size="14">Centralised data policy</text><text x="480" y="55" text-anchor="middle" class="svg-muted" font-size="12">packets / flows par</text><text x="480" y="75" text-anchor="middle" class="svg-muted" font-size="12">Controller edges tak push kare</text><text x="480" y="95" text-anchor="middle" class="svg-muted" font-size="12">drop, DIA, service chain</text>
<rect x="10" y="115" width="300" height="95" rx="8" fill="#fde68a"/><text x="160" y="137" text-anchor="middle" class="svg-ink" font-size="14">App-aware routing</text><text x="160" y="160" text-anchor="middle" class="svg-muted" font-size="12">SLA classes, preferred colour</text><text x="160" y="180" text-anchor="middle" class="svg-muted" font-size="12">Controller edges tak push kare</text><text x="160" y="200" text-anchor="middle" class="svg-muted" font-size="12">BFD statistics use kare</text>
<rect x="330" y="115" width="300" height="95" rx="8" fill="#bbf7d0"/><text x="480" y="137" text-anchor="middle" class="svg-ink" font-size="14">Localised policy</text><text x="480" y="160" text-anchor="middle" class="svg-muted" font-size="12">QoS, ACLs, route policy</text><text x="480" y="180" text-anchor="middle" class="svg-muted" font-size="12">edge par hi configure</text><text x="480" y="200" text-anchor="middle" class="svg-muted" font-size="12">template ya config group se</text>
</svg><p class="cap">Centralised policies Controller par rehti hain; localised policy har device ki configuration mein rehti hai.</p></div>
<dl class="terms">
<dt>Centralised control policy</dt><dd>Badalti hai ki Controller <b>OMP mein kya advertise</b> kare: site kaunse TLOCs seekhe (full mesh ki jagah hub-and-spoke), route aur TLOC preference, kaunsa service route use ho, VPNs ke beech route leaking. Site list par Controller ke relative <code>in</code> ya <code>out</code> direction mein apply hoti hai. Edges policy khud kabhi nahi dekhte, sirf uska effect.</dd>
<dt>Centralised data policy</dt><dd>Edges tak push hone wale per-flow rules: 5-tuple, DSCP ya application par match; actions jaise accept, drop, count, next hop ya TLOC set karna, firewall ke through <b>service chaining</b>, ya <b>direct internet access (DIA)</b> ke liye <b>VPN 0 tak NAT</b>. Site list aur VPN list par apply, from-service, from-tunnel ya all.</dd>
<dt>Application-aware routing</dt><dd>SLA-based path choice (pichla chapter).</dd>
<dt>Localised policy</dt><dd>Device configuration mein rehti hai: QoS (class maps, queues, shaping, re-marking), interfaces par access lists, aur service side par OSPF ya BGP ke liye route policy.</dd>
</dl>

<pre class="code"><span class="c">! Centralised control policy: spokes sirf hub ke TLOCs seekhte hain (hub-and-spoke)</span>
policy
 lists
  site-list SPOKES
   site-id 200-299
  tloc-list HUB-TLOCS
   tloc 10.255.0.11 color mpls encap ipsec
 control-policy HUB-SPOKE
  sequence 10
   match route
    prefix-list _AnyIpv4PrefixList
   action accept
    set
     tloc-list HUB-TLOCS
  sequence 20
   match tloc
    site-list SPOKES
   action reject
  default-action accept
apply-policy
 site-list SPOKES
  control-policy HUB-SPOKE out</pre>
<p>Sequence 10 spokes ko bheje gaye har route ko rewrite karta hai taaki uska next hop hub ka TLOC ho; sequence 20 spoke TLOCs ko doosre spokes se chhupata hai, isliye spoke-to-spoke tunnels ya BFD sessions nahi bante. Isi tarah bade fabrics n(n-1)/2 tunnel problem se bachte hain.</p>

<h3>Cloud OnRamp</h3>
<ul>
<li><b>Cloud OnRamp for SaaS</b>: edges har exit (local DIA circuits aur gateway sites) se popular SaaS applications ko probe karte hain, loss aur latency se quality score nikalte hain, aur har application ko best exit se bhejte hain.</li>
<li><b>Cloud OnRamp for Multicloud (IaaS)</b>: Manager public clouds mein virtual WAN edges (Catalyst 8000V) aur cloud-native transit constructs automate karta hai taaki cloud workloads fabric mein normal sites ban jaayein.</li>
<li><b>Cloud OnRamp for Colocation</b>: colocation facilities mein virtualised network services ke saath regional hubs.</li>
<li>Related: <b>secure internet gateway</b> integration DIA traffic ke liye edges se cloud security service tak tunnels automatically banata hai.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Aisi control policy likhna jo TLOCs reject kare par <code>default-action accept</code> bhool jaaye, jisse chupchaap har route hat jaata hai. Data policy galat direction mein apply karna (from-service ki jagah from-tunnel). Attached device ko CLI se edit karna aur agle template push par change kho dena.</p></div>

<div class="exam"><p><b>Exam traps.</b> Control policy = OMP routes aur TLOCs, Controller par execute. Data policy = packets, edges par execute. Localised policy = device par QoS, ACLs aur route policy. DIA centralised data policy (ya NAT settings) se hota hai jo traffic ko VPN 0 ki taraf bhejti hai.</p></div>

<div class="scn"><h4>Galti se bana full mesh</h4><p>600 branches wale ek bank ne default settings ke saath SD-WAN migrate kiya. Branch routers, chhote ISR models, apni tunnel scale limits tak pahunch gaye: 599 remote sites guna do colours matlab har ek par hazaar se zyada BFD sessions, aur CPU 90% par tha. Design team ne ek centralised control policy jodi jo branches ko sirf do data-centre hubs ke TLOCs advertise karti thi, aur jo kuch branch pairs sach mein baat karte the unke liye dynamic on-demand tunnels. Har branch ke BFD sessions chaar par aa gaye.</p><p><b>Seekh:</b> full mesh default hai, zaroorat nahi. Control policy overlay topology ko shape karti hai.</p></div>

<div class="iv"><p class="q">"Centralised control policy aur centralised data policy mein kya farak hai?"</p><p>Strong answer: control policy Controller par OMP routing information manipulate karti hai: har site ko kaunse routes aur TLOCs kis preference ke saath milte hain, isliye yeh topology shape karti hai (hub-and-spoke, regional meshes, traffic engineering). Data policy edges tak push hoti hai aur flows par kaam karti hai: drop, service chain, TLOC set karna, ya direct internet access ke liye VPN 0 tak NAT. Jodo ki app-aware routing teesri, SLA-based centralised policy hai aur localised policy (QoS, ACLs) device par rehti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Feature aur device templates (variables ke saath) ya configuration groups identical, error-free branch configs dete hain.</li>
<li>Control policy Controller par OMP (topology, preference) shape karti hai.</li>
<li>Data policy edges par flows par kaam karti hai (drop, DIA, service chaining).</li>
<li>Localised policy = device par QoS, ACLs, route policy.</li>
<li>Cloud OnRamp SaaS optimise karta hai, fabric ko IaaS clouds aur colocation hubs tak le jaata hai.</li>
</ul></div>
`}};export{e as default};