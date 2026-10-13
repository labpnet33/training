var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started with the question "what is SD-WAN?" and finished by fixing an Idle overlay. This chapter pulls everything together: a can-do checklist, a mini glossary, the most tested facts, a command cheat-sheet, and a view of what comes next.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Module summary">
<rect x="10" y="10" width="620" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">Overlay: organization Acme, site-id 101, MP-BGP, IPsec tunnels</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">Controller 198.51.100.20 decides who joins</text>
<rect x="10" y="70" width="620" height="50" rx="8" fill="#bae6fd"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14">Underlay: vni-0/0 203.0.113.6/30, default route 203.0.113.5</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">Internet-Transport-VR carries the route; ping proves it</text>
<rect x="10" y="130" width="620" height="50" rx="8" fill="#fed7aa"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="14">Transports: Internet, MPLS, LTE/5G circuits from carriers</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Latency, jitter, loss decide quality</text>
<rect x="10" y="190" width="620" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="14">Tools: Director manages, Controller controls, Analytics reports, VOS forwards</text><text x="320" y="232" text-anchor="middle" class="svg-muted" font-size="12">Method: underlay, identity, tunnel, BGP</text>
</svg><p class="cap">Build from the bottom up and troubleshoot from the bottom up.</p></div>

<h3>Can-do checklist</h3>
<p>You are ready for the next module when you can do each of these without notes:</p>
<ul>
<li>Explain SD-WAN, the problems it solves and the difference between MPLS-only and hybrid WAN.</li>
<li>Define underlay and overlay and say which layer a given symptom belongs to.</li>
<li>Compare Internet, MPLS and LTE/5G, and define circuit, handoff, demarcation, PE/CE, latency, jitter and loss.</li>
<li>Describe IPsec, IKE (UDP 500/4500), ESP and tunnel mode, and explain why MTU matters.</li>
<li>Explain organization, site and site-id, and the lab addressing pattern (site-id 10k, LAN 10.1.k.0/24).</li>
<li>Name the Versa components and planes: VOS, Director, Controller, Analytics, Concerto; management, control, data.</li>
<li>Use operational and configure modes, set, delete, show | compare, commit, rollback.</li>
<li>Bring up an Internet underlay (lab vs-underlay-inet) and prove it with ping.</li>
<li>Configure overlay identity (lab vs-tenant-site) and verify tunnels and BGP.</li>
<li>Diagnose and fix an Idle overlay from a Controller address typo (lab vs-controller-typo).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SD-WAN</dt><dd>Software-defined WAN: central control of multiple transports with encrypted overlay and per-application steering.</dd>
<dt>Underlay</dt><dd>The IP transport network between WAN interface addresses.</dd>
<dt>Overlay</dt><dd>Tunnels and routes built on top of the underlay.</dd>
<dt>VOS</dt><dd>Versa Operating System, the software on branch and DC devices (CPE).</dd>
<dt>Director</dt><dd>Management and orchestration (198.51.100.10 in the lab).</dd>
<dt>Controller</dt><dd>Control plane and BGP route reflector (198.51.100.20; 172.31.100.2 on MPLS).</dd>
<dt>Analytics</dt><dd>Log collection and reporting (198.51.100.30).</dd>
<dt>Concerto</dt><dd>Optional orchestrator above Director.</dd>
<dt>Organization (tenant)</dt><dd>Logical customer; the lab uses Acme.</dd>
<dt>Site-id</dt><dd>Numeric site identity, unique within the organization (101, 102, 103).</dd>
<dt>Transport VR</dt><dd>Virtual router holding WAN-side routes: Internet-Transport-VR, MPLS-Transport-VR, LTE-Transport-VR.</dd>
<dt>Transport domain</dt><dd>Named class of WAN circuits: Internet, MPLS, LTE.</dd>
<dt>MP-BGP</dt><dd>BGP with extra address families, used between VOS and Controller for overlay routes.</dd>
<dt>IPsec / IKE / ESP</dt><dd>Encrypted tunnel framework; IKE negotiates, ESP carries data.</dd>
<dt>SLA</dt><dd>Measured service promise: latency, jitter, loss.</dd>
<dt>DIA</dt><dd>Direct Internet access at the branch.</dd>
<dt>CPE / PE / CE</dt><dd>Customer premises equipment; provider edge; customer edge.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li>Overlay depends on underlay, never the reverse. Ping the Controller first.</li>
<li>Delhi: vni-0/0 203.0.113.6/30, gateway 203.0.113.5, default route in Internet-Transport-VR.</li>
<li>Internet 203.0.113.(4k)/30 carrier .(4k+1), branch .(4k+2); MPLS 172.31.k.0/30 PE .1, CE .2; LTE 100.64.k.0/30 carrier .1, CPE .2.</li>
<li>Default circuit quality (latency / jitter / loss): Internet 30/6/0.3, MPLS 20/2/0.05, LTE 60/15/1.</li>
<li>Overlay identity statements: site-id, controllers, wan-interfaces ... transport under <code>orgs org Acme sd-wan</code>.</li>
<li>BGP Established needs at least one tunnel up and consistent organization, site-id and Controller.</li>
<li>User traffic does not pass through the Controller.</li>
<li>Commit validates syntax, not correctness. Verify after every commit.</li>
<li>A wrong Controller address shows Idle with no tunnel rows; fix by deleting only the wrong statement.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Modes</span>
configure                          <span class="c">! enter configuration mode (prompt %)</span>
exit                               <span class="c">! leave configuration mode</span>
<span class="c">! Underlay</span>
set interfaces vni-0/0 unit 0 family inet address 203.0.113.6/30
set interfaces vni-0/0 enable true
set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.5
<span class="c">! Overlay identity</span>
set orgs org Acme sd-wan site-id 101
set orgs org Acme sd-wan controllers 198.51.100.20
set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
<span class="c">! Review, apply, discard, remove</span>
show | compare
commit
rollback
delete orgs org Acme sd-wan controllers 198.51.100.2
<span class="c">! Verify (operational mode)</span>
show interfaces brief
show route
show configuration
ping 198.51.100.20
show orgs org Acme sd-wan brief
show orgs org Acme sd-wan wan-interfaces
show bgp neighbor brief</pre>

