var e={id:`performance-policy`,h:{en:`Performance policy: SLAs, thresholds, move flows, FEC and packet duplication`,hi:`Performance policy: SLAs, thresholds, move flows, FEC aur packet duplication`},body:{en:`
<p>Path policy says where traffic <i>should</i> go. <b>Performance policy</b> says what quality is good enough and what the ION does when a path falls below it. The exam lists <b>performance</b> as a separate policy design topic, and it is the part that turns SD-WAN from "pick a link" into "keep the application working".</p>
<h3>Analogy: a lifeguard with rules</h3>
<p>A lifeguard watches the water. The rule book says: if the waves are above one metre, move swimmers to the shallow area; for children, always keep a float on, even in calm water. A performance rule is that rule book: thresholds (waves), actions (move swimmers) and extra protection (float) for the most sensitive users.</p>
<h3>The performance SLA</h3>
<p>A <b>performance SLA</b> is a set of metric thresholds. The documentation lists these metric groups: link quality, application, probe, system health, circuit utilisation and flow metrics. The common link quality values, with the ranges the portal accepts, are:</p>
<table class="cmp"><tr><th>Metric</th><th>Accepted range</th><th>Meaning</th></tr>
<tr><td>Latency</td><td>1 to 500 ms</td><td>Delay; measured per branch circuit using the lowest value between the branch and the data centers</td></tr>
<tr><td>Jitter</td><td>1 to 100 ms</td><td>Variation in delay</td></tr>
<tr><td>Packet loss</td><td>1 to 20 percent</td><td>Lost packets</td></tr>
<tr><td>MOS</td><td>1 to 5</td><td>Optional voice quality score</td></tr></table>
<h3>Defaults you must know</h3>
<p>On ION software 6.3.1 and later the system assigns three default performance rules to each site, with these default SLAs:</p>
<table class="cmp"><tr><th>Traffic</th><th>Latency</th><th>Packet loss</th><th>Jitter</th></tr>
<tr><td>Media (audio and video)</td><td>150 ms</td><td>2 percent</td><td>75 ms</td></tr>
<tr><td>All other (bulk and transactional)</td><td>500 ms</td><td>5 percent</td><td>100 ms</td></tr></table>
<ul>
<li>Rule 1, <b>Visibility</b>: monitoring; the media thresholds draw the threshold lines on the fabric link graphs.</li>
<li>Rule 2, <b>Media apps</b>: action <b>Move Flows</b> for audio and video, to active paths that meet the SLA, falling back to backup paths.</li>
<li>Rule 3, <b>All apps</b>: Move Flows for bulk and transactional traffic with the more tolerant SLA.</li>
</ul>
<p>The default rules themselves are not editable; you may change their SLA thresholds and actions, or add your own rules above them.</p>
<h3>Actions</h3>
<table class="cmp"><tr><th>Action</th><th>What it does</th><th>Notes</th></tr>
<tr><td><b>Create incident</b></td><td>Raises an incident when the SLA is violated</td><td>Also exists for system health rules (CPU, memory, disk, flows, circuit utilisation)</td></tr>
<tr><td><b>Move flows</b></td><td>Graceful or forced movement of flows to a path that meets the SLA</td><td>Graceful or Forced is selected in the rule</td></tr>
<tr><td><b>FEC</b> (forward error correction)</td><td>Adds redundancy so lost packets can be rebuilt; the documentation gives an effective range of 1 to 10 percent loss</td><td>Requires Move Flows enabled</td></tr>
<tr><td><b>Packet duplication</b></td><td>Replicates a session across up to three VPN paths at the same time</td><td>Requires Move Flows; use for the most critical sessions</td></tr>
<tr><td><b>Visibility</b></td><td>Shows the SLA indicator on fabric link graphs</td><td>Depends only on link quality metrics</td></tr>
<tr><td><b>App acceleration</b></td><td>Forwards direct internet TCP traffic to a SaaS service for better throughput and latency</td><td>For direct internet paths</td></tr></table>
<p>Rule match elements: applications (up to 256 per rule), application transfer type (bulk, audio, video, transactional), path filters (overlay, circuit category, path type: Direct, Prisma SD-WAN VPN, Standard VPN) and data center groups. Advanced settings include raise-above and clear-below percentages and a monitoring approach (conservative or aggressive).</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Performance thresholds">
<line x1="40" y1="190" x2="620" y2="190" stroke="#64748b" stroke-width="2"/><line x1="40" y1="190" x2="40" y2="20" stroke="#64748b" stroke-width="2"/>
<text x="50" y="16" class="svg-muted" font-size="11">loss %</text><text x="600" y="210" class="svg-muted" font-size="11">time</text>
<line x1="40" y1="120" x2="620" y2="120" stroke="#d97706" stroke-width="2" stroke-dasharray="6 4"/><text x="480" y="112" class="svg-accent" font-size="12">SLA: 2 percent loss (media)</text>
<polyline points="40,170 120,165 200,160 260,100 300,60 360,70 420,150 500,160 600,165" fill="none" stroke="#2563eb" stroke-width="3"/>
<rect x="250" y="30" width="140" height="26" rx="6" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="11">SLA violated: move flows</text>
<rect x="400" y="130" width="130" height="26" rx="6" fill="#bbf7d0"/><text x="465" y="148" text-anchor="middle" class="svg-ink" font-size="11">clears: flows may return</text>
</svg><p class="cap">When loss on a path rises above the threshold, the rule moves flows to a path that qualifies; when it falls below, flows can return.</p></div>
<h3>FEC and packet duplication: when to use</h3>
<p>The best practices page suggests two modes: <b>Always on</b> for mission-critical applications regardless of link health, and <b>Adaptive</b>, turned on only when loss exceeds the SLA. These features cost bandwidth and ION resources, and there are platform limits: larger models support many more active VPNs with FEC or duplication than the small ones (the documentation quotes 64 to 256 for the 9000 family and 8 for the 1000 to 2000 families), rule capacity differs by model, and software requirements apply (6.3.1 or later for performance policy, 6.3.2 or later recommended for FEC, 6.4.1 or later for packet duplication). Add only the business-critical or path-sensitive applications to FEC rules.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>The documented use case "protect a business-critical enterprise application" works under Configuration, Prisma SD-WAN, Policies, Performance. Create a rule named WebPoS, choose the actions FEC and Move Flows, match the WebPoS application on all public and all private paths with path type Prisma SD-WAN VPN, enable link quality metrics and set jitter 50 ms, latency 150 ms and packet loss 1 percent. The path policy has the active path as Prisma SD-WAN VPN on primary internet, no backup path and a Layer 3 failure path as Prisma SD-WAN VPN on metered 5G. The documentation reports transport packet loss reduced from about 5 percent to 0 percent and effectively no transaction failures.</p>
<div class="eg"><p><b>Worked example: voice at STORE-007.</b> Voice needs low loss and jitter. Rule: match audio transfer type, SLA latency 150 ms, jitter 30 ms, loss 1 percent, action Move Flows (graceful) plus Create Incident. Internet-A shows 3 percent loss for 90 seconds, violating the SLA: new calls use MPLS, an incident is raised and the NOC sees it. Add adaptive FEC with a loss window of 1 to 5 percent so that a modestly lossy path is still usable for calls already in progress.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Setting SLAs tighter than the circuits can ever meet, so flows move constantly. FEC or duplication on bulk traffic, which wastes capacity. Forgetting that FEC and duplication require Move Flows. Relying on default rules without checking that their thresholds match the application.</p></div>
<div class="exam"><p><b>Exam trap.</b> Defaults: media 150 ms, 2 percent loss, 75 ms jitter; others 500 ms, 5 percent, 100 ms; three default rules (Visibility, Media apps, All apps); not editable themselves. FEC and packet duplication require Move Flows; duplication replicates over up to three VPN paths.</p></div>
<div class="scn"><h4>Always on, then adaptive</h4><p>A retailer enabled packet duplication for all transactional traffic and found the 100 Mbps circuits were suddenly 40 percent busier. They kept duplication always on only for card payments, which are small, and used adaptive FEC for ERP. Utilisation fell back to normal while payment success stayed at the target.</p><p><b>Lesson:</b> spend the redundancy overhead only where it earns revenue.</p></div>
<div class="iv"><p class="q">"What is the difference between path policy and performance policy?"</p><p>Path policy chooses the paths (active, backup, Layer 3 failure) for an application. Performance policy defines the SLA thresholds for latency, jitter, loss and other metrics, and the action when a path violates them: raise an incident, move flows, add FEC or packet duplication. They work together: the path list gives the candidates, the performance policy decides when to leave one.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A performance SLA is a set of metric thresholds; link quality ranges: latency 1 to 500 ms, jitter 1 to 100 ms, loss 1 to 20 percent, MOS 1 to 5.</li>
<li>Default SLAs: media 150 ms, 2 percent, 75 ms; other 500 ms, 5 percent, 100 ms.</li>
<li>Actions: create incident, move flows (graceful or forced), FEC, packet duplication (up to three paths), visibility, app acceleration.</li>
<li>FEC and duplication need Move Flows and platform and software support.</li>
<li>Apply FEC and duplication only to critical or path-sensitive applications.</li>
</ul></div>
`,hi:`
<p>Path policy batati hai ki traffic <i>ko</i> kahan jaana chahiye. <b>Performance policy</b> batati hai ki kitni quality kaafi achhi hai aur jab path usse neeche aaye to ION kya karta hai. Exam <b>performance</b> ko alag policy design topic ki tarah list karta hai, aur yahi hissa SD-WAN ko "link chuno" se "application ko chalta rakho" tak le jaata hai.</p>
<h3>Analogy: rules wala lifeguard</h3>
<p>Lifeguard paani dekhta hai. Rule book kehti hai: agar lehrein ek meter se upar hon to swimmers ko shallow area mein le jao; bachchon ke liye shaant paani mein bhi float hamesha lagao. Performance rule wahi rule book hai: thresholds (lehrein), actions (swimmers ko move karna) aur sabse sensitive users ke liye extra protection (float).</p>
<h3>Performance SLA</h3>
<p><b>Performance SLA</b> metric thresholds ka set hai. Documentation yeh metric groups batati hai: link quality, application, probe, system health, circuit utilisation aur flow metrics. Common link quality values, un ranges ke saath jo portal accept karta hai:</p>
<table class="cmp"><tr><th>Metric</th><th>Accepted range</th><th>Matlab</th></tr>
<tr><td>Latency</td><td>1 se 500 ms</td><td>Delay; har branch circuit par branch aur data centers ke beech lowest value se naapa jaata hai</td></tr>
<tr><td>Jitter</td><td>1 se 100 ms</td><td>Delay mein variation</td></tr>
<tr><td>Packet loss</td><td>1 se 20 percent</td><td>Khoye hue packets</td></tr>
<tr><td>MOS</td><td>1 se 5</td><td>Optional voice quality score</td></tr></table>
<h3>Defaults jo aapko aane chahiye</h3>
<p>ION software 6.3.1 aur baad mein system har site ko teen default performance rules deta hai, in default SLAs ke saath:</p>
<table class="cmp"><tr><th>Traffic</th><th>Latency</th><th>Packet loss</th><th>Jitter</th></tr>
<tr><td>Media (audio aur video)</td><td>150 ms</td><td>2 percent</td><td>75 ms</td></tr>
<tr><td>Baaki sab (bulk aur transactional)</td><td>500 ms</td><td>5 percent</td><td>100 ms</td></tr></table>
<ul>
<li>Rule 1, <b>Visibility</b>: monitoring; media thresholds fabric link graphs par threshold lines banate hain.</li>
<li>Rule 2, <b>Media apps</b>: audio aur video ke liye action <b>Move Flows</b>, SLA meet karne wale active paths par, backup paths par fall back ke saath.</li>
<li>Rule 3, <b>All apps</b>: bulk aur transactional traffic ke liye zyada tolerant SLA ke saath Move Flows.</li>
</ul>
<p>Default rules khud editable nahi hain; aap unke SLA thresholds aur actions badal sakte ho, ya unke upar apne rules add kar sakte ho.</p>
<h3>Actions</h3>
<table class="cmp"><tr><th>Action</th><th>Kya karta hai</th><th>Notes</th></tr>
<tr><td><b>Create incident</b></td><td>SLA violate hone par incident raise karta hai</td><td>System health rules (CPU, memory, disk, flows, circuit utilisation) ke liye bhi hai</td></tr>
<tr><td><b>Move flows</b></td><td>Flows ko SLA meet karne wale path par graceful ya forced move karta hai</td><td>Graceful ya Forced rule mein chuna jaata hai</td></tr>
<tr><td><b>FEC</b> (forward error correction)</td><td>Redundancy jodta hai taaki khoye packets dobara ban sakein; documentation 1 se 10 percent loss ki effective range deti hai</td><td>Move Flows enabled hona zaroori</td></tr>
<tr><td><b>Packet duplication</b></td><td>Session ko ek saath teen VPN paths tak replicate karta hai</td><td>Move Flows chahiye; sabse critical sessions ke liye</td></tr>
<tr><td><b>Visibility</b></td><td>Fabric link graphs par SLA indicator dikhata hai</td><td>Sirf link quality metrics par depend karta hai</td></tr>
<tr><td><b>App acceleration</b></td><td>Direct internet TCP traffic ko SaaS service ki taraf forward karta hai, behtar throughput aur latency ke liye</td><td>Direct internet paths ke liye</td></tr></table>
<p>Rule match elements: applications (har rule mein 256 tak), application transfer type (bulk, audio, video, transactional), path filters (overlay, circuit category, path type: Direct, Prisma SD-WAN VPN, Standard VPN) aur data center groups. Advanced settings mein raise-above aur clear-below percentages aur monitoring approach (conservative ya aggressive) hain.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Performance thresholds">
<line x1="40" y1="190" x2="620" y2="190" stroke="#64748b" stroke-width="2"/><line x1="40" y1="190" x2="40" y2="20" stroke="#64748b" stroke-width="2"/>
<text x="50" y="16" class="svg-muted" font-size="11">loss %</text><text x="600" y="210" class="svg-muted" font-size="11">time</text>
<line x1="40" y1="120" x2="620" y2="120" stroke="#d97706" stroke-width="2" stroke-dasharray="6 4"/><text x="440" y="112" class="svg-accent" font-size="12">SLA: 2 percent loss (media)</text>
<polyline points="40,170 120,165 200,160 260,100 300,60 360,70 420,150 500,160 600,165" fill="none" stroke="#2563eb" stroke-width="3"/>
<rect x="250" y="30" width="140" height="26" rx="6" fill="#fde68a"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="11">SLA violate: move flows</text>
<rect x="400" y="130" width="130" height="26" rx="6" fill="#bbf7d0"/><text x="465" y="148" text-anchor="middle" class="svg-ink" font-size="11">clear: flows wapas aa sakte</text>
</svg><p class="cap">Jab path par loss threshold se upar jaata hai, rule flows ko qualify karne wale path par move karta hai; jab neeche aata hai, flows wapas aa sakte hain.</p></div>
<h3>FEC aur packet duplication: kab use karein</h3>
<p>Best practices page do modes suggest karta hai: <b>Always on</b> mission-critical applications ke liye link health se bina matlab, aur <b>Adaptive</b>, jo sirf tab on hota hai jab loss SLA se zyada ho. Yeh features bandwidth aur ION resources kharch karte hain, aur platform limits hain: bade models FEC ya duplication ke saath chhote models se bahut zyada active VPNs support karte hain (documentation 9000 family ke liye 64 se 256 aur 1000 se 2000 families ke liye 8 batati hai), rule capacity model ke hisaab se alag hai, aur software requirements lagu hain (performance policy ke liye 6.3.1 ya baad, FEC ke liye 6.3.2 ya baad recommended, packet duplication ke liye 6.4.1 ya baad). FEC rules mein sirf business-critical ya path-sensitive applications daalo.</p>
<h3>Portal walk-through (not run in the simulator)</h3>
<p>Documented use case "protect a business-critical enterprise application" Configuration, Prisma SD-WAN, Policies, Performance ke under chalta hai. WebPoS naam ka rule banao, actions FEC aur Move Flows chuno, WebPoS application ko all public aur all private paths par path type Prisma SD-WAN VPN ke saath match karo, link quality metrics enable karo aur jitter 50 ms, latency 150 ms aur packet loss 1 percent set karo. Path policy mein active path primary internet par Prisma SD-WAN VPN, koi backup path nahi aur Layer 3 failure path metered 5G par Prisma SD-WAN VPN hai. Documentation report karti hai ki transport packet loss lagbhag 5 percent se 0 percent ho gaya aur transaction failures lagbhag khatam.</p>
<div class="eg"><p><b>Worked example: STORE-007 par voice.</b> Voice ko kam loss aur jitter chahiye. Rule: audio transfer type match, SLA latency 150 ms, jitter 30 ms, loss 1 percent, action Move Flows (graceful) plus Create Incident. Internet-A 90 second ke liye 3 percent loss dikhata hai, SLA violate: naye calls MPLS use karte hain, incident raise hota hai aur NOC dekhta hai. Adaptive FEC 1 se 5 percent loss window ke saath jodo taaki thoda lossy path bhi chal rahe calls ke liye use ho sake.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> SLAs ko circuits ki capability se zyada tight set karna, jisse flows lagataar move hote hain. Bulk traffic par FEC ya duplication, jo capacity waste karta hai. Yeh bhoolna ki FEC aur duplication ko Move Flows chahiye. Default rules par bharosa karna bina check kiye ki unke thresholds application se match karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Defaults: media 150 ms, 2 percent loss, 75 ms jitter; baaki 500 ms, 5 percent, 100 ms; teen default rules (Visibility, Media apps, All apps); khud editable nahi. FEC aur packet duplication ko Move Flows chahiye; duplication teen VPN paths tak replicate karta hai.</p></div>
<div class="scn"><h4>Always on, phir adaptive</h4><p>Ek retailer ne saare transactional traffic ke liye packet duplication enable kiya aur dekha ki 100 Mbps circuits achanak 40 percent zyada busy ho gaye. Unhone duplication sirf card payments ke liye always on rakha, jo chhote hote hain, aur ERP ke liye adaptive FEC use kiya. Utilisation normal par aa gayi jabki payment success target par raha.</p><p><b>Seekh:</b> redundancy overhead sirf wahin kharch karo jahan woh revenue kamata hai.</p></div>
<div class="iv"><p class="q">"Path policy aur performance policy mein kya farak hai?"</p><p>Path policy application ke liye paths (active, backup, Layer 3 failure) chunti hai. Performance policy latency, jitter, loss aur doosre metrics ke SLA thresholds define karti hai, aur path ke violate karne par action: incident raise karo, flows move karo, FEC ya packet duplication jodo. Dono saath kaam karti hain: path list candidates deti hai, performance policy tay karti hai ki kab ek ko chhodna hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Performance SLA metric thresholds ka set hai; link quality ranges: latency 1 se 500 ms, jitter 1 se 100 ms, loss 1 se 20 percent, MOS 1 se 5.</li>
<li>Default SLAs: media 150 ms, 2 percent, 75 ms; baaki 500 ms, 5 percent, 100 ms.</li>
<li>Actions: create incident, move flows (graceful ya forced), FEC, packet duplication (teen paths tak), visibility, app acceleration.</li>
<li>FEC aur duplication ko Move Flows aur platform aur software support chahiye.</li>
<li>FEC aur duplication sirf critical ya path-sensitive applications par lagao.</li>
</ul></div>
`}};export{e as default};