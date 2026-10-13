var e={id:`probes-hops`,h:{en:`Probes, scores and the five hops`,hi:`Probes, scores aur paanch hops`},body:{en:`
<h3>Probes: small test visits</h3>
<p>A <b>probe</b> is a tiny, regular test the device makes toward an application, like a mystery shopper who visits the shop every few minutes and notes how long each step took. The probe records timings and losses; the portal turns them into hop values and a score. <b>No probe, no score.</b> In the portal, digital experience has a global switch (<code>zdx.enabled</code>) and a per-application switch (<code>zdx.apps.&lt;id&gt;.enabled</code>). Both must be on, otherwise the application shows "no data" instead of Good, Okay or Poor, and nobody will notice a problem there.</p>

<h3>The five hops, one by one</h3>
<table class="cmp"><tr><th>Hop</th><th>What is measured</th><th>Typical bad cause</th></tr>
<tr><td>1 Device</td><td>CPU and memory use of the laptop</td><td>Overloaded laptop, too many apps, heavy scan</td></tr>
<tr><td>2 Wi-Fi</td><td>Wireless signal quality at the user</td><td>Weak signal, interference, far from the access point</td></tr>
<tr><td>3 Internet circuit</td><td>Loss and round-trip time to the first internet side</td><td>Congested or degraded ISP link</td></tr>
<tr><td>4 Cloud path</td><td>Round-trip time through the tunnel or proxy to the security cloud</td><td>Long route, far node, failover to a distant node</td></tr>
<tr><td>5 Application</td><td>Server response time of the application itself</td><td>Slow server or database</td></tr>
</table>
<p>In our simulator these show up as user fields such as <code>cpu</code>, <code>mem</code>, <code>wifi</code>, <code>ispLoss</code>, <code>ispRtt</code>, <code>cloudRtt</code> and <code>dns</code>, and the application has <code>serverMs</code>. The portal's hop table shows which measurement feeds which hop; read it before you decide.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Hop values against baseline">
<text x="20" y="25" class="svg-ink" font-size="13">Hop value compared with its own baseline (dashed line)</text>
<line x1="20" y1="150" x2="620" y2="150" stroke="#64748b" stroke-width="2"/><line x1="20" y1="110" x2="620" y2="110" stroke="#64748b" stroke-width="1" stroke-dasharray="5 4"/>
<rect x="40" y="100" width="70" height="50" fill="#bbf7d0"/><rect x="170" y="105" width="70" height="45" fill="#bbf7d0"/><rect x="300" y="40" width="70" height="110" fill="#fed7aa"/><rect x="430" y="95" width="70" height="55" fill="#bbf7d0"/><rect x="540" y="98" width="70" height="52" fill="#bbf7d0"/>
<text x="75" y="172" text-anchor="middle" class="svg-muted" font-size="12">Device</text><text x="205" y="172" text-anchor="middle" class="svg-muted" font-size="12">Wi-Fi</text><text x="335" y="172" text-anchor="middle" class="svg-muted" font-size="12">Circuit</text><text x="465" y="172" text-anchor="middle" class="svg-muted" font-size="12">Cloud</text><text x="575" y="172" text-anchor="middle" class="svg-muted" font-size="12">App</text>
<text x="335" y="195" text-anchor="middle" class="svg-ink" font-size="12">tall bar = furthest above baseline = the cause</text>
</svg><p class="cap">Only the Internet circuit stands far above its normal level.</p></div>

<h3>Baselines</h3>
<p>A baseline is the normal value for that hop. A satellite link can have a high normal round-trip time and still be healthy for its user; the same number would be a disaster on fibre. The portal therefore compares each hop with its own baseline, and the <b>cause is the hop furthest above its baseline</b>, not the biggest raw number.</p>

<h3>From hops to score and bucket</h3>
<p>Every hop adds to or subtracts from the score. Many healthy hops with one bad hop still lowers the whole score, because the user feels the slowest link. The result is placed in a bucket: Good at 66 or above, Okay from 34 to 65, Poor below 34. Exact weights are vendor-specific and we do not state them; the exam asks you to <i>use</i> the buckets and the cause rule.</p>

<div class="eg"><p><b>Worked example.</b> kabir (Jaipur) opens the CRM. The device and Wi-Fi are near baseline, the circuit shows loss and a high round-trip time, the cloud path and server are normal. The circuit hop is furthest above baseline, so it is the cause; the score lands in Poor.</p></div>
<pre class="out">Digital experience &gt; User detail   kabir   app: CRM
Hop               Value        Baseline   vs baseline
Device            cpu 31%      35%        below
Wi-Fi             good         good       equal
Internet circuit  loss 6%      loss 0.5%  <span class="hl">much higher</span>
Cloud path        rtt 28 ms    30 ms      equal
Application       server 210   200        equal
Score 24 (Poor)   Cause: Internet circuit</pre>

<div class="note"><p><b>What does this change on the wire/policy?</b> Enabling a probe on an application starts periodic test requests from the device toward it, so a small amount of extra traffic crosses the path and may appear in logs. Changing an application's probe or alert settings never alters routing or allow rules.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Comparing hops by raw numbers instead of against baseline. (2) Leaving the application probe off and calling the app "healthy". (3) Blaming the cloud path just because it carries all traffic.</p></div>
<div class="exam"><p><b>Exam trap.</b> A hop with a high absolute value is not automatically the cause. Ask "above its own baseline by how much?".</p></div>

<div class="scn"><h4>The satellite office</h4><p>A remote site on a slow link looked terrible on a raw milliseconds chart, yet its users were happy. Against its own baseline the hop was normal. The real outlier was a laptop at 98 percent CPU in another city.</p><p><b>Lesson:</b> baselines turn numbers into judgement.</p></div>

<div class="iv"><p class="q">"How does the portal decide which hop is the problem?"</p><p>Each hop is compared with its own baseline and the one furthest above it is named as the cause. Add that a probe must be enabled for the application, otherwise there is no score at all.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Probes are small regular tests; no probe means no score.</li>
<li>Both the global and the per-application switch must be on.</li>
<li>Five hops: Device, Wi-Fi, Internet circuit, Cloud path, Application.</li>
<li>Judge each hop against its own baseline.</li>
<li>Buckets: Good 66 or more, Okay 34 to 65, Poor below 34.</li>
</ul></div>
`,hi:`
<h3>Probes: chhote test visits</h3>
<p><b>Probe</b> ek chhota, regular test hai jo device application ki taraf karta hai, mystery shopper ki tarah jo har kuch minute mein shop jaata hai aur note karta hai har step mein kitna time laga. Probe timings aur losses record karta hai; portal unhe hop values aur score mein badalta hai. <b>Probe nahi, score nahi.</b> Portal mein digital experience ka ek global switch (<code>zdx.enabled</code>) aur per-application switch (<code>zdx.apps.&lt;id&gt;.enabled</code>) hota hai. Dono on hone chahiye, warna application Good, Okay ya Poor ki jagah "no data" dikhata hai, aur wahan koi problem notice nahi karega.</p>

<h3>Paanch hops, ek ek karke</h3>
<table class="cmp"><tr><th>Hop</th><th>Kya measure hota hai</th><th>Typical bad cause</th></tr>
<tr><td>1 Device</td><td>Laptop ka CPU aur memory use</td><td>Overloaded laptop, bahut saari apps, heavy scan</td></tr>
<tr><td>2 Wi-Fi</td><td>User par wireless signal quality</td><td>Weak signal, interference, access point se door</td></tr>
<tr><td>3 Internet circuit</td><td>Internet ke pehle side tak loss aur round-trip time</td><td>Congested ya degraded ISP link</td></tr>
<tr><td>4 Cloud path</td><td>Tunnel ya proxy se security cloud tak round-trip time</td><td>Lamba route, door node, distant node par failover</td></tr>
<tr><td>5 Application</td><td>Application ka khud ka server response time</td><td>Slow server ya database</td></tr>
</table>
<p>Hamare simulator mein yeh user fields ke roop mein dikhte hain jaise <code>cpu</code>, <code>mem</code>, <code>wifi</code>, <code>ispLoss</code>, <code>ispRtt</code>, <code>cloudRtt</code> aur <code>dns</code>, aur application ka <code>serverMs</code> hota hai. Portal ki hop table batati hai kaun si measurement kaun se hop mein jaati hai; decide karne se pehle use padho.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Hop values baseline ke against">
<text x="20" y="25" class="svg-ink" font-size="13">Hop value apni baseline (dashed line) se compare</text>
<line x1="20" y1="150" x2="620" y2="150" stroke="#64748b" stroke-width="2"/><line x1="20" y1="110" x2="620" y2="110" stroke="#64748b" stroke-width="1" stroke-dasharray="5 4"/>
<rect x="40" y="100" width="70" height="50" fill="#bbf7d0"/><rect x="170" y="105" width="70" height="45" fill="#bbf7d0"/><rect x="300" y="40" width="70" height="110" fill="#fed7aa"/><rect x="430" y="95" width="70" height="55" fill="#bbf7d0"/><rect x="540" y="98" width="70" height="52" fill="#bbf7d0"/>
<text x="75" y="172" text-anchor="middle" class="svg-muted" font-size="12">Device</text><text x="205" y="172" text-anchor="middle" class="svg-muted" font-size="12">Wi-Fi</text><text x="335" y="172" text-anchor="middle" class="svg-muted" font-size="12">Circuit</text><text x="465" y="172" text-anchor="middle" class="svg-muted" font-size="12">Cloud</text><text x="575" y="172" text-anchor="middle" class="svg-muted" font-size="12">App</text>
<text x="335" y="195" text-anchor="middle" class="svg-ink" font-size="12">lamba bar = baseline se sabse upar = cause</text>
</svg><p class="cap">Sirf Internet circuit apne normal level se bahut upar hai.</p></div>

<h3>Baselines</h3>
<p>Baseline us hop ki normal value hai. Satellite link ka normal round-trip time high ho sakta hai aur phir bhi apne user ke liye healthy ho; wahi number fibre par disaster hota. Isliye portal har hop ko uski apni baseline se compare karta hai, aur <b>cause woh hop hai jo apni baseline se sabse upar hai</b>, sabse bada raw number nahi.</p>

<h3>Hops se score aur bucket tak</h3>
<p>Har hop score mein jodta ya ghatata hai. Bahut saare healthy hops ke saath ek bad hop bhi poora score girata hai, kyunki user sabse slow link feel karta hai. Result bucket mein jaata hai: Good 66 ya upar, Okay 34 se 65, Poor 34 se neeche. Exact weights vendor-specific hain aur hum unhe state nahi karte; exam mein aapko buckets aur cause rule <i>use</i> karna hota hai.</p>

<div class="eg"><p><b>Worked example.</b> kabir (Jaipur) CRM kholta hai. Device aur Wi-Fi baseline ke paas hain, circuit loss aur high round-trip time dikhata hai, cloud path aur server normal hain. Circuit hop baseline se sabse upar hai, to wahi cause hai; score Poor mein aata hai.</p></div>
<pre class="out">Digital experience &gt; User detail   kabir   app: CRM
Hop               Value        Baseline   vs baseline
Device            cpu 31%      35%        below
Wi-Fi             good         good       equal
Internet circuit  loss 6%      loss 0.5%  <span class="hl">much higher</span>
Cloud path        rtt 28 ms    30 ms      equal
Application       server 210   200        equal
Score 24 (Poor)   Cause: Internet circuit</pre>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Application par probe enable karne se device se uski taraf periodic test requests shuru hoti hain, to path par thoda extra traffic jaata hai aur logs mein dikh sakta hai. Application ki probe ya alert settings badalne se routing ya allow rules kabhi nahi badalte.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Hops ko baseline ki jagah raw numbers se compare karna. (2) Application probe off chhod kar app ko "healthy" kehna. (3) Cloud path ko sirf isliye blame karna ki woh saara traffic carry karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> High absolute value wala hop apne aap cause nahi hota. Poochho "apni baseline se kitna upar?".</p></div>

<div class="scn"><h4>Satellite office</h4><p>Slow link par ek remote site raw milliseconds chart par bahut kharab dikha, phir bhi uske users khush the. Apni baseline ke against hop normal tha. Asli outlier doosre sheher ka ek laptop tha jo 98 percent CPU par tha.</p><p><b>Seekh:</b> baselines numbers ko judgement mein badalti hain.</p></div>

<div class="iv"><p class="q">"Portal kaise decide karta hai ki kaun sa hop problem hai?"</p><p>Har hop apni baseline se compare hota hai aur jo sabse upar hai use cause bataya jaata hai. Add karo ki application ke liye probe enabled hona chahiye, warna score hi nahi hota.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Probes chhote regular tests hain; probe nahi to score nahi.</li>
<li>Global aur per-application dono switch on hone chahiye.</li>
<li>Paanch hops: Device, Wi-Fi, Internet circuit, Cloud path, Application.</li>
<li>Har hop ko uski apni baseline se judge karo.</li>
<li>Buckets: Good 66 ya upar, Okay 34 se 65, Poor 34 se neeche.</li>
</ul></div>
`}};export{e as default};