<div class="note"><p><b>Where the course goes next.</b> The next Versa modules cover platform onboarding (Director workflow, staging and zero-touch), routing in LAN virtual routers, and SD-WAN policy with SLA profiles and forwarding profiles. This module gave you the foundation they all rely on: underlay, identity, tunnel and BGP.</p></div>

<div class="warn"><p><b>Last reminders.</b> Do not skip the underlay ping. Do not copy identity values blindly. Do not close a ticket without an "after" output. The lab CLI is a simplified model of the real VOS and Director; production deployments add many more statements and a rich GUI.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> Carrier availability is not application quality. Link up is not reachability. Commit success is not a working overlay. Established BGP is not "all transports healthy".</p></div>

<div class="scn"><h4>The new engineer's first week</h4><p>A new NOC engineer received three tickets in one morning: a branch with no circuit address, a branch whose overlay was Idle, and a branch with Internet fine but MPLS missing. She used the same four-step method on all of them. First ticket: underlay. Second: identity, a mismatched organization name. Third: tunnel, a missing transport domain on the Controller. Her manager noticed that she opened each ticket with the same two commands and closed each with a before and after output.</p><p><b>Lesson:</b> a method turns different-looking problems into the same routine.</p></div>

<div class="iv"><p class="q">"You are new to Versa. What would you check first on any SD-WAN branch problem?"</p><p>Strong answer: the layer, bottom up. Interface and route state, a ping to the Controller, then the overlay summary and the per-tunnel Reason text, then BGP. Mention that you record evidence, change one thing and verify, and that you know the difference between Director, Controller and VOS responsibilities.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN adds an encrypted, policy-driven overlay over multiple underlay transports.</li>
<li>Versa components: VOS, Director, Controller, Analytics, optional Concerto.</li>
<li>Build and fix in order: underlay, identity, tunnel, BGP.</li>
<li>The VOS CLI is a candidate-and-commit model: set, delete, show | compare, commit, rollback.</li>
<li>Always verify with show commands and ping, and close tickets with evidence.</li>
</ul></div>
`,hi:`
<p>Aapne "SD-WAN kya hai?" sawaal se shuru kiya aur Idle overlay fix karke khatam kiya. Yeh chapter sab kuch ek jagah laata hai: can-do checklist, mini glossary, sabse zyada pooche jaane wale facts, command cheat-sheet, aur aage kya aata hai.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Module summary">
<rect x="10" y="10" width="620" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">Overlay: organization Acme, site-id 101, MP-BGP, IPsec tunnels</text><text x="320" y="50" text-anchor="middle" class="svg-muted" font-size="12">Controller 198.51.100.20 decide karta hai kaun join karega</text>
<rect x="10" y="70" width="620" height="50" rx="8" fill="#bae6fd"/><text x="320" y="92" text-anchor="middle" class="svg-ink" font-size="14">Underlay: vni-0/0 203.0.113.6/30, default route 203.0.113.5</text><text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">Internet-Transport-VR route rakhta hai; ping prove karta hai</text>
<rect x="10" y="130" width="620" height="50" rx="8" fill="#fed7aa"/><text x="320" y="152" text-anchor="middle" class="svg-ink" font-size="14">Transports: carriers ke Internet, MPLS, LTE/5G circuits</text><text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">Latency, jitter, loss quality decide karte hain</text>
<rect x="10" y="190" width="620" height="60" rx="8" fill="#bbf7d0"/><text x="320" y="212" text-anchor="middle" class="svg-ink" font-size="14">Tools: Director manage, Controller control, Analytics report, VOS forward</text><text x="320" y="232" text-anchor="middle" class="svg-muted" font-size="12">Method: underlay, identity, tunnel, BGP</text>
</svg><p class="cap">Neeche se banao aur neeche se hi troubleshoot karo.</p></div>

