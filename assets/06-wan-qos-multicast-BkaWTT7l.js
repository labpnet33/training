function e(e,t,n,r,i,a){return`<text x="`+e+`" y="`+t+`" text-anchor="`+(a||`middle`)+`" class="`+(r||`svg-ink`)+`" font-size="`+(i||12)+`">`+n+`</text>`}function t(t,n,r,i){return`<g stroke="#64748b" fill="`+r+`"><ellipse cx="`+(t-22)+`" cy="`+(n+6)+`" rx="22" ry="13"/><ellipse cx="`+(t+22)+`" cy="`+(n+6)+`" rx="22" ry="13"/><ellipse cx="`+t+`" cy="`+(n-6)+`" rx="24" ry="16"/></g><g fill="`+r+`"><ellipse cx="`+(t-22)+`" cy="`+(n+6)+`" rx="21" ry="12"/><ellipse cx="`+(t+22)+`" cy="`+(n+6)+`" rx="21" ry="12"/><ellipse cx="`+t+`" cy="`+(n-6)+`" rx="23" ry="15"/><rect x="`+(t-22)+`" y="`+(n-2)+`" width="44" height="20"/></g>`+e(t,n+4,i,`svg-ink`,11)}function n(t,n,r,i,a,o){return`<rect x="`+t+`" y="`+n+`" width="`+r+`" height="`+i+`" rx="8" fill="`+a+`" stroke="#64748b"/>`+e(t+r/2,n+i/2+4,o,`svg-ink`,12)}function r(e,t,n,r){return`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`}function i(i){return`<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="`+i.alt+`">`+e(320,20,i.t,`svg-accent`,13)+n(10,40,130,50,`#bae6fd`,i.s1)+n(165,40,130,50,`#ddd6fe`,i.s2)+n(320,40,130,50,`#fde68a`,i.s3)+r(140,65,165,65)+r(295,65,320,65)+r(450,65,495,65)+t(520,65,`#bbf7d0`,`WAN`)+e(320,128,i.q,`svg-ink`,12)+n(40,140,112,40,`#fde68a`,i.q1)+n(152,140,196,40,`#bae6fd`,i.q2)+n(348,140,140,40,`#bbf7d0`,i.q3)+n(488,140,112,40,`#e2e8f0`,i.q4)+e(320,212,i.note,`svg-muted`,11)+`</svg><p class="cap">`+i.cap+`</p></div>`}var a=i({alt:`WAN QoS pipeline: classify, queue, shape, then provider classes, with example bandwidth split`,t:`Branch WAN egress QoS pipeline`,s1:`1 Classify and mark`,s2:`2 LLQ + CBWFQ`,s3:`3 Shape to CIR`,q:`Example split of a 100 Mbps circuit`,q1:`Voice 20%`,q2:`Critical apps 35%`,q3:`Business 25%`,q4:`Default 20%`,note:`Voice is priority (LLQ); the others get guaranteed shares`,cap:`Mark at the trust boundary, queue by class, shape to the contracted rate, then map markings to the provider classes.`}),o=i({alt:`WAN QoS pipeline: classify, queue, shape, phir provider classes, example bandwidth split ke saath`,t:`Branch WAN egress QoS pipeline`,s1:`1 Classify and mark`,s2:`2 LLQ + CBWFQ`,s3:`3 Shape to CIR`,q:`100 Mbps circuit ka example split`,q1:`Voice 20%`,q2:`Critical apps 35%`,q3:`Business 25%`,q4:`Default 20%`,note:`Voice priority (LLQ) hai; baaki ko guaranteed shares milte hain`,cap:`Trust boundary par mark karo, class ke hisaab se queue karo, contracted rate par shape karo, phir markings ko provider classes se map karo.`}),s={id:`wan-qos-multicast`,h:{en:`Customer case: WAN QoS and multicast for a contact-centre network`,hi:`Customer case: contact-centre network ke liye WAN QoS aur multicast`},body:{en:`
<h3>The customer: Summit Contact Centers</h3>
<p><b>Summit Contact Centers</b> has 5 sites and 1,200 agents who spend most of their day on voice calls. Voice runs through softphones and IP phones to a cloud voice platform and to the head-office data centre. The WAN is an MPLS service with a <b>4-class provider model</b> (real-time, critical, business, best effort) at the four large sites, and two small sites use internet with a DMVPN overlay. Twice a month IT pushes a 4 GB software image to all desktops, and the training team streams live video to 400 desks. Agents complain of choppy calls on Monday mornings. The brief: protect voice, make the image push safe and avoid sending 400 copies of one video stream.</p>

<h3>Requirements for voice</h3>
<p>Well-known targets for interactive voice are <b>one-way delay at or below 150 ms, jitter at or below 30 ms, and loss at or below 1%</b>. Voice needs little bandwidth (roughly 80 to 100 kbps per call including overhead) but cannot wait in a queue behind a software image.</p>

<h3>QoS design building blocks</h3>
<ol>
<li><b>Classification and marking at the trust boundary.</b> Trust DSCP only from devices you control, such as IP phones, and re-mark everything else. Voice is EF, interactive video AF4x, critical apps AF3x, signalling CS3, bulk data AF1x, scavenger CS1.</li>
<li><b>Queuing.</b> A <b>low-latency queue (LLQ)</b> gives voice strict priority and an implicit policer so it cannot starve other classes. A common guideline is to keep priority traffic under about one third of the link. Other classes use class-based weighted fair queuing (CBWFQ) with guaranteed shares.</li>
<li><b>Shaping.</b> The access handoff is often a 1 Gbps Ethernet port, but the contract is 100 Mbps. If you send faster than the contract, the provider <b>polices</b> and drops without regard to your priorities. Use a <b>hierarchical policy</b>: the parent shapes to the committed rate, the child queues by class.</li>
<li><b>Provider class mapping.</b> Carriers support only a few classes. Map your 8 or 12 internal classes onto the 4 provider classes and re-mark DSCP on the CE to the values the provider honours.</li>
</ol>
<table class="cmp"><tr><th>Enterprise class</th><th>DSCP</th><th>Provider class</th><th>Queue behaviour</th></tr>
<tr><td>Voice</td><td>EF</td><td>Real-time</td><td>Priority (LLQ)</td></tr>
<tr><td>Interactive video, call signalling</td><td>AF41, CS3</td><td>Critical</td><td>Guaranteed share</td></tr>
<tr><td>Business apps</td><td>AF21, AF31</td><td>Business</td><td>Guaranteed share, WRED</td></tr>
<tr><td>Bulk and default</td><td>AF11, default, CS1</td><td>Best effort</td><td>Remaining bandwidth</td></tr></table>

@@DIA@@

<pre class="code"><span class="c">! Child policy: classes. Parent policy: shape to the contract</span>
class-map match-any VOICE
 match dscp ef
class-map match-any CRITICAL
 match dscp af41 cs3
policy-map CHILD-WAN
 class VOICE
  priority percent 20
 class CRITICAL
  bandwidth remaining percent 50
 class class-default
  fair-queue
policy-map PARENT-SHAPE
 class class-default
  shape average 100000000
  service-policy CHILD-WAN
interface GigabitEthernet0/0/1
 service-policy output PARENT-SHAPE</pre>
<pre class="out">HQ-R1# show policy-map interface GigabitEthernet0/0/1
 Service-policy output: PARENT-SHAPE
  Class-map: class-default (match-any)
   shape (average) cir 100000000, bc 400000, be 400000
   Service-policy : CHILD-WAN
    Class-map: VOICE (match-any)
     Priority: 20% (20000 kbps), burst bytes 500000, <span class="hl">b/w exceed drops: 0</span></pre>

<h3>QoS over tunnels and SD-WAN</h3>
<p>GRE and IPsec copy the inner DSCP to the outer header by default, so the provider still sees EF. Over DMVPN, a hub serving many spokes can apply <b>per-tunnel QoS</b>, because each spoke has a different bandwidth. In SD-WAN, QoS is part of the localized policy on the edge (class maps, scheduling, shaping), while the application-aware policy chooses the path.</p>

<h3>WAN multicast</h3>
<p>Unicast delivery of 6 Mbps video to 400 desks over one site link would need 2.4 Gbps. Multicast sends one copy per link. Design choices: ask the provider for multicast VPN support (the carrier replicates inside its core), or build multicast over your own overlay. On <b>DMVPN</b>, enable PIM sparse mode on the tunnels, put <code>ip pim nbma-mode</code> on the hub so it can send to each spoke separately, and keep the RP at the hub or data centre. Spokes set <code>ip pim dr-priority 0</code> so the hub is the designated router. Multicast always flows through the hub, spoke-to-spoke multicast is not direct. <b>GETVPN</b> supports multicast natively. <b>SD-WAN</b> uses PIM at the service side and OMP to carry multicast routing, with replicators placed at hubs.</p>
<pre class="code"><span class="c">! DMVPN hub tunnel</span>
ip multicast-routing
ip pim rp-address 10.0.0.1
interface Tunnel0
 ip pim sparse-mode
 ip pim nbma-mode
 ip nhrp map multicast dynamic
<span class="c">! DMVPN spoke tunnel</span>
interface Tunnel0
 ip pim sparse-mode
 ip pim dr-priority 0</pre>
<div class="eg"><p><b>Worked example.</b> 6 Mbps video to 400 desks across 4 sites at 100 desks each: unicast puts 600 Mbps on every site link and overloads the 100 Mbps circuits. With multicast each site link carries a single 6 Mbps stream.</p></div>

<div class="warn"><p><b>Common mistake.</b> Putting more than about a third of the link in the priority queue, or marking everything EF. The priority class then starves the rest and QoS loses all meaning.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shaping belongs on egress and buffers; policing drops or re-marks. Classify at the edge, queue where there is congestion, and map to the provider's classes. Multicast over DMVPN needs the hub to replicate.</p></div>

<div class="scn"><h4>Post-mortem: choppy Monday calls</h4><p>The CE router sent voice as EF, but the provider's real-time class expected a different marking and treated the voice as best effort. There was also no shaper, so a software image push filled the 100 Mbps contract and the provider policer dropped packets at random, voice included. The team added a parent shaper at 100 Mbps, a child LLQ for voice, a remark map to the provider's real-time marking, and a scavenger class for the image push.</p><p><b>Lesson:</b> QoS works only end to end. Verify what the carrier actually does with your markings.</p></div>

<div class="iv"><p class="q">"Why shape before the provider handoff?"</p><p>The handoff port is faster than the contract, so the provider policer drops excess traffic with no knowledge of priorities. Shaping to the committed rate moves the queue into your router, where LLQ and class-based queues decide what to drop.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Voice targets: 150 ms one-way delay, 30 ms jitter, 1% loss.</li>
<li>Mark at the trust boundary, use LLQ for voice, CBWFQ for the rest, and shape to the CIR with a hierarchical policy.</li>
<li>Map internal classes onto the provider's few classes and re-mark DSCP.</li>
<li>Tunnels copy DSCP outward; DMVPN hubs can apply per-tunnel QoS.</li>
<li>Multicast over DMVPN is hub-replicated; mVPN, GETVPN and SD-WAN replicators are the other options.</li>
</ul></div>
`.replace(`@@DIA@@`,a),hi:`
<h3>Customer: Summit Contact Centers</h3>
<p><b>Summit Contact Centers</b> ke 5 sites aur 1,200 agents hain jo din ka zyadatar time voice calls par bitate hain. Voice softphones aur IP phones se cloud voice platform aur head-office data centre tak jaati hai. WAN MPLS service hai jisme chaar bade sites par <b>4-class provider model</b> (real-time, critical, business, best effort) hai, aur do chhote sites internet par DMVPN overlay use karte hain. Mahine mein do baar IT saare desktops par 4 GB software image push karta hai, aur training team 400 desks par live video stream karti hai. Agents Monday subah choppy calls ki shikayat karte hain. Brief: voice ko protect karo, image push ko safe banao aur ek video stream ki 400 copies bhejne se bacho.</p>

<h3>Voice ke liye requirements</h3>
<p>Interactive voice ke well-known targets hain: <b>one-way delay 150 ms ya kam, jitter 30 ms ya kam, aur loss 1% ya kam</b>. Voice ko bandwidth kam chahiye (overhead sahit lagbhag 80 se 100 kbps per call), par woh software image ke peeche queue mein wait nahi kar sakti.</p>

<h3>QoS design building blocks</h3>
<ol>
<li><b>Trust boundary par classification aur marking.</b> DSCP sirf un devices se trust karo jo aapke control mein hain, jaise IP phones, baaki sab ko re-mark karo. Voice EF, interactive video AF4x, critical apps AF3x, signalling CS3, bulk data AF1x, scavenger CS1.</li>
<li><b>Queuing.</b> <b>Low-latency queue (LLQ)</b> voice ko strict priority deti hai aur implicit policer lagati hai taaki woh doosri classes ko starve na kare. Common guideline: priority traffic link ke lagbhag ek tihaai se kam rakho. Baaki classes class-based weighted fair queuing (CBWFQ) se guaranteed shares leti hain.</li>
<li><b>Shaping.</b> Access handoff aksar 1 Gbps Ethernet port hota hai, par contract 100 Mbps ka hai. Contract se tez bhejoge to provider <b>police</b> karke aapki priorities dekhe bina drop karega. <b>Hierarchical policy</b> use karo: parent committed rate par shape karta hai, child class ke hisaab se queue karta hai.</li>
<li><b>Provider class mapping.</b> Carriers sirf kuch classes support karte hain. Apni 8 ya 12 internal classes ko 4 provider classes par map karo aur CE par DSCP ko un values mein re-mark karo jo provider honour karta hai.</li>
</ol>
<table class="cmp"><tr><th>Enterprise class</th><th>DSCP</th><th>Provider class</th><th>Queue behaviour</th></tr>
<tr><td>Voice</td><td>EF</td><td>Real-time</td><td>Priority (LLQ)</td></tr>
<tr><td>Interactive video, call signalling</td><td>AF41, CS3</td><td>Critical</td><td>Guaranteed share</td></tr>
<tr><td>Business apps</td><td>AF21, AF31</td><td>Business</td><td>Guaranteed share, WRED</td></tr>
<tr><td>Bulk aur default</td><td>AF11, default, CS1</td><td>Best effort</td><td>Bacha hua bandwidth</td></tr></table>

@@DIA@@

<pre class="code"><span class="c">! Child policy: classes. Parent policy: contract par shape</span>
class-map match-any VOICE
 match dscp ef
class-map match-any CRITICAL
 match dscp af41 cs3
policy-map CHILD-WAN
 class VOICE
  priority percent 20
 class CRITICAL
  bandwidth remaining percent 50
 class class-default
  fair-queue
policy-map PARENT-SHAPE
 class class-default
  shape average 100000000
  service-policy CHILD-WAN
interface GigabitEthernet0/0/1
 service-policy output PARENT-SHAPE</pre>
<pre class="out">HQ-R1# show policy-map interface GigabitEthernet0/0/1
 Service-policy output: PARENT-SHAPE
  Class-map: class-default (match-any)
   shape (average) cir 100000000, bc 400000, be 400000
   Service-policy : CHILD-WAN
    Class-map: VOICE (match-any)
     Priority: 20% (20000 kbps), burst bytes 500000, <span class="hl">b/w exceed drops: 0</span></pre>

<h3>Tunnels aur SD-WAN par QoS</h3>
<p>GRE aur IPsec by default inner DSCP ko outer header mein copy karte hain, isliye provider ko EF dikhta rehta hai. DMVPN par, bahut spokes serve karne wala hub <b>per-tunnel QoS</b> laga sakta hai, kyunki har spoke ka bandwidth alag hota hai. SD-WAN mein QoS edge ki localized policy ka hissa hai (class maps, scheduling, shaping), jabki application-aware policy path chunti hai.</p>

<h3>WAN multicast</h3>
<p>400 desks ko 6 Mbps video unicast mein bhejne ke liye ek site link par 2.4 Gbps lagega. Multicast har link par ek copy bhejta hai. Design choices: provider se multicast VPN support maango (carrier apne core mein replicate karta hai), ya apne overlay par multicast banao. <b>DMVPN</b> par tunnels par PIM sparse mode enable karo, hub par <code>ip pim nbma-mode</code> lagao taaki woh har spoke ko alag bhej sake, aur RP hub ya data centre mein rakho. Spokes <code>ip pim dr-priority 0</code> set karte hain taaki hub designated router bane. Multicast hamesha hub se guzarta hai, spoke-to-spoke multicast direct nahi hota. <b>GETVPN</b> multicast natively support karta hai. <b>SD-WAN</b> service side par PIM aur multicast routing carry karne ke liye OMP use karta hai, replicators hubs par rakhe jaate hain.</p>
<pre class="code"><span class="c">! DMVPN hub tunnel</span>
ip multicast-routing
ip pim rp-address 10.0.0.1
interface Tunnel0
 ip pim sparse-mode
 ip pim nbma-mode
 ip nhrp map multicast dynamic
<span class="c">! DMVPN spoke tunnel</span>
interface Tunnel0
 ip pim sparse-mode
 ip pim dr-priority 0</pre>
<div class="eg"><p><b>Worked example.</b> 4 sites, har site par 100 desks, 400 desks ko 6 Mbps video: unicast har site link par 600 Mbps daalta hai aur 100 Mbps circuits overload ho jaate hain. Multicast mein har site link par sirf ek 6 Mbps stream jaati hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Link ka ek tihaai se zyada priority queue mein daalna, ya sab kuch EF mark kar dena. Tab priority class baaki sab ko starve kar deti hai aur QoS ka matlab khatam ho jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shaping egress par hoti hai aur buffer karti hai; policing drop ya re-mark karti hai. Edge par classify karo, jahan congestion ho wahan queue karo, aur provider ki classes se map karo. DMVPN par multicast ke liye hub ko replicate karna padta hai.</p></div>

<div class="scn"><h4>Post-mortem: Monday ki choppy calls</h4><p>CE router voice ko EF bhejta tha, par provider ki real-time class koi aur marking expect karti thi aur voice ko best effort ki tarah treat kiya. Shaper bhi nahi tha, isliye software image push ne 100 Mbps contract bhar diya aur provider policer ne random packets drop kiye, voice sahit. Team ne 100 Mbps par parent shaper, voice ke liye child LLQ, provider ki real-time marking par remark map, aur image push ke liye scavenger class jodi.</p><p><b>Lesson:</b> QoS sirf end to end kaam karti hai. Verify karo ki carrier aapki markings ke saath actually kya karta hai.</p></div>

<div class="iv"><p class="q">"Provider handoff se pehle shape kyun karte hain?"</p><p>Handoff port contract se tez hai, isliye provider policer priorities jaane bina excess traffic drop kar deta hai. Committed rate par shape karne se queue aapke router mein aa jaati hai, jahan LLQ aur class-based queues tay karti hain ki kya drop karna hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Voice targets: 150 ms one-way delay, 30 ms jitter, 1% loss.</li>
<li>Trust boundary par mark karo, voice ke liye LLQ, baaki ke liye CBWFQ, aur hierarchical policy se CIR par shape karo.</li>
<li>Internal classes ko provider ki kuch classes par map karo aur DSCP re-mark karo.</li>
<li>Tunnels DSCP ko bahar copy karte hain; DMVPN hubs per-tunnel QoS laga sakte hain.</li>
<li>DMVPN par multicast hub se replicate hota hai; mVPN, GETVPN aur SD-WAN replicators doosre options hain.</li>
</ul></div>
`.replace(`@@DIA@@`,o)}};export{s as default};