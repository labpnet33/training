var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a six-lane motorway meeting a one-lane bridge. You now have the tools to run the bridge: a token bucket to measure, a policer to enforce, a shaper to smooth, a hierarchy to protect voice, and a method to prove it. This last chapter collects everything you should be able to do, say and type.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain a token bucket with CIR, Bc, Be and Tc, and calculate <code>Tc = Bc / CIR</code> and the default values.</li>
<li>Choose between policing and shaping for a given requirement, and say where each can be applied.</li>
<li>Write a two-colour and a three-colour policer with transmit, drop and remark actions, and read conformed, exceeded and violated counters.</li>
<li>Write <code>shape average</code> in class-default, choose a rate below the CIR and justify it with Layer 2 overhead.</li>
<li>Build a hierarchical policy: parent shaper, child priority, bandwidth and fair-queue, attached only at the parent.</li>
<li>Recognise bufferbloat, calculate queue delay, and apply the fixes (shape below the circuit, queue-limit, fair-queue, WRED or ECN).</li>
<li>Design for a multi-site MPLS service: one child policy, a parent shaper per site, a per-spoke shaper at the hub, and provider class alignment.</li>
<li>Troubleshoot a slow WAN with the six-step method and place drops in the right or wrong place.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Which tool for which job">
<rect x="10" y="10" width="620" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">What is the requirement?</text>
<rect x="10" y="70" width="190" height="80" rx="8" fill="#fed7aa"/><text x="105" y="95" text-anchor="middle" class="svg-ink" font-size="13">Enforce or cap a class</text><text x="105" y="115" text-anchor="middle" class="svg-muted" font-size="12">police, input or output</text><text x="105" y="133" text-anchor="middle" class="svg-muted" font-size="12">drop or remark</text>
<rect x="225" y="70" width="190" height="80" rx="8" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Match a slower circuit</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">shape average, output</text><text x="320" y="133" text-anchor="middle" class="svg-muted" font-size="12">just below the CIR</text>
<rect x="440" y="70" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="13">Protect voice in it</text><text x="535" y="115" text-anchor="middle" class="svg-muted" font-size="12">parent shaper + child</text><text x="535" y="133" text-anchor="middle" class="svg-muted" font-size="12">priority and bandwidth</text>
<rect x="10" y="175" width="300" height="60" rx="8" fill="#ddd6fe"/><text x="160" y="200" text-anchor="middle" class="svg-ink" font-size="13">Low delay while busy</text><text x="160" y="218" text-anchor="middle" class="svg-muted" font-size="12">queue-limit, fair-queue, WRED</text>
<rect x="330" y="175" width="300" height="60" rx="8" fill="#fde68a"/><text x="480" y="200" text-anchor="middle" class="svg-ink" font-size="13">Many sites, different CIRs</text><text x="480" y="218" text-anchor="middle" class="svg-muted" font-size="12">same child, shaper per site, per-spoke at the hub</text>
</svg><p class="cap">The module on one page.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CIR</dt><dd>Committed information rate, the contracted long-term speed.</dd>
<dt>Bc / Be</dt><dd>Committed and excess burst: sizes of the first and second token buckets.</dd>
<dt>Tc</dt><dd>Time interval, Bc divided by CIR; the shaper sends one Bc per Tc.</dd>
<dt>Conform / exceed / violate</dt><dd>The three colours a policer assigns to a packet.</dd>
<dt>Policer</dt><dd>Rate limiter that transmits, remarks or drops at once; no queue.</dd>
<dt>Shaper</dt><dd>Rate limiter that queues the excess and releases it later; output only.</dd>
<dt>HQoS</dt><dd>Hierarchical QoS: a parent policy that shapes and a child that queues.</dd>
<dt>Bufferbloat</dt><dd>High delay with little loss caused by a large standing queue.</dd>
<dt>PE / CE</dt><dd>Provider edge and customer edge routers.</dd>
<dt>EIR / PIR</dt><dd>Excess and peak information rate of dual-rate services.</dd>
</dl>