<h3>Can-do checklist</h3>
<p>Aap agle module ke liye ready ho jab bina notes ke yeh sab kar sako:</p>
<ul>
<li>SD-WAN, woh kaunse problems solve karta hai aur MPLS-only aur hybrid WAN ka farak explain karo.</li>
<li>Underlay aur overlay define karo aur batao ki koi symptom kis layer ka hai.</li>
<li>Internet, MPLS aur LTE/5G compare karo, aur circuit, handoff, demarcation, PE/CE, latency, jitter aur loss define karo.</li>
<li>IPsec, IKE (UDP 500/4500), ESP aur tunnel mode describe karo, aur samjhao ki MTU kyun matter karta hai.</li>
<li>Organization, site aur site-id, aur lab addressing pattern (site-id 10k, LAN 10.1.k.0/24) explain karo.</li>
<li>Versa components aur planes ke naam batao: VOS, Director, Controller, Analytics, Concerto; management, control, data.</li>
<li>Operational aur configure modes, set, delete, show | compare, commit, rollback use karo.</li>
<li>Internet underlay up karo (lab vs-underlay-inet) aur ping se prove karo.</li>
<li>Overlay identity configure karo (lab vs-tenant-site) aur tunnels aur BGP verify karo.</li>
<li>Controller address typo se hue Idle overlay ko diagnose aur fix karo (lab vs-controller-typo).</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>SD-WAN</dt><dd>Software-defined WAN: kai transports ka central control, encrypted overlay aur per-application steering ke saath.</dd>
<dt>Underlay</dt><dd>WAN interface addresses ke beech ka IP transport network.</dd>
<dt>Overlay</dt><dd>Underlay ke upar bane tunnels aur routes.</dd>
<dt>VOS</dt><dd>Versa Operating System, branch aur DC devices (CPE) ka software.</dd>
<dt>Director</dt><dd>Management aur orchestration (lab mein 198.51.100.10).</dd>
<dt>Controller</dt><dd>Control plane aur BGP route reflector (198.51.100.20; MPLS par 172.31.100.2).</dd>
<dt>Analytics</dt><dd>Log collection aur reporting (198.51.100.30).</dd>
<dt>Concerto</dt><dd>Director ke upar optional orchestrator.</dd>
<dt>Organization (tenant)</dt><dd>Logical customer; lab Acme use karta hai.</dd>
<dt>Site-id</dt><dd>Numeric site identity, organization ke andar unique (101, 102, 103).</dd>
<dt>Transport VR</dt><dd>WAN-side routes rakhne wala virtual router: Internet-Transport-VR, MPLS-Transport-VR, LTE-Transport-VR.</dd>
<dt>Transport domain</dt><dd>WAN circuits ki named class: Internet, MPLS, LTE.</dd>
<dt>MP-BGP</dt><dd>Extra address families wala BGP, VOS aur Controller ke beech overlay routes ke liye.</dd>
<dt>IPsec / IKE / ESP</dt><dd>Encrypted tunnel framework; IKE negotiate karta hai, ESP data le jaata hai.</dd>
<dt>SLA</dt><dd>Measured service promise: latency, jitter, loss.</dd>
<dt>DIA</dt><dd>Branch par direct Internet access.</dd>
<dt>CPE / PE / CE</dt><dd>Customer premises equipment; provider edge; customer edge.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ul>
<li>Overlay underlay par depend karta hai, ulta kabhi nahi. Pehle Controller ko ping karo.</li>
<li>Delhi: vni-0/0 203.0.113.6/30, gateway 203.0.113.5, Internet-Transport-VR mein default route.</li>
<li>Internet 203.0.113.(4k)/30 carrier .(4k+1), branch .(4k+2); MPLS 172.31.k.0/30 PE .1, CE .2; LTE 100.64.k.0/30 carrier .1, CPE .2.</li>
<li>Default circuit quality (latency / jitter / loss): Internet 30/6/0.3, MPLS 20/2/0.05, LTE 60/15/1.</li>
<li>Overlay identity statements: <code>orgs org Acme sd-wan</code> ke neeche site-id, controllers, wan-interfaces ... transport.</li>
<li>BGP Established ko kam se kam ek tunnel up aur consistent organization, site-id aur Controller chahiye.</li>
<li>User traffic Controller se nahi guzarta.</li>
<li>Commit syntax validate karta hai, correctness nahi. Har commit ke baad verify karo.</li>
<li>Galat Controller address Idle dikhata hai bina tunnel rows ke; fix ke liye sirf wrong statement delete karo.</li>
</ul>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Modes</span>
configure                          <span class="c">! configuration mode mein jao (prompt %)</span>
exit                               <span class="c">! configuration mode se bahar</span>
<span class="c">! Underlay</span>
set interfaces vni-0/0 unit 0 family inet address 203.0.113.6/30
set interfaces vni-0/0 enable true
set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.5
<span class="c">! Overlay identity</span>
set orgs org Acme sd-wan site-id 101
set orgs org Acme sd-wan controllers 198.51.100.20
set orgs org Acme sd-wan wan-interfaces vni-0/0 transport Internet
<span class="c">! Review, apply, discard, remove</span>
show | compare
commit
rollback
delete orgs org Acme sd-wan controllers 198.51.100.2
<span class="c">! Verify (operational mode)</span>
show interfaces brief
show route
show configuration
ping 198.51.100.20
show orgs org Acme sd-wan brief
show orgs org Acme sd-wan wan-interfaces
show bgp neighbor brief</pre>

