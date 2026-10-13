var e={id:`what-to-monitor`,h:{en:`What to monitor in a Versa SD-WAN`,hi:`Versa SD-WAN mein kya monitor karein`},body:{en:`
<p>You cannot watch everything, and watching everything equally is the same as watching nothing. Good monitoring starts with one question: <b>what would tell me, early, that a user is about to be hurt?</b> Think of a car dashboard. It shows speed, fuel, engine temperature and a few warning lights. It does not show every sensor in the engine. A Versa SD-WAN dashboard should work the same way: a handful of signals per layer, each with a normal range and an owner.</p>

<h3>The seven things worth watching</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Monitoring layers">
<rect x="20" y="14" width="600" height="30" rx="6" fill="#fde68a"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">7. Application experience: voice, ERP, web per site</text>
<rect x="20" y="50" width="600" height="30" rx="6" fill="#fed7aa"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">6. Log flow: branch to Analytics, per source</text>
<rect x="20" y="86" width="600" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="13">5. Headend health: Director, Controller, Analytics</text>
<rect x="20" y="122" width="600" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="13">4. Onboarding and configuration state: Online, template revision</text>
<rect x="20" y="158" width="600" height="30" rx="6" fill="#bae6fd"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">3. Circuit utilisation: Mbps in and out per WAN interface</text>
<rect x="20" y="194" width="600" height="30" rx="6" fill="#bae6fd"/><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="13">2. Path quality: latency, jitter, loss per transport (SLA monitor)</text>
<rect x="20" y="230" width="600" height="26" rx="6" fill="#e2e8f0"/><text x="320" y="248" text-anchor="middle" class="svg-ink" font-size="13">1. Tunnel and BGP state: up or down, Established or Idle</text>
</svg><p class="cap">Monitor from the bottom up. If layer 1 is red, the layers above it are meaningless until it is fixed.</p></div>

<dl class="terms">
<dt>1. Tunnel and BGP state</dt><dd>Each WAN interface of a branch builds an overlay tunnel (IPsec) to the Controller's transport. The MP-BGP session to the Controller carries the LAN prefixes. If the session is <b>Established</b> there is at least one tunnel up. If it is <b>Idle</b>, the branch is isolated from the overlay. In the course CLI: <code>show orgs org Acme sd-wan brief</code> and <code>show bgp neighbor brief</code>.</dd>
<dt>2. Path quality</dt><dd>Branches send small probes on every tunnel and measure <b>latency</b> (delay), <b>jitter</b> (variation of delay) and <b>loss</b>. These are compared against <b>SLA profiles</b>. In the course CLI: <code>show orgs org Acme sd-wan sla-monitor status</code>.</dd>
<dt>3. Circuit utilisation</dt><dd>How full each circuit is. A circuit at 95 percent for ten minutes causes queueing, jitter and loss even though the carrier is healthy. Utilisation is mainly an Analytics view in real Versa.</dd>
<dt>4. Onboarding and configuration state</dt><dd>Is the branch <b>Online</b>? Is it on the intended template revision? Is a commit pending? Drift between intended and running state is a silent risk.</dd>
<dt>5. Headend health</dt><dd>Director reachable, Controller registered and reachable, Analytics collector enabled. A sick Controller affects every branch at once. In the course CLI: <code>show system director status</code> on the Controller, <code>show controllers</code> and <code>show analytics</code> on the Director, <code>show analytics log-collector status</code> on Analytics.</dd>
<dt>6. Log flow</dt><dd>Each branch exports logs to the Analytics collector. If a source goes quiet, your dashboards go blind for that site, and nobody gets an error. <code>show analytics sources</code> lists who is exporting.</dd>
<dt>7. Application experience</dt><dd>The user's view: is voice good at Delhi? The first six layers explain it; the seventh is what the business feels.</dd>
</dl>

<h3>Normal, warning, critical: thresholds and baselines</h3>
<p>A number means nothing without a baseline. The course default circuit qualities are: Internet 30 ms latency, 6 ms jitter, 0.3 percent loss; MPLS 20 ms, 2 ms, 0.05 percent; LTE 60 ms, 15 ms, 1 percent. The <code>VOICE</code> SLA profile is latency 150 ms, jitter 30 ms, loss 1 percent. So Internet at 30/6/0.3 is healthy for voice. If Internet jumps to 40 ms that is a change from baseline but still within SLA: worth a note, not a page. If loss reaches 2 percent, Internet no longer meets VOICE and the policy will prefer another transport: that is an event.</p>
<div class="eg"><p><b>Worked example.</b> Alert design for Delhi. Warning when any transport is above 70 percent of the SLA limit (voice latency above 105 ms, loss above 0.7 percent) for 10 minutes; critical when a tunnel goes down or MP-BGP leaves Established; critical when no log source update arrives for 15 minutes. Warnings go to a ticket queue, criticals page the on-call engineer. Notice that three different thresholds protect three different failure types.</p></div>

<h3>Redundancy changes what is urgent</h3>
<p>Delhi has three circuits (Internet, MPLS, LTE). One tunnel down is a <b>degradation</b> because the site still works: urgent for the carrier ticket, not for a midnight call. Three tunnels down is an <b>outage</b>. A site with a single circuit has no such luxury. Alert severity should follow the remaining redundancy, not just the event name.</p>

<h3>What "healthy" looks like in the course CLI</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.20 (CTL)   Overlay (MP-BGP): <span class="hl">Established</span>
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    up      -
LTE        vni-0/2    up      -

admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status
Transport  State  Latency   Jitter   Loss    Meets SLA profile
Internet   up     30 ms     6 ms     0.3 %   VOICE=yes
MPLS       up     20 ms     2 ms     0.05 %  VOICE=yes
LTE        up     60 ms     15 ms    1 %     VOICE=yes</pre>
<p>Save a healthy snapshot like this in your runbook. During an incident, the difference from the snapshot is your first clue.</p>

<div class="warn"><p><b>Common mistakes.</b> Alerting on every event (alert fatigue, so real alarms are ignored); no baseline; monitoring tunnels but not log flow; using averages that hide short loss bursts; forgetting that the monitoring system itself can fail.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Interface up" does not mean "circuit working". A WAN interface can be up (the cable to the carrier box is fine) while the carrier network behind it is broken. Always check the tunnel or SLA state, not only the interface.</p></div>

<div class="scn"><h4>The dashboard nobody opened</h4><p>A retail company noticed in a quarterly review that one store had no security logs for six weeks. The branch had been replaced after a hardware fault and the log exporter destination was never restored. Nothing alarmed because the dashboards only showed sources that were present. After the incident the team added an alert on the number of active log sources against the number of onboarded sites.</p><p><b>Lesson:</b> monitor for absence as well as for bad values.</p></div>

<div class="iv"><p class="q">"What would you monitor on a new SD-WAN deployment?"</p><p>Go bottom up: tunnel and BGP state, SLA metrics per transport, circuit utilisation, onboarding and template state, headend health, log flow, application experience. Add baselines, alert only on actionable thresholds, and make severity depend on remaining redundancy.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Monitor in layers, bottom up: tunnels, quality, utilisation, state, headend, logs, applications.</li>
<li>Numbers need baselines and SLA thresholds.</li>
<li>Alert on absence (silent logs) as well as on bad values.</li>
<li>Severity depends on remaining redundancy.</li>
<li>Interface up is not the same as circuit working.</li>
</ul></div>
`,hi:`
<p>Aap sab kuch nahi dekh sakte, aur sab kuch barabar dekhna matlab kuch nahi dekhna. Achhi monitoring ek sawal se shuru hoti hai: <b>wo kaunsa signal hai jo mujhe jaldi bata de ki user ko takleef hone wali hai?</b> Car dashboard socho. Wo speed, fuel, engine temperature aur kuch warning lights dikhata hai. Engine ka har sensor nahi dikhata. Versa SD-WAN dashboard bhi aisa hi hona chahiye: har layer ke kuch signals, har ek ki normal range aur owner.</p>

<h3>Saat cheezein jo dekhne layak hain</h3>
<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Monitoring layers">
<rect x="20" y="14" width="600" height="30" rx="6" fill="#fde68a"/><text x="320" y="34" text-anchor="middle" class="svg-ink" font-size="13">7. Application experience: voice, ERP, web har site par</text>
<rect x="20" y="50" width="600" height="30" rx="6" fill="#fed7aa"/><text x="320" y="70" text-anchor="middle" class="svg-ink" font-size="13">6. Log flow: branch se Analytics, har source ka</text>
<rect x="20" y="86" width="600" height="30" rx="6" fill="#ddd6fe"/><text x="320" y="106" text-anchor="middle" class="svg-ink" font-size="13">5. Headend health: Director, Controller, Analytics</text>
<rect x="20" y="122" width="600" height="30" rx="6" fill="#bbf7d0"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="13">4. Onboarding aur configuration state: Online, template revision</text>
<rect x="20" y="158" width="600" height="30" rx="6" fill="#bae6fd"/><text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">3. Circuit utilisation: har WAN interface ka Mbps in aur out</text>
<rect x="20" y="194" width="600" height="30" rx="6" fill="#bae6fd"/><text x="320" y="214" text-anchor="middle" class="svg-ink" font-size="13">2. Path quality: latency, jitter, loss har transport ka (SLA monitor)</text>
<rect x="20" y="230" width="600" height="26" rx="6" fill="#e2e8f0"/><text x="320" y="248" text-anchor="middle" class="svg-ink" font-size="13">1. Tunnel aur BGP state: up ya down, Established ya Idle</text>
</svg><p class="cap">Neeche se upar monitor karo. Layer 1 red hai to upar ki layers tab tak meaningless hain jab tak use fix na karo.</p></div>

<dl class="terms">
<dt>1. Tunnel aur BGP state</dt><dd>Branch ka har WAN interface Controller ke transport tak overlay tunnel (IPsec) banata hai. Controller ke saath MP-BGP session LAN prefixes carry karta hai. Session <b>Established</b> hai to kam se kam ek tunnel up hai. <b>Idle</b> hai to branch overlay se isolate hai. Course CLI mein: <code>show orgs org Acme sd-wan brief</code> aur <code>show bgp neighbor brief</code>.</dd>
<dt>2. Path quality</dt><dd>Branches har tunnel par chhote probes bhejte hain aur <b>latency</b> (delay), <b>jitter</b> (delay ka variation) aur <b>loss</b> naapte hain. Inhe <b>SLA profiles</b> se compare kiya jata hai. Course CLI mein: <code>show orgs org Acme sd-wan sla-monitor status</code>.</dd>
<dt>3. Circuit utilisation</dt><dd>Circuit kitna full hai. 95 percent par das minute rehne wala circuit queueing, jitter aur loss deta hai, chahe carrier healthy ho. Real Versa mein utilisation mainly Analytics view hai.</dd>
<dt>4. Onboarding aur configuration state</dt><dd>Kya branch <b>Online</b> hai? Kya wo intended template revision par hai? Kya koi commit pending hai? Intended aur running state ka drift ek silent risk hai.</dd>
<dt>5. Headend health</dt><dd>Director reachable, Controller registered aur reachable, Analytics collector enabled. Beemar Controller har branch ko ek saath affect karta hai. Course CLI mein: Controller par <code>show system director status</code>, Director par <code>show controllers</code> aur <code>show analytics</code>, Analytics par <code>show analytics log-collector status</code>.</dd>
<dt>6. Log flow</dt><dd>Har branch logs Analytics collector ko export karta hai. Source chup ho jaye to us site ke liye dashboards andhe ho jate hain, aur kisi ko error nahi milta. <code>show analytics sources</code> batata hai kaun export kar raha hai.</dd>
<dt>7. Application experience</dt><dd>User ka view: kya Delhi mein voice achhi hai? Pehli chhe layers isse explain karti hain; saatvi wo hai jo business mehsoos karta hai.</dd>
</dl>

<h3>Normal, warning, critical: thresholds aur baselines</h3>
<p>Baseline ke bina number ka koi matlab nahi. Course ke default circuit qualities hain: Internet 30 ms latency, 6 ms jitter, 0.3 percent loss; MPLS 20 ms, 2 ms, 0.05 percent; LTE 60 ms, 15 ms, 1 percent. <code>VOICE</code> SLA profile hai latency 150 ms, jitter 30 ms, loss 1 percent. To Internet 30/6/0.3 voice ke liye healthy hai. Internet 40 ms ho jaye to baseline se change hai lekin SLA ke andar: note karne layak, page karne layak nahi. Loss 2 percent ho jaye to Internet ab VOICE meet nahi karta aur policy doosra transport prefer karegi: ye event hai.</p>
<div class="eg"><p><b>Worked example.</b> Delhi ke liye alert design. Warning jab koi transport SLA limit ke 70 percent se upar ho (voice latency 105 ms se upar, loss 0.7 percent se upar) das minute tak; critical jab tunnel down ho ya MP-BGP Established chhod de; critical jab 15 minute tak koi log source update na aaye. Warnings ticket queue mein jati hain, criticals on-call engineer ko page karte hain. Dhyan do ki teen alag thresholds teen alag failure types ko protect karte hain.</p></div>

<h3>Redundancy decide karti hai kya urgent hai</h3>
<p>Delhi ke teen circuits hain (Internet, MPLS, LTE). Ek tunnel down hona <b>degradation</b> hai kyunki site abhi chal rahi hai: carrier ticket ke liye urgent, raat ke teen baje call ke liye nahi. Teeno tunnels down ho to <b>outage</b> hai. Single circuit wali site ke paas ye luxury nahi. Alert severity event ke naam se nahi, bachi hui redundancy se judi honi chahiye.</p>

<h3>Course CLI mein "healthy" kaisa dikhta hai</h3>
<pre class="out">admin@Branch1-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 101   Hostname: Branch1
Controller: 198.51.100.20 (CTL)   Overlay (MP-BGP): <span class="hl">Established</span>
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    up      -
LTE        vni-0/2    up      -

admin@Branch1-cli&gt; show orgs org Acme sd-wan sla-monitor status
Transport  State  Latency   Jitter   Loss    Meets SLA profile
Internet   up     30 ms     6 ms     0.3 %   VOICE=yes
MPLS       up     20 ms     2 ms     0.05 %  VOICE=yes
LTE        up     60 ms     15 ms    1 %     VOICE=yes</pre>
<p>Aisa healthy snapshot apni runbook mein save karo. Incident ke time snapshot se difference aapka pehla clue hai.</p>

<div class="warn"><p><b>Common mistakes.</b> Har event par alert (alert fatigue, to asli alarms ignore hote hain); baseline na hona; tunnels monitor karna lekin log flow nahi; averages use karna jo chhote loss bursts chhupa dete hain; ye bhoolna ki monitoring system khud bhi fail ho sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Interface up" ka matlab "circuit working" nahi. WAN interface up ho sakta hai (carrier box tak cable theek hai) jabki uske peeche carrier network toota ho. Sirf interface nahi, tunnel ya SLA state hamesha check karo.</p></div>

<div class="scn"><h4>Wo dashboard jo kisi ne nahi khola</h4><p>Ek retail company ne quarterly review mein dekha ki ek store ke chhe hafte se security logs nahi the. Hardware fault ke baad branch replace hui thi aur log exporter destination restore nahi hua tha. Koi alarm nahi baja kyunki dashboards sirf present sources dikhate the. Incident ke baad team ne onboarded sites ke against active log sources ki ginti par alert lagaya.</p><p><b>Lesson:</b> bad values ke saath absence ko bhi monitor karo.</p></div>

<div class="iv"><p class="q">"Naye SD-WAN deployment par aap kya monitor karoge?"</p><p>Bottom up jao: tunnel aur BGP state, har transport ka SLA metrics, circuit utilisation, onboarding aur template state, headend health, log flow, application experience. Baselines rakho, sirf actionable thresholds par alert do, aur severity bachi hui redundancy par rakho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layers mein, neeche se upar monitor karo: tunnels, quality, utilisation, state, headend, logs, applications.</li>
<li>Numbers ko baselines aur SLA thresholds chahiye.</li>
<li>Bad values ke saath absence (silent logs) par bhi alert do.</li>
<li>Severity bachi hui redundancy par depend karti hai.</li>
<li>Interface up aur circuit working same nahi.</li>
</ul></div>
`}};export{e as default};