<h3>Most tested facts</h3>
<ol>
<li>Policing drops or remarks and never delays; shaping buffers and does delay.</li>
<li>Shaping and all queuing commands exist only in the output direction.</li>
<li>Policer Bc is in bytes (default CIR/32); shaper Bc is in bits (default CIR x 4 ms).</li>
<li>Default policer actions: conform transmit, exceed drop. A violate action needs Be.</li>
<li>Child bandwidth and priority are relative to the parent shape rate and must fit inside it.</li>
<li>Only the parent policy is attached to the interface.</li>
<li>Shape below the CIR; on a fast handoff use an absolute rate, not percent.</li>
<li>Queue delay equals queue size in bits divided by the drain rate.</li>
<li>The hub of a hub-and-spoke WAN needs a shaper per spoke.</li>
<li>Clear the counters before every proof run.</li>
</ol>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Goal</th><th>Command</th></tr>
<tr><td>Police, drop excess</td><td><code>police cir 2000000 conform-action transmit exceed-action drop</code></td></tr>
<tr><td>Police, remark excess</td><td><code>police cir 3000000 conform-action transmit exceed-action set-dscp-transmit af13</code></td></tr>
<tr><td>Three colours</td><td><code>police cir 3000000 bc 94000 be 94000 conform-action transmit exceed-action set-dscp-transmit af12 violate-action drop</code></td></tr>
<tr><td>Shape</td><td><code>shape average 19000000</code></td></tr>
<tr><td>Nest a child</td><td><code>service-policy WAN-CHILD</code> (inside the parent class)</td></tr>
<tr><td>Attach</td><td><code>service-policy output WAN-SHAPE</code></td></tr>
<tr><td>Short queue, per-flow queues</td><td><code>queue-limit 64 packets</code> and <code>fair-queue</code></td></tr>
<tr><td>Verify</td><td><code>show policy-map interface GigabitEthernet0/0 output</code></td></tr>
<tr><td>Reset counters</td><td><code>clear policy-map counters</code></td></tr>
<tr><td>Test traffic from a host</td><td><code>traffic 10.30.1.50 udp/16500 600 20 dscp ef</code></td></tr></table>

<h3>The four labs in one line each</h3>
<ul>
<li><b>mq-wan-police</b>: backup capped at 2 Mbps (drop), video 3 Mbps then AF13.</li>
<li><b>mq-wan-shape-hqos</b>: WAN-SHAPE at 19 Mbps with WAN-CHILD; voice and billing clean, loss only in class-default, provider policer silent.</li>
<li><b>mq-wan-bufferbloat</b>: three independent faults in one policy; proof by counters and a delay calculation.</li>
<li><b>mq-wan-provider-cir</b>: Pune 19, Delhi 29, Mumbai per spoke 19 and 29; all voice clean, provider counters zero.</li>
</ul>

<div class="warn"><p><b>Last common mistakes.</b> Shape at exactly the CIR; a policer with a tiny Bc; priority larger than the provider real-time class; one hub shaper; testing only at idle; reading stale counters.</p></div>
<div class="exam"><p><b>Exam traps to rehearse.</b> "Which tool adds delay?" (shaper). "Where can a shaper be applied?" (output). "What does Be add?" (a third colour). "What is the bucket unit in police and in shape?" (bytes and bits). "Why does LLQ on a fast handoff not help?" (no congestion without a shaper).</p></div>

<div class="scn"><h4>The change window checklist</h4><p>A network team adds QoS to a new branch on a 50 Mbps service. Their window checklist is short: confirm CIR and provider classes; build the child policy that all branches share; set the parent shaper to 45 Mbps; attach on the WAN port output; clear counters; run the three-flow load from the branch and from head office; save the outputs; confirm the provider policer shows no exceeded packets; save the configuration. The change takes 25 minutes and the evidence goes into the ticket.</p><p><b>Lesson:</b> a good WAN change is repeatable and ends with evidence.</p></div>
<div class="iv"><p class="q">"Give me the shortest possible design for QoS on a branch with a 20 Mbps Ethernet WAN."</p><p>Mark at the LAN edge, then on the WAN port a parent policy shaping to about 19 Mbps with a child policy: EF in a priority class sized above the real voice, a guaranteed class for business-critical traffic, and fair-queue with a short queue in class-default. Verify with a loaded test that voice is clean, that the loss is in class-default and that the provider policer is silent.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Token bucket, policer, shaper: one idea, two behaviours.</li>
<li>Edge recipe: parent shaper below the CIR, child policy for voice, short queues.</li>
<li>Multi-site: one child, a shaper per site, a shaper per spoke at the hub.</li>
<li>Prove everything with a loaded test and cleared counters.</li>
<li>Next: <b>mq-voice</b> ties marking, queuing and WAN design into end-to-end voice and video.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module chhe-lane motorway ke ek-lane pul se milne se shuru kiya tha. Ab aapke paas pul chalane ke tools hain: naapne ke liye token bucket, lagu karne ke liye policer, smooth karne ke liye shaper, voice bachane ke liye hierarchy, aur sabit karne ke liye method. Yeh aakhri chapter woh sab jama karta hai jo aapko karna, bolna aur type karna aana chahiye.</p>