<div class="note"><p><b>Course aage kahan jaata hai.</b> Agle Versa modules platform onboarding (Director workflow, staging aur zero-touch), LAN virtual routers mein routing, aur SLA profiles aur forwarding profiles ke saath SD-WAN policy cover karte hain. Is module ne woh foundation diya jis par sab depend karte hain: underlay, identity, tunnel aur BGP.</p></div>

<div class="warn"><p><b>Aakhri reminders.</b> Underlay ping skip mat karo. Identity values blindly copy mat karo. "After" output ke bina ticket close mat karo. Lab CLI asli VOS aur Director ka simplified model hai; production deployments mein bahut zyada statements aur rich GUI hota hai.</p></div>
<div class="exam"><p><b>Exam trap summary.</b> Carrier availability application quality nahi hai. Link up reachability nahi hai. Commit success ka matlab working overlay nahi hai. Established BGP ka matlab "saare transports healthy" nahi hai.</p></div>

<div class="scn"><h4>Nayi engineer ka pehla hafta</h4><p>Ek nayi NOC engineer ko ek subah teen tickets mile: ek branch jiska circuit address nahi tha, ek jiska overlay Idle tha, aur ek jahan Internet theek tha lekin MPLS missing tha. Usne teeno par wahi chaar-step method use kiya. Pehla ticket: underlay. Doosra: identity, mismatched organization name. Teesra: tunnel, Controller par missing transport domain. Uske manager ne dekha ki woh har ticket do same commands se kholti aur har ek ko before aur after output se close karti thi.</p><p><b>Seekh:</b> method alag dikhne wali problems ko ek hi routine bana deta hai.</p></div>

<div class="iv"><p class="q">"Tum Versa mein naye ho. Kisi bhi SD-WAN branch problem par sabse pehle kya check karoge?"</p><p>Strong answer: layer, neeche se upar. Interface aur route state, Controller ko ping, phir overlay summary aur per-tunnel Reason text, phir BGP. Bolo ki aap evidence record karte ho, ek cheez badalte ho aur verify karte ho, aur Director, Controller aur VOS ki responsibilities ka farak jaante ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SD-WAN multiple underlay transports par encrypted, policy-driven overlay jodta hai.</li>
<li>Versa components: VOS, Director, Controller, Analytics, optional Concerto.</li>
<li>Order mein banao aur fix karo: underlay, identity, tunnel, BGP.</li>
<li>VOS CLI candidate-aur-commit model hai: set, delete, show | compare, commit, rollback.</li>
<li>Hamesha show commands aur ping se verify karo, aur tickets evidence ke saath close karo.</li>
</ul></div>
`}};export{e as default};