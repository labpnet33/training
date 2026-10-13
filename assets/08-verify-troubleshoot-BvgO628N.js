var e={id:`verify-troubleshoot`,h:{en:`Verifying and troubleshooting QoS: a six-step workflow`,hi:`QoS verify aur troubleshoot karna: six-step workflow`},body:{en:`
<p>"The calls are choppy" is the most common QoS ticket, and also the least specific. A good engineer does not guess at the policy. She follows the packet through the same stages the router does: was it classified, which queue did it enter, was the queue congested, was the shaper right, and what DSCP left the box. At every stage there is one command that shows the truth.</p>

<h3>Analogy: a lost parcel in a courier network</h3>
<p>To trace a late parcel you check, in order: was it booked with the right service level (classification), was it loaded into the express van (queue), was the van stuck in traffic (congestion, drops), was the depot's gate speed the problem (shaper), and did the label survive to the next depot (marking)? QoS troubleshooting is parcel tracing.</p>

<h3>The six-step workflow</h3>
<ol>
<li><b>Define the symptom and the direction.</b> Which site, which flow, which direction (QoS acts on egress), which transport, when? A call that is bad only toward Mumbai is a problem on the sending edge's WAN interface.</li>
<li><b>Is the policy and configuration on the router?</b> Check the template push status in Manager, then on the edge: <code>show sdwan running-config</code> and <code>show running-config | section policy-map</code>. Look for the QoS policy map, the shape parent policy, and the <code>service-policy output</code> on the right WAN interface.</li>
<li><b>Is the traffic classified?</b> For a localized ACL: <code>show sdwan policy access-list-associations</code> (is the ACL on the LAN interface, inbound?) and <code>show sdwan policy access-list-counters</code> (are the counters of your sequence increasing?). For a data policy: <code>show sdwan policy from-vsmart</code> and <code>show sdwan policy data-policy-filter</code>.</li>
<li><b>Is it in the right queue and are there drops?</b> <code>show policy-map interface GigabitEthernet1</code>: the packet counter of the class you expect must grow, the offered and drop rates tell the story, and the "total drops" under the priority class is the police drops.</li>
<li><b>Is the shaper right?</b> In the same output, <code>target shape rate</code> must match the circuit. Compare with a speed test and with the interface utilisation graph.</li>
<li><b>What DSCP leaves the router?</b> <code>show sdwan policy rewrite-associations</code> shows where a rewrite rule is applied. To prove the actual marking, capture traffic on the WAN interface (Manager packet capture or embedded packet capture, see the sdw-ops module) and read the outer DSCP. If the router is right but the far side reports wrong values, the provider is re-marking.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="QoS troubleshooting stages">
<rect x="6" y="40" width="96" height="70" rx="8" fill="#fde68a"/><text x="54" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 Symptom</text><text x="54" y="86" text-anchor="middle" class="svg-muted" font-size="11">flow, direction</text>
<rect x="110" y="40" width="96" height="70" rx="8" fill="#fde68a"/><text x="158" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 Config</text><text x="158" y="86" text-anchor="middle" class="svg-muted" font-size="11">policy-map</text>
<rect x="214" y="40" width="96" height="70" rx="8" fill="#fde68a"/><text x="262" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Classify</text><text x="262" y="86" text-anchor="middle" class="svg-muted" font-size="11">ACL counters</text>
<rect x="318" y="40" width="96" height="70" rx="8" fill="#fde68a"/><text x="366" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 Queue</text><text x="366" y="86" text-anchor="middle" class="svg-muted" font-size="11">drops</text>
<rect x="422" y="40" width="96" height="70" rx="8" fill="#fde68a"/><text x="470" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 Shaper</text><text x="470" y="86" text-anchor="middle" class="svg-muted" font-size="11">target rate</text>
<rect x="526" y="40" width="104" height="70" rx="8" fill="#bbf7d0"/><text x="578" y="68" text-anchor="middle" class="svg-ink" font-size="12">6 Marking</text><text x="578" y="86" text-anchor="middle" class="svg-muted" font-size="11">outer DSCP</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Follow the packet: ingress, queue, shaper, wire</text>
</svg><p class="cap">The first stage whose evidence is wrong is the fault.</p></div>

<h3>Reading show policy-map interface</h3>
<p>This is the most important QoS command. A trimmed example from E-BLR-1 during a busy period:</p>
<pre class="out">E-BLR-1# show policy-map interface GigabitEthernet1
 GigabitEthernet1
  Service-policy output: shape_GigabitEthernet1
    Class-map: class-default (match-any)
      <span class="hl">target shape rate 19000000</span>
      Service-policy : QoS-Map
        queue stats for all priority classes:
          priority level 1
          <span class="hl">(total drops) 0</span>
        Class-map: Queue0 (match-any)
          61240 packets, 17147200 bytes
          Match: qos-group 0
          Priority: Strict, b/w exceed drops: 0
        Class-map: Queue4 (match-any)
          2209310 packets, 3180830400 bytes
          Match: qos-group 4
          <span class="hl">(queue depth/total drops/no-buffer drops) 64/412930/0</span>
        Class-map: class-default (match-any)
          118402 packets, 24132088 bytes</pre>
<p>Reading it: voice (Queue0) has traffic and no drops. The bulk class (Queue4) is full (depth 64, equal to its limit) with many drops, which is exactly what should happen to bulk when the circuit is saturated. Everything is as designed; if users complain, the cause is elsewhere (for example the application or the far side). If, instead, voice showed rising "b/w exceed drops", the LLQ percentage is too small for the load.</p>

<h3>Symptom to cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Evidence and fix</th></tr>
<tr><td>Voice counters at zero, but default class grows</td><td>Not classified: ACL not on the LAN interface, wrong direction, or DSCP not matched</td><td><code>access-list-associations</code> and counters; apply ACL inbound on the service interface</td></tr>
<tr><td>Everything in class-default</td><td>Class not mapped to a queue, or the QoS map lacks the scheduler</td><td>Check class map and QoS map; add an explicit DEFAULT class</td></tr>
<tr><td>No queue drops, but the provider drops</td><td>No shaper or shaper rate above the circuit</td><td>Set shaping rate in kbps at or below the circuit rate</td></tr>
<tr><td>Voice drops in the priority class</td><td>LLQ percent too small, duplication not counted, user traffic marked 46</td><td><code>b/w exceed drops</code>; resize and re-mark untrusted traffic</td></tr>
<tr><td>Voice fine on MPLS, poor on the other path</td><td>QoS map missing on that interface, or internet ignores DSCP</td><td>Apply the map and shaper on every WAN interface</td></tr>
<tr><td>Provider's class stays idle</td><td>Rewrite rule missing or DSCP does not match their table</td><td><code>rewrite-associations</code>, capture outer DSCP</td></tr>
<tr><td>Template push fails</td><td>Name mismatch between class, scheduler, rewrite rule or policer</td><td>Read the push error, fix references, re-attach</td></tr>
<tr><td>Hub: one spoke is slow after enabling per-tunnel QoS</td><td>Spoke downstream bandwidth too low or missing</td><td>Check <code>bandwidth-downstream</code> on the spoke</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "calls from Pune to Delhi are choppy at 11:00, fine at night." The engineer checks the Pune edge. The WAN interface has the shaper at 19000000 and the voice class Queue0 shows zero packets while class-default has 30,000. Classification is failing. <code>show sdwan policy access-list-associations</code> shows ACL-CLASSIFY applied on the LAN interface in the <b>out</b> direction. A classifying ACL must be applied <b>in</b>. The template is corrected, the counters of sequence 10 start to grow, the voice class fills, and the calls are clean at 11:00 the next day.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Looking at the receiving edge: QoS acts on egress, so check the sender. (2) Testing with a ping, which is tiny and never congests; use a realistic load test such as a speed test while a call is active. (3) Changing queue weights without first proving the traffic is in that queue. (4) Disabling QoS to test and forgetting to re-enable.</p></div>

<div class="exam"><p><b>Exam trap.</b> The commands to know: <code>show policy-map interface</code> (queue stats), <code>show sdwan policy access-list-associations</code>, <code>access-list-counters</code>, <code>access-list-names</code>, <code>access-list-policers</code>, <code>rewrite-associations</code>, <code>show sdwan policy data-policy-filter</code>, <code>show sdwan policy from-vsmart</code> and <code>show sdwan app-route stats</code>. The packet's DSCP leaving the box must be verified by a capture.</p></div>

<div class="scn"><h4>QoS map applied to the wrong interface</h4><p>At the Hyderabad branch the MPLS circuit carried the main traffic, but the QoS map and shaper had been attached to GigabitEthernet1 (internet) in the template while MPLS was GigabitEthernet2. During an outage of the internet circuit the voice calls moved to MPLS by AAR and immediately became choppy. <code>show policy-map interface GigabitEthernet2</code> returned no service policy. The template fix added the QoS map, rewrite rule and shaper to both WAN interfaces.</p><p><b>Lesson:</b> QoS must exist on every transport interface that AAR can use.</p></div>

<div class="iv"><p class="q">"Users say voice is poor. How do you prove whether QoS is the problem?"</p><p>I trace the packet through the edge that sends it: confirm the policy is on the interface, check ACL or data policy counters to prove classification, read <code>show policy-map interface</code> for the voice class counters and drops, confirm the shaper's target rate equals the circuit, and capture on the WAN interface to read the outer DSCP. Then I check the AAR statistics for loss, latency and jitter on the path. The first stage whose evidence is wrong is the fault.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot the sender: QoS acts on egress.</li>
<li>Six stages: symptom, config, classification, queue, shaper, marking.</li>
<li><code>show policy-map interface</code> shows class counters, drops, queue depth and target shape rate.</li>
<li>ACL commands under <code>show sdwan policy</code> prove classification and application.</li>
<li>Prove the outgoing DSCP with a capture; apply QoS on every transport interface.</li>
</ul></div>
`,hi:`
<p>"Calls choppy hain" sabse aam QoS ticket hai, aur sabse kam specific bhi. Achha engineer policy ke baare mein andaza nahi lagata. Woh packet ko usi stages se follow karta hai jinse router guzarta hai: kya classify hua, kaunsi queue mein gaya, kya queue congested thi, kya shaper sahi tha, aur box se kaunsa DSCP nikla. Har stage par ek command hai jo sach dikhata hai.</p>

<h3>Analogy: courier network mein khoya parcel</h3>
<p>Late parcel ko trace karne ke liye aap order mein check karte ho: kya sahi service level se book hua (classification), kya express van mein load hua (queue), kya van traffic mein phansi (congestion, drops), kya depot ke gate ki speed problem thi (shaper), aur kya label agle depot tak bacha (marking)? QoS troubleshooting parcel tracing hai.</p>

<h3>Six-step workflow</h3>
<ol>
<li><b>Symptom aur direction define karo.</b> Kaunsi site, kaunsa flow, kaunsi direction (QoS egress par kaam karta hai), kaunsa transport, kab? Jo call sirf Mumbai ki taraf kharab hai woh bhejne wale edge ke WAN interface ki problem hai.</li>
<li><b>Kya policy aur configuration router par hai?</b> Manager mein template push status dekho, phir edge par: <code>show sdwan running-config</code> aur <code>show running-config | section policy-map</code>. QoS policy map, shape parent policy, aur sahi WAN interface par <code>service-policy output</code> dhundo.</li>
<li><b>Kya traffic classify ho raha hai?</b> Localized ACL ke liye: <code>show sdwan policy access-list-associations</code> (kya ACL LAN interface par, inbound hai?) aur <code>show sdwan policy access-list-counters</code> (kya aapke sequence ke counters badh rahe hain?). Data policy ke liye: <code>show sdwan policy from-vsmart</code> aur <code>show sdwan policy data-policy-filter</code>.</li>
<li><b>Kya sahi queue mein hai aur drops hain?</b> <code>show policy-map interface GigabitEthernet1</code>: jis class ki ummeed hai uska packet counter badhna chahiye, offered aur drop rates kahani batate hain, aur priority class ke neeche "total drops" police drops hain.</li>
<li><b>Kya shaper sahi hai?</b> Usi output mein <code>target shape rate</code> circuit se match karna chahiye. Speed test aur interface utilisation graph se compare karo.</li>
<li><b>Router se kaunsa DSCP nikalta hai?</b> <code>show sdwan policy rewrite-associations</code> dikhata hai rewrite rule kahan lagi hai. Asli marking saabit karne ke liye WAN interface par traffic capture karo (Manager packet capture ya embedded packet capture, sdw-ops module dekho) aur outer DSCP padho. Agar router sahi hai lekin door ka side galat values report kare to provider re-mark kar raha hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="QoS troubleshooting stages">
<rect x="6" y="40" width="96" height="70" rx="8" fill="#fde68a"/><text x="54" y="68" text-anchor="middle" class="svg-ink" font-size="12">1 Symptom</text><text x="54" y="86" text-anchor="middle" class="svg-muted" font-size="11">flow, direction</text>
<rect x="110" y="40" width="96" height="70" rx="8" fill="#fde68a"/><text x="158" y="68" text-anchor="middle" class="svg-ink" font-size="12">2 Config</text><text x="158" y="86" text-anchor="middle" class="svg-muted" font-size="11">policy-map</text>
<rect x="214" y="40" width="96" height="70" rx="8" fill="#fde68a"/><text x="262" y="68" text-anchor="middle" class="svg-ink" font-size="12">3 Classify</text><text x="262" y="86" text-anchor="middle" class="svg-muted" font-size="11">ACL counters</text>
<rect x="318" y="40" width="96" height="70" rx="8" fill="#fde68a"/><text x="366" y="68" text-anchor="middle" class="svg-ink" font-size="12">4 Queue</text><text x="366" y="86" text-anchor="middle" class="svg-muted" font-size="11">drops</text>
<rect x="422" y="40" width="96" height="70" rx="8" fill="#fde68a"/><text x="470" y="68" text-anchor="middle" class="svg-ink" font-size="12">5 Shaper</text><text x="470" y="86" text-anchor="middle" class="svg-muted" font-size="11">target rate</text>
<rect x="526" y="40" width="104" height="70" rx="8" fill="#bbf7d0"/><text x="578" y="68" text-anchor="middle" class="svg-ink" font-size="12">6 Marking</text><text x="578" y="86" text-anchor="middle" class="svg-muted" font-size="11">outer DSCP</text>
<text x="320" y="150" text-anchor="middle" class="svg-accent" font-size="12">Packet ko follow karo: ingress, queue, shaper, wire</text>
</svg><p class="cap">Jis pehle stage ka evidence galat hai, wahi fault hai.</p></div>

<h3>show policy-map interface padhna</h3>
<p>Yeh sabse zaroori QoS command hai. Busy period mein E-BLR-1 ka trimmed example:</p>
<pre class="out">E-BLR-1# show policy-map interface GigabitEthernet1
 GigabitEthernet1
  Service-policy output: shape_GigabitEthernet1
    Class-map: class-default (match-any)
      <span class="hl">target shape rate 19000000</span>
      Service-policy : QoS-Map
        queue stats for all priority classes:
          priority level 1
          <span class="hl">(total drops) 0</span>
        Class-map: Queue0 (match-any)
          61240 packets, 17147200 bytes
          Match: qos-group 0
          Priority: Strict, b/w exceed drops: 0
        Class-map: Queue4 (match-any)
          2209310 packets, 3180830400 bytes
          Match: qos-group 4
          <span class="hl">(queue depth/total drops/no-buffer drops) 64/412930/0</span>
        Class-map: class-default (match-any)
          118402 packets, 24132088 bytes</pre>
<p>Padhna: voice (Queue0) mein traffic hai aur drops nahi. Bulk class (Queue4) full hai (depth 64, apni limit ke barabar) aur bahut drops hain, jo circuit saturate hone par bulk ke saath hona hi chahiye. Sab design ke mutabik hai; agar users shikayat karte hain to wajah kahin aur hai (jaise application ya door ka side). Agar voice mein "b/w exceed drops" badhte dikhein to LLQ percentage load ke liye chhota hai.</p>

<h3>Symptom se cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit cause</th><th>Evidence aur fix</th></tr>
<tr><td>Voice counters zero, lekin default class badh rahi hai</td><td>Classify nahi hua: ACL LAN interface par nahi, galat direction, ya DSCP match nahi hua</td><td><code>access-list-associations</code> aur counters; ACL service interface par inbound lagao</td></tr>
<tr><td>Sab kuch class-default mein</td><td>Class queue se map nahi, ya QoS map mein scheduler nahi</td><td>Class map aur QoS map check karo; explicit DEFAULT class jodo</td></tr>
<tr><td>Queue drops nahi, lekin provider drop karta hai</td><td>Shaper nahi ya shaper rate circuit se upar</td><td>Shaping rate kbps mein circuit rate ya usse neeche set karo</td></tr>
<tr><td>Priority class mein voice drops</td><td>LLQ percent chhota, duplication gina nahi, user traffic 46 mark</td><td><code>b/w exceed drops</code>; resize karo aur untrusted traffic re-mark karo</td></tr>
<tr><td>MPLS par voice theek, dusre path par kharab</td><td>Us interface par QoS map nahi, ya internet DSCP ignore karta hai</td><td>Har WAN interface par map aur shaper lagao</td></tr>
<tr><td>Provider ki class idle rehti hai</td><td>Rewrite rule nahi ya DSCP unki table se match nahi</td><td><code>rewrite-associations</code>, outer DSCP capture karo</td></tr>
<tr><td>Template push fail</td><td>Class, scheduler, rewrite rule ya policer ke beech naam mismatch</td><td>Push error padho, references theek karo, re-attach</td></tr>
<tr><td>Hub: per-tunnel QoS ke baad ek spoke slow</td><td>Spoke ka downstream bandwidth bahut kam ya missing</td><td>Spoke par <code>bandwidth-downstream</code> check karo</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Ticket: "Pune se Delhi calls 11:00 baje choppy, raat ko theek." Engineer Pune edge check karta hai. WAN interface par shaper 19000000 hai aur voice class Queue0 mein zero packets hain jabki class-default mein 30,000. Classification fail ho rahi hai. <code>show sdwan policy access-list-associations</code> dikhata hai ki ACL-CLASSIFY LAN interface par <b>out</b> direction mein laga hai. Classify karne wala ACL <b>in</b> lagna chahiye. Template theek kiya jaata hai, sequence 10 ke counters badhne lagte hain, voice class bharti hai, aur agle din 11:00 par calls saaf hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Receiving edge dekhna: QoS egress par kaam karta hai, to sender check karo. (2) Ping se test karna, jo chhota hai aur kabhi congest nahi karta; realistic load test use karo jaise call chalte hue speed test. (3) Pehle saabit kiye bina ki traffic us queue mein hai, queue weights badalna. (4) Test ke liye QoS disable karke wapas enable karna bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Yaad rakhne wale commands: <code>show policy-map interface</code> (queue stats), <code>show sdwan policy access-list-associations</code>, <code>access-list-counters</code>, <code>access-list-names</code>, <code>access-list-policers</code>, <code>rewrite-associations</code>, <code>show sdwan policy data-policy-filter</code>, <code>show sdwan policy from-vsmart</code> aur <code>show sdwan app-route stats</code>. Box se nikalte packet ka DSCP capture se verify hota hai.</p></div>

<div class="scn"><h4>QoS map galat interface par lagi</h4><p>Hyderabad branch mein MPLS circuit mukhya traffic le jaata tha, lekin template mein QoS map aur shaper GigabitEthernet1 (internet) par lage the jabki MPLS GigabitEthernet2 tha. Internet circuit ke outage mein AAR ne voice calls MPLS par moved ki aur woh turant choppy ho gayin. <code>show policy-map interface GigabitEthernet2</code> ne koi service policy nahi dikhayi. Template fix ne dono WAN interfaces par QoS map, rewrite rule aur shaper joda.</p><p><b>Lesson:</b> QoS har us transport interface par hona chahiye jise AAR use kar sakta hai.</p></div>

<div class="iv"><p class="q">"Users kehte hain voice kharab hai. Kaise saabit karoge ki QoS problem hai ya nahi?"</p><p>Main packet ko us edge se trace karta hoon jo use bhejta hai: confirm karta hoon policy interface par hai, ACL ya data policy counters se classification saabit karta hoon, voice class ke counters aur drops ke liye <code>show policy-map interface</code> padhta hoon, confirm karta hoon ki shaper ka target rate circuit ke barabar hai, aur WAN interface par capture karke outer DSCP padhta hoon. Phir path par loss, latency aur jitter ke liye AAR statistics dekhta hoon. Jis pehle stage ka evidence galat hai wahi fault hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Sender ko troubleshoot karo: QoS egress par kaam karta hai.</li>
<li>Chhe stages: symptom, config, classification, queue, shaper, marking.</li>
<li><code>show policy-map interface</code> class counters, drops, queue depth aur target shape rate dikhata hai.</li>
<li><code>show sdwan policy</code> ke neeche ACL commands classification aur application saabit karte hain.</li>
<li>Nikalte DSCP ko capture se saabit karo; har transport interface par QoS lagao.</li>
</ul></div>
`}};export{e as default};