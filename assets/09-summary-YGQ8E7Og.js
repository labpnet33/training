var e={id:`summary`,h:{en:`Summary, cheat sheet and exam checklist`,hi:`Summary, cheat sheet aur exam checklist`},body:{en:`
<p>You started this module with a crowded road and finish it with a complete traffic plan for a WAN edge. This chapter pulls everything together: what you can now do, the vocabulary, the facts that exams like to test, and a cheat sheet of configuration and commands to keep beside you.</p>

<h3>The whole module in one picture</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="QoS pipeline summary">
<rect x="6" y="50" width="110" height="80" rx="8" fill="#bae6fd"/><text x="61" y="80" text-anchor="middle" class="svg-ink" font-size="13">Classify</text><text x="61" y="98" text-anchor="middle" class="svg-muted" font-size="11">ACL or data policy</text><text x="61" y="114" text-anchor="middle" class="svg-muted" font-size="11">trust boundary</text>
<rect x="130" y="50" width="110" height="80" rx="8" fill="#ddd6fe"/><text x="185" y="80" text-anchor="middle" class="svg-ink" font-size="13">Queue</text><text x="185" y="98" text-anchor="middle" class="svg-muted" font-size="11">class map, 8 queues</text><text x="185" y="114" text-anchor="middle" class="svg-muted" font-size="11">LLQ, WRR, RED</text>
<rect x="254" y="50" width="110" height="80" rx="8" fill="#fde68a"/><text x="309" y="80" text-anchor="middle" class="svg-ink" font-size="13">Shape</text><text x="309" y="98" text-anchor="middle" class="svg-muted" font-size="11">parent shaper</text><text x="309" y="114" text-anchor="middle" class="svg-muted" font-size="11">per-tunnel at hub</text>
<rect x="378" y="50" width="110" height="80" rx="8" fill="#fed7aa"/><text x="433" y="80" text-anchor="middle" class="svg-ink" font-size="13">Rewrite</text><text x="433" y="98" text-anchor="middle" class="svg-muted" font-size="11">DSCP for provider</text><text x="433" y="114" text-anchor="middle" class="svg-muted" font-size="11">outer IPsec header</text>
<rect x="502" y="50" width="128" height="80" rx="8" fill="#bbf7d0"/><text x="566" y="80" text-anchor="middle" class="svg-ink" font-size="13">Verify</text><text x="566" y="98" text-anchor="middle" class="svg-muted" font-size="11">show policy-map</text><text x="566" y="114" text-anchor="middle" class="svg-muted" font-size="11">capture, AAR stats</text>
<line x1="116" y1="90" x2="130" y2="90" stroke="#64748b" stroke-width="2"/><line x1="240" y1="90" x2="254" y2="90" stroke="#64748b" stroke-width="2"/><line x1="364" y1="90" x2="378" y2="90" stroke="#64748b" stroke-width="2"/><line x1="488" y1="90" x2="502" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">Mark once, queue by class, shape to the circuit, rewrite for the provider</text>
</svg><p class="cap">The QoS pipeline on a Catalyst SD-WAN edge, from LAN ingress to the WAN wire.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why a WAN link needs QoS and how it differs from application-aware routing.</li>
<li>Name the DSCP values for voice (46), video (34), critical data (18), bulk (8) and default (0).</li>
<li>Classify traffic with a localized ACL (class, DSCP) and with a centralized data policy (app-list, set DSCP, forwarding class).</li>
<li>Build the objects: class map, QoS scheduler, QoS map, rewrite rule, policer, and attach them in the VPN Interface Ethernet template.</li>
<li>Explain the eight queues, LLQ on queue 0, WRR on 1 to 7, queue 2 as default, tail drop versus RED.</li>
<li>Configure and explain the shaping rate and the parent and child policy maps.</li>
<li>Configure per-tunnel QoS with <code>tunnel-qos hub</code>, <code>tunnel-qos spoke</code> and <code>bandwidth-downstream</code>, and state its restrictions.</li>
<li>Explain how DSCP crosses IPsec and an MPLS provider, and write a rewrite rule for it.</li>
<li>Size voice and video with real numbers, including duplication.</li>
<li>Verify with <code>show policy-map interface</code> and the <code>show sdwan policy</code> commands, and troubleshoot in six steps.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>QoS</dt><dd>Quality of Service: giving different traffic different treatment when a link is congested.</dd>
<dt>DSCP</dt><dd>6-bit marking in the IP header that selects a per-hop behaviour.</dd>
<dt>Forwarding class</dt><dd>A router-local name for a traffic class, mapped to a queue.</dd>
<dt>LLQ</dt><dd>Low-latency queuing: strict-priority queue, queue 0 in SD-WAN.</dd>
<dt>WRR</dt><dd>Weighted round robin: queues share bandwidth in proportion to their weights.</dd>
<dt>RED</dt><dd>Random early detection: drops packets early to slow TCP gradually.</dd>
<dt>PLP</dt><dd>Packet loss priority (low or high), set by a policer; used by RED and rewrite rules.</dd>
<dt>Shaper</dt><dd>Delays traffic to hold an output rate; policer drops or remarks excess.</dd>
<dt>HQoS</dt><dd>Hierarchical QoS: parent shaper with a child queuing policy.</dd>
<dt>Per-tunnel QoS</dt><dd>A hub shapes and queues each spoke tunnel separately, using the spoke's downstream bandwidth.</dd>
<dt>Rewrite rule</dt><dd>Egress DSCP and CoS rewriting by class and PLP.</dd>
<dt>Trust boundary</dt><dd>The point where received markings are no longer believed and are reset.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Queues</td><td>8 queues (0 to 7); queue 0 = LLQ + control traffic, tail drop; queues 1 to 7 WRR; default queue is 2</td></tr>
<tr><td>Policy type</td><td>QoS is a localized policy; classification can be a localized ACL or a centralized data policy</td></tr>
<tr><td>ACL</td><td>Applied inbound on the service side; default drops unmatched packets unless <code>default-action accept</code></td></tr>
<tr><td>Shaping</td><td>Egress only, per interface in kbps; creates the congestion on your router; VLAN subinterfaces unsupported</td></tr>
<tr><td>Policer</td><td>Rate in bps, burst minimum 15,000 bytes; exceed drop or remark; 250 ms burst calculation</td></tr>
<tr><td>Rewrite</td><td>Applied on the egress WAN interface; changes the outer DSCP by class and PLP</td></tr>
<tr><td>Per-tunnel QoS</td><td>Hub-to-spoke only; IOS XE hubs; not on cellular; spokes publish downstream bandwidth via OMP</td></tr>
<tr><td>Internet</td><td>DSCP is normally not honoured between networks; MPLS providers honour their own class table</td></tr>
<tr><td>Duplication</td><td>Doubles the bandwidth of duplicated traffic; FEC adds parity overhead</td></tr></table>

<h3>Command and configuration cheat sheet</h3>
<pre class="code"><span class="c">! Manager: Configuration &gt; Policies &gt; Localized Policy</span>
policy
 class-map
  class VOICE queue 0
 !
 qos-scheduler VOICE-SCH
  class VOICE
  bandwidth-percent 20
  buffer-percent 20
  scheduling llq
  drops tail-drop
 !
 qos-map QOS-5Q
  qos-scheduler VOICE-SCH
 !
 rewrite-rule RW-TO-MPLS
  class VOICE low dscp 46
 !
!
<span class="c">! per-tunnel QoS</span>
sdwan interface GigabitEthernet1 tunnel-interface tunnel-qos hub|spoke
<span class="c">! verification</span>
show policy-map interface GigabitEthernet1
show sdwan policy access-list-associations
show sdwan policy access-list-counters
show sdwan policy rewrite-associations
show sdwan policy data-policy-filter
show sdwan app-route stats</pre>

<div class="eg"><p><b>Worked example.</b> Final exam-style calculation: a 100 Mbps shaped link, LLQ 20 percent, other queues ratio 40:30:20:10 for the remaining 80 Mbps. Voice limit 20 Mbps; the first WRR queue gets 80 x 40/100 = 32 Mbps, the second 24, the third 16, the fourth 8. If the second queue is idle, the other three share its 24 Mbps in proportion 40:20:10 (total 70), so the first gets 32 + 24 x 40/70 = about 45.7 Mbps.</p></div>

<div class="warn"><p><b>Common mistake.</b> Memorising commands without understanding the order of the stages. In an interview, explain the path of a packet: classify, queue, shape, rewrite, verify.</p></div>

<div class="exam"><p><b>Exam trap.</b> Read each question for the word <i>localized</i>, <i>centralized</i>, <i>ingress</i> or <i>egress</i>. Classification is at ingress on the service side; queuing, shaping and rewrite are at egress on the WAN interface.</p></div>

<div class="scn"><h4>The final design review</h4><p>Before opening a new Bharat Retail branch, the team reviewed the QoS design with a checklist: trust boundary defined at the phone VLAN, ACL inbound on the LAN with default accept, five classes with LLQ at 20 percent, shaping rate 95 percent of the circuit on both WAN interfaces, a rewrite rule per provider, per-tunnel QoS on the hub, and a capture plan to confirm DSCP. The branch went live with no QoS ticket in its first quarter.</p><p><b>Lesson:</b> a short checklist beats a long troubleshooting session.</p></div>

<div class="iv"><p class="q">"Walk me through QoS on a Catalyst SD-WAN edge, end to end."</p><p>At the LAN I classify traffic and decide the trust boundary, using an ACL or a data policy to set a forwarding class and DSCP. The class map sends each class to one of eight queues; queue 0 is the low-latency queue. Schedulers define bandwidth, buffer and drop type, grouped in a QoS map. On the WAN interface a parent shaper at the circuit rate makes the congestion happen on my router, and a rewrite rule adapts the outer DSCP to the provider. At the hub, per-tunnel QoS shapes each spoke. I verify with show policy-map interface and a capture.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Mark once at ingress, queue by class, shape to the circuit, rewrite for the provider.</li>
<li>Eight queues: Q0 LLQ with tail drop, Q1 to Q7 WRR, default Q2.</li>
<li>Per-tunnel QoS is hub-to-spoke only and uses the spoke's downstream bandwidth.</li>
<li>Verify with <code>show policy-map interface</code> and the <code>show sdwan policy</code> family.</li>
<li>Next: operations, monitoring and upgrades in the sdw-ops module.</li>
</ul></div>
`,hi:`
<p>Is module ki shuruaat aapne bheed bhari sadak se ki thi aur ant WAN edge ke poore traffic plan par kar rahe ho. Yeh chapter sab kuch jodta hai: ab aap kya kar sakte ho, vocabulary, woh facts jo exams test karna pasand karte hain, aur configuration aur commands ki cheat sheet jo aapke saath rakhni chahiye.</p>

<h3>Poora module ek picture mein</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="QoS pipeline summary">
<rect x="6" y="50" width="110" height="80" rx="8" fill="#bae6fd"/><text x="61" y="80" text-anchor="middle" class="svg-ink" font-size="13">Classify</text><text x="61" y="98" text-anchor="middle" class="svg-muted" font-size="11">ACL ya data policy</text><text x="61" y="114" text-anchor="middle" class="svg-muted" font-size="11">trust boundary</text>
<rect x="130" y="50" width="110" height="80" rx="8" fill="#ddd6fe"/><text x="185" y="80" text-anchor="middle" class="svg-ink" font-size="13">Queue</text><text x="185" y="98" text-anchor="middle" class="svg-muted" font-size="11">class map, 8 queues</text><text x="185" y="114" text-anchor="middle" class="svg-muted" font-size="11">LLQ, WRR, RED</text>
<rect x="254" y="50" width="110" height="80" rx="8" fill="#fde68a"/><text x="309" y="80" text-anchor="middle" class="svg-ink" font-size="13">Shape</text><text x="309" y="98" text-anchor="middle" class="svg-muted" font-size="11">parent shaper</text><text x="309" y="114" text-anchor="middle" class="svg-muted" font-size="11">hub par per-tunnel</text>
<rect x="378" y="50" width="110" height="80" rx="8" fill="#fed7aa"/><text x="433" y="80" text-anchor="middle" class="svg-ink" font-size="13">Rewrite</text><text x="433" y="98" text-anchor="middle" class="svg-muted" font-size="11">provider ke liye DSCP</text><text x="433" y="114" text-anchor="middle" class="svg-muted" font-size="11">outer IPsec header</text>
<rect x="502" y="50" width="128" height="80" rx="8" fill="#bbf7d0"/><text x="566" y="80" text-anchor="middle" class="svg-ink" font-size="13">Verify</text><text x="566" y="98" text-anchor="middle" class="svg-muted" font-size="11">show policy-map</text><text x="566" y="114" text-anchor="middle" class="svg-muted" font-size="11">capture, AAR stats</text>
<line x1="116" y1="90" x2="130" y2="90" stroke="#64748b" stroke-width="2"/><line x1="240" y1="90" x2="254" y2="90" stroke="#64748b" stroke-width="2"/><line x1="364" y1="90" x2="378" y2="90" stroke="#64748b" stroke-width="2"/><line x1="488" y1="90" x2="502" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="180" text-anchor="middle" class="svg-accent" font-size="12">Ek baar mark, class se queue, circuit par shape, provider ke liye rewrite</text>
</svg><p class="cap">Catalyst SD-WAN edge par QoS pipeline, LAN ingress se WAN wire tak.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjha sako ki WAN link ko QoS kyun chahiye aur yeh application-aware routing se kaise alag hai.</li>
<li>Voice (46), video (34), critical data (18), bulk (8) aur default (0) ke DSCP values batao.</li>
<li>Localized ACL (class, DSCP) aur centralized data policy (app-list, set DSCP, forwarding class) se traffic classify karo.</li>
<li>Objects banao: class map, QoS scheduler, QoS map, rewrite rule, policer, aur VPN Interface Ethernet template mein attach karo.</li>
<li>Aath queues, queue 0 par LLQ, 1 se 7 par WRR, queue 2 default, tail drop versus RED samjhao.</li>
<li>Shaping rate aur parent aur child policy maps configure karo aur samjhao.</li>
<li><code>tunnel-qos hub</code>, <code>tunnel-qos spoke</code> aur <code>bandwidth-downstream</code> se per-tunnel QoS configure karo aur uski restrictions batao.</li>
<li>Samjhao DSCP IPsec aur MPLS provider se kaise guzarta hai, aur uske liye rewrite rule likho.</li>
<li>Duplication samet voice aur video ko real numbers se size karo.</li>
<li><code>show policy-map interface</code> aur <code>show sdwan policy</code> commands se verify karo, aur chhe steps mein troubleshoot karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>QoS</dt><dd>Quality of Service: link congested ho to alag traffic ko alag treatment dena.</dd>
<dt>DSCP</dt><dd>IP header ka 6-bit marking jo per-hop behaviour chunta hai.</dd>
<dt>Forwarding class</dt><dd>Traffic class ka router-local naam, queue se map hota hai.</dd>
<dt>LLQ</dt><dd>Low-latency queuing: strict-priority queue, SD-WAN mein queue 0.</dd>
<dt>WRR</dt><dd>Weighted round robin: queues apne weights ke anupaat mein bandwidth baantti hain.</dd>
<dt>RED</dt><dd>Random early detection: packets pehle drop karta hai taaki TCP dheere slow ho.</dd>
<dt>PLP</dt><dd>Packet loss priority (low ya high), policer set karta hai; RED aur rewrite rules use karte hain.</dd>
<dt>Shaper</dt><dd>Output rate rakhne ke liye traffic delay karta hai; policer excess drop ya remark karta hai.</dd>
<dt>HQoS</dt><dd>Hierarchical QoS: parent shaper aur child queuing policy.</dd>
<dt>Per-tunnel QoS</dt><dd>Hub har spoke tunnel ko alag shape aur queue karta hai, spoke ke downstream bandwidth se.</dd>
<dt>Rewrite rule</dt><dd>Class aur PLP ke hisaab se egress DSCP aur CoS rewrite.</dd>
<dt>Trust boundary</dt><dd>Woh point jahan aaye hue markings par bharosa nahi kiya jaata aur reset kiye jaate hain.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Queues</td><td>8 queues (0 se 7); queue 0 = LLQ + control traffic, tail drop; queues 1 se 7 WRR; default queue 2</td></tr>
<tr><td>Policy type</td><td>QoS localized policy hai; classification localized ACL ya centralized data policy se ho sakti hai</td></tr>
<tr><td>ACL</td><td>Service side par inbound lagta hai; jab tak <code>default-action accept</code> na ho, unmatched packets drop</td></tr>
<tr><td>Shaping</td><td>Sirf egress, interface ke hisaab se kbps mein; aapke router par congestion banata hai; VLAN subinterfaces unsupported</td></tr>
<tr><td>Policer</td><td>Rate bps mein, burst minimum 15,000 bytes; exceed drop ya remark; 250 ms burst calculation</td></tr>
<tr><td>Rewrite</td><td>Egress WAN interface par lagta hai; class aur PLP se outer DSCP badalta hai</td></tr>
<tr><td>Per-tunnel QoS</td><td>Sirf hub-to-spoke; IOS XE hubs; cellular par nahi; spokes downstream bandwidth OMP se publish karte hain</td></tr>
<tr><td>Internet</td><td>DSCP aam taur par networks ke beech nahi maana jaata; MPLS providers apni class table maante hain</td></tr>
<tr><td>Duplication</td><td>Duplicate kiye traffic ka bandwidth double; FEC parity overhead jodta hai</td></tr></table>

<h3>Command aur configuration cheat sheet</h3>
<pre class="code"><span class="c">! Manager: Configuration &gt; Policies &gt; Localized Policy</span>
policy
 class-map
  class VOICE queue 0
 !
 qos-scheduler VOICE-SCH
  class VOICE
  bandwidth-percent 20
  buffer-percent 20
  scheduling llq
  drops tail-drop
 !
 qos-map QOS-5Q
  qos-scheduler VOICE-SCH
 !
 rewrite-rule RW-TO-MPLS
  class VOICE low dscp 46
 !
!
<span class="c">! per-tunnel QoS</span>
sdwan interface GigabitEthernet1 tunnel-interface tunnel-qos hub|spoke
<span class="c">! verification</span>
show policy-map interface GigabitEthernet1
show sdwan policy access-list-associations
show sdwan policy access-list-counters
show sdwan policy rewrite-associations
show sdwan policy data-policy-filter
show sdwan app-route stats</pre>

<div class="eg"><p><b>Worked example.</b> Final exam-style calculation: 100 Mbps shaped link, LLQ 20 percent, baaki 80 Mbps ke liye doosri queues ratio 40:30:20:10. Voice limit 20 Mbps; pehli WRR queue ko 80 x 40/100 = 32 Mbps, doosri ko 24, teesri ko 16, chauthi ko 8. Agar doosri queue idle hai to baaki teen uske 24 Mbps ko 40:20:10 (total 70) ke anupaat mein baantte hain, to pehli ko 32 + 24 x 40/70 = lagbhag 45.7 Mbps.</p></div>

<div class="warn"><p><b>Common mistake.</b> Stages ka order samjhe bina commands ratna. Interview mein packet ka path samjhao: classify, queue, shape, rewrite, verify.</p></div>

<div class="exam"><p><b>Exam trap.</b> Har sawal mein <i>localized</i>, <i>centralized</i>, <i>ingress</i> ya <i>egress</i> shabd dhyan se padho. Classification service side par ingress mein hoti hai; queuing, shaping aur rewrite WAN interface par egress mein.</p></div>

<div class="scn"><h4>Final design review</h4><p>Naya Bharat Retail branch kholne se pehle team ne QoS design ko checklist se review kiya: phone VLAN par trust boundary define, LAN par inbound ACL default accept ke saath, LLQ 20 percent wali paanch classes, dono WAN interfaces par circuit ka 95 percent shaping rate, har provider ke liye rewrite rule, hub par per-tunnel QoS, aur DSCP confirm karne ka capture plan. Branch live hui aur pehli quarter mein koi QoS ticket nahi aaya.</p><p><b>Lesson:</b> chhoti checklist lambe troubleshooting session se behtar hai.</p></div>

<div class="iv"><p class="q">"Catalyst SD-WAN edge par QoS shuru se ant tak samjhao."</p><p>LAN par main traffic classify karta hoon aur trust boundary tay karta hoon, ACL ya data policy se forwarding class aur DSCP set karke. Class map har class ko aath queues mein se ek par bhejta hai; queue 0 low-latency queue hai. Schedulers bandwidth, buffer aur drop type define karte hain, QoS map mein grouped. WAN interface par circuit rate ka parent shaper congestion mere router par banata hai, aur rewrite rule outer DSCP ko provider ke hisaab se badalta hai. Hub par per-tunnel QoS har spoke ko shape karta hai. Main show policy-map interface aur capture se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ingress par ek baar mark, class se queue, circuit par shape, provider ke liye rewrite.</li>
<li>Aath queues: Q0 LLQ tail drop ke saath, Q1 se Q7 WRR, default Q2.</li>
<li>Per-tunnel QoS sirf hub-to-spoke hai aur spoke ka downstream bandwidth use karta hai.</li>
<li><code>show policy-map interface</code> aur <code>show sdwan policy</code> family se verify karo.</li>
<li>Agla: sdw-ops module mein operations, monitoring aur upgrades.</li>
</ul></div>
`}};export{e as default};