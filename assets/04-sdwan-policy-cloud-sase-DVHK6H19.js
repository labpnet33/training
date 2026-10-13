function e(e,t,n,r,i,a){return`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`}function t(t,n,r,i){return`<g stroke="#64748b" fill="`+r+`"><ellipse cx="`+(t-22)+`" cy="`+(n+6)+`" rx="22" ry="13"/><ellipse cx="`+(t+22)+`" cy="`+(n+6)+`" rx="22" ry="13"/><ellipse cx="`+t+`" cy="`+(n-6)+`" rx="24" ry="16"/></g><g fill="`+r+`"><ellipse cx="`+(t-22)+`" cy="`+(n+6)+`" rx="21" ry="12"/><ellipse cx="`+(t+22)+`" cy="`+(n+6)+`" rx="21" ry="12"/><ellipse cx="`+t+`" cy="`+(n-6)+`" rx="23" ry="15"/><rect x="`+(t-22)+`" y="`+(n-2)+`" width="44" height="20"/></g>`+e(t,n+4,i,`svg-ink`,11)}function n(t,n,r,i){return`<circle cx="`+t+`" cy="`+n+`" r="15" fill="`+r+`" stroke="#64748b"/><path d="M`+(t-8)+` `+n+`H`+(t+8)+`M`+t+` `+(n-8)+`V`+(n+8)+`" stroke="#1e293b" stroke-width="2"/>`+e(t,n+30,i,`svg-ink`,11)}function r(t,n,r,i){return`<rect x="`+t+`" y="`+n+`" width="28" height="34" fill="`+r+`" stroke="#64748b"/><path d="M`+(t+6)+` `+(n+8)+`h4M`+(t+18)+` `+(n+8)+`h4M`+(t+6)+` `+(n+18)+`h4M`+(t+18)+` `+(n+18)+`h4" stroke="#1e293b" stroke-width="3"/>`+e(t+14,n+48,i,`svg-ink`,11)}function i(t,n,r,i){return`<path d="M`+t+` `+(n-18)+`L`+(t+15)+` `+(n-11)+`V`+(n+3)+`C`+(t+15)+` `+(n+13)+` `+t+` `+(n+19)+` `+t+` `+(n+19)+`C`+t+` `+(n+19)+` `+(t-15)+` `+(n+13)+` `+(t-15)+` `+(n+3)+`V`+(n-11)+`Z" fill="`+r+`" stroke="#64748b"/>`+e(t,n+36,i,`svg-ink`,11)}function a(e,t,n,r,i){return`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"`+(i?` stroke-dasharray="5 4"`:``)+`/>`}function o(o){return`<div class="dia"><svg viewBox="0 0 640 345" role="img" aria-label="`+o.alt+`">`+a(145,145,255,78)+a(145,155,255,225)+a(294,72,546,58)+a(294,222,446,158,1)+a(294,235,400,280,1)+a(432,285,536,268,1)+r(30,120,`#e2e8f0`,o.clinic)+a(58,140,115,150)+n(130,150,`#fde68a`,o.edge)+t(270,70,`#bae6fd`,`MPLS`)+t(270,230,`#bbf7d0`,`Internet`)+r(546,40,`#ddd6fe`,o.dc)+t(470,150,`#fde68a`,`SaaS`)+i(416,280,`#fed7aa`,o.sig)+t(570,262,`#ddd6fe`,`IaaS`)+e(360,118,o.dia,`svg-accent`,11)+e(130,108,o.sla,`svg-muted`,11)+`<line x1="130" y1="330" x2="160" y2="330" stroke="#64748b" stroke-width="2"/>`+e(166,334,o.k1,`svg-ink`,11,`start`)+`<line x1="340" y1="330" x2="370" y2="330" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>`+e(376,334,o.k2,`svg-ink`,11,`start`)+`</svg><p class="cap">`+o.cap+`</p></div>`}var s=o({alt:`Clinic edge router with private WAN, direct internet access, SaaS, IaaS and cloud security`,clinic:`Clinic`,edge:`Edge`,dc:`Hospital DC`,sig:`Cloud security`,dia:`DIA + Cloud OnRamp`,sla:`SLA probes`,k1:`Private WAN path`,k2:`Internet breakout path`,cap:`The clinic edge measures every path. Business traffic uses MPLS, trusted SaaS uses local breakout steered by Cloud OnRamp, and general internet goes through cloud security.`}),c=o({alt:`Clinic edge router private WAN, direct internet access, SaaS, IaaS aur cloud security ke saath`,clinic:`Clinic`,edge:`Edge`,dc:`Hospital DC`,sig:`Cloud security`,dia:`DIA + Cloud OnRamp`,sla:`SLA probes`,k1:`Private WAN path`,k2:`Internet breakout path`,cap:`Clinic edge har path ko measure karta hai. Business traffic MPLS use karta hai, trusted SaaS Cloud OnRamp se steer hoke local breakout leta hai, aur general internet cloud security se guzarta hai.`}),l={id:`sdwan-policy-cloud`,h:{en:`Customer case: SD-WAN policy, cloud on-ramps and SASE for a clinic network`,hi:`Customer case: clinic network ke liye SD-WAN policy, cloud on-ramps aur SASE`},body:{en:`
<h3>The customer: Northwind Clinics</h3>
<p><b>Northwind Clinics</b> operates 85 clinics and 3 hospitals. The electronic health record (EHR) is a SaaS application, collaboration and telehealth are cloud services, and a new analytics platform runs in a public cloud network (IaaS). Today all internet traffic is backhauled over MPLS to the hospital data centre, which hosts the only internet gateway. Users see about 140 ms to the EHR, MPLS links run at 80% busy, and patient-data rules require inspection of internet traffic. The brief: faster SaaS, protected internet, telehealth video inside quality limits, and a clean path to the cloud analytics network.</p>

<h3>Options for internet access and cloud</h3>
<table class="cmp"><tr><th>Design</th><th>Strength</th><th>Weakness</th></tr>
<tr><td><b>Centralized breakout</b> (backhaul to DC)</td><td>One security stack to manage</td><td>Extra latency, MPLS load, DC gateway is a bottleneck</td></tr>
<tr><td><b>Regional breakout</b> (country or hospital hubs)</td><td>Shorter path, fewer stacks</td><td>Still some backhaul; regional capacity planning</td></tr>
<tr><td><b>Direct Internet Access (DIA) at every clinic</b></td><td>Shortest path, saves MPLS bandwidth</td><td>Security must move to the branch or to a cloud service</td></tr>
<tr><td><b>DIA plus cloud security (SASE style)</b></td><td>Local breakout plus consistent policy from the cloud</td><td>Subscription cost; tunnel design to the cloud service</td></tr></table>

<h3>SD-WAN policy building blocks</h3>
<p>A <b>centralized policy</b> lives on the Controller and shapes the whole fabric. A <b>control policy</b> changes route and TLOC advertisements, for example hub-and-spoke versus full mesh, or sending a segment only through the hospital hubs. A <b>data policy</b> matches traffic (application, DSCP, address) and chooses the action, such as NAT to the local internet or a forced path. <b>Application-aware routing</b> measures loss, latency and jitter on every tunnel with BFD and moves flows to a tunnel that meets the <b>SLA class</b>. A <b>localized policy</b> runs on the router itself: QoS, ACLs and route policy.</p>
<pre class="code"><span class="c">! Centralized policy: telehealth must meet its SLA, prefer MPLS</span>
policy
 sla-class TELEHEALTH-SLA
  loss 1
  latency 150
  jitter 30
 app-route-policy TELEHEALTH-PATH
  vpn-list CORP-VPNS
   sequence 10
    match
     dscp 46
    action
     sla-class TELEHEALTH-SLA preferred-color mpls</pre>
<pre class="out">CLINIC-12# show sdwan app-route stats remote-system-ip 10.255.0.10
app-route statistics 198.51.100.50 198.51.100.20 ipsec 12346 12346
 remote-system-ip  10.255.0.10
 local-color       mpls
 remote-color      mpls
 mean-loss         <span class="hl">0</span>
 mean-latency      <span class="hl">31</span>
 mean-jitter       <span class="hl">2</span></pre>

@@DIA@@

<h3>Cloud OnRamp and cloud connectivity</h3>
<p><b>Cloud OnRamp for SaaS</b> probes the paths to a SaaS application (through DIA exits at the clinic, or through a gateway site) and picks the path with the best quality for each clinic. <b>Cloud OnRamp for IaaS</b> (multicloud) automates virtual WAN edges and transit connectivity in the public cloud network, so the cloud looks like another SD-WAN site. For heavy or steady traffic, add a <b>dedicated cloud connection</b> (the Direct Connect or ExpressRoute style of service): a private circuit from a colocation or the hospital DC into the cloud provider, with BGP over a private virtual interface. Build two connections in two separate facilities, and keep an IPsec VPN over the internet as a backup. A dedicated link gives predictable latency and bandwidth, the VPN gives fast, cheap resilience.</p>

<h3>Chosen design</h3>
<ul>
<li>Clinic edges use <b>DIA for trusted SaaS</b> (EHR, collaboration) with Cloud OnRamp choosing the best exit.</li>
<li>All other internet traffic goes to a <b>cloud security service</b> through IPsec or GRE tunnels from the edge, which gives URL filtering, DNS security and a cloud firewall.</li>
<li>Telehealth and voice use app-route policy with an SLA class and MPLS preferred.</li>
<li>The analytics network is reached through a dedicated connection from the two hospital DCs, with SD-WAN virtual edges in the cloud and VPN as backup.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Moving 60% of internet and SaaS traffic off MPLS drops the clinic MPLS load from 80% to about 45% of an 100 Mbps circuit, and EHR latency falls from 140 ms to about 35 ms because the flow no longer crosses the data centre.</p></div>

<div class="warn"><p><b>Common mistake.</b> Enabling DIA without a security design. Local breakout moves the internet edge to every clinic, so inspection, logging and DNS policy must travel with it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Control policy changes the routing and topology view; data policy acts on packets; app-route policy chooses paths by SLA; localized policy runs on the router. Know which one a requirement points to.</p></div>

<div class="scn"><h4>Post-mortem: an SLA nobody could meet</h4><p>The first draft set the EHR SLA to 30 ms latency. The real internet path to the SaaS provider was always about 45 ms, so no tunnel ever met the class. With no compliant path, traffic was balanced over all tunnels, including LTE backups, and users complained about random slowness. The team measured a baseline for two weeks, set the threshold to 60 ms and enabled fallback to the best path.</p><p><b>Lesson:</b> SLA thresholds come from measured baselines and business tolerance, not from guesses, and every SLA policy needs a defined fallback.</p></div>

<div class="iv"><p class="q">"How would you give branches secure direct internet access?"</p><p>Local breakout with NAT at the edge for trusted SaaS, and a cloud security service (SIG or SASE) reached through tunnels for everything else. Mention DNS security, URL filtering, centralized logging and per-segment policy, and that Cloud OnRamp for SaaS picks the best exit by measured quality.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Control policy shapes routes and topology; data policy acts on traffic; app-route policy picks paths by SLA.</li>
<li>Set SLA thresholds from measured baselines and define a fallback.</li>
<li>DIA cuts latency and MPLS load but needs security that follows the user (SASE).</li>
<li>Cloud OnRamp for SaaS and IaaS integrates cloud into the fabric.</li>
<li>Dedicated cloud connections need diversity (two connections, two locations) plus VPN backup.</li>
</ul></div>
`.replace(`@@DIA@@`,s),hi:`
<h3>Customer: Northwind Clinics</h3>
<p><b>Northwind Clinics</b> 85 clinics aur 3 hospitals chalata hai. Electronic health record (EHR) SaaS application hai, collaboration aur telehealth cloud services hain, aur naya analytics platform public cloud network (IaaS) mein chalta hai. Abhi saara internet traffic MPLS par hospital data centre tak backhaul hota hai, jahan akela internet gateway hai. Users ko EHR tak lagbhag 140 ms milta hai, MPLS links 80% busy hain, aur patient-data rules internet traffic ki inspection maangte hain. Brief: tez SaaS, protected internet, quality limits ke andar telehealth video, aur cloud analytics network tak saaf path.</p>

<h3>Internet access aur cloud ke options</h3>
<table class="cmp"><tr><th>Design</th><th>Strength</th><th>Weakness</th></tr>
<tr><td><b>Centralized breakout</b> (DC tak backhaul)</td><td>Ek security stack manage karna</td><td>Extra latency, MPLS load, DC gateway bottleneck</td></tr>
<tr><td><b>Regional breakout</b> (country ya hospital hubs)</td><td>Chhota path, kam stacks</td><td>Thoda backhaul abhi bhi; regional capacity planning</td></tr>
<tr><td><b>Har clinic par Direct Internet Access (DIA)</b></td><td>Sabse chhota path, MPLS bandwidth bachta hai</td><td>Security ko branch ya cloud service tak le jaana padta hai</td></tr>
<tr><td><b>DIA plus cloud security (SASE style)</b></td><td>Local breakout plus cloud se consistent policy</td><td>Subscription cost; cloud service tak tunnel design</td></tr></table>

<h3>SD-WAN policy building blocks</h3>
<p><b>Centralized policy</b> Controller par rehti hai aur poore fabric ko shape karti hai. <b>Control policy</b> route aur TLOC advertisements badalti hai, jaise hub-and-spoke versus full mesh, ya kisi segment ko sirf hospital hubs se bhejna. <b>Data policy</b> traffic match karti hai (application, DSCP, address) aur action chunti hai, jaise local internet par NAT ya forced path. <b>Application-aware routing</b> BFD se har tunnel par loss, latency aur jitter naapti hai aur flows ko aise tunnel par le jaati hai jo <b>SLA class</b> meet kare. <b>Localized policy</b> router par hi chalti hai: QoS, ACLs aur route policy.</p>
<pre class="code"><span class="c">! Centralized policy: telehealth ko SLA meet karna hai, MPLS prefer karo</span>
policy
 sla-class TELEHEALTH-SLA
  loss 1
  latency 150
  jitter 30
 app-route-policy TELEHEALTH-PATH
  vpn-list CORP-VPNS
   sequence 10
    match
     dscp 46
    action
     sla-class TELEHEALTH-SLA preferred-color mpls</pre>
<pre class="out">CLINIC-12# show sdwan app-route stats remote-system-ip 10.255.0.10
app-route statistics 198.51.100.50 198.51.100.20 ipsec 12346 12346
 remote-system-ip  10.255.0.10
 local-color       mpls
 remote-color      mpls
 mean-loss         <span class="hl">0</span>
 mean-latency      <span class="hl">31</span>
 mean-jitter       <span class="hl">2</span></pre>

@@DIA@@

<h3>Cloud OnRamp aur cloud connectivity</h3>
<p><b>Cloud OnRamp for SaaS</b> SaaS application tak ke paths probe karta hai (clinic ke DIA exits se, ya gateway site se) aur har clinic ke liye best quality wala path chunta hai. <b>Cloud OnRamp for IaaS</b> (multicloud) public cloud network mein virtual WAN edges aur transit connectivity automate karta hai, isliye cloud ek aur SD-WAN site jaisa dikhta hai. Heavy ya steady traffic ke liye <b>dedicated cloud connection</b> jodo (Direct Connect ya ExpressRoute style service): colocation ya hospital DC se cloud provider tak private circuit, private virtual interface par BGP ke saath. Do alag facilities mein do connections banao, aur backup ke liye internet par IPsec VPN rakho. Dedicated link predictable latency aur bandwidth deta hai, VPN tez aur sasti resilience deta hai.</p>

<h3>Chosen design</h3>
<ul>
<li>Clinic edges <b>trusted SaaS ke liye DIA</b> use karte hain (EHR, collaboration), best exit Cloud OnRamp chunta hai.</li>
<li>Baaki saara internet traffic edge se IPsec ya GRE tunnels ke through <b>cloud security service</b> par jaata hai: URL filtering, DNS security aur cloud firewall.</li>
<li>Telehealth aur voice app-route policy, SLA class aur MPLS preferred ke saath chalte hain.</li>
<li>Analytics network do hospital DCs se dedicated connection ke through reach hota hai, cloud mein SD-WAN virtual edges aur backup mein VPN ke saath.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> 60% internet aur SaaS traffic MPLS se hatane par clinic ka 100 Mbps MPLS load 80% se lagbhag 45% par aata hai, aur EHR latency 140 ms se lagbhag 35 ms ho jaati hai kyunki flow ab data centre se nahi guzarta.</p></div>

<div class="warn"><p><b>Common mistake.</b> Security design ke bina DIA enable karna. Local breakout internet edge ko har clinic tak le jaata hai, isliye inspection, logging aur DNS policy bhi saath jaani chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Control policy routing aur topology view badalti hai; data policy packets par kaam karti hai; app-route policy SLA se paths chunti hai; localized policy router par chalti hai. Jaano ki requirement kis policy ki taraf ishara karti hai.</p></div>

<div class="scn"><h4>Post-mortem: aisi SLA jo koi meet nahi kar sakta tha</h4><p>Pehle draft mein EHR SLA 30 ms latency rakhi gayi. Asli internet path SaaS provider tak hamesha lagbhag 45 ms tha, isliye koi tunnel class meet nahi karta tha. Compliant path na hone par traffic saare tunnels par balance hua, LTE backups sahit, aur users ne random slowness ki shikayat ki. Team ne do hafte baseline naapi, threshold 60 ms kiya aur fallback to best path enable kiya.</p><p><b>Lesson:</b> SLA thresholds measured baselines aur business tolerance se aate hain, guess se nahi, aur har SLA policy ko defined fallback chahiye.</p></div>

<div class="iv"><p class="q">"Branches ko secure direct internet access kaise doge?"</p><p>Trusted SaaS ke liye edge par NAT ke saath local breakout, aur baaki sab ke liye tunnels se reach hone wali cloud security service (SIG ya SASE). DNS security, URL filtering, centralized logging aur per-segment policy batao, aur yeh ki Cloud OnRamp for SaaS measured quality se best exit chunta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Control policy routes aur topology shape karti hai; data policy traffic par kaam karti hai; app-route policy SLA se paths chunti hai.</li>
<li>SLA thresholds measured baselines se set karo aur fallback define karo.</li>
<li>DIA latency aur MPLS load kam karta hai par security chahiye jo user ke saath chale (SASE).</li>
<li>Cloud OnRamp for SaaS aur IaaS cloud ko fabric mein integrate karta hai.</li>
<li>Dedicated cloud connections ko diversity (do connections, do locations) plus VPN backup chahiye.</li>
</ul></div>
`.replace(`@@DIA@@`,c)}};export{l as default};