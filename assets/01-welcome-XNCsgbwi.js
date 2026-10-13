var e={id:`welcome`,h:{en:`Welcome to service provider networking: what you will learn and the big picture`,hi:`Service provider networking mein swagat: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> This is the free "Start here" module for the Cisco CCNP Service Provider core exam, <b>SPCOR 350-501</b>. You will learn how an internet service provider (ISP) network is built: the access, aggregation and core layers, the IGP that holds the core together, BGP that carries customer and internet routes, MPLS that switches labels instead of looking up IP addresses, and the VPN services that providers sell on top. You will also learn how the exam domains fit together and how to practise them in the labs, so that your first IS-IS adjacency in the next module is not a surprise.</p>
<p><b>Prerequisites.</b> You should have finished CCNA and, ideally, ENARSI: OSPF, EIGRP or BGP basics, VLANs, static routes and reading <code>show ip route</code>. Nothing here needs service provider experience.</p>

<h3>Analogy: a country's road network</h3>
<p>Think of the roads of a large country. Your house sits on a small lane. Lanes join a district road, district roads feed a city ring road, and cities are linked by national highways. Nobody builds a house on a highway, and nobody runs a lorry from Chennai to Delhi over village lanes. A service provider network has the same layers. <b>Access</b> links reach the customer's door. <b>Aggregation</b> collects many access links. The <b>core</b> is the national highway: few devices, huge speed, no customers plugged in. The job of the core is to move traffic between the edges as fast and as reliably as possible, and to stay up even when a link is cut by a road digger.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Access, aggregation and core layers">
<rect x="15" y="70" width="120" height="70" rx="10" fill="#bae6fd"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="14">Customers</text><text x="75" y="120" text-anchor="middle" class="svg-muted" font-size="12">homes, offices</text>
<rect x="165" y="70" width="120" height="70" rx="10" fill="#bbf7d0"/><text x="225" y="100" text-anchor="middle" class="svg-ink" font-size="14">Access</text><text x="225" y="120" text-anchor="middle" class="svg-muted" font-size="12">last mile</text>
<rect x="315" y="70" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="385" y="100" text-anchor="middle" class="svg-ink" font-size="14">Aggregation</text><text x="385" y="120" text-anchor="middle" class="svg-muted" font-size="12">PoP, metro</text>
<rect x="485" y="70" width="140" height="70" rx="10" fill="#fde68a"/><text x="555" y="100" text-anchor="middle" class="svg-ink" font-size="14">Core</text><text x="555" y="120" text-anchor="middle" class="svg-muted" font-size="12">IGP + MPLS + BGP</text>
<line x1="135" y1="105" x2="165" y2="105" stroke="#64748b" stroke-width="2"/><line x1="285" y1="105" x2="315" y2="105" stroke="#64748b" stroke-width="2"/><line x1="455" y1="105" x2="485" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">many devices, low speed  to  few devices, very high speed</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Every layer is built redundant: two links, two devices, two paths.</text>
</svg><p class="cap">The layers of a provider network, from the customer to the core.</p></div>

<h3>Why providers are different from enterprises</h3>
<ul>
<li><b>Scale.</b> A provider carries traffic for thousands of customers, so the core routing table must stay small and stable. Customer routes do not belong in the IGP.</li>
<li><b>Many customers on one network.</b> Two customers can both use 10.0.0.0/8. The provider must keep them apart on shared routers. That is what VPNs and MPLS are for.</li>
<li><b>Money is tied to uptime.</b> Service level agreements (SLAs) promise availability, so convergence time, protection and monitoring become exam topics.</li>
<li><b>Operations at scale.</b> Hundreds of routers are managed by automation, model-driven telemetry and templates, not by typing on each device.</li>
</ul>

<h3>The five building blocks you will meet</h3>
<table class="cmp"><tr><th>Block</th><th>Question it answers</th><th>Where you study it</th></tr>
<tr><td>IGP (IS-IS, OSPF)</td><td>How does every router reach every other router loopback?</td><td>spcor-isis, spcor-isis-design</td></tr>
<tr><td>MPLS and LDP</td><td>How do we forward on labels so the core needs no customer routes?</td><td>spcor-mpls-ldp</td></tr>
<tr><td>BGP and route reflectors</td><td>How do customer and internet routes cross the core?</td><td>spcor-bgp</td></tr>
<tr><td>L3VPN and L2VPN</td><td>How do we sell private networks on shared hardware?</td><td>spcor-l3vpn, spcor-l2vpn</td></tr>
<tr><td>Operations</td><td>How do we protect, secure, automate and monitor it?</td><td>spcor-ha, spcor-sp-security, spcor-telemetry</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A customer in Pune orders a 100 Mbps internet link and a private link between Pune and Hyderabad. The Pune access router (a CE or the provider's own access node) hands traffic to a PE router. For the internet service the PE sends it over BGP routes to the upstream. For the private link the PE puts the traffic in a VRF, adds two MPLS labels, and sends it across the core to the Hyderabad PE. The same physical routers deliver both services. By the end of this module you will be able to describe every step of that story in your own words.</p></div>

<div class="warn"><p><b>Common mistake.</b> Treating a provider network as "a very big enterprise network" and putting customer subnets into the IGP. Provider cores keep the IGP tiny (only loopbacks and infrastructure links) and carry customer routes in BGP.</p></div>
<div class="exam"><p><b>Exam trap.</b> SPCOR questions often describe a symptom in one layer but the cause is in another, for example "VPN route is present but traffic fails" where the cause is a missing label path in the core. Learn each layer and learn which layer to check next.</p></div>

<div class="scn"><h4>The core that stayed small</h4><p>A regional ISP started by putting every customer /30 into OSPF. At 3,000 customers the routing table on the core routers was huge and every flap in a customer link caused an SPF run everywhere. The team moved customer routes into BGP and kept only loopbacks and core links in the IGP. SPF runs dropped sharply and the core became boring, which is exactly what a core should be.</p><p><b>Lesson:</b> the IGP carries infrastructure only; BGP carries customers.</p></div>

<div class="iv"><p class="q">"How is a service provider network different from an enterprise network?"</p><p>Describe the layers (access, aggregation, core), then say that providers serve many customers on shared infrastructure, so they use MPLS and VPNs to separate them, keep the IGP small, carry customer routes in BGP, and design for scale and SLA-grade convergence. Mention PE, P and CE roles to show you know the vocabulary.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A provider network has access, aggregation and core layers, each built redundant.</li>
<li>The core carries traffic fast; customers do not plug into it.</li>
<li>IGP carries infrastructure; BGP carries customer and internet routes.</li>
<li>MPLS labels and VPNs let many customers share one network safely.</li>
<li>SPCOR tests architecture, routing, services, automation, assurance and security.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Yeh Cisco CCNP Service Provider core exam, <b>SPCOR 350-501</b>, ka free "Start here" module hai. Aap seekhoge ki internet service provider (ISP) network kaise bante hain: access, aggregation aur core layers, woh IGP jo core ko jodta hai, BGP jo customer aur internet routes le jaata hai, MPLS jo IP address lookup ki jagah labels switch karta hai, aur woh VPN services jo provider upar se bechte hain. Aap yeh bhi seekhoge ki exam domains aapas mein kaise jude hain aur labs mein practice kaise karein, taaki agle module mein aapki pehli IS-IS adjacency aapko surprise na kare.</p>
<p><b>Prerequisites.</b> Aapne CCNA kar liya ho aur behtar ho ki ENARSI bhi: OSPF, EIGRP ya BGP basics, VLANs, static routes aur <code>show ip route</code> padhna. Yahan service provider ka koi experience zaroori nahi.</p>

<h3>Analogy: ek desh ka road network</h3>
<p>Ek bade desh ki sadkon ke baare mein socho. Aapka ghar ek chhoti gali mein hai. Galiyan district road se judti hain, district roads city ring road ko feed karti hain, aur cities national highways se jude hote hain. Koi highway par ghar nahi banata, aur koi Chennai se Delhi ka lorry gaon ki galiyon se nahi chalata. Service provider network mein bhi yahi layers hoti hain. <b>Access</b> links customer ke darwaze tak jaate hain. <b>Aggregation</b> bahut saare access links ko ikattha karta hai. <b>Core</b> national highway hai: kam devices, bahut high speed, koi customer seedha nahi judta. Core ka kaam hai edges ke beech traffic ko sabse tez aur reliable tareeke se le jaana, aur road digger se link kat jaaye tab bhi up rehna.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Access, aggregation aur core layers">
<rect x="15" y="70" width="120" height="70" rx="10" fill="#bae6fd"/><text x="75" y="100" text-anchor="middle" class="svg-ink" font-size="14">Customers</text><text x="75" y="120" text-anchor="middle" class="svg-muted" font-size="12">ghar, office</text>
<rect x="165" y="70" width="120" height="70" rx="10" fill="#bbf7d0"/><text x="225" y="100" text-anchor="middle" class="svg-ink" font-size="14">Access</text><text x="225" y="120" text-anchor="middle" class="svg-muted" font-size="12">last mile</text>
<rect x="315" y="70" width="140" height="70" rx="10" fill="#ddd6fe"/><text x="385" y="100" text-anchor="middle" class="svg-ink" font-size="14">Aggregation</text><text x="385" y="120" text-anchor="middle" class="svg-muted" font-size="12">PoP, metro</text>
<rect x="485" y="70" width="140" height="70" rx="10" fill="#fde68a"/><text x="555" y="100" text-anchor="middle" class="svg-ink" font-size="14">Core</text><text x="555" y="120" text-anchor="middle" class="svg-muted" font-size="12">IGP + MPLS + BGP</text>
<line x1="135" y1="105" x2="165" y2="105" stroke="#64748b" stroke-width="2"/><line x1="285" y1="105" x2="315" y2="105" stroke="#64748b" stroke-width="2"/><line x1="455" y1="105" x2="485" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="13">bahut devices, kam speed se  kam devices, bahut high speed tak</text>
<text x="320" y="185" text-anchor="middle" class="svg-muted" font-size="12">Har layer redundant: do links, do devices, do paths.</text>
</svg><p class="cap">Customer se core tak provider network ki layers.</p></div>

<h3>Providers enterprise se alag kyun hain</h3>
<ul>
<li><b>Scale.</b> Provider hazaron customers ka traffic le jaata hai, isliye core routing table chhoti aur stable rehni chahiye. Customer routes IGP mein nahi jaate.</li>
<li><b>Ek network par bahut customers.</b> Do customers dono 10.0.0.0/8 use kar sakte hain. Provider ko shared routers par unhe alag rakhna padta hai. VPN aur MPLS isi ke liye hain.</li>
<li><b>Paisa uptime se juda hai.</b> Service level agreements (SLAs) availability ka wada karte hain, isliye convergence time, protection aur monitoring exam topics ban jaate hain.</li>
<li><b>Scale par operations.</b> Saikdon routers automation, model-driven telemetry aur templates se manage hote hain, har device par type karke nahi.</li>
</ul>

<h3>Paanch building blocks jo milenge</h3>
<table class="cmp"><tr><th>Block</th><th>Kis sawal ka jawab deta hai</th><th>Kahan padhoge</th></tr>
<tr><td>IGP (IS-IS, OSPF)</td><td>Har router doosre har router ke loopback tak kaise pahunchta hai?</td><td>spcor-isis, spcor-isis-design</td></tr>
<tr><td>MPLS aur LDP</td><td>Labels par forward kaise karein taaki core ko customer routes na chahiye?</td><td>spcor-mpls-ldp</td></tr>
<tr><td>BGP aur route reflectors</td><td>Customer aur internet routes core paar kaise karte hain?</td><td>spcor-bgp</td></tr>
<tr><td>L3VPN aur L2VPN</td><td>Shared hardware par private networks kaise bechte hain?</td><td>spcor-l3vpn, spcor-l2vpn</td></tr>
<tr><td>Operations</td><td>Ise protect, secure, automate aur monitor kaise karte hain?</td><td>spcor-ha, spcor-sp-security, spcor-telemetry</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Pune ka ek customer 100 Mbps internet link aur Pune se Hyderabad ke beech ek private link order karta hai. Pune access router (CE ya provider ka apna access node) traffic PE router ko deta hai. Internet service ke liye PE use upstream ke BGP routes par bhejta hai. Private link ke liye PE traffic ko VRF mein rakhta hai, do MPLS labels lagata hai, aur core paar Hyderabad PE ko bhejta hai. Dono services ek hi physical routers deliver karte hain. Is module ke end tak aap yeh poori kahani apne shabdon mein bata paoge.</p></div>

<div class="warn"><p><b>Common mistake.</b> Provider network ko "bahut bada enterprise network" samajhna aur customer subnets IGP mein daal dena. Provider cores IGP ko bahut chhota rakhte hain (sirf loopbacks aur infrastructure links) aur customer routes BGP mein le jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> SPCOR ke sawal aksar ek layer ka symptom batate hain par cause doosri layer mein hota hai, jaise "VPN route present hai par traffic fail" jahan cause core mein missing label path hai. Har layer seekho aur yeh bhi ki agla check kaunsi layer ka karna hai.</p></div>

<div class="scn"><h4>Woh core jo chhota raha</h4><p>Ek regional ISP ne har customer /30 OSPF mein daal diya. 3,000 customers par core routers ki routing table bahut badi ho gayi aur customer link ke har flap par sab jagah SPF chalta tha. Team ne customer routes BGP mein shift kiye aur IGP mein sirf loopbacks aur core links rakhe. SPF runs kaafi gir gaye aur core boring ho gaya, jo ek core ke liye bilkul sahi hai.</p><p><b>Lesson:</b> IGP sirf infrastructure le jaata hai; BGP customers le jaata hai.</p></div>

<div class="iv"><p class="q">"Service provider network enterprise network se kaise alag hai?"</p><p>Layers batao (access, aggregation, core), phir kaho ki providers shared infrastructure par bahut customers serve karte hain, isliye woh unhe alag karne ke liye MPLS aur VPNs use karte hain, IGP chhota rakhte hain, customer routes BGP mein le jaate hain, aur scale aur SLA-grade convergence ke liye design karte hain. PE, P aur CE roles ka zikr karo taaki vocabulary dikhe.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Provider network mein access, aggregation aur core layers hoti hain, har ek redundant.</li>
<li>Core traffic tezi se le jaata hai; customers use seedha nahi jude hote.</li>
<li>IGP infrastructure le jaata hai; BGP customer aur internet routes.</li>
<li>MPLS labels aur VPNs bahut customers ko ek network safely share karne dete hain.</li>
<li>SPCOR architecture, routing, services, automation, assurance aur security test karta hai.</li>
</ul></div>
`}};export{e as default};