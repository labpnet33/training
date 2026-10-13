var e={id:`troubleshooting`,h:{en:`Troubleshooting CoS: a step-by-step workflow`,hi:`CoS troubleshooting: step-by-step workflow`},body:{en:`
<p>CoS faults feel mysterious because the traffic still flows; it just flows badly. The cure is a fixed order of checks that follows the pipeline. Work from ingress to egress and stop at the first stage that does not match what you expect.</p>

<h3>The five-step workflow</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Troubleshooting order">
<rect x="10" y="30" width="112" height="56" rx="8" fill="#bae6fd"/><text x="66" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Classified?</text><text x="66" y="72" text-anchor="middle" class="svg-muted" font-size="11">right class</text>
<rect x="136" y="30" width="112" height="56" rx="8" fill="#fde68a"/><text x="192" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Policed?</text><text x="192" y="72" text-anchor="middle" class="svg-muted" font-size="11">counters</text>
<rect x="262" y="30" width="112" height="56" rx="8" fill="#bbf7d0"/><text x="318" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Queued?</text><text x="318" y="72" text-anchor="middle" class="svg-muted" font-size="11">queue stats</text>
<rect x="388" y="30" width="112" height="56" rx="8" fill="#ddd6fe"/><text x="444" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Scheduled?</text><text x="444" y="72" text-anchor="middle" class="svg-muted" font-size="11">scheduler-map</text>
<rect x="514" y="30" width="116" height="56" rx="8" fill="#fed7aa"/><text x="572" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Rewritten?</text><text x="572" y="72" text-anchor="middle" class="svg-muted" font-size="11">next hop</text>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">Stop at the first step that disagrees with your design</text>
</svg><p class="cap">Follow the packet: classify, police, queue, schedule, rewrite.</p></div>
<table class="cmp"><tr><th>Step</th><th>Question</th><th>Command</th></tr>
<tr><td>1</td><td>Which classifier or filter is bound, and does it match?</td><td><code>show class-of-service interface</code>, <code>show configuration firewall</code></td></tr>
<tr><td>2</td><td>Is a policer dropping or marking?</td><td><code>show policer</code>, <code>show firewall filter NAME</code></td></tr>
<tr><td>3</td><td>Which queue did the packets enter?</td><td><code>show interfaces queue</code></td></tr>
<tr><td>4</td><td>Does the egress port have the right scheduler-map and shaping?</td><td><code>show class-of-service interface</code>, <code>show class-of-service scheduler-map</code></td></tr>
<tr><td>5</td><td>Is the marking written and trusted on the next hop?</td><td><code>show class-of-service rewrite-rule</code>, a capture, queue counters on the next router</td></tr></table>

<h3>Walking the three lab tickets</h3>
<p><b>Ticket A: "Nashik softphones sound robotic" (BR1 and CORE1).</b> Step 1 on BR1: <code>show class-of-service interface ge-0/0/1</code> shows <code>ipprec-compatibility</code>, which is expected because MF does the work. <code>show configuration firewall</code> shows term <code>rtp</code> and <code>rest</code>. Step 3: <code>show interfaces queue ge-0/0/0</code> on BR1 shows queue 1 counting. Step 5: on CORE1 the queue count lands in queue 0. The cause is the missing BA classifier on CORE1, as seen in chapter 7. Fix: bind <code>CL-CORE</code> to ge-0/0/0.0.</p>
<p><b>Ticket B: "Staff cannot reach the CRM at lunchtime" (HUB).</b> Step 2: <code>show policer</code> shows only the guest instance counting. The staff traffic never matches. If staff were slow too, you would find the policer attached to the whole unit by mistake. Result in the lab: the guest instance counted 24,850 out-of-profile packets, staff counted nothing. No fix needed; the cap works.</p>
<p><b>Ticket C: "Calls break when the NAS backs up" (EDGE).</b> Step 3: <code>show interfaces queue ge-0/0/0</code> shows queue 1 with thousands of tail-dropped packets. Step 4: <code>show class-of-service interface ge-0/0/0</code> shows <code>Scheduler map: &lt;default&gt;</code>. The cause is the default map with nothing for EF. Fix: apply <code>SM-WAN</code> and repeat the test.</p>

<h3>The commit check is a troubleshooting tool</h3>
<p>Junos refuses configurations that reference something that does not exist. For example, a scheduler-map that names an undefined scheduler:</p>
<pre class="out">[edit]
lab@EDGE# commit check
[edit class-of-service scheduler-maps SM-Y]
  'forwarding-class best-effort'
    <span class="hl">Referenced scheduler 'NOPE' is not defined</span>
error: configuration check-out failed</pre>
<p>Typing the wrong scheduler name is the most common cause. Fix the reference or define the scheduler and run <code>commit</code> again.</p>

<h3>Resetting counters for a clean test</h3>
<p>Counters accumulate. Before every test run <code>clear interfaces statistics ge-0/0/0</code> and <code>clear firewall all</code>. Otherwise drops from yesterday appear in today's reading and you chase a fault that is gone. In the EDGE lab, the task explicitly clears statistics for this reason.</p>

<div class="eg"><p><b>Worked example.</b> A report says "voice is choppy". You check in order. Step 1: the ingress unit has the classifier and <code>show interfaces queue</code> shows queue 1 counting, so classification is fine. Step 2: no policer is configured. Step 3: queue 1 shows tail drops, so the queue itself overflows. Step 4: the scheduler-map is the default, so EF has no share. Root cause found in four commands. Without the order you might have spent an hour changing DSCP on the phones.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Changing several things at once, so you cannot tell which fixed it. (2) Looking at interface utilisation instead of queue counters. (3) Testing with ping only; ICMP is small and rarely fills a queue, so use a flow generator or a realistic load. (4) Forgetting that the fault may be on the other router.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often show a configuration that looks right but misses one binding: a classifier not applied, a scheduler-map on the wrong interface, or a filter without a final accept. Check bindings before values.</p></div>

<div class="scn"><h4>The upgrade that reset the scheduler</h4><p>After a maintenance window the same clinic calls broke again. The configuration still held the schedulers, but a colleague had replaced the interface stanza and removed the <code>scheduler-map SM-WAN</code> line. <code>show class-of-service interface ge-0/0/0</code> showed <code>Scheduler map: &lt;default&gt;</code>. Re-adding one line restored voice. The team added a post-change check to their runbook: compare <code>show class-of-service interface</code> before and after.</p><p><b>Lesson:</b> bindings are fragile. Verify the binding output after every change.</p></div>

<div class="iv"><p class="q">"Users report poor voice quality. What do you check on a Junos router?"</p><p>I follow the packet: first confirm the class with <code>show class-of-service interface</code> and the queue counters; then check for policers; then the scheduler-map and shaping on the egress port; then whether the marking is rewritten and trusted by the next hop. I clear counters, generate a known flow, and read <code>show interfaces queue</code> before and after a single change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot in pipeline order: classify, police, queue, schedule, rewrite.</li>
<li><code>show interfaces queue</code> proves where packets went and where they were dropped.</li>
<li><code>show class-of-service interface</code> proves what is bound.</li>
<li>Clear counters before each test.</li>
<li><code>commit check</code> catches undefined references.</li>
</ul></div>
`,hi:`
<p>CoS faults rahasyamayi lagte hain kyunki traffic chalta rehta hai; bas kharab chalta hai. Ilaaj hai pipeline ko follow karne wali fixed checks ki order. Ingress se egress ki taraf kaam karo aur pehle us stage par ruko jo aapki ummeed se match na kare.</p>

<h3>Paanch step ka workflow</h3>
<div class="dia"><svg viewBox="0 0 640 130" role="img" aria-label="Troubleshooting order">
<rect x="10" y="30" width="112" height="56" rx="8" fill="#bae6fd"/><text x="66" y="55" text-anchor="middle" class="svg-ink" font-size="12">1 Classified?</text><text x="66" y="72" text-anchor="middle" class="svg-muted" font-size="11">sahi class</text>
<rect x="136" y="30" width="112" height="56" rx="8" fill="#fde68a"/><text x="192" y="55" text-anchor="middle" class="svg-ink" font-size="12">2 Policed?</text><text x="192" y="72" text-anchor="middle" class="svg-muted" font-size="11">counters</text>
<rect x="262" y="30" width="112" height="56" rx="8" fill="#bbf7d0"/><text x="318" y="55" text-anchor="middle" class="svg-ink" font-size="12">3 Queued?</text><text x="318" y="72" text-anchor="middle" class="svg-muted" font-size="11">queue stats</text>
<rect x="388" y="30" width="112" height="56" rx="8" fill="#ddd6fe"/><text x="444" y="55" text-anchor="middle" class="svg-ink" font-size="12">4 Scheduled?</text><text x="444" y="72" text-anchor="middle" class="svg-muted" font-size="11">scheduler-map</text>
<rect x="514" y="30" width="116" height="56" rx="8" fill="#fed7aa"/><text x="572" y="55" text-anchor="middle" class="svg-ink" font-size="12">5 Rewritten?</text><text x="572" y="72" text-anchor="middle" class="svg-muted" font-size="11">agla hop</text>
<text x="320" y="115" text-anchor="middle" class="svg-muted" font-size="12">Jo pehla step aapke design se na mile wahin ruko</text>
</svg><p class="cap">Packet ko follow karo: classify, police, queue, schedule, rewrite.</p></div>
<table class="cmp"><tr><th>Step</th><th>Sawaal</th><th>Command</th></tr>
<tr><td>1</td><td>Kaunsa classifier ya filter bind hai, aur kya match karta hai?</td><td><code>show class-of-service interface</code>, <code>show configuration firewall</code></td></tr>
<tr><td>2</td><td>Kya policer drop ya mark kar raha hai?</td><td><code>show policer</code>, <code>show firewall filter NAME</code></td></tr>
<tr><td>3</td><td>Packets kaunsi queue mein gaye?</td><td><code>show interfaces queue</code></td></tr>
<tr><td>4</td><td>Egress port par sahi scheduler-map aur shaping hai?</td><td><code>show class-of-service interface</code>, <code>show class-of-service scheduler-map</code></td></tr>
<tr><td>5</td><td>Marking likhi gayi aur agle hop par trusted hai?</td><td><code>show class-of-service rewrite-rule</code>, capture, agle router ke queue counters</td></tr></table>

<h3>Teen lab tickets ka walkthrough</h3>
<p><b>Ticket A: "Nashik softphones robotic sunayi dete hain" (BR1 aur CORE1).</b> BR1 par step 1: <code>show class-of-service interface ge-0/0/1</code> <code>ipprec-compatibility</code> dikhata hai, jo expected hai kyunki kaam MF karta hai. <code>show configuration firewall</code> term <code>rtp</code> aur <code>rest</code> dikhata hai. Step 3: BR1 par <code>show interfaces queue ge-0/0/0</code> queue 1 ko ginte dikhata hai. Step 5: CORE1 par count queue 0 mein aata hai. Wajah CORE1 par BA classifier ka na hona hai, jaisa chapter 7 mein dekha. Fix: ge-0/0/0.0 par <code>CL-CORE</code> bind karo.</p>
<p><b>Ticket B: "Lunchtime par staff CRM tak nahi pahunch pata" (HUB).</b> Step 2: <code>show policer</code> sirf guest instance ko ginte dikhata hai. Staff traffic kabhi match nahi hota. Staff bhi dheema hota to aap policer ko galti se poori unit par lagaya hua paate. Lab ka nateeja: guest instance ne 24,850 out-of-profile packets gine, staff ne kuch nahi. Fix ki zaroorat nahi; cap sahi kaam karta hai.</p>
<p><b>Ticket C: "NAS backup chalte hi calls toot jaati hain" (EDGE).</b> Step 3: <code>show interfaces queue ge-0/0/0</code> queue 1 mein hazaron tail-dropped packets dikhata hai. Step 4: <code>show class-of-service interface ge-0/0/0</code> <code>Scheduler map: &lt;default&gt;</code> dikhata hai. Wajah default map hai jisme EF ke liye kuch nahi. Fix: <code>SM-WAN</code> lagao aur test dobara chalao.</p>

<h3>Commit check bhi troubleshooting tool hai</h3>
<p>Junos aisi configuration reject karta hai jo kisi na-maujood cheez ka reference de. Jaise scheduler-map jo undefined scheduler ka naam leta hai:</p>
<pre class="out">[edit]
lab@EDGE# commit check
[edit class-of-service scheduler-maps SM-Y]
  'forwarding-class best-effort'
    <span class="hl">Referenced scheduler 'NOPE' is not defined</span>
error: configuration check-out failed</pre>
<p>Galat scheduler naam type karna sabse aam wajah hai. Reference theek karo ya scheduler define karo aur dobara <code>commit</code> chalao.</p>

<h3>Saaf test ke liye counters reset karna</h3>
<p>Counters jama hote rehte hain. Har test se pehle <code>clear interfaces statistics ge-0/0/0</code> aur <code>clear firewall all</code> chalao. Warna kal ke drops aaj ki reading mein dikhte hain aur aap aisi fault ke peeche bhaagte ho jo jaa chuki hai. EDGE lab mein isi wajah se task statistics clear karne ko kehta hai.</p>

<div class="eg"><p><b>Worked example.</b> Report aayi "voice choppy hai". Aap order mein check karte ho. Step 1: ingress unit par classifier hai aur <code>show interfaces queue</code> queue 1 ko ginta dikhata hai, to classification theek hai. Step 2: koi policer configured nahi. Step 3: queue 1 mein tail drops hain, yaani queue khud overflow ho rahi hai. Step 4: scheduler-map default hai, isliye EF ka koi hissa nahi. Root cause chaar commands mein mil gaya. Order ke bina aap ghanta bhar phones ka DSCP badalne mein laga dete.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Ek saath kai cheezein badalna, jisse pata nahi chalta ki kisne fix kiya. (2) Queue counters ki jagah interface utilisation dekhna. (3) Sirf ping se test karna; ICMP chhota hota hai aur queue kam hi bharta hai, isliye flow generator ya realistic load use karo. (4) Yeh bhoolna ki fault doosre router par ho sakti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawaal aksar aisi configuration dikhate hain jo theek lagti hai lekin ek binding chhooti hoti hai: classifier apply nahi hua, scheduler-map galat interface par, ya filter bina final accept ke. Values se pehle bindings check karo.</p></div>

<div class="scn"><h4>Upgrade jisne scheduler reset kar diya</h4><p>Maintenance window ke baad usi clinic ki calls phir tootne lagi. Configuration mein schedulers the, lekin ek colleague ne interface stanza replace kar diya tha aur <code>scheduler-map SM-WAN</code> line hat gayi thi. <code>show class-of-service interface ge-0/0/0</code> ne <code>Scheduler map: &lt;default&gt;</code> dikhaya. Ek line wapas jodne se voice theek ho gayi. Team ne runbook mein post-change check jod diya: change se pehle aur baad <code>show class-of-service interface</code> compare karo.</p><p><b>Lesson:</b> bindings nazuk hote hain. Har change ke baad binding ka output verify karo.</p></div>

<div class="iv"><p class="q">"Users voice quality kharab bata rahe hain. Junos router par kya check karoge?"</p><p>Main packet ko follow karta hoon: pehle <code>show class-of-service interface</code> aur queue counters se class confirm karta hoon; phir policers; phir egress port par scheduler-map aur shaping; phir yeh ki marking rewrite hui aur agle hop par trusted hai ya nahi. Main counters clear karta hoon, known flow chalata hoon, aur sirf ek change se pehle aur baad <code>show interfaces queue</code> padhta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pipeline order mein troubleshoot karo: classify, police, queue, schedule, rewrite.</li>
<li><code>show interfaces queue</code> saabit karta hai ki packets kahan gaye aur kahan drop hue.</li>
<li><code>show class-of-service interface</code> saabit karta hai ki kya bind hai.</li>
<li>Har test se pehle counters clear karo.</li>
<li><code>commit check</code> undefined references pakadta hai.</li>
</ul></div>
`}};export{e as default};