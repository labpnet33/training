var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have followed a packet through the whole Junos CoS pipeline and built it in three labs. This chapter pulls everything together: a can-do checklist, a mini glossary, the most tested facts and a command cheat sheet for the JN0-650 exam.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Summary map">
<rect x="10" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="12">Classify</text><text x="80" y="59" text-anchor="middle" class="svg-muted" font-size="11">BA first, MF overrides</text>
<rect x="170" y="20" width="140" height="50" rx="8" fill="#fde68a"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="12">Police</text><text x="240" y="59" text-anchor="middle" class="svg-muted" font-size="11">hard or soft</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="12">Schedule</text><text x="400" y="59" text-anchor="middle" class="svg-muted" font-size="11">map on physical port</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="12">Rewrite</text><text x="560" y="59" text-anchor="middle" class="svg-muted" font-size="11">egress unit</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">Internal labels: forwarding class + loss priority</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Verify: show class-of-service interface, show interfaces queue</text>
</svg><p class="cap">The whole module on one line.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can name the five pipeline stages and say on which interface each one is applied.</li>
<li>I can explain forwarding class, queue and loss priority, and read the default forwarding-class table.</li>
<li>I can write a dscp BA classifier, bind it to a unit and explain the <code>ipprec-compatibility</code> default.</li>
<li>I can build an MF filter with a catch-all accept and apply it as input.</li>
<li>I can build a hard and a soft policer and read its counters.</li>
<li>I can write schedulers, a scheduler-map, apply it to the physical interface and explain strict-high.</li>
<li>I can write a drop profile and attach it with a drop-profile-map by loss priority.</li>
<li>I can write a rewrite rule and prove it with a capture and a next-hop queue counter.</li>
<li>I can troubleshoot in pipeline order and reset counters for a clean test.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BA classifier</dt><dd>Maps a header code point (DSCP, precedence, 802.1p) to forwarding class and loss priority.</dd>
<dt>MF classifier</dt><dd>A firewall filter that classifies by addresses, protocol and ports.</dd>
<dt>Forwarding class</dt><dd>Name that selects the egress queue.</dd>
<dt>Loss priority (PLP)</dt><dd>Label that controls how early a packet is dropped.</dd>
<dt>Policer</dt><dd>Token bucket limiting a rate with bandwidth-limit and burst-size-limit.</dd>
<dt>Scheduler / scheduler-map</dt><dd>Rules for one queue; table binding classes to schedulers.</dd>
<dt>Shaping rate</dt><dd>Egress rate cap that delays rather than drops.</dd>
<dt>Drop profile</dt><dd>RED curve of fill level against drop probability.</dd>
<dt>Rewrite rule</dt><dd>Egress mapping of forwarding class and loss priority back to code points.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>Default classes</td><td>best-effort 0, expedited-forwarding 1, assured-forwarding 2, network-control 3</td></tr>
<tr><td>No classifier bound</td><td>Default table: DSCP EF lands in best-effort; only precedence 6 and 7 go to network-control</td></tr>
<tr><td>BA versus MF</td><td>BA runs first, the MF filter overrides it</td></tr>
<tr><td>Filter end</td><td>Implicit discard; add a final accept term</td></tr>
<tr><td>Policer units</td><td>bandwidth-limit in bits per second; burst-size-limit in bytes</td></tr>
<tr><td>Hard versus soft</td><td>discard versus loss-priority high</td></tr>
<tr><td>Default scheduler</td><td>best-effort 95, network-control 5, nothing for EF or AF</td></tr>
<tr><td>Where bound</td><td>Classifier on ingress unit; scheduler-map on physical interface; rewrite on egress unit</td></tr>
<tr><td>EF</td><td>DSCP 46, binary 101110, ToS byte 0xb8</td></tr>
<tr><td>802.1p</td><td>Only on tagged interfaces; rebuilt on each link</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="out">show class-of-service interface ge-0/0/0
show class-of-service forwarding-class
show class-of-service classifier name CL-CORE
show class-of-service rewrite-rule
show class-of-service scheduler-map SM-WAN
show class-of-service drop-profile
show interfaces queue ge-0/0/0
show policer
show firewall filter GUEST-LIMIT
clear interfaces statistics ge-0/0/0
clear firewall all</pre>
<p>One reminder on scope: the simulator implements the commands above. Code-point aliases, three-colour policers, hierarchical CoS and the <code>host-outbound-traffic</code> show command are taught as concepts only, so do not expect lab output for them.</p>

<div class="eg"><p><b>Worked example: a full design in six lines of thought.</b> A branch has softphones, a 2 Mbps circuit and guests. Classify RTP by MF at the access port. Police guests to 2 Mbps in an input filter. Rewrite EF on the WAN unit. Trust EF with a BA classifier at the core. Apply a strict-high voice scheduler and shaping on the WAN port. Verify with queue counters under load.</p></div>