<h3>Can-do checklist</h3>
<ul>
<li>CIR, Bc, Be aur Tc ke saath token bucket samjhao, aur <code>Tc = Bc / CIR</code> aur default values calculate karo.</li>
<li>Diye gaye requirement ke liye policing aur shaping mein se chuno, aur batao har ek kahan lagta hai.</li>
<li>Transmit, drop aur remark actions wala two-colour aur three-colour policer likho, aur conformed, exceeded, violated counters padho.</li>
<li>class-default mein <code>shape average</code> likho, CIR se neeche rate chuno aur Layer 2 overhead se uska karan batao.</li>
<li>Hierarchical policy banao: parent shaper, child priority, bandwidth aur fair-queue, sirf parent par attach.</li>
<li>Bufferbloat pehchano, queue delay calculate karo, aur fixes lagao (circuit se neeche shape, queue-limit, fair-queue, WRED ya ECN).</li>
<li>Multi-site MPLS service design karo: ek child policy, har site ka parent shaper, hub par per-spoke shaper, aur provider class alignment.</li>
<li>Chhe-step method se slow WAN troubleshoot karo aur drops ko sahi ya galat jagah rakho.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Kaun sa tool kis kaam ke liye">
<rect x="10" y="10" width="620" height="38" rx="8" fill="#e2e8f0"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="14">Requirement kya hai?</text>
<rect x="10" y="70" width="190" height="80" rx="8" fill="#fed7aa"/><text x="105" y="95" text-anchor="middle" class="svg-ink" font-size="13">Class ko lagu ya cap karo</text><text x="105" y="115" text-anchor="middle" class="svg-muted" font-size="12">police, input ya output</text><text x="105" y="133" text-anchor="middle" class="svg-muted" font-size="12">drop ya remark</text>
<rect x="225" y="70" width="190" height="80" rx="8" fill="#bae6fd"/><text x="320" y="95" text-anchor="middle" class="svg-ink" font-size="13">Dheeme circuit se match</text><text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">shape average, output</text><text x="320" y="133" text-anchor="middle" class="svg-muted" font-size="12">CIR se thoda neeche</text>
<rect x="440" y="70" width="190" height="80" rx="8" fill="#bbf7d0"/><text x="535" y="95" text-anchor="middle" class="svg-ink" font-size="13">Usme voice bachao</text><text x="535" y="115" text-anchor="middle" class="svg-muted" font-size="12">parent shaper + child</text><text x="535" y="133" text-anchor="middle" class="svg-muted" font-size="12">priority aur bandwidth</text>
<rect x="10" y="175" width="300" height="60" rx="8" fill="#ddd6fe"/><text x="160" y="200" text-anchor="middle" class="svg-ink" font-size="13">Busy mein kam delay</text><text x="160" y="218" text-anchor="middle" class="svg-muted" font-size="12">queue-limit, fair-queue, WRED</text>
<rect x="330" y="175" width="300" height="60" rx="8" fill="#fde68a"/><text x="480" y="200" text-anchor="middle" class="svg-ink" font-size="13">Kai sites, alag CIRs</text><text x="480" y="218" text-anchor="middle" class="svg-muted" font-size="12">wahi child, har site shaper, hub par per-spoke</text>
</svg><p class="cap">Poora module ek page par.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>CIR</dt><dd>Committed information rate, contract wali lambe samay ki speed.</dd>
<dt>Bc / Be</dt><dd>Committed aur excess burst: pehle aur doosre token bucket ke size.</dd>
<dt>Tc</dt><dd>Time interval, Bc ko CIR se bhaag karne par; shaper har Tc mein ek Bc bhejta hai.</dd>
<dt>Conform / exceed / violate</dt><dd>Policer packet ko jo teen colours deta hai.</dd>
<dt>Policer</dt><dd>Rate limiter jo turant transmit, remark ya drop karta hai; queue nahi.</dd>
<dt>Shaper</dt><dd>Rate limiter jo excess ko queue mein rakhkar baad mein chhodta hai; sirf output.</dd>
<dt>HQoS</dt><dd>Hierarchical QoS: shape karne wali parent policy aur queue karne wala child.</dd>
<dt>Bufferbloat</dt><dd>Bade standing queue se kam loss ke saath high delay.</dd>
<dt>PE / CE</dt><dd>Provider edge aur customer edge routers.</dd>
<dt>EIR / PIR</dt><dd>Dual-rate services ke excess aur peak information rate.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<ol>
<li>Policing drop ya remark karti hai, kabhi delay nahi; shaping buffer karti hai aur delay karti hai.</li>
<li>Shaping aur saare queuing commands sirf output direction mein hote hain.</li>
<li>Policer Bc bytes mein (default CIR/32); shaper Bc bits mein (default CIR x 4 ms).</li>
<li>Default policer actions: conform transmit, exceed drop. Violate action ke liye Be chahiye.</li>
<li>Child bandwidth aur priority parent shape rate ke relative hote hain aur uske andar fit hone chahiye.</li>
<li>Interface par sirf parent policy attach hoti hai.</li>
<li>CIR se neeche shape karo; fast handoff par absolute rate use karo, percent nahi.</li>
<li>Queue delay = queue size in bits ko drain rate se bhaag dena.</li>
<li>Hub-and-spoke WAN ke hub ko har spoke ke liye shaper chahiye.</li>
<li>Har proof run se pehle counters clear karo.</li>
</ol>

