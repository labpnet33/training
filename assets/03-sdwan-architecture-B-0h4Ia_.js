function e(e,t,n,r,i,a){return`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`}function t(t,n,r,i){return`<g stroke="#64748b" fill="`+r+`"><ellipse cx="`+(t-22)+`" cy="`+(n+6)+`" rx="22" ry="13"/><ellipse cx="`+(t+22)+`" cy="`+(n+6)+`" rx="22" ry="13"/><ellipse cx="`+t+`" cy="`+(n-6)+`" rx="24" ry="16"/></g><g fill="`+r+`"><ellipse cx="`+(t-22)+`" cy="`+(n+6)+`" rx="21" ry="12"/><ellipse cx="`+(t+22)+`" cy="`+(n+6)+`" rx="21" ry="12"/><ellipse cx="`+t+`" cy="`+(n-6)+`" rx="23" ry="15"/><rect x="`+(t-22)+`" y="`+(n-2)+`" width="44" height="20"/></g>`+e(t,n+4,i,`svg-ink`,11)}function n(t,n,r,i){return`<circle cx="`+t+`" cy="`+n+`" r="15" fill="`+r+`" stroke="#64748b"/><path d="M`+(t-8)+` `+n+`H`+(t+8)+`M`+t+` `+(n-8)+`V`+(n+8)+`" stroke="#1e293b" stroke-width="2"/>`+e(t,n+30,i,`svg-ink`,11)}function r(t,n,r,i){return`<rect x="`+(t-18)+`" y="`+n+`" width="36" height="28" rx="4" fill="`+r+`" stroke="#64748b"/><path d="M`+(t-11)+` `+(n+9)+`h22M`+(t-11)+` `+(n+19)+`h22" stroke="#1e293b" stroke-width="2"/>`+e(t,n+44,i,`svg-ink`,11)}function i(e,t,n,r,i){return`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"`+(i?` stroke-dasharray="5 4"`:``)+`/>`}function a(a){var o=[90,230,410,550],s,c=``;for(s=0;s<4;s++)c+=i(o[s],285,200,212)+i(o[s],285,440,212);return`<div class="dia"><svg viewBox="0 0 640 365" role="img" aria-label="`+a.alt+`"><rect x="110" y="26" width="420" height="88" rx="10" fill="#f1f5f9" stroke="#64748b"/>`+e(320,20,a.band,`svg-accent`,12)+r(200,40,`#bae6fd`,a.m)+r(320,40,`#fde68a`,a.v)+r(440,40,`#ddd6fe`,a.c)+i(200,114,200,186,1)+i(440,114,440,186,1)+c+t(200,200,`#bae6fd`,`MPLS`)+t(440,200,`#bbf7d0`,`Internet`)+n(90,285,`#bbf7d0`,a.hub)+n(230,285,`#fed7aa`,a.bor)+n(410,285,`#fde68a`,a.b1)+n(550,285,`#fde68a`,a.b2)+`<line x1="150" y1="352" x2="180" y2="352" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>`+e(186,356,a.k1,`svg-ink`,11,`start`)+`<line x1="360" y1="352" x2="390" y2="352" stroke="#64748b" stroke-width="2"/>`+e(396,356,a.k2,`svg-ink`,11,`start`)+`</svg><p class="cap">`+a.cap+`</p></div>`}var o=a({alt:`SD-WAN controllers reach every edge router over any transport`,band:`Cloud-hosted controllers`,m:`Manager`,v:`Validator`,c:`Controller`,hub:`Country hub`,bor:`Border router`,b1:`Depot 1`,b2:`Depot 2`,k1:`Control connection (DTLS/TLS)`,k2:`Data-plane IPsec tunnel`,cap:`Controllers are reachable over any transport. Blue = management, amber = orchestration, purple = control plane, green/orange/amber routers = data plane.`}),s=a({alt:`SD-WAN controllers har transport par har edge router tak pahunchte hain`,band:`Cloud-hosted controllers`,m:`Manager`,v:`Validator`,c:`Controller`,hub:`Country hub`,bor:`Border router`,b1:`Depot 1`,b2:`Depot 2`,k1:`Control connection (DTLS/TLS)`,k2:`Data-plane IPsec tunnel`,cap:`Controllers kisi bhi transport par reachable hain. Blue = management, amber = orchestration, purple = control plane, green/orange/amber routers = data plane.`}),c={id:`sdwan-architecture`,h:{en:`Customer case: designing Catalyst SD-WAN for 320 depots`,hi:`Customer case: 320 depots ke liye Catalyst SD-WAN design karna`},body:{en:`
<h3>The customer: Orion Logistics</h3>
<p><b>Orion Logistics</b> runs 320 depots in 4 countries, 6 country hubs and 2 data centres. Depots have 15 to 80 staff, handheld scanners (an IoT-style segment), guest Wi-Fi and a warehouse management system in the data centres, plus growing use of SaaS. The network team is four people. The brief: plug-and-play deployment of 40 new depots a quarter, one place to see and change every site, three isolated segments (corporate, scanners, guest), and use of both MPLS and internet at every site. Budget is tight, and no truck may wait because a depot router is misconfigured.</p>

<h3>Options and trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Fits when</th><th>Problem for Orion</th></tr>
<tr><td><b>Traditional WAN with DMVPN</b></td><td>Few sites, strong CLI team</td><td>Per-device configuration, no central policy view, steering by hand</td></tr>
<tr><td><b>Cisco Catalyst SD-WAN</b></td><td>Many sites, several transports, central policy and visibility</td><td>New controllers to operate and a licence model to learn</td></tr>
<tr><td><b>Hybrid (SD-WAN at depots, legacy at DCs)</b></td><td>Phased migration</td><td>Two operating models for a while; needs a clear cut-over plan</td></tr></table>
<p>Orion picks Catalyst SD-WAN with a phased migration.</p>

<h3>The four planes and their components</h3>
<dl class="terms">
<dt>SD-WAN Manager (management plane)</dt><dd>The single pane of glass: templates, configuration groups, monitoring, software upgrades. Runs as a cluster of three nodes for scale and availability.</dd>
<dt>SD-WAN Validator (orchestration plane)</dt><dd>The first contact. It authenticates every device and tells it which Controller and Manager to join. It needs a public, reachable address, because devices behind NAT must find it first.</dd>
<dt>SD-WAN Controller (control plane)</dt><dd>Runs the Overlay Management Protocol (OMP). It receives routes from edges, applies centralized policy and re-advertises routes to the other edges. It never forwards user traffic.</dd>
<dt>WAN Edge routers (data plane)</dt><dd>Physical or virtual routers at sites. They build IPsec tunnels between transports and use BFD to measure loss, latency and jitter.</dd>
</dl>
<p>OMP carries three kinds of route: prefixes, <b>TLOC routes</b> and service routes. A <b>TLOC</b> (transport locator) is the address of a tunnel endpoint, defined by system IP, <b>colour</b> and encapsulation. Colours such as <code>mpls</code> and <code>biz-internet</code> label the transports. Public colours may talk across NAT; private colours expect direct reachability, and <code>restrict</code> limits a TLOC to peers of the same colour.</p>

@@DIA@@

<pre class="code"><span class="c">! WAN Edge: identity and transport (CLI view)</span>
system
 host-name DEPOT-017
 system-ip 10.255.1.17
 site-id 17
 organization-name "Orion Logistics"
 vbond vbond.orion.example
sdwan
 interface GigabitEthernet0/0/0
  tunnel-interface
   encapsulation ipsec
   color mpls restrict</pre>
<pre class="out">DEPOT-017# show sdwan control connections
PEER  PEER  PEER        SITE  DOMAIN  PEER           LOCAL
TYPE  PROT  SYSTEM IP   ID    ID      PRIVATE IP     COLOR   STATE
vsmart dtls 10.255.0.2   100   1       198.51.100.21  mpls    <span class="hl">up</span>
vsmart dtls 10.255.0.2   100   1       198.51.100.21  biz-internet  <span class="hl">up</span>
vmanage dtls 10.255.0.1  100   0       198.51.100.20  mpls    <span class="hl">up</span></pre>

<h3>Templates and the chosen design</h3>
<p>A <b>device template</b> is built from <b>feature templates</b> (interface, routing, QoS, AAA) with variables for the site-specific values, so 320 depots come from a handful of templates. Newer releases add <b>configuration groups</b> with a guided workflow for the same idea. A new router powers on, reaches the Validator through plug-and-play and pulls its configuration. Orion's design: cloud-hosted controllers in two regions, a three-node Manager cluster, two Controllers and two Validators, and <b>Multi-Region Fabric</b>. Each country is an <b>access region</b>; a <b>core region</b> joins them; <b>border routers</b> at the country hubs sit in both. Traffic between two depots in one country stays in the region, and cross-country traffic goes through the core. The benefits are smaller routing tables, simpler policy per region and control over the middle-mile path.</p>
<div class="eg"><p><b>Worked sizing example.</b> A flat full mesh of 320 sites with two transports would mean up to about 320 x 319 / 2 x 2, over 100,000 potential tunnels. With four access regions of about 80 depots, each depot builds tunnels inside its region and to its border routers only, so the tunnel count stays manageable.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating the Controller like a router in the data path. If every Controller is unreachable, existing tunnels keep forwarding for a while (graceful restart), but no new policy or route changes arrive. Plan at least two Controllers on separate infrastructure.</p></div>
<div class="exam"><p><b>Exam trap.</b> Match the plane to the component: Manager = management, Validator = orchestration, Controller = control (OMP), WAN Edge = data. A TLOC is system IP plus colour plus encapsulation. VPN 0 is the transport VPN and VPN 512 is management; service VPNs carry user segments.</p></div>

<div class="scn"><h4>Post-mortem: 40 new depots, none online</h4><p>A batch of new routers shipped to depots stayed stuck in the "connect" state. Cabling and addressing were fine and the Validator was reachable. The root cause: the routers had no NTP source and booted with a clock years in the past, so the controller certificates looked "not yet valid" and the DTLS handshake failed. The fix was a bootstrap NTP server and a correct clock before onboarding.</p><p><b>Lesson:</b> SD-WAN trust is built on certificates, so time, DNS for the Validator name and a reachable firewall path are part of the design.</p></div>

<div class="iv"><p class="q">"Walk me through how a new SD-WAN branch router joins the fabric."</p><p>It boots, gets an IP from the transport, resolves and reaches the Validator, which authenticates it with certificates and returns the Manager and Controller addresses. The router builds control connections to the Controller and Manager, receives its template, then forms OMP sessions and BFD-monitored IPsec tunnels to other edges. Mention certificates, time and NAT.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four planes: Manager (management), Validator (orchestration), Controller (control, OMP), WAN Edge (data).</li>
<li>A TLOC is system IP, colour and encapsulation; colours label transports.</li>
<li>Templates and plug-and-play make hundreds of sites repeatable.</li>
<li>Multi-Region Fabric uses access regions, a core region and border routers to scale and control paths.</li>
<li>Certificates, time and reachability to the Validator are design requirements.</li>
</ul></div>
`.replace(`@@DIA@@`,o),hi:`
<h3>Customer: Orion Logistics</h3>
<p><b>Orion Logistics</b> 4 countries mein 320 depots, 6 country hubs aur 2 data centres chalata hai. Depots mein 15 se 80 staff, handheld scanners (IoT-style segment), guest Wi-Fi aur data centres mein warehouse management system hai, aur SaaS ka use badh raha hai. Network team sirf chaar log hain. Brief: har quarter 40 naye depots ka plug-and-play deployment, har site dekhne aur badalne ke liye ek jagah, teen isolated segments (corporate, scanners, guest), aur har site par MPLS aur internet dono ka use. Budget tight hai, aur depot router galat configure hone se koi truck rukna nahi chahiye.</p>

<h3>Options aur trade-offs</h3>
<table class="cmp"><tr><th>Option</th><th>Kab fit hai</th><th>Orion ke liye problem</th></tr>
<tr><td><b>Traditional WAN with DMVPN</b></td><td>Kam sites, strong CLI team</td><td>Per-device configuration, central policy view nahi, steering haath se</td></tr>
<tr><td><b>Cisco Catalyst SD-WAN</b></td><td>Bahut sites, kai transports, central policy aur visibility</td><td>Naye controllers operate karne padte hain aur licence model seekhna padta hai</td></tr>
<tr><td><b>Hybrid (depots par SD-WAN, DCs par legacy)</b></td><td>Phased migration</td><td>Kuch time ke liye do operating models; clear cut-over plan chahiye</td></tr></table>
<p>Orion phased migration ke saath Catalyst SD-WAN chunta hai.</p>

<h3>Chaar planes aur unke components</h3>
<dl class="terms">
<dt>SD-WAN Manager (management plane)</dt><dd>Single pane of glass: templates, configuration groups, monitoring, software upgrades. Scale aur availability ke liye teen nodes ke cluster mein chalta hai.</dd>
<dt>SD-WAN Validator (orchestration plane)</dt><dd>Pehla contact. Yeh har device ko authenticate karta hai aur batata hai ki kaunse Controller aur Manager se judna hai. Isse public, reachable address chahiye, kyunki NAT ke peeche wale devices ko pehle yahi dhoondhna hota hai.</dd>
<dt>SD-WAN Controller (control plane)</dt><dd>Overlay Management Protocol (OMP) chalata hai. Edges se routes leta hai, centralized policy lagata hai aur routes doosre edges ko re-advertise karta hai. Yeh kabhi user traffic forward nahi karta.</dd>
<dt>WAN Edge routers (data plane)</dt><dd>Sites par physical ya virtual routers. Yeh transports ke beech IPsec tunnels banate hain aur BFD se loss, latency aur jitter naapte hain.</dd>
</dl>
<p>OMP teen tarah ke routes carry karta hai: prefixes, <b>TLOC routes</b> aur service routes. <b>TLOC</b> (transport locator) tunnel endpoint ka address hai, jo system IP, <b>colour</b> aur encapsulation se define hota hai. <code>mpls</code> aur <code>biz-internet</code> jaise colours transports ko label karte hain. Public colours NAT ke paar baat kar sakte hain; private colours direct reachability expect karte hain, aur <code>restrict</code> TLOC ko sirf same colour ke peers tak limit karta hai.</p>

@@DIA@@

<pre class="code"><span class="c">! WAN Edge: identity aur transport (CLI view)</span>
system
 host-name DEPOT-017
 system-ip 10.255.1.17
 site-id 17
 organization-name "Orion Logistics"
 vbond vbond.orion.example
sdwan
 interface GigabitEthernet0/0/0
  tunnel-interface
   encapsulation ipsec
   color mpls restrict</pre>
<pre class="out">DEPOT-017# show sdwan control connections
PEER  PEER  PEER        SITE  DOMAIN  PEER           LOCAL
TYPE  PROT  SYSTEM IP   ID    ID      PRIVATE IP     COLOR   STATE
vsmart dtls 10.255.0.2   100   1       198.51.100.21  mpls    <span class="hl">up</span>
vsmart dtls 10.255.0.2   100   1       198.51.100.21  biz-internet  <span class="hl">up</span>
vmanage dtls 10.255.0.1  100   0       198.51.100.20  mpls    <span class="hl">up</span></pre>

<h3>Templates aur chosen design</h3>
<p><b>Device template</b> <b>feature templates</b> (interface, routing, QoS, AAA) se banta hai, site-specific values ke liye variables ke saath, isliye 320 depots ek chhote set of templates se bante hain. Naye releases same idea ke liye guided workflow wale <b>configuration groups</b> jodte hain. Naya router power on hota hai, plug-and-play se Validator tak pahunchta hai aur apni configuration kheench leta hai. Orion ka design: do regions mein cloud-hosted controllers, teen-node Manager cluster, do Controllers aur do Validators, aur <b>Multi-Region Fabric</b>. Har country ek <b>access region</b> hai; <b>core region</b> unko jodta hai; country hubs ke <b>border routers</b> dono mein baithte hain. Ek country ke do depots ke beech traffic region ke andar rehta hai, aur cross-country traffic core se guzarta hai. Fayde: chhote routing tables, har region ke liye simple policy aur middle-mile path par control.</p>
<div class="eg"><p><b>Worked sizing example.</b> Do transports ke saath 320 sites ka flat full mesh matlab lagbhag 320 x 319 / 2 x 2, yaani 100,000 se zyada potential tunnels. Lagbhag 80 depots ke chaar access regions mein har depot sirf apne region aur border routers tak tunnels banata hai, isliye tunnel count manageable rehta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Controller ko data path ka router samajhna. Agar saare Controllers unreachable ho jaayein to existing tunnels kuch der forward karte rehte hain (graceful restart), par nayi policy ya route changes nahi aate. Alag infrastructure par kam se kam do Controllers plan karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Plane ko component se match karo: Manager = management, Validator = orchestration, Controller = control (OMP), WAN Edge = data. TLOC = system IP plus colour plus encapsulation. VPN 0 transport VPN hai aur VPN 512 management; service VPNs user segments carry karte hain.</p></div>

<div class="scn"><h4>Post-mortem: 40 naye depots, ek bhi online nahi</h4><p>Depots ko bheje gaye naye routers "connect" state mein atke rahe. Cabling aur addressing theek thi aur Validator reachable tha. Root cause: routers ke paas NTP source nahi tha aur woh saalon pehle ki clock ke saath boot hue, isliye controller certificates "not yet valid" dikhe aur DTLS handshake fail hua. Fix: bootstrap NTP server aur onboarding se pehle sahi clock.</p><p><b>Lesson:</b> SD-WAN trust certificates par bana hai, isliye time, Validator name ke liye DNS aur firewall path reachability design ka hissa hain.</p></div>

<div class="iv"><p class="q">"Naya SD-WAN branch router fabric mein kaise join karta hai, samjhao."</p><p>Woh boot hota hai, transport se IP leta hai, Validator ko resolve karke reach karta hai, jo certificates se authenticate karke Manager aur Controller ke addresses deta hai. Router Controller aur Manager se control connections banata hai, apna template receive karta hai, phir OMP sessions aur BFD-monitored IPsec tunnels doosre edges ke saath banata hai. Certificates, time aur NAT ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar planes: Manager (management), Validator (orchestration), Controller (control, OMP), WAN Edge (data).</li>
<li>TLOC = system IP, colour aur encapsulation; colours transports ko label karte hain.</li>
<li>Templates aur plug-and-play sainkdon sites ko repeatable banate hain.</li>
<li>Multi-Region Fabric access regions, core region aur border routers se scale aur path control deta hai.</li>
<li>Certificates, time aur Validator tak reachability design requirements hain.</li>
</ul></div>
`.replace(`@@DIA@@`,s)}};export{c as default};