<div class="warn"><p><b>Last-minute reminders.</b> Read the question for the direction (ingress or egress) and for the object (unit or physical interface). Most wrong answers on CoS come from a correct feature applied in the wrong place.</p></div>
<div class="exam"><p><b>Exam trap.</b> Do not confuse policing with shaping, and do not confuse a classifier (ingress, code point to class) with a rewrite rule (egress, class to code point).</p></div>

<div class="scn"><h4>The 15-minute design review</h4><p>A new engineer was asked to review a branch CoS design in 15 minutes. He asked four questions: is traffic classified at the edge, is the marking written on the WAN, does the core trust it, and does the WAN port have a scheduler-map. The design answered yes, yes, no, yes. The core had no classifier. Everything else was perfect and useless until one binding was added.</p><p><b>Lesson:</b> the four-question review catches most faults before a single packet is sent.</p></div>

<div class="iv"><p class="q">"Describe a complete CoS design for a branch with voice, data and guests."</p><p>Classify at the edge with MF where sources cannot mark, and BA elsewhere. Police guests with a hard policer in an input filter. Rewrite DSCP on the WAN egress unit. Trust DSCP with a BA classifier on the next router. On the WAN port, apply a scheduler-map with strict-high voice limited by its rate, remainder for data, a small share for network control, and shape to the circuit speed. Verify with queue statistics under load.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know where each tool is applied: ingress unit, physical port or egress unit.</li>
<li>Defaults are traps: unclassified EF is best-effort, default schedulers ignore EF.</li>
<li>Policers drop or mark; schedulers and shapers manage queues.</li>
<li>Prove each stage with the right show command.</li>
<li>Practise the three labs until you can build them without notes.</li>
</ul></div>
`,hi:`
<p>Aapne ek packet ko poori Junos CoS pipeline mein follow kiya aur teen labs mein use banaya. Yeh chapter sab kuch ek jagah jodta hai: can-do checklist, mini glossary, sabse zyada poochhe jaane wale facts aur JN0-650 exam ke liye command cheat sheet.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Summary map">
<rect x="10" y="20" width="140" height="50" rx="8" fill="#bae6fd"/><text x="80" y="42" text-anchor="middle" class="svg-ink" font-size="12">Classify</text><text x="80" y="59" text-anchor="middle" class="svg-muted" font-size="11">pehle BA, MF override</text>
<rect x="170" y="20" width="140" height="50" rx="8" fill="#fde68a"/><text x="240" y="42" text-anchor="middle" class="svg-ink" font-size="12">Police</text><text x="240" y="59" text-anchor="middle" class="svg-muted" font-size="11">hard ya soft</text>
<rect x="330" y="20" width="140" height="50" rx="8" fill="#bbf7d0"/><text x="400" y="42" text-anchor="middle" class="svg-ink" font-size="12">Schedule</text><text x="400" y="59" text-anchor="middle" class="svg-muted" font-size="11">map physical port par</text>
<rect x="490" y="20" width="140" height="50" rx="8" fill="#fed7aa"/><text x="560" y="42" text-anchor="middle" class="svg-ink" font-size="12">Rewrite</text><text x="560" y="59" text-anchor="middle" class="svg-muted" font-size="11">egress unit</text>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">Internal labels: forwarding class + loss priority</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Verify: show class-of-service interface, show interfaces queue</text>
</svg><p class="cap">Poora module ek line mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main paanch pipeline stages ke naam bata sakta hoon aur har ek kis interface par lagta hai.</li>
<li>Main forwarding class, queue aur loss priority samjha sakta hoon, aur default forwarding-class table padh sakta hoon.</li>
<li>Main dscp BA classifier likh sakta hoon, use unit par bind kar sakta hoon aur <code>ipprec-compatibility</code> default samjha sakta hoon.</li>
<li>Main catch-all accept ke saath MF filter bana kar input par laga sakta hoon.</li>
<li>Main hard aur soft policer bana kar uske counters padh sakta hoon.</li>
<li>Main schedulers, scheduler-map likh kar physical interface par laga sakta hoon aur strict-high samjha sakta hoon.</li>
<li>Main drop profile likh kar loss priority ke hisaab se drop-profile-map se jod sakta hoon.</li>
<li>Main rewrite rule likh kar capture aur next-hop queue counter se saabit kar sakta hoon.</li>
<li>Main pipeline order mein troubleshoot kar sakta hoon aur saaf test ke liye counters reset kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>BA classifier</dt><dd>Header code point (DSCP, precedence, 802.1p) ko forwarding class aur loss priority par map karta hai.</dd>
<dt>MF classifier</dt><dd>Firewall filter jo addresses, protocol aur ports se classify karta hai.</dd>
<dt>Forwarding class</dt><dd>Naam jo egress queue chunta hai.</dd>
<dt>Loss priority (PLP)</dt><dd>Label jo tay karta hai ki packet kitni jaldi drop hoga.</dd>
<dt>Policer</dt><dd>Token bucket jo bandwidth-limit aur burst-size-limit se rate limit karta hai.</dd>
<dt>Scheduler / scheduler-map</dt><dd>Ek queue ke rules; classes ko schedulers se jodne wali table.</dd>
<dt>Shaping rate</dt><dd>Egress rate cap jo drop ki jagah delay karta hai.</dd>
<dt>Drop profile</dt><dd>Fill level aur drop probability ka RED curve.</dd>
<dt>Rewrite rule</dt><dd>Forwarding class aur loss priority ko wapas code points mein badalne wali egress mapping.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>Default classes</td><td>best-effort 0, expedited-forwarding 1, assured-forwarding 2, network-control 3</td></tr>
<tr><td>Classifier bind nahi</td><td>Default table: DSCP EF best-effort mein girta hai; sirf precedence 6 aur 7 network-control mein</td></tr>
<tr><td>BA vs MF</td><td>BA pehle chalta hai, MF filter use override karta hai</td></tr>
<tr><td>Filter ka end</td><td>Implicit discard; final accept term jodo</td></tr>
<tr><td>Policer units</td><td>bandwidth-limit bits per second mein; burst-size-limit bytes mein</td></tr>
<tr><td>Hard vs soft</td><td>discard vs loss-priority high</td></tr>
<tr><td>Default scheduler</td><td>best-effort 95, network-control 5, EF ya AF ke liye kuch nahi</td></tr>
<tr><td>Kahan bind</td><td>Classifier ingress unit par; scheduler-map physical interface par; rewrite egress unit par</td></tr>
<tr><td>EF</td><td>DSCP 46, binary 101110, ToS byte 0xb8</td></tr>
<tr><td>802.1p</td><td>Sirf tagged interfaces par; har link par dobara banta hai</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="out">show class-of-service interface ge-0/0/0
show class-of-service forwarding-class
show class-of-service classifier name CL-CORE
show class-of-service rewrite-rule
show class-of-service scheduler-map SM-WAN
show class-of-service drop-profile
show interfaces queue ge-0/0/0
show policer
show firewall filter GUEST-LIMIT
clear interfaces statistics ge-0/0/0
clear firewall all</pre>
<p>Scope par ek yaad-dihaani: simulator upar ke commands implement karta hai. Code-point aliases, three-colour policers, hierarchical CoS aur <code>host-outbound-traffic</code> ka show command sirf concept ke roop mein sikhaye gaye hain, isliye unka lab output mat dhoondo.</p>