<h3>Command cheat-sheet</h3>
<table class="cmp"><tr><th>Goal</th><th>Command</th></tr>
<tr><td>Police, excess drop</td><td><code>police cir 2000000 conform-action transmit exceed-action drop</code></td></tr>
<tr><td>Police, excess remark</td><td><code>police cir 3000000 conform-action transmit exceed-action set-dscp-transmit af13</code></td></tr>
<tr><td>Teen colours</td><td><code>police cir 3000000 bc 94000 be 94000 conform-action transmit exceed-action set-dscp-transmit af12 violate-action drop</code></td></tr>
<tr><td>Shape</td><td><code>shape average 19000000</code></td></tr>
<tr><td>Child nest karo</td><td><code>service-policy WAN-CHILD</code> (parent class ke andar)</td></tr>
<tr><td>Attach</td><td><code>service-policy output WAN-SHAPE</code></td></tr>
<tr><td>Chhoti queue, per-flow queues</td><td><code>queue-limit 64 packets</code> aur <code>fair-queue</code></td></tr>
<tr><td>Verify</td><td><code>show policy-map interface GigabitEthernet0/0 output</code></td></tr>
<tr><td>Counters reset</td><td><code>clear policy-map counters</code></td></tr>
<tr><td>Host se test traffic</td><td><code>traffic 10.30.1.50 udp/16500 600 20 dscp ef</code></td></tr></table>

<h3>Chaar labs, ek-ek line mein</h3>
<ul>
<li><b>mq-wan-police</b>: backup 2 Mbps par cap (drop), video 3 Mbps phir AF13.</li>
<li><b>mq-wan-shape-hqos</b>: WAN-SHAPE 19 Mbps par WAN-CHILD ke saath; voice aur billing saaf, loss sirf class-default mein, provider policer chup.</li>
<li><b>mq-wan-bufferbloat</b>: ek policy mein teen swatantra faults; counters aur delay calculation se proof.</li>
<li><b>mq-wan-provider-cir</b>: Pune 19, Delhi 29, Mumbai per spoke 19 aur 29; saari voice saaf, provider counters zero.</li>
</ul>

<div class="warn"><p><b>Aakhri aam galtiyan.</b> Theek CIR par shape; bahut chhote Bc wala policer; provider real-time class se badi priority; hub par ek shaper; sirf idle par test; purane counters padhna.</p></div>
<div class="exam"><p><b>Exam traps jo dohrane hain.</b> "Kaun sa tool delay jodta hai?" (shaper). "Shaper kahan lag sakta hai?" (output). "Be kya jodta hai?" (teesra colour). "Police aur shape mein bucket ki unit kya hai?" (bytes aur bits). "Fast handoff par LLQ madad kyun nahi karti?" (shaper ke bina congestion nahi).</p></div>

<div class="scn"><h4>Change window ki checklist</h4><p>Ek network team 50 Mbps service wali nayi branch par QoS jodti hai. Unki window checklist chhoti hai: CIR aur provider classes confirm karo; sab branches ki share ki hui child policy banao; parent shaper 45 Mbps par set karo; WAN port output par attach karo; counters clear karo; branch aur head office se teen-flow load chalao; outputs save karo; confirm karo ki provider policer koi exceeded packet nahi dikhata; configuration save karo. Change 25 minute leta hai aur evidence ticket mein jaata hai.</p><p><b>Lesson:</b> achha WAN change dohraya ja sakta hai aur evidence par khatam hota hai.</p></div>
<div class="iv"><p class="q">"20 Mbps Ethernet WAN wali branch ke liye QoS ka sabse chhota design batao."</p><p>LAN edge par mark karo, phir WAN port par parent policy jo lagbhag 19 Mbps par shape kare aur child policy: EF asli voice se upar size ki hui priority class mein, business-critical traffic ke liye guaranteed class, aur class-default mein chhoti queue ke saath fair-queue. Loaded test se verify karo ki voice saaf hai, loss class-default mein hai aur provider policer chup hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Token bucket, policer, shaper: ek idea, do behaviours.</li>
<li>Edge recipe: CIR se neeche parent shaper, voice ke liye child policy, chhoti queues.</li>
<li>Multi-site: ek child, har site ka shaper, hub par har spoke ka shaper.</li>
<li>Sab kuch loaded test aur cleared counters se sabit karo.</li>
<li>Agla: <b>mq-voice</b> marking, queuing aur WAN design ko end-to-end voice aur video mein jodta hai.</li>
</ul></div>
`}};export{e as default};