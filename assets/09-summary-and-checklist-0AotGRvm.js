var e={id:`summary`,h:{en:`Summary, track roadmap and exam checklist`,hi:`Summary, track roadmap aur exam checklist`},body:{en:`
<p>You started this module knowing only basic IP. You can now explain how one stream reaches many receivers, why a busy link hurts voice, how a packet is classified and marked, and you have built both in the simulator. This last chapter pulls it together, shows what comes next in the track and gives you a checklist to test yourself.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Roadmap of the Multicast and QoS track">
<rect x="10" y="10" width="620" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">mq-start: zero to first stream and first mark (this module, free)</text>
<rect x="10" y="60" width="300" height="34" rx="8" fill="#bae6fd"/><text x="160" y="82" text-anchor="middle" class="svg-ink" font-size="13">mq-igmp: addressing, IGMP, snooping</text>
<rect x="330" y="60" width="300" height="34" rx="8" fill="#ddd6fe"/><text x="480" y="82" text-anchor="middle" class="svg-ink" font-size="13">mq-mark: classification, marking, trust</text>
<rect x="10" y="104" width="300" height="34" rx="8" fill="#bae6fd"/><text x="160" y="126" text-anchor="middle" class="svg-ink" font-size="13">mq-pim: PIM sparse mode and SSM</text>
<rect x="330" y="104" width="300" height="34" rx="8" fill="#ddd6fe"/><text x="480" y="126" text-anchor="middle" class="svg-ink" font-size="13">mq-queue: CBWFQ, LLQ, WRED</text>
<rect x="10" y="148" width="300" height="34" rx="8" fill="#bae6fd"/><text x="160" y="170" text-anchor="middle" class="svg-ink" font-size="13">mq-rp: static, Auto-RP, BSR, anycast</text>
<rect x="330" y="148" width="300" height="34" rx="8" fill="#ddd6fe"/><text x="480" y="170" text-anchor="middle" class="svg-ink" font-size="13">mq-wan: policing, shaping, WAN edge</text>
<rect x="10" y="192" width="300" height="34" rx="8" fill="#bae6fd"/><text x="160" y="214" text-anchor="middle" class="svg-ink" font-size="13">mq-mroute: RPF and mroute troubleshooting</text>
<rect x="330" y="192" width="300" height="34" rx="8" fill="#ddd6fe"/><text x="480" y="214" text-anchor="middle" class="svg-ink" font-size="13">mq-voice: voice and video end to end</text>
</svg><p class="cap">Left column: multicast. Right column: QoS. Both start from this module and meet in mq-voice.</p></div>

<h3>What you can do now (checklist)</h3>
<ul>
<li>Explain unicast, broadcast and multicast, and say why multicast saves bandwidth.</li>
<li>Recognise a multicast group address (224.0.0.0/4, and 239.x.x.x for private use).</li>
<li>Describe the roles of IGMP (host to router) and PIM (router to router).</li>
<li>Explain what a rendezvous point is and configure a static RP.</li>
<li>Read a (*,G) and an (S,G) entry: incoming interface, RPF neighbour, outgoing list, flags S, C, J and T.</li>
<li>Explain congestion, queue, tail drop, delay, jitter and loss.</li>
<li>Name the four traffic types and say what each needs.</li>
<li>Write a class-map, a policy-map with set dscp ef, and apply it with service-policy input.</li>
<li>Read show policy-map interface and explain class-default.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Group address</dt><dd>A multicast destination address in 224.0.0.0/4. It names a group, not a host.</dd>
<dt>IGMP</dt><dd>Protocol a host uses to tell its router which groups it wants.</dd>
<dt>PIM sparse mode</dt><dd>Protocol routers use to build multicast trees, using a meeting point (RP) when nobody knows the source yet.</dd>
<dt>RP</dt><dd>Rendezvous point, the router where sources and receivers meet in sparse mode.</dd>
<dt>mroute table</dt><dd>The multicast routing table, listing (*,G) and (S,G) state.</dd>
<dt>RPF check</dt><dd>Accept a multicast packet only if it arrives on the interface used to reach the source; prevents loops.</dd>
<dt>Congestion</dt><dd>More traffic arrives than a link can send.</dd>
<dt>DSCP</dt><dd>6-bit class label in the IP header; EF 46 is the voice value.</dd>
<dt>MQC</dt><dd>Modular QoS CLI: class-map, policy-map, service-policy.</dd>
<dt>Trust boundary</dt><dd>The point where you stop believing marks from users and re-mark or accept them.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>IPv4 multicast range</td><td>224.0.0.0 to 239.255.255.255</td></tr>
<tr><td>Private-style multicast range</td><td>239.0.0.0/8 (administratively scoped)</td></tr>
<tr><td>Host to router protocol</td><td>IGMP</td></tr>
<tr><td>Router to router protocol</td><td>PIM (sparse mode in enterprises)</td></tr>
<tr><td>Voice DSCP</td><td>EF = 46</td></tr>
<tr><td>Voice targets</td><td>delay under 150 ms one way, jitter under 30 ms, loss under 1 percent</td></tr>
<tr><td>Where to mark</td><td>Input, at the trust boundary</td></tr>
<tr><td>Where to queue</td><td>Output, at the narrow link</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">ip multicast-routing
interface GigabitEthernet0/1
 ip pim sparse-mode
ip pim rp-address 2.2.2.2
class-map match-any VOICE
 match access-group name VOICE-RTP
policy-map MARK-IN
 class VOICE
  set dscp ef
interface GigabitEthernet0/0
 service-policy input MARK-IN</pre>
<pre class="out">show ip pim neighbor     show ip pim rp mapping     show ip igmp groups
show ip mroute 239.20.1.1     show class-map     show policy-map
show policy-map interface GigabitEthernet0/0 input</pre>
<p>On Junos the same ideas use different words. <i>Multicast:</i> <code>protocols pim</code> with <code>rp static address</code> and <code>protocols igmp</code>. <i>QoS:</i> classifiers, rewrite rules and schedulers under <code>class-of-service</code>. Later modules include a Junos note where it helps.</p>

<div class="warn"><p><b>Common mistakes to avoid in the exam.</b> Saying broadcast crosses routers; saying QoS adds bandwidth; marking on output at the LAN when traffic enters on input; forgetting that the RP must be the same on every router.</p></div>

<div class="exam"><p><b>Exam trap.</b> If a question describes a stream that works to some receivers and not others, think of the point where the tree splits: a missing PIM interface or a wrong RP on one branch.</p></div>

<div class="scn"><h4>Ready for the real job</h4><p>A trainee who finished this module joined a college network team. In week one a lecture hall lost its live feed. She started at the hall's router: <code>show ip igmp groups</code> showed the group, <code>show ip pim neighbor</code> showed one neighbour instead of two, and one uplink had lost its <code>ip pim sparse-mode</code> after a hardware swap. She added the line, saw the (S,G) entry return, and the feed came back in ten minutes.</p><p><b>Lesson:</b> a simple, repeatable method (receiver first, then neighbours, then RP, then mroute) solves most multicast faults. You already know it.</p></div>

<div class="iv"><p class="q">"Tell me what you know about multicast and QoS in two minutes."</p><p>Strong answer: multicast sends one stream to a group; hosts join with IGMP, routers build a tree with PIM and a rendezvous point, and the RPF check prevents loops. QoS handles congestion by classifying, marking with DSCP and treating traffic in queues, with voice as EF in a priority queue. Add one lab you ran and one command you used to verify it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast: one copy per link, hosts join with IGMP, routers build trees with PIM.</li>
<li>QoS: classify, mark, treat; it decides who waits, it does not add bandwidth.</li>
<li>MQC is class-map, policy-map and service-policy, the same everywhere.</li>
<li>Verify with show ip mroute and show policy-map interface; troubleshoot receiver first.</li>
<li>Next: mq-igmp for multicast and mq-mark for QoS, both building directly on this module.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module sirf basic IP jaankar shuru kiya tha. Ab aap samjha sakte ho ki ek stream kai receivers tak kaise pahunchti hai, busy link voice ko kyun nuksaan pahunchati hai, packet kaise classify aur mark hota hai, aur aapne dono simulator mein bana bhi liye. Yeh aakhri chapter sab kuch jodta hai, track mein aage kya hai batata hai aur khud ko test karne ke liye checklist deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Multicast and QoS track ka roadmap">
<rect x="10" y="10" width="620" height="34" rx="8" fill="#bbf7d0"/><text x="320" y="32" text-anchor="middle" class="svg-ink" font-size="14">mq-start: zero se pehli stream aur pehla mark (yeh module, free)</text>
<rect x="10" y="60" width="300" height="34" rx="8" fill="#bae6fd"/><text x="160" y="82" text-anchor="middle" class="svg-ink" font-size="13">mq-igmp: addressing, IGMP, snooping</text>
<rect x="330" y="60" width="300" height="34" rx="8" fill="#ddd6fe"/><text x="480" y="82" text-anchor="middle" class="svg-ink" font-size="13">mq-mark: classification, marking, trust</text>
<rect x="10" y="104" width="300" height="34" rx="8" fill="#bae6fd"/><text x="160" y="126" text-anchor="middle" class="svg-ink" font-size="13">mq-pim: PIM sparse mode aur SSM</text>
<rect x="330" y="104" width="300" height="34" rx="8" fill="#ddd6fe"/><text x="480" y="126" text-anchor="middle" class="svg-ink" font-size="13">mq-queue: CBWFQ, LLQ, WRED</text>
<rect x="10" y="148" width="300" height="34" rx="8" fill="#bae6fd"/><text x="160" y="170" text-anchor="middle" class="svg-ink" font-size="13">mq-rp: static, Auto-RP, BSR, anycast</text>
<rect x="330" y="148" width="300" height="34" rx="8" fill="#ddd6fe"/><text x="480" y="170" text-anchor="middle" class="svg-ink" font-size="13">mq-wan: policing, shaping, WAN edge</text>
<rect x="10" y="192" width="300" height="34" rx="8" fill="#bae6fd"/><text x="160" y="214" text-anchor="middle" class="svg-ink" font-size="13">mq-mroute: RPF aur mroute troubleshooting</text>
<rect x="330" y="192" width="300" height="34" rx="8" fill="#ddd6fe"/><text x="480" y="214" text-anchor="middle" class="svg-ink" font-size="13">mq-voice: voice aur video end to end</text>
</svg><p class="cap">Left column: multicast. Right column: QoS. Dono is module se shuru hote hain aur mq-voice mein milte hain.</p></div>

<h3>Ab aap kya kar sakte ho (checklist)</h3>
<ul>
<li>Unicast, broadcast aur multicast samjhao, aur batao multicast bandwidth kyun bachata hai.</li>
<li>Multicast group address pehchano (224.0.0.0/4, aur private use ke liye 239.x.x.x).</li>
<li>IGMP (host se router) aur PIM (router se router) ke roles batao.</li>
<li>Samjhao rendezvous point kya hai aur static RP configure karo.</li>
<li>(*,G) aur (S,G) entry padho: incoming interface, RPF neighbour, outgoing list, flags S, C, J aur T.</li>
<li>Congestion, queue, tail drop, delay, jitter aur loss samjhao.</li>
<li>Chaar traffic types ke naam batao aur har ek ko kya chahiye yeh batao.</li>
<li>Class-map, set dscp ef wala policy-map likho, aur service-policy input se apply karo.</li>
<li>show policy-map interface padho aur class-default samjhao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Group address</dt><dd>224.0.0.0/4 mein multicast destination address. Yeh group ko naam deta hai, host ko nahi.</dd>
<dt>IGMP</dt><dd>Protocol jisse host apne router ko batata hai ki use kaunse groups chahiye.</dd>
<dt>PIM sparse mode</dt><dd>Protocol jo routers multicast trees banane ke liye use karte hain, meeting point (RP) ke saath jab source abhi kisi ko pata nahi.</dd>
<dt>RP</dt><dd>Rendezvous point, woh router jahan sparse mode mein sources aur receivers milte hain.</dd>
<dt>mroute table</dt><dd>Multicast routing table, jisme (*,G) aur (S,G) state hoti hai.</dd>
<dt>RPF check</dt><dd>Multicast packet tabhi accept karo jab woh us interface par aaye jisse source tak pahunchte hain; loops rokta hai.</dd>
<dt>Congestion</dt><dd>Link ke bhejne se zyada traffic aana.</dd>
<dt>DSCP</dt><dd>IP header ka 6-bit class label; EF 46 voice ki value hai.</dd>
<dt>MQC</dt><dd>Modular QoS CLI: class-map, policy-map, service-policy.</dd>
<dt>Trust boundary</dt><dd>Woh point jahan aap users ke marks par bharosa karna band karte ho aur re-mark karte ho ya accept karte ho.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>IPv4 multicast range</td><td>224.0.0.0 se 239.255.255.255</td></tr>
<tr><td>Private-style multicast range</td><td>239.0.0.0/8 (administratively scoped)</td></tr>
<tr><td>Host se router protocol</td><td>IGMP</td></tr>
<tr><td>Router se router protocol</td><td>PIM (enterprises mein sparse mode)</td></tr>
<tr><td>Voice DSCP</td><td>EF = 46</td></tr>
<tr><td>Voice targets</td><td>one-way delay 150 ms se kam, jitter 30 ms se kam, loss 1 percent se kam</td></tr>
<tr><td>Mark kahan karein</td><td>Input par, trust boundary par</td></tr>
<tr><td>Queue kahan karein</td><td>Output par, patli link par</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">ip multicast-routing
interface GigabitEthernet0/1
 ip pim sparse-mode
ip pim rp-address 2.2.2.2
class-map match-any VOICE
 match access-group name VOICE-RTP
policy-map MARK-IN
 class VOICE
  set dscp ef
interface GigabitEthernet0/0
 service-policy input MARK-IN</pre>
<pre class="out">show ip pim neighbor     show ip pim rp mapping     show ip igmp groups
show ip mroute 239.20.1.1     show class-map     show policy-map
show policy-map interface GigabitEthernet0/0 input</pre>
<p>Junos par wahi ideas alag shabdon mein hain. <i>Multicast:</i> <code>protocols pim</code> ke saath <code>rp static address</code> aur <code>protocols igmp</code>. <i>QoS:</i> <code>class-of-service</code> ke andar classifiers, rewrite rules aur schedulers. Baad ke modules mein jahan madad kare wahan Junos note hai.</p>

<div class="warn"><p><b>Exam mein bachne wali common galtiyan.</b> Kehna ki broadcast routers paar karta hai; kehna ki QoS bandwidth badhata hai; LAN par output mein mark karna jabki traffic input par aata hai; yeh bhoolna ki RP har router par same hona chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Agar sawaal aisi stream batata hai jo kuch receivers ko chalti hai aur kuch ko nahi, to us point ke baare mein socho jahan tree split hota hai: ek branch par missing PIM interface ya galat RP.</p></div>

<div class="scn"><h4>Asli job ke liye taiyaar</h4><p>Is module ko khatam karne wali ek trainee ek college network team mein shamil hui. Pehle hafte mein ek lecture hall ka live feed chala gaya. Usne hall ke router se shuru kiya: <code>show ip igmp groups</code> ne group dikhaya, <code>show ip pim neighbor</code> ne do ke bajay ek neighbour dikhaya, aur hardware swap ke baad ek uplink ka <code>ip pim sparse-mode</code> chala gaya tha. Usne line add ki, (S,G) entry wapas aati dekhi, aur feed das minute mein laut aayi.</p><p><b>Seekh:</b> ek simple, repeatable method (pehle receiver, phir neighbours, phir RP, phir mroute) zyada tar multicast faults solve kar deta hai. Aap yeh pehle se jaante ho.</p></div>

<div class="iv"><p class="q">"Mujhe do minute mein multicast aur QoS ke baare mein jo aap jaante ho batao."</p><p>Strong answer: multicast ek stream ek group ko bhejta hai; hosts IGMP se join karte hain, routers PIM aur rendezvous point se tree banate hain, aur RPF check loops rokta hai. QoS congestion ko classify, DSCP se mark aur queues mein treat karke handle karta hai, voice EF ke roop mein priority queue mein. Ek lab jo aapne chalaya aur ek command jo verify ke liye use kiya, jodo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Multicast: har link par ek copy, hosts IGMP se join karte hain, routers PIM se trees banate hain.</li>
<li>QoS: classify, mark, treat; yeh decide karta hai kaun ruke, bandwidth add nahi karta.</li>
<li>MQC class-map, policy-map aur service-policy hai, har jagah same.</li>
<li>show ip mroute aur show policy-map interface se verify karo; pehle receiver se troubleshoot karo.</li>
<li>Aage: multicast ke liye mq-igmp aur QoS ke liye mq-mark, dono seedhe is module par bante hain.</li>
</ul></div>
`}};export{e as default};