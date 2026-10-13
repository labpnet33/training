var e={id:`overview`,h:{en:`Class of service: what you will learn and the big picture`,hi:`Class of service: kya seekhoge aur big picture`},body:{en:`
<p><b>What you will learn in this module.</b> You will follow one packet through the Junos class of service (CoS) pipeline: how it is <b>classified</b> into a forwarding class, how it can be <b>policed</b>, how a <b>scheduler</b> serves its queue when a link is congested, and how a <b>rewrite rule</b> writes the marking back into the header for the next router. These are the class of service objectives of the JNCIP-ENT exam (JN0-650). Three labs use the same devices and commands that appear in the chapters: BR1 and CORE1 (voice marking), HUB (guest policer) and EDGE (strict-high voice on a 2 Mbps circuit).</p>
<p><b>Prerequisites.</b> You should be comfortable with the Junos CLI (JNCIA level), with IPv4 addressing and static routing, and with the idea of a firewall filter. You do not need any earlier CoS knowledge.</p>

<h3>Analogy: an airport with fast lanes</h3>
<p>Think of an airport security hall. At the entrance an officer looks at each traveller's boarding pass and sends them to a lane: business, family, or economy. That is <b>classification</b>. Some lanes have a rope that only lets a fixed number of people through per minute. That is <b>policing</b>. Inside the hall there are fewer scanners than travellers, so each lane has a rule for who is served first and how much of the scanner time it gets. That is <b>scheduling</b>. Finally, when you walk out, a sticker is put on your bag so the next airport knows your lane. That is a <b>rewrite rule</b>.</p>
<p>Notice one thing: if the hall is empty, nobody cares about lanes. CoS only changes the outcome when a link is <b>congested</b>. This is the first fact to remember for the exam and for real life.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="CoS pipeline">
<rect x="10" y="50" width="100" height="60" rx="10" fill="#bae6fd"/><text x="60" y="78" text-anchor="middle" class="svg-ink" font-size="13">Classify</text><text x="60" y="97" text-anchor="middle" class="svg-muted" font-size="11">BA / MF</text>
<rect x="135" y="50" width="100" height="60" rx="10" fill="#fde68a"/><text x="185" y="78" text-anchor="middle" class="svg-ink" font-size="13">Police</text><text x="185" y="97" text-anchor="middle" class="svg-muted" font-size="11">policer</text>
<rect x="260" y="50" width="100" height="60" rx="10" fill="#bbf7d0"/><text x="310" y="78" text-anchor="middle" class="svg-ink" font-size="13">Queue</text><text x="310" y="97" text-anchor="middle" class="svg-muted" font-size="11">FC to queue</text>
<rect x="385" y="50" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="435" y="78" text-anchor="middle" class="svg-ink" font-size="13">Schedule</text><text x="435" y="97" text-anchor="middle" class="svg-muted" font-size="11">scheduler-map</text>
<rect x="510" y="50" width="120" height="60" rx="10" fill="#fed7aa"/><text x="570" y="78" text-anchor="middle" class="svg-ink" font-size="13">Rewrite</text><text x="570" y="97" text-anchor="middle" class="svg-muted" font-size="11">DSCP / 802.1p</text>
<line x1="110" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="235" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="360" y1="80" x2="385" y2="80" stroke="#64748b" stroke-width="2"/><line x1="485" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="185" y="30" text-anchor="middle" class="svg-accent" font-size="12">ingress</text><text x="480" y="30" text-anchor="middle" class="svg-accent" font-size="12">egress</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Two internal labels travel with the packet: forwarding class and loss priority</text>
</svg><p class="cap">The five steps of the Junos CoS pipeline.</p></div>

<h3>The two labels</h3>
<p>Junos CoS does not carry a packet's marking around "as is". When a packet enters the router it receives two internal labels, and every later decision uses only those labels:</p>
<ul>
<li><b>Forwarding class (FC)</b> chooses the <b>output queue</b>. Default classes are <code>best-effort</code>, <code>expedited-forwarding</code>, <code>assured-forwarding</code> and <code>network-control</code>.</li>
<li><b>Packet loss priority (PLP)</b> says how willing the router is to drop the packet when a queue fills up: low, medium-low, medium-high or high.</li>
</ul>
<p>The labels exist only inside the router. The next router sees only what is in the header, so a marking that must survive has to be written out again with a rewrite rule.</p>

<h3>The labs you will build</h3>
<table class="cmp"><tr><th>Lab</th><th>Devices</th><th>Skill</th></tr>
<tr><td>Mark softphone voice as EF</td><td>BR1, CORE1</td><td>MF filter, rewrite rule, BA classifier</td></tr>
<tr><td>Police the guest subnet</td><td>HUB</td><td>Policer in an input filter, counters</td></tr>
<tr><td>Strict-high voice on 2 Mbps</td><td>EDGE</td><td>Schedulers, scheduler-map, queue statistics</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A branch router has a gigabit port that is shaped to a 2 Mbps WAN circuit. A phone call needs 400 kbps; a backup job tries to send 3 Mbps. Total demand is 3.4 Mbps on a 2 Mbps link, so the queues fill. Without CoS the router drops packets at random from whichever queue is full, and the call breaks up. With a scheduler that serves the voice queue first, the call is never delayed and the backup absorbs all the loss. In chapter 6 you will see this with real numbers from the simulator.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Configuring a perfect classifier and scheduler on one router and expecting end-to-end quality. CoS is hop by hop: every router on the path needs a classifier that trusts the marking and a scheduler on its congested links.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which device applies CoS to an uncongested link?" CoS changes nothing for traffic while queues are empty. Also remember that a rewrite rule acts on egress and that a classifier acts on ingress.</p></div>

<div class="scn"><h4>The calls that broke only on Mondays</h4><p>A clinic complained that video calls to head office were choppy only on Monday mornings, when the weekly backup started. Link utilisation graphs looked fine because they were averaged over five minutes. The engineer checked the queue counters on the WAN interface and found tail drops in the voice queue during bursts. The router was classifying voice correctly, but no scheduler was giving that queue any bandwidth.</p><p><b>Lesson:</b> averages hide microbursts. Check queue counters, not only interface utilisation, and give real-time classes an explicit scheduler.</p></div>

<div class="iv"><p class="q">"Where in the router do you apply classification, policing, scheduling and rewrite?"</p><p>Classification and ingress policing happen on the ingress logical interface (BA classifier, input filter, input policer). Scheduling happens on the egress physical interface through a scheduler-map. Rewrite rules apply on the egress logical interface. Mention that the forwarding class and loss priority are internal labels and that CoS matters only under congestion.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The pipeline is classify, police, queue, schedule, rewrite.</li>
<li>Forwarding class selects the queue; loss priority selects drop eagerness.</li>
<li>The two labels live only inside the router.</li>
<li>CoS matters only when an egress link is congested.</li>
<li>Every hop on the path needs its own classifier and scheduler.</li>
</ul></div>
`,hi:`
<p><b>Is module mein aap kya seekhoge.</b> Aap ek packet ke saath Junos class of service (CoS) pipeline mein chalte hue dekhoge: woh forwarding class mein kaise <b>classify</b> hota hai, kaise <b>police</b> ho sakta hai, link congested hone par <b>scheduler</b> uski queue ko kaise serve karta hai, aur <b>rewrite rule</b> marking ko header mein wapas kaise likhta hai taaki agla router use samajh sake. Yeh JNCIP-ENT exam (JN0-650) ke class of service objectives hain. Teen labs wahi devices aur commands use karte hain jo chapters mein aate hain: BR1 aur CORE1 (voice marking), HUB (guest policer) aur EDGE (2 Mbps circuit par strict-high voice).</p>
<p><b>Prerequisites.</b> Aapko Junos CLI (JNCIA level), IPv4 addressing aur static routing, aur firewall filter ka idea aana chahiye. Pehle se CoS jaanna zaroori nahi.</p>

<h3>Analogy: fast lanes wala airport</h3>
<p>Airport ka security hall socho. Entrance par officer har traveller ka boarding pass dekh kar use ek lane mein bhejta hai: business, family ya economy. Yeh <b>classification</b> hai. Kuch lanes mein rassi lagi hoti hai jo ek minute mein sirf fixed logon ko jaane deti hai. Yeh <b>policing</b> hai. Hall ke andar scanners kam hain aur travellers zyada, isliye har lane ka rule hota hai ki kise pehle serve karna hai aur scanner ka kitna time milega. Yeh <b>scheduling</b> hai. Aakhir mein bahar nikalte waqt aapke bag par sticker lagta hai taaki agla airport aapki lane jaan sake. Yeh <b>rewrite rule</b> hai.</p>
<p>Ek baat dhyan do: hall khaali ho to lanes se kisi ko fark nahi padta. CoS tabhi nateeja badalta hai jab link <b>congested</b> ho. Exam aur real life dono ke liye yeh pehla fact yaad rakho.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="CoS pipeline">
<rect x="10" y="50" width="100" height="60" rx="10" fill="#bae6fd"/><text x="60" y="78" text-anchor="middle" class="svg-ink" font-size="13">Classify</text><text x="60" y="97" text-anchor="middle" class="svg-muted" font-size="11">BA / MF</text>
<rect x="135" y="50" width="100" height="60" rx="10" fill="#fde68a"/><text x="185" y="78" text-anchor="middle" class="svg-ink" font-size="13">Police</text><text x="185" y="97" text-anchor="middle" class="svg-muted" font-size="11">policer</text>
<rect x="260" y="50" width="100" height="60" rx="10" fill="#bbf7d0"/><text x="310" y="78" text-anchor="middle" class="svg-ink" font-size="13">Queue</text><text x="310" y="97" text-anchor="middle" class="svg-muted" font-size="11">FC se queue</text>
<rect x="385" y="50" width="100" height="60" rx="10" fill="#ddd6fe"/><text x="435" y="78" text-anchor="middle" class="svg-ink" font-size="13">Schedule</text><text x="435" y="97" text-anchor="middle" class="svg-muted" font-size="11">scheduler-map</text>
<rect x="510" y="50" width="120" height="60" rx="10" fill="#fed7aa"/><text x="570" y="78" text-anchor="middle" class="svg-ink" font-size="13">Rewrite</text><text x="570" y="97" text-anchor="middle" class="svg-muted" font-size="11">DSCP / 802.1p</text>
<line x1="110" y1="80" x2="135" y2="80" stroke="#64748b" stroke-width="2"/><line x1="235" y1="80" x2="260" y2="80" stroke="#64748b" stroke-width="2"/><line x1="360" y1="80" x2="385" y2="80" stroke="#64748b" stroke-width="2"/><line x1="485" y1="80" x2="510" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="185" y="30" text-anchor="middle" class="svg-accent" font-size="12">ingress</text><text x="480" y="30" text-anchor="middle" class="svg-accent" font-size="12">egress</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Packet ke saath do internal labels chalte hain: forwarding class aur loss priority</text>
</svg><p class="cap">Junos CoS pipeline ke paanch steps.</p></div>

<h3>Do labels</h3>
<p>Junos CoS packet ki marking ko "jaisa hai waisa" saath nahi le jaata. Packet router mein aate hi do internal labels paata hai, aur baad ke har faisle mein sirf yahi labels use hote hain:</p>
<ul>
<li><b>Forwarding class (FC)</b> <b>output queue</b> chunti hai. Default classes hain <code>best-effort</code>, <code>expedited-forwarding</code>, <code>assured-forwarding</code> aur <code>network-control</code>.</li>
<li><b>Packet loss priority (PLP)</b> batati hai ki queue bharne par router packet ko girane ke liye kitna taiyaar hai: low, medium-low, medium-high ya high.</li>
</ul>
<p>Labels sirf router ke andar rehte hain. Agla router sirf header mein likha dekhta hai, isliye jo marking bachaani ho use rewrite rule se dobara likhna padta hai.</p>

<h3>Jo labs aap banaoge</h3>
<table class="cmp"><tr><th>Lab</th><th>Devices</th><th>Skill</th></tr>
<tr><td>Softphone voice ko EF mark karo</td><td>BR1, CORE1</td><td>MF filter, rewrite rule, BA classifier</td></tr>
<tr><td>Guest subnet ko police karo</td><td>HUB</td><td>Input filter mein policer, counters</td></tr>
<tr><td>2 Mbps par strict-high voice</td><td>EDGE</td><td>Schedulers, scheduler-map, queue statistics</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Branch router ka gigabit port 2 Mbps WAN circuit ke hisaab se shape hai. Phone call ko 400 kbps chahiye; backup job 3 Mbps bhejna chahta hai. Kul demand 3.4 Mbps hai aur link 2 Mbps ka, isliye queues bhar jaati hain. CoS ke bina router jo bhi queue bhari ho usse random packets girata hai aur call toot-toot kar chalti hai. Aisa scheduler lagao jo voice queue ko pehle serve kare, to call kabhi delay nahi hoti aur saara loss backup ko jhelna padta hai. Chapter 6 mein aap simulator ke real numbers ke saath yeh dekhoge.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Ek router par perfect classifier aur scheduler laga kar end-to-end quality ki umeed rakhna. CoS hop by hop hai: raste ke har router ko aisa classifier chahiye jo marking par bharosa kare, aur congested links par scheduler.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Uncongested link par CoS kaun lagata hai?" Queues khaali hon to CoS traffic mein kuch nahi badalta. Yeh bhi yaad rakho ki rewrite rule egress par chalta hai aur classifier ingress par.</p></div>

<div class="scn"><h4>Woh calls jo sirf Monday ko tootti thi</h4><p>Ek clinic ne shikayat ki ki head office ki video calls sirf Monday subah, jab weekly backup shuru hota hai, tootti hain. Link utilisation graphs theek dikhte the kyunki woh paanch minute ke average the. Engineer ne WAN interface ke queue counters dekhe to bursts ke dauran voice queue mein tail drops mile. Router voice ko sahi classify kar raha tha, lekin us queue ko koi scheduler bandwidth nahi de raha tha.</p><p><b>Lesson:</b> average microbursts chhupa deta hai. Sirf interface utilisation nahi, queue counters bhi dekho, aur real-time classes ko explicit scheduler do.</p></div>

<div class="iv"><p class="q">"Router mein classification, policing, scheduling aur rewrite kahan lagate ho?"</p><p>Classification aur ingress policing ingress logical interface par hote hain (BA classifier, input filter, input policer). Scheduling egress physical interface par scheduler-map se hota hai. Rewrite rules egress logical interface par lagte hain. Yeh zaroor kaho ki forwarding class aur loss priority internal labels hain aur CoS sirf congestion mein matter karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pipeline hai classify, police, queue, schedule, rewrite.</li>
<li>Forwarding class queue chunti hai; loss priority drop ki eagerness.</li>
<li>Dono labels sirf router ke andar rehte hain.</li>
<li>CoS tabhi matter karta hai jab egress link congested ho.</li>
<li>Raste ke har hop ko apna classifier aur scheduler chahiye.</li>
</ul></div>
`}};export{e as default};