<div class="eg"><p><b>Worked example: poora design chhe soch mein.</b> Ek branch mein softphones, 2 Mbps circuit aur guests hain. Access port par RTP ko MF se classify karo. Input filter mein guests ko 2 Mbps par police karo. WAN unit par EF rewrite karo. Core mein BA classifier se EF par bharosa karo. WAN port par strict-high voice scheduler aur shaping lagao. Load mein queue counters se verify karo.</p></div>

<div class="warn"><p><b>Aakhri minute ke reminders.</b> Sawaal mein direction (ingress ya egress) aur object (unit ya physical interface) padho. CoS ke zyadatar galat jawab sahi feature ko galat jagah lagane se aate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Policing ko shaping se mat milao, aur classifier (ingress, code point se class) ko rewrite rule (egress, class se code point) se mat milao.</p></div>

<div class="scn"><h4>15 minute ka design review</h4><p>Ek naye engineer ko 15 minute mein branch CoS design review karne ko kaha gaya. Usne chaar sawaal poochhe: kya edge par traffic classify hota hai, kya WAN par marking likhi jaati hai, kya core us par bharosa karta hai, aur kya WAN port par scheduler-map hai. Design ka jawab tha haan, haan, nahi, haan. Core mein classifier nahi tha. Baaki sab perfect tha aur ek binding jodne tak bekaar tha.</p><p><b>Lesson:</b> chaar sawaal wala review ek bhi packet bheje bina zyadatar faults pakad leta hai.</p></div>

<div class="iv"><p class="q">"Voice, data aur guests wali branch ke liye poora CoS design batao."</p><p>Jahan sources mark nahi kar sakte wahan edge par MF se classify karo, baaki jagah BA. Guests ko input filter mein hard policer se police karo. WAN egress unit par DSCP rewrite karo. Agle router par BA classifier se DSCP par bharosa karo. WAN port par scheduler-map lagao jisme strict-high voice uske rate se limited ho, data ke liye remainder, network control ka chhota hissa, aur interface ko circuit speed par shape karo. Load mein queue statistics se verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Jaano har tool kahan lagta hai: ingress unit, physical port ya egress unit.</li>
<li>Defaults traps hain: unclassified EF best-effort hai, default schedulers EF ko ignore karte hain.</li>
<li>Policers drop ya mark karte hain; schedulers aur shapers queues manage karte hain.</li>
<li>Har stage ko sahi show command se saabit karo.</li>
<li>Teeno labs ko tab tak practise karo jab tak bina notes ke bana na lo.</li>
</ul></div>
`}};export{e as default};