var e={id:`qos-queuing`,h:{en:`QoS design: queuing, policing, shaping and WAN edge`,hi:`QoS design: queuing, policing, shaping aur WAN edge`},body:{en:`
<h3>Customer case: Kestrel Logistics</h3>
<div class="eg"><p><b>Company:</b> Kestrel Logistics, 1,100 staff, a warehouse hub and 40 depots. <b>Network:</b> each depot has a 10 Mb/s Metro Ethernet service delivered on a 1 Gb/s handoff port; the hub has 200 Mb/s. <b>Applications:</b> VoIP (G.711), a handheld-scanner app, ERP, CCTV uploads, and nightly stock-file transfers. <b>Problem:</b> at depots, voice breaks up when CCTV uploads start. QoS is already configured on the router with a policy applied to the 1 Gb/s port, yet nothing improves. <b>Budget:</b> no hardware change; the same ISR routers stay.</p></div>

<h3>Why it fails: the router does not know the link is slow</h3>
<p>Analogy: a six-lane road narrows to a single lane after a toll booth. Cars queue at the toll booth, not on the six-lane road, so a traffic officer placed on the wide road never sees a queue. A router sends packets at the physical port speed (1 Gb/s), but the provider only carries 10 Mb/s and drops the rest in its own network. Your queues never fill, so QoS never acts, and the provider drops voice without caring. The fix is to <b>shape</b> the traffic down to 10 Mb/s on the router so the queue builds where you control it.</p>

<h3>Policing versus shaping</h3>
<table class="cmp"><tr><th></th><th>Policing</th><th>Shaping</th></tr>
<tr><td>Excess traffic</td><td>Dropped or re-marked immediately</td><td>Buffered (delayed) and sent later</td></tr>
<tr><td>Direction</td><td>Ingress or egress</td><td>Egress only</td></tr>
<tr><td>Effect on TCP</td><td>Sawtooth, retransmissions</td><td>Smoother flows</td></tr>
<tr><td>Adds delay</td><td>No</td><td>Yes (buffering)</td></tr>
<tr><td>Typical use</td><td>Limit a class, protect priority queue, enforce a contract at ingress</td><td>Match a slower SP rate, e.g. 10 Mb/s on a 1 Gb/s port</td></tr></table>
<p>Both use a token bucket: <b>CIR</b> is the committed rate, <b>Bc</b> the burst allowed per interval. A shaper smooths bursts by holding packets; a policer cannot.</p>

<h3>Queuing tools</h3>
<p>When a link is congested, packets wait in queues, and the scheduler decides who goes next.</p>
<ul>
<li><b>LLQ (low latency queuing)</b>: one strict-priority queue, for voice and sometimes real-time video. It is also policed internally, so it cannot starve others. Cisco guidance: keep priority traffic to about one third of link bandwidth.</li>
<li><b>CBWFQ (class-based weighted fair queuing)</b>: guaranteed minimum bandwidth per class, with unused bandwidth shared.</li>
<li><b>WRED (weighted random early detection)</b>: drops lower-priority packets earlier as the queue fills (for example AF22 before AF21), avoiding TCP global synchronisation. Do not apply it to voice.</li>
<li><b>Fair-queue</b> in class-default spreads bandwidth between flows.</li>
</ul>
<p>Cisco Catalyst 9000 switches offer up to 8 egress queues per port, with priority queues for voice. Campus links are usually fast and rarely congested, but uplinks and east-west bursts still need the policy, particularly for the trust and priority guarantees.</p>

<h3>Options for Kestrel's depots</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Apply queuing on the 1 Gb/s port only</td><td>Simple</td><td>Queue never builds; provider drops voice</td></tr>
<tr><td>Ask provider to upgrade to 50 Mb/s</td><td>No design change</td><td>Cost; still congests during CCTV bursts</td></tr>
<tr><td>Hierarchical policy: shape to 10 Mb/s, queue inside</td><td>No new hardware; control of drops</td><td>Must keep shaper rate in step with the contract</td></tr>
<tr><td>Rate-limit CCTV at the camera switch</td><td>Protects every hop</td><td>Does not help other bursty apps</td></tr></table>
<p><b>Chosen design:</b> a hierarchical policy (HQoS) with a parent shaper at the contracted rate and a child policy with LLQ for voice, CBWFQ for scanner app and ERP, and a limited share for CCTV and file transfers. We also police CCTV at ingress on the depot LAN port as an extra guard. Voice math: G.711 at 20 ms packetization is about 80 kb/s per call on the wire with Layer 3 overhead; 10 calls need about 0.8 Mb/s, well within a 33 percent priority limit (3.3 Mb/s).</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Hierarchical QoS at a depot router">
<rect x="10" y="20" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="13">Voice (EF)</text>
<rect x="10" y="85" width="120" height="50" rx="8" fill="#fde68a"/><text x="70" y="115" text-anchor="middle" class="svg-ink" font-size="13">ERP, scanners</text>
<rect x="10" y="150" width="120" height="50" rx="8" fill="#fed7aa"/><text x="70" y="180" text-anchor="middle" class="svg-ink" font-size="13">CCTV, files</text>
<rect x="190" y="40" width="200" height="140" rx="10" fill="#bae6fd"/><text x="290" y="64" text-anchor="middle" class="svg-ink" font-size="13">Child policy</text>
<text x="290" y="96" text-anchor="middle" class="svg-ink" font-size="12">LLQ voice 33%</text><text x="290" y="120" text-anchor="middle" class="svg-ink" font-size="12">CBWFQ data 40%</text><text x="290" y="144" text-anchor="middle" class="svg-ink" font-size="12">default 27%</text>
<rect x="440" y="60" width="90" height="100" rx="10" fill="#ddd6fe"/><text x="485" y="104" text-anchor="middle" class="svg-ink" font-size="13">Shaper</text><text x="485" y="124" text-anchor="middle" class="svg-muted" font-size="12">10 Mb/s</text>
<rect x="570" y="75" width="60" height="70" rx="8" fill="#e2e8f0"/><text x="600" y="106" text-anchor="middle" class="svg-ink" font-size="12">Metro</text><text x="600" y="124" text-anchor="middle" class="svg-ink" font-size="12">Ethernet</text>
<line x1="130" y1="45" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="130" y1="110" x2="190" y2="110" stroke="#64748b" stroke-width="2"/><line x1="130" y1="175" x2="190" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="110" x2="440" y2="110" stroke="#64748b" stroke-width="2"/><line x1="530" y1="110" x2="570" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="212" width="14" height="14" fill="#bbf7d0"/><text x="210" y="224" class="svg-ink" font-size="12">priority</text>
<rect x="280" y="212" width="14" height="14" fill="#fde68a"/><text x="300" y="224" class="svg-ink" font-size="12">guaranteed</text>
<rect x="390" y="212" width="14" height="14" fill="#fed7aa"/><text x="410" y="224" class="svg-ink" font-size="12">best effort</text>
</svg><p class="cap">The parent shaper makes the queue form on our router; the child policy then decides who goes first.</p></div>

<pre class="code"><span class="c">! Child: who goes first inside the shaped rate</span>
policy-map DEPOT-CHILD
 class VOICE
  priority percent 33
 class CRITICAL-APP
  bandwidth remaining percent 40
  random-detect dscp-based
 class class-default
  fair-queue
<span class="c">! Parent: shape to the contracted 10 Mb/s</span>
policy-map DEPOT-PARENT
 class class-default
  shape average 10000000
  service-policy DEPOT-CHILD
interface GigabitEthernet0/0/1
 service-policy output DEPOT-PARENT</pre>
<pre class="out">Router# show policy-map interface GigabitEthernet0/0/1 output
  Class-map: class-default (match-any)
    Queueing
    queue limit 64 packets
    shape (average) cir 10000000, bc 40000, be 40000
    Service-policy : DEPOT-CHILD
      Class-map: VOICE (match-any)
        priority percent 33 (3300 kbps)
        <span class="hl">Packets dropped: 0</span></pre>

<h3>QoS across the WAN</h3>
<ul>
<li><b>Provider classes:</b> map your classes into the SP's classes and agree how DSCP is preserved or re-marked on return.</li>
<li><b>MPLS L3VPN:</b> the SP may copy or re-mark the markings at the PE; with tunnels the modes are uniform, pipe and short-pipe.</li>
<li><b>IPsec VPN over the Internet:</b> the DSCP is copied to the outer header, but the inner ports are hidden, so use <code>qos pre-classify</code> when you classify on the tunnel interface by ports or ACL. Internet has no QoS guarantee; shape to the real rate and keep a separate voice path where possible.</li>
<li><b>Metro Ethernet:</b> shape to the CIR and consider CoS-to-class mapping at the SP.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Putting everything in the priority queue; forgetting that LLQ is also a policer; shaping at a rate higher than the SP contract; applying WRED to voice or to UDP-heavy classes.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shaping is egress only and buffers; policing can be ingress or egress and drops or re-marks. Voice goes in the LLQ and is not subject to WRED.</p></div>

<div class="scn"><h4>Post-mortem: the shaper that was too generous</h4><p>After the HQoS rollout at Kestrel, two depots still had bad voice. Their circuits had been downgraded to 6 Mb/s during a contract renewal, but the shaper still said 10 Mb/s, so the provider policer dropped packets before our queue formed. The team found it by comparing the shaper rate with the contract in the inventory, corrected it to 6 Mb/s, and added the contract rate to the change checklist.</p><p><b>Lesson:</b> a shaper is only correct when it matches the real contract. Treat the rate as a monitored value.</p></div>

<div class="iv"><p class="q">"Why does QoS not help when the WAN port is 1 Gb/s but the circuit is 10 Mb/s?"</p><p>Because congestion happens inside the provider, not on our interface. We must shape to the contracted rate on egress so our router builds the queue, then apply priority and bandwidth guarantees within it. Mention HQoS and the 33 percent priority guideline.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Shape to the real circuit rate so queues form on your device.</li>
<li>Policing drops or re-marks; shaping buffers and is egress only.</li>
<li>LLQ for voice, CBWFQ for guaranteed classes, WRED for TCP classes only.</li>
<li>Keep priority traffic around one third of link capacity.</li>
<li>Use HQoS (parent shaper, child queues) on slow WAN circuits and qos pre-classify with IPsec.</li>
</ul></div>
`,hi:`
<h3>Customer case: Kestrel Logistics</h3>
<div class="eg"><p><b>Company:</b> Kestrel Logistics, 1,100 staff, ek warehouse hub aur 40 depots. <b>Network:</b> har depot mein 10 Mb/s Metro Ethernet service hai jo 1 Gb/s handoff port par aati hai; hub par 200 Mb/s. <b>Applications:</b> VoIP (G.711), handheld-scanner app, ERP, CCTV uploads, aur raat ke stock-file transfers. <b>Problem:</b> depots par CCTV uploads shuru hote hi voice toot-toot jaati hai. Router par QoS pehle se configured hai aur policy 1 Gb/s port par lagi hai, phir bhi kuch behtar nahi hota. <b>Budget:</b> hardware change nahi; wahi ISR routers rahenge.</p></div>

<h3>Kyun fail hota hai: router ko pata nahi ki link slow hai</h3>
<p>Analogy: chhe-lane road toll booth ke baad ek lane mein badal jaati hai. Gaadiyan toll booth par queue banati hain, chaude road par nahi, isliye chaude road par khada traffic officer queue dekhta hi nahi. Router packets physical port speed (1 Gb/s) par bhejta hai, lekin provider sirf 10 Mb/s carry karta hai aur baaki apne network mein drop kar deta hai. Aapki queues kabhi bharti nahi, isliye QoS kabhi act nahi karta, aur provider voice ko bina parwah ke drop karta hai. Fix hai router par traffic ko 10 Mb/s tak <b>shape</b> karna taaki queue wahan bane jahan aapka control hai.</p>

<h3>Policing versus shaping</h3>
<table class="cmp"><tr><th></th><th>Policing</th><th>Shaping</th></tr>
<tr><td>Excess traffic</td><td>Turant drop ya re-mark</td><td>Buffer (delay) hota hai aur baad mein bheja jaata hai</td></tr>
<tr><td>Direction</td><td>Ingress ya egress</td><td>Sirf egress</td></tr>
<tr><td>TCP par asar</td><td>Sawtooth, retransmissions</td><td>Smooth flows</td></tr>
<tr><td>Delay jodta hai</td><td>Nahi</td><td>Haan (buffering)</td></tr>
<tr><td>Typical use</td><td>Class limit karna, priority queue bachana, ingress par contract enforce karna</td><td>Slower SP rate se match karna, jaise 1 Gb/s port par 10 Mb/s</td></tr></table>
<p>Dono token bucket use karte hain: <b>CIR</b> committed rate hai, <b>Bc</b> har interval mein allowed burst. Shaper packets rok kar bursts smooth karta hai; policer nahi kar sakta.</p>

<h3>Queuing tools</h3>
<p>Link congested ho to packets queues mein wait karte hain, aur scheduler tay karta hai ki agla kaun jaaye.</p>
<ul>
<li><b>LLQ (low latency queuing)</b>: ek strict-priority queue, voice aur kabhi kabhi real-time video ke liye. Yeh andar se policed bhi hoti hai, isliye doosron ko starve nahi kar sakti. Cisco guidance: priority traffic ko link bandwidth ka lagbhag ek tihai rakho.</li>
<li><b>CBWFQ (class-based weighted fair queuing)</b>: har class ko guaranteed minimum bandwidth, unused bandwidth share hoti hai.</li>
<li><b>WRED (weighted random early detection)</b>: queue bharte waqt lower-priority packets ko pehle drop karta hai (jaise AF22 pehle, AF21 baad mein), jisse TCP global synchronisation avoid hota hai. Voice par mat lagao.</li>
<li>class-default mein <b>fair-queue</b> flows ke beech bandwidth baant deta hai.</li>
</ul>
<p>Cisco Catalyst 9000 switches har port par 8 tak egress queues dete hain, voice ke liye priority queues ke saath. Campus links aam taur par fast hote hain aur kam congested, lekin uplinks aur east-west bursts ko bhi policy chahiye, khaaskar trust aur priority guarantees ke liye.</p>

<h3>Kestrel ke depots ke liye options</h3>
<table class="cmp"><tr><th>Option</th><th>Pros</th><th>Cons</th></tr>
<tr><td>Sirf 1 Gb/s port par queuing lagana</td><td>Simple</td><td>Queue kabhi nahi banti; provider voice drop karta hai</td></tr>
<tr><td>Provider se 50 Mb/s upgrade maangna</td><td>Design change nahi</td><td>Cost; CCTV bursts mein phir congest hoga</td></tr>
<tr><td>Hierarchical policy: 10 Mb/s tak shape, andar queue</td><td>Naya hardware nahi; drops par control</td><td>Shaper rate ko contract ke saath sync rakhna padta hai</td></tr>
<tr><td>Camera switch par CCTV rate-limit</td><td>Har hop bachta hai</td><td>Doosri bursty apps ko madad nahi</td></tr></table>
<p><b>Chosen design:</b> hierarchical policy (HQoS) jisme parent shaper contracted rate par aur child policy mein voice ke liye LLQ, scanner app aur ERP ke liye CBWFQ, aur CCTV aur file transfers ke liye limited share. Extra guard ke taur par depot LAN port par CCTV ko ingress par police bhi karte hain. Voice math: G.711, 20 ms packetization par Layer 3 overhead ke saath wire par lagbhag 80 kb/s per call; 10 calls ko lagbhag 0.8 Mb/s chahiye, jo 33 percent priority limit (3.3 Mb/s) ke andar hai.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Depot router par hierarchical QoS">
<rect x="10" y="20" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="70" y="50" text-anchor="middle" class="svg-ink" font-size="13">Voice (EF)</text>
<rect x="10" y="85" width="120" height="50" rx="8" fill="#fde68a"/><text x="70" y="115" text-anchor="middle" class="svg-ink" font-size="13">ERP, scanners</text>
<rect x="10" y="150" width="120" height="50" rx="8" fill="#fed7aa"/><text x="70" y="180" text-anchor="middle" class="svg-ink" font-size="13">CCTV, files</text>
<rect x="190" y="40" width="200" height="140" rx="10" fill="#bae6fd"/><text x="290" y="64" text-anchor="middle" class="svg-ink" font-size="13">Child policy</text>
<text x="290" y="96" text-anchor="middle" class="svg-ink" font-size="12">LLQ voice 33%</text><text x="290" y="120" text-anchor="middle" class="svg-ink" font-size="12">CBWFQ data 40%</text><text x="290" y="144" text-anchor="middle" class="svg-ink" font-size="12">default 27%</text>
<rect x="440" y="60" width="90" height="100" rx="10" fill="#ddd6fe"/><text x="485" y="104" text-anchor="middle" class="svg-ink" font-size="13">Shaper</text><text x="485" y="124" text-anchor="middle" class="svg-muted" font-size="12">10 Mb/s</text>
<rect x="570" y="75" width="60" height="70" rx="8" fill="#e2e8f0"/><text x="600" y="106" text-anchor="middle" class="svg-ink" font-size="12">Metro</text><text x="600" y="124" text-anchor="middle" class="svg-ink" font-size="12">Ethernet</text>
<line x1="130" y1="45" x2="190" y2="90" stroke="#64748b" stroke-width="2"/><line x1="130" y1="110" x2="190" y2="110" stroke="#64748b" stroke-width="2"/><line x1="130" y1="175" x2="190" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="110" x2="440" y2="110" stroke="#64748b" stroke-width="2"/><line x1="530" y1="110" x2="570" y2="110" stroke="#64748b" stroke-width="2"/>
<rect x="190" y="212" width="14" height="14" fill="#bbf7d0"/><text x="210" y="224" class="svg-ink" font-size="12">priority</text>
<rect x="280" y="212" width="14" height="14" fill="#fde68a"/><text x="300" y="224" class="svg-ink" font-size="12">guaranteed</text>
<rect x="390" y="212" width="14" height="14" fill="#fed7aa"/><text x="410" y="224" class="svg-ink" font-size="12">best effort</text>
</svg><p class="cap">Parent shaper queue ko hamare router par banata hai; child policy phir tay karti hai ki pehle kaun jaaye.</p></div>

<pre class="code"><span class="c">! Child: who goes first inside the shaped rate</span>
policy-map DEPOT-CHILD
 class VOICE
  priority percent 33
 class CRITICAL-APP
  bandwidth remaining percent 40
  random-detect dscp-based
 class class-default
  fair-queue
<span class="c">! Parent: shape to the contracted 10 Mb/s</span>
policy-map DEPOT-PARENT
 class class-default
  shape average 10000000
  service-policy DEPOT-CHILD
interface GigabitEthernet0/0/1
 service-policy output DEPOT-PARENT</pre>
<pre class="out">Router# show policy-map interface GigabitEthernet0/0/1 output
  Class-map: class-default (match-any)
    Queueing
    queue limit 64 packets
    shape (average) cir 10000000, bc 40000, be 40000
    Service-policy : DEPOT-CHILD
      Class-map: VOICE (match-any)
        priority percent 33 (3300 kbps)
        <span class="hl">Packets dropped: 0</span></pre>

<h3>WAN ke across QoS</h3>
<ul>
<li><b>Provider classes:</b> apni classes ko SP ki classes mein map karo aur agree karo ki return par DSCP preserve hoga ya re-mark.</li>
<li><b>MPLS L3VPN:</b> SP PE par markings copy ya re-mark kar sakta hai; tunnels ke modes uniform, pipe aur short-pipe hain.</li>
<li><b>Internet par IPsec VPN:</b> DSCP outer header mein copy hota hai, lekin inner ports chhup jaate hain, isliye tunnel interface par ports ya ACL se classify karte waqt <code>qos pre-classify</code> use karo. Internet par QoS guarantee nahi; real rate par shape karo aur jahan ho sake voice ka alag path rakho.</li>
<li><b>Metro Ethernet:</b> CIR par shape karo aur SP par CoS-to-class mapping dekho.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Sab kuch priority queue mein daal dena; yeh bhool jana ki LLQ policer bhi hai; SP contract se zyada rate par shape karna; voice ya UDP-heavy classes par WRED lagana.</p></div>
<div class="exam"><p><b>Exam trap.</b> Shaping sirf egress hai aur buffer karta hai; policing ingress ya egress ho sakti hai aur drop ya re-mark karti hai. Voice LLQ mein jaati hai aur WRED ke under nahi aati.</p></div>

<div class="scn"><h4>Post-mortem: bahut udaar shaper</h4><p>Kestrel mein HQoS rollout ke baad do depots par voice phir bhi kharab thi. Contract renewal ke dauraan unke circuits 6 Mb/s par downgrade ho gaye the, lekin shaper ab bhi 10 Mb/s bol raha tha, isliye hamari queue banne se pehle provider ka policer packets drop kar raha tha. Team ne shaper rate ko inventory ke contract se compare karke yeh pakda, use 6 Mb/s kiya, aur contract rate ko change checklist mein jod diya.</p><p><b>Seekh:</b> shaper tabhi sahi hai jab woh asli contract se match kare. Rate ko monitored value maano.</p></div>

<div class="iv"><p class="q">"WAN port 1 Gb/s hai lekin circuit 10 Mb/s, to QoS madad kyun nahi karta?"</p><p>Kyunki congestion provider ke andar hota hai, hamare interface par nahi. Hum egress par contracted rate tak shape karte hain taaki hamara router queue banaye, phir uske andar priority aur bandwidth guarantees lagate hain. HQoS aur 33 percent priority guideline ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Asli circuit rate par shape karo taaki queues aapke device par banein.</li>
<li>Policing drop ya re-mark karti hai; shaping buffer karti hai aur sirf egress hai.</li>
<li>Voice ke liye LLQ, guaranteed classes ke liye CBWFQ, WRED sirf TCP classes ke liye.</li>
<li>Priority traffic ko link capacity ka lagbhag ek tihai rakho.</li>
<li>Slow WAN circuits par HQoS (parent shaper, child queues) aur IPsec ke saath qos pre-classify use karo.</li>
</ul></div>
`}};export{e as default};