var e={id:`aggregation-core-design`,h:{en:`Aggregation and core design: IGP hierarchy, unified MPLS, BGP and transport`,hi:`Aggregation aur core design: IGP hierarchy, unified MPLS, BGP aur transport`},body:{en:`
<p>With thousands of access and aggregation nodes, one flat IGP and one flat label space would not scale. Providers use hierarchy and a clear division of labour between protocols. This chapter covers the design choices behind that, and the trade-offs the exam expects you to explain. The protocol mechanics are covered in the spcor-isis, spcor-bgp, spcor-mpls-ldp and spcor-sr modules; here we focus on how the pieces fit.</p>

<h3>The division of labour</h3>
<table class="cmp"><tr><th>Layer</th><th>Protocol</th><th>Job</th></tr>
<tr><td>Underlay reachability</td><td>IS-IS or OSPF</td><td>Loopback and link reachability inside a domain</td></tr>
<tr><td>Transport labels</td><td>LDP or segment routing</td><td>Labels for LSPs between loopbacks</td></tr>
<tr><td>Service routes</td><td>MP-BGP (VPNv4, VPNv6, EVPN)</td><td>Customer routes and MACs between PEs</td></tr>
<tr><td>External routes</td><td>BGP (eBGP and iBGP)</td><td>Internet and peering routes</td></tr></table>
<p>The core principle: the IGP carries only infrastructure addresses (loopbacks and links). BGP carries everything else. Internet routes, customer VPN routes and MACs never go into the IGP.</p>

<h3>Why a single flat domain fails</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Hierarchy limits routing state">
<rect x="20" y="20" width="180" height="170" rx="10" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Access domain</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="11">own IGP area/level</text><text x="110" y="90" text-anchor="middle" class="svg-muted" font-size="11">hundreds of loopbacks</text>
<rect x="230" y="20" width="180" height="170" rx="10" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Aggregation domain</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="11">own area/level</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">sees only local loopbacks</text>
<rect x="440" y="20" width="180" height="170" rx="10" fill="#ddd6fe"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">Core domain</text><text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="11">core loopbacks only</text><text x="530" y="90" text-anchor="middle" class="svg-muted" font-size="11">BGP-LU stitches domains</text>
<line x1="200" y1="105" x2="230" y2="105" stroke="#64748b" stroke-width="2"/><line x1="410" y1="105" x2="440" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Border routers re-advertise only what is needed</text>
</svg><p class="cap">Separate domains keep each IGP small; BGP labelled-unicast connects the PE loopbacks across them.</p></div>
<p>In a flat design every router knows every loopback and every link. Each change floods to all. Convergence slows as the domain grows, memory use grows, and an access fault disturbs the core. The fix is hierarchy.</p>

<h3>Options for hierarchy</h3>
<ul>
<li><b>IS-IS levels or OSPF areas</b>: level 1 or non-backbone areas in the edge, level 2 or area 0 in the core, with summarisation at the boundary. The simplest option, but end-to-end LSPs between a PE in one area and a PE in another need loopback reachability across the boundary, which a summary breaks for LDP.</li>
<li><b>Separate IGP instances per domain, joined by BGP labelled-unicast (BGP-LU, "seamless MPLS" or "unified MPLS")</b>: each domain has its own small IGP. Border routers use <b>BGP-LU</b> (IPv4 or IPv6 with a label) to advertise PE loopbacks and their labels between domains, so an end-to-end LSP is built from segments stitched at the borders. PE loopbacks stay reachable without leaking the whole IGP.</li>
<li><b>Segment routing</b>: a source router can express a path as a stack of segments. With SR plus a path computation element or controller, you can span domains using binding or anycast segments, reducing the need for per-domain LDP and BGP-LU state. The details are in spcor-sr.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A network has 20,000 access nodes. In a flat IS-IS domain, each router would hold 20,000 loopbacks and thousands of links. With 40 access domains of 500 nodes, each access IGP holds 500 loopbacks. The aggregation borders hold their own domain plus the BGP-LU routes for the PE loopbacks that must be reached from elsewhere, perhaps a few hundred, not 20,000. State falls by one to two orders of magnitude.</p></div>

<h3>Route reflectors</h3>
<p>iBGP needs a full mesh unless <b>route reflectors (RRs)</b> are used. An RR receives routes from clients and reflects them to other clients, so PEs peer only with RRs. A design uses at least two RRs (often in different sites), clustered so a failure of one does not break service. In larger networks, RRs are <b>hierarchical</b> or <b>partitioned</b> by address family (for example VPNv4 RRs separate from Internet RRs) to share load. RRs can be virtual or dedicated, and need not be in the forwarding path; but if they are not in the path, their IGP metric to the clients should be considered carefully so best-path decisions still reflect the clients' view.</p>

<h3>Transport choices: LDP, SR and RSVP-TE</h3>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Cost</th></tr>
<tr><td>LDP</td><td>Simple, widespread, automatic</td><td>Follows IGP only; needs LDP-IGP sync; extra protocol state</td></tr>
<tr><td>Segment routing (SR-MPLS)</td><td>No LDP or RSVP state, simple, supports traffic engineering with SR policy and TI-LFA</td><td>New skills; interoperability and label-stack depth planning</td></tr>
<tr><td>RSVP-TE</td><td>Explicit paths and bandwidth reservation</td><td>Per-tunnel state in every hop, complex at scale</td></tr></table>
<p>Many modern designs migrate from LDP to segment routing because it removes a protocol and gives fast reroute through TI-LFA.</p>

<h3>Fast convergence and resilience</h3>
<ul>
<li><b>BFD</b> for fast failure detection on links and neighbours.</li>
<li><b>IP fast reroute</b> (LFA, remote LFA or TI-LFA) pre-computes a backup so traffic is redirected within tens of milliseconds, before the IGP has re-converged.</li>
<li><b>Graceful restart / non-stop forwarding</b> so a control-plane restart does not disturb forwarding (platform support varies).</li>
<li><b>BGP PIC</b> (prefix-independent convergence) so thousands of routes switch to a backup next hop in one operation.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Summarising PE loopbacks at an area boundary and then wondering why LDP LSPs do not form; carrying customer or Internet routes in the IGP; and an RR placed with a poor IGP view so it selects the wrong best path for its clients.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember that BGP-LU carries IPv4 prefixes with labels to build inter-domain LSPs (unified MPLS). Do not confuse it with MP-BGP VPNv4, which carries customer routes.</p></div>

<div class="scn"><h4>The summary that broke the LSPs</h4><p>An operator introduced IS-IS levels and summarised level 1 loopbacks into one prefix at the boundary. LDP only creates labels for exact FEC matches, so PEs in different levels could no longer build end-to-end LSPs and VPN traffic was dropped. The fix was to leak the /32 PE loopbacks (or use BGP-LU) while still summarising everything else.</p><p><b>Lesson:</b> PE loopbacks must remain reachable as /32s end to end when using LDP.</p></div>

<div class="iv"><p class="q">"How do you scale a large SP network's IGP and MPLS?"</p><p>Keep the IGP for infrastructure only, split the network into domains with their own IGP, and join them with BGP labelled-unicast (seamless MPLS) or use segment routing. Use route reflectors for BGP, BFD plus fast reroute for convergence, and keep PE loopbacks as /32s.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGP carries infrastructure; BGP carries services and external routes.</li>
<li>Hierarchy limits state: IGP levels or separate domains joined by BGP-LU, or SR.</li>
<li>Route reflectors remove the iBGP full mesh; deploy them in redundant pairs.</li>
<li>SR simplifies transport; RSVP-TE adds per-tunnel state.</li>
<li>BFD, fast reroute and BGP PIC give fast convergence.</li>
</ul></div>
`,hi:`
<p>Hazaron access aur aggregation nodes ke saath ek flat IGP aur ek flat label space scale nahi karega. Providers hierarchy aur protocols ke beech saaf kaam ka baant use karte hain. Yeh chapter uske peeche ke design choices aur woh trade-offs cover karta hai jo exam aapse samjhane ko kehta hai. Protocol mechanics spcor-isis, spcor-bgp, spcor-mpls-ldp aur spcor-sr modules mein hain; yahan hum dhyan dete hain ki hisse kaise fit hote hain.</p>

<h3>Kaam ka baant</h3>
<table class="cmp"><tr><th>Layer</th><th>Protocol</th><th>Kaam</th></tr>
<tr><td>Underlay reachability</td><td>IS-IS ya OSPF</td><td>Domain ke andar loopback aur link reachability</td></tr>
<tr><td>Transport labels</td><td>LDP ya segment routing</td><td>Loopbacks ke beech LSPs ke liye labels</td></tr>
<tr><td>Service routes</td><td>MP-BGP (VPNv4, VPNv6, EVPN)</td><td>PEs ke beech customer routes aur MACs</td></tr>
<tr><td>External routes</td><td>BGP (eBGP aur iBGP)</td><td>Internet aur peering routes</td></tr></table>
<p>Core principle: IGP sirf infrastructure addresses (loopbacks aur links) carry karta hai. Baaki sab BGP carry karta hai. Internet routes, customer VPN routes aur MACs kabhi IGP mein nahi jaate.</p>

<h3>Single flat domain kyun fail hota hai</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Hierarchy routing state limit karti hai">
<rect x="20" y="20" width="180" height="170" rx="10" fill="#bae6fd"/><text x="110" y="45" text-anchor="middle" class="svg-ink" font-size="13">Access domain</text><text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="11">apna IGP area/level</text><text x="110" y="90" text-anchor="middle" class="svg-muted" font-size="11">saikdon loopbacks</text>
<rect x="230" y="20" width="180" height="170" rx="10" fill="#bbf7d0"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Aggregation domain</text><text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="11">apna area/level</text><text x="320" y="90" text-anchor="middle" class="svg-muted" font-size="11">sirf local loopbacks dekhta hai</text>
<rect x="440" y="20" width="180" height="170" rx="10" fill="#ddd6fe"/><text x="530" y="45" text-anchor="middle" class="svg-ink" font-size="13">Core domain</text><text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="11">sirf core loopbacks</text><text x="530" y="90" text-anchor="middle" class="svg-muted" font-size="11">BGP-LU domains jodta hai</text>
<line x1="200" y1="105" x2="230" y2="105" stroke="#64748b" stroke-width="2"/><line x1="410" y1="105" x2="440" y2="105" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Border routers sirf zaroori cheez re-advertise karte hain</text>
</svg><p class="cap">Alag domains har IGP ko chhota rakhte hain; BGP labelled-unicast PE loopbacks ko unke across jodta hai.</p></div>
<p>Flat design mein har router har loopback aur har link jaanta hai. Har change sab tak flood hota hai. Domain badhne par convergence slow hoti hai, memory use badhta hai, aur access fault core ko disturb karti hai. Fix hierarchy hai.</p>

<h3>Hierarchy ke options</h3>
<ul>
<li><b>IS-IS levels ya OSPF areas</b>: edge mein level 1 ya non-backbone areas, core mein level 2 ya area 0, boundary par summarisation ke saath. Sabse simple option, lekin ek area ke PE aur doosre area ke PE ke beech end-to-end LSPs ko boundary ke across loopback reachability chahiye, jise summary LDP ke liye tod deti hai.</li>
<li><b>Har domain ke liye alag IGP instances, BGP labelled-unicast (BGP-LU, "seamless MPLS" ya "unified MPLS") se jode hue</b>: har domain ka apna chhota IGP hota hai. Border routers domains ke beech PE loopbacks aur unke labels advertise karne ke liye <b>BGP-LU</b> (label ke saath IPv4 ya IPv6) use karte hain, isliye end-to-end LSP borders par stitched segments se banta hai. Poora IGP leak kiye bina PE loopbacks reachable rehte hain.</li>
<li><b>Segment routing</b>: source router path ko segments ke stack ke roop mein express kar sakta hai. SR plus path computation element ya controller ke saath, binding ya anycast segments se domains span kar sakte ho, jisse per-domain LDP aur BGP-LU state ki zaroorat kam hoti hai. Detail spcor-sr mein hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Network mein 20,000 access nodes hain. Flat IS-IS domain mein har router 20,000 loopbacks aur hazaron links rakhta. 500-node ke 40 access domains ke saath har access IGP 500 loopbacks rakhta hai. Aggregation borders apna domain plus un PE loopbacks ke BGP-LU routes rakhte hain jinhe kahin aur se reach karna zaroori hai, shayad kuch saikde, 20,000 nahi. State ek se do orders of magnitude gir jaati hai.</p></div>

<h3>Route reflectors</h3>
<p>iBGP ko full mesh chahiye jab tak <b>route reflectors (RRs)</b> use na ho. RR clients se routes receive karta hai aur doosre clients ko reflect karta hai, isliye PEs sirf RRs se peer karte hain. Design mein kam se kam do RRs (aksar alag sites mein) hote hain, clustered taaki ek ka fail hona service na tode. Bade networks mein RRs <b>hierarchical</b> ya address family ke hisaab se <b>partitioned</b> hote hain (jaise VPNv4 RRs Internet RRs se alag) load baantne ke liye. RRs virtual ya dedicated ho sakte hain, aur forwarding path mein hone ki zaroorat nahi; lekin agar path mein nahi hain, to clients tak unka IGP metric dhyan se dekhna chahiye taaki best-path decisions clients ke view ko reflect karein.</p>

<h3>Transport choices: LDP, SR aur RSVP-TE</h3>
<table class="cmp"><tr><th>Option</th><th>Strength</th><th>Cost</th></tr>
<tr><td>LDP</td><td>Simple, widespread, automatic</td><td>Sirf IGP follow karta hai; LDP-IGP sync chahiye; extra protocol state</td></tr>
<tr><td>Segment routing (SR-MPLS)</td><td>LDP ya RSVP state nahi, simple, SR policy aur TI-LFA se traffic engineering support</td><td>Nayi skills; interoperability aur label-stack depth planning</td></tr>
<tr><td>RSVP-TE</td><td>Explicit paths aur bandwidth reservation</td><td>Har hop mein per-tunnel state, scale par complex</td></tr></table>
<p>Kai modern designs LDP se segment routing par migrate karte hain kyunki yeh ek protocol hata deta hai aur TI-LFA se fast reroute deta hai.</p>

<h3>Fast convergence aur resilience</h3>
<ul>
<li>Links aur neighbours par fast failure detection ke liye <b>BFD</b>.</li>
<li><b>IP fast reroute</b> (LFA, remote LFA ya TI-LFA) backup pehle se compute karta hai taaki IGP re-converge hone se pehle traffic das-dahaai milliseconds mein redirect ho.</li>
<li><b>Graceful restart / non-stop forwarding</b> taaki control-plane restart forwarding ko disturb na kare (platform support alag hota hai).</li>
<li><b>BGP PIC</b> (prefix-independent convergence) taaki hazaron routes ek operation mein backup next hop par switch ho jaayein.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Area boundary par PE loopbacks summarise karna aur phir sochna ki LDP LSPs kyun nahi ban rahe; customer ya Internet routes IGP mein carry karna; aur RR ko kharab IGP view ke saath rakhna jisse woh clients ke liye galat best path chunta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Yaad rakho BGP-LU inter-domain LSPs banane ke liye labels ke saath IPv4 prefixes carry karta hai (unified MPLS). Ise MP-BGP VPNv4 se confuse mat karo, jo customer routes carry karta hai.</p></div>

<div class="scn"><h4>Summary jisne LSPs tod diye</h4><p>Operator ne IS-IS levels lagaye aur boundary par level 1 loopbacks ko ek prefix mein summarise kiya. LDP sirf exact FEC match ke liye labels banata hai, isliye alag levels ke PEs end-to-end LSPs nahi bana paaye aur VPN traffic drop hua. Fix yeh tha ki /32 PE loopbacks ko leak kiya jaaye (ya BGP-LU use ho) jabki baaki sab summarise ho.</p><p><b>Lesson:</b> LDP use karte waqt PE loopbacks end to end /32 ke roop mein reachable rehne chahiye.</p></div>

<div class="iv"><p class="q">"Bade SP network ke IGP aur MPLS ko scale kaise karte ho?"</p><p>IGP ko sirf infrastructure ke liye rakho, network ko apne IGP wale domains mein baanto, aur unhe BGP labelled-unicast (seamless MPLS) se jodo ya segment routing use karo. BGP ke liye route reflectors, convergence ke liye BFD plus fast reroute, aur PE loopbacks ko /32 rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGP infrastructure carry karta hai; BGP services aur external routes.</li>
<li>Hierarchy state limit karti hai: IGP levels ya BGP-LU se jode alag domains, ya SR.</li>
<li>Route reflectors iBGP full mesh hataate hain; redundant pairs mein deploy karo.</li>
<li>SR transport simple karta hai; RSVP-TE per-tunnel state jodta hai.</li>
<li>BFD, fast reroute aur BGP PIC fast convergence dete hain.</li>
</ul></div>
`}};export{e as default};