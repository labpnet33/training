var e={id:`troubleshoot-telemetry`,h:{en:`Troubleshooting telemetry`,hi:`Telemetry troubleshooting`},body:{en:`
<h3>A stream that says nothing</h3>
<p>A broken poll gives you an error. A broken stream gives you <b>silence</b>, and silence looks exactly like "nothing is happening". That is why telemetry troubleshooting starts with a hard rule: never trust an empty graph until you have proved the stream is alive. In this chapter you learn an ordered workflow and then walk through lab obs-tel-2, where the subscription on R-KCH shows no updates.</p>

<h3>The reason codes the console gives you</h3>
<p>Each subscription card on the Telemetry page shows a badge. When it is not green "streaming", the badge text is the reason. The nine possible answers are worth learning, because they are also a checklist in the right order:</p>
<table class="cmp"><tr><th>Reason</th><th>Meaning</th><th>First fix</th></tr>
<tr><td>disabled</td><td>The subscription switch is off</td><td>Turn Enabled on</td></tr>
<tr><td>target-down</td><td>The device itself is not up</td><td>Fix the device or link first</td></tr>
<tr><td>gnmi-off</td><td>gNMI service is not running on the device</td><td>Enable it on the device</td></tr>
<tr><td>port</td><td>Subscription port differs from the device port</td><td>Match the device port</td></tr>
<tr><td>tls</td><td>TLS settings on the two sides disagree or the certificate fails</td><td>Align TLS, fix the certificate</td></tr>
<tr><td>path</td><td>The path is not in the device model</td><td>Correct the path</td></tr>
<tr><td>mode</td><td>Mode not allowed for that path (for example on-change on a counter)</td><td>Use sample</td></tr>
<tr><td>collector</td><td>Collector address is not where the collector listens</td><td>Correct address and port</td></tr>
<tr><td>ok</td><td>Updates arrive</td><td>Nothing to fix</td></tr></table>
<p>The same list works on real gNMI deployments, only the words differ: connection refused, TLS handshake failure, "path not found" or "unsupported mode".</p>

<h3>The ordered workflow</h3>
<ol>
<li><b>Is the device alive?</b> Use Live tools: ping the target. If it fails, this is not a telemetry problem.</li>
<li><b>Is the subscription enabled and applied?</b> The card shows your edit in "After Apply" and the live state next to the badge. A dirty CommitBar means you have not applied.</li>
<li><b>Is the service on and the port right?</b> Compare the subscription port with the device port.</li>
<li><b>Is TLS aligned?</b></li>
<li><b>Does the path exist and allow the mode?</b> Compare against the model list.</li>
<li><b>Does the collector address match?</b></li>
<li><b>Prove it.</b> Run a Live tools capture on the target filtered to the collector and watch packets flow.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Telemetry check order">
<rect x="10" y="60" width="90" height="44" rx="8" fill="#bae6fd"/><text x="55" y="86" text-anchor="middle" class="svg-ink" font-size="12">Device up</text>
<rect x="115" y="60" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="160" y="86" text-anchor="middle" class="svg-ink" font-size="12">Enabled</text>
<rect x="220" y="60" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="265" y="86" text-anchor="middle" class="svg-ink" font-size="12">Port + TLS</text>
<rect x="325" y="60" width="90" height="44" rx="8" fill="#fde68a"/><text x="370" y="86" text-anchor="middle" class="svg-ink" font-size="12">Path + mode</text>
<rect x="430" y="60" width="90" height="44" rx="8" fill="#fed7aa"/><text x="475" y="86" text-anchor="middle" class="svg-ink" font-size="12">Collector</text>
<rect x="535" y="60" width="95" height="44" rx="8" fill="#e2e8f0"/><text x="582" y="86" text-anchor="middle" class="svg-ink" font-size="12">Capture</text>
<g stroke="#64748b" stroke-width="2"><line x1="100" y1="82" x2="115" y2="82"/><line x1="205" y1="82" x2="220" y2="82"/><line x1="310" y1="82" x2="325" y2="82"/><line x1="415" y1="82" x2="430" y2="82"/><line x1="520" y1="82" x2="535" y2="82"/></g>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">work left to right, change one thing at a time, then prove with a capture</text>
</svg><p class="cap">Each box rules out one cause before you move on.</p></div>

<h3>Lab obs-tel-2: the Kochi subscription shows no updates</h3>
<p>Scenario: Meena Iyer in the Kochi office reports that the link status panel for the router stopped moving. In OBSERVER, Telemetry shows <code>ts-if-kch</code> with a red badge. The network is built with the tweak <code>telemetry-off</code>.</p>
<pre class="out">Telemetry            applied state
ts-if-kch  (R-KCH)   status <span class="hl">port</span>
path       /interfaces/interface[name=Gi0/1]/state/oper_status
mode       on-change    collector 10.1.50.100:57400  tls on
agent      gnmi enabled  port 57401  tls ok</pre>
<p>Read the output like an engineer. The agent listens on 57401 but the subscription uses 57400: reason <code>port</code>. Fixing only the port is not enough: the path uses <code>oper_status</code> with an underscore, but the model node is <code>oper-status</code>. Two faults stack, and the console shows the first one it finds. After you fix the port, the badge changes to <code>path</code>. This is normal: peel one layer at a time.</p>
<ol>
<li>Open <b>Telemetry</b>, press <b>Edit</b> on <code>ts-if-kch</code>.</li>
<li>Set <b>Device port</b> to 57401. Apply. Badge now says path.</li>
<li>Correct the <b>Path</b> to <code>/interfaces/interface[name=Gi0/1]/state/oper-status</code>. Apply. Badge is green.</li>
<li>Open <b>Live tools</b>, choose capture, target R-KCH, filter on the collector host. Run it. The packets prove traffic flows, and the run is recorded in the audit log.</li>
<li>Answer the Why question on the page in your own words: the subscription failed because the port and the path did not match the device.</li>
</ol>
<p><b>What does this change on the wire/policy?</b> The port edit changes which TCP port the secure channel is opened to on the device; the path edit changes which model node the stream carries. Nothing about the router configuration changed. The router was always correct; the subscription pointed at the wrong things. The capture is read-only evidence.</p>

<h3>The other telemetry fault: a coarse interval</h3>
<p>With the tweak <code>microburst</code>, the subscription <code>ts-cnt-hyd</code> watches queue depth and an 800 ms event happens. The badge is green, data arrives, and yet the burst does not appear. This is not a failure of the stream, it is a design error. The test tool shows the event as hidden for sample 10000 ms. The fix is to reduce the interval to 500 ms or lower on that one subscription, not on all of them.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Fixing the first reason code and declaring victory without checking that the badge is green. (2) Changing three things at once, so you cannot tell which fixed it. (3) Editing the card and forgetting Apply. (4) Blaming the router when the subscription was wrong.</p></div>
<div class="exam"><p><b>Exam trap.</b> A green "streaming" badge means updates arrive. It does not mean the data answers your question. A sample interval longer than the event hides it with no error at all.</p></div>

<div class="scn"><h4>Port 57401 after a security hardening</h4><p>After a hardening change the Kochi router moved its gNMI service to another port. Every dashboard fed by that router went quiet but no alert fired, because the alert rules needed data to evaluate. The team added a "stream is alive" check and corrected the subscription port.</p><p><b>Lesson:</b> monitor the monitoring: alert on the absence of data.</p></div>

<div class="iv"><p class="q">"A telemetry subscription shows no data. How do you troubleshoot?"</p><p>Strong answer: confirm the device is up, the subscription is enabled and applied, then port and TLS, then path and mode against the model, then the collector address, and finally prove it with a packet capture. Change one thing at a time and mention that silence is not evidence of health.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A broken stream is silent, so prove it is alive before trusting a graph.</li>
<li>Reason codes: disabled, target-down, gnmi-off, port, tls, path, mode, collector.</li>
<li>Faults can stack: fix one, re-read the badge, fix the next.</li>
<li>A capture on the target filtered to the collector is the final proof.</li>
<li>A green stream with too coarse an interval is a design error, not a bug.</li>
</ul></div>
`,hi:`
<h3>Ek stream jo kuch nahi bolti</h3>
<p>Toota hua poll aapko error deta hai. Tooti hui stream aapko <b>chuppi</b> deti hai, aur chuppi bilkul "kuch nahi ho raha" jaisi dikhti hai. Isliye telemetry troubleshooting ek kadak rule se shuru hota hai: khaali graph par tab tak bharosa mat karo jab tak aap saabit na kar do ki stream zinda hai. Is chapter mein aap ek ordered workflow seekhte ho aur phir lab obs-tel-2 chalate ho, jisme R-KCH ki subscription koi update nahi dikhati.</p>

<h3>Console jo reason codes deta hai</h3>
<p>Telemetry page par har subscription card ek badge dikhata hai. Jab woh hara "streaming" nahi hota, to badge ka text hi reason hota hai. Nau possible jawab seekhne layak hain, kyunki woh sahi order mein ek checklist bhi hain:</p>
<table class="cmp"><tr><th>Reason</th><th>Matlab</th><th>Pehla fix</th></tr>
<tr><td>disabled</td><td>Subscription ka switch off hai</td><td>Enabled on karo</td></tr>
<tr><td>target-down</td><td>Device khud up nahi hai</td><td>Pehle device ya link theek karo</td></tr>
<tr><td>gnmi-off</td><td>Device par gNMI service chal nahi rahi</td><td>Device par enable karo</td></tr>
<tr><td>port</td><td>Subscription ka port device ke port se alag hai</td><td>Device port se match karo</td></tr>
<tr><td>tls</td><td>Dono side ki TLS settings alag hain ya certificate fail</td><td>TLS align karo, certificate fix karo</td></tr>
<tr><td>path</td><td>Path device model mein nahi hai</td><td>Path sahi karo</td></tr>
<tr><td>mode</td><td>Us path ke liye mode allowed nahi (jaise counter par on-change)</td><td>Sample use karo</td></tr>
<tr><td>collector</td><td>Collector address wahan nahi jahan collector sunta hai</td><td>Address aur port sahi karo</td></tr>
<tr><td>ok</td><td>Updates aa rahe hain</td><td>Kuch fix nahi karna</td></tr></table>
<p>Yahi list real gNMI deployments par bhi chalti hai, bas words alag hote hain: connection refused, TLS handshake failure, "path not found" ya "unsupported mode".</p>

<h3>Ordered workflow</h3>
<ol>
<li><b>Device zinda hai?</b> Live tools use karo: target ko ping karo. Fail ho to yeh telemetry problem nahi hai.</li>
<li><b>Subscription enabled aur applied hai?</b> Card "After Apply" mein aapka edit aur badge ke paas live state dikhata hai. Dirty CommitBar ka matlab hai aapne apply nahi kiya.</li>
<li><b>Service on hai aur port sahi hai?</b> Subscription port ko device port se compare karo.</li>
<li><b>TLS aligned hai?</b></li>
<li><b>Path exist karta hai aur mode allow karta hai?</b> Model list se compare karo.</li>
<li><b>Collector address match karta hai?</b></li>
<li><b>Saabit karo.</b> Target par collector ke filter ke saath Live tools capture chalao aur packets flow hote dekho.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Telemetry check order">
<rect x="10" y="60" width="90" height="44" rx="8" fill="#bae6fd"/><text x="55" y="86" text-anchor="middle" class="svg-ink" font-size="12">Device up</text>
<rect x="115" y="60" width="90" height="44" rx="8" fill="#bbf7d0"/><text x="160" y="86" text-anchor="middle" class="svg-ink" font-size="12">Enabled</text>
<rect x="220" y="60" width="90" height="44" rx="8" fill="#ddd6fe"/><text x="265" y="86" text-anchor="middle" class="svg-ink" font-size="12">Port + TLS</text>
<rect x="325" y="60" width="90" height="44" rx="8" fill="#fde68a"/><text x="370" y="86" text-anchor="middle" class="svg-ink" font-size="12">Path + mode</text>
<rect x="430" y="60" width="90" height="44" rx="8" fill="#fed7aa"/><text x="475" y="86" text-anchor="middle" class="svg-ink" font-size="12">Collector</text>
<rect x="535" y="60" width="95" height="44" rx="8" fill="#e2e8f0"/><text x="582" y="86" text-anchor="middle" class="svg-ink" font-size="12">Capture</text>
<g stroke="#64748b" stroke-width="2"><line x1="100" y1="82" x2="115" y2="82"/><line x1="205" y1="82" x2="220" y2="82"/><line x1="310" y1="82" x2="325" y2="82"/><line x1="415" y1="82" x2="430" y2="82"/><line x1="520" y1="82" x2="535" y2="82"/></g>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">left se right chalo, ek time par ek cheez badlo, phir capture se saabit karo</text>
</svg><p class="cap">Har box aage badhne se pehle ek cause ko rule out karta hai.</p></div>

<h3>Lab obs-tel-2: Kochi subscription koi update nahi dikhati</h3>
<p>Scenario: Kochi office ki Meena Iyer batati hain ki router ka link status panel hilna band ho gaya. OBSERVER mein Telemetry par <code>ts-if-kch</code> laal badge ke saath hai. Network tweak <code>telemetry-off</code> ke saath bana hai.</p>
<pre class="out">Telemetry            applied state
ts-if-kch  (R-KCH)   status <span class="hl">port</span>
path       /interfaces/interface[name=Gi0/1]/state/oper_status
mode       on-change    collector 10.1.50.100:57400  tls on
agent      gnmi enabled  port 57401  tls ok</pre>
<p>Output ko engineer ki tarah padho. Agent 57401 par sunta hai lekin subscription 57400 use karti hai: reason <code>port</code>. Sirf port theek karna kaafi nahi: path mein underscore wala <code>oper_status</code> hai, jabki model node <code>oper-status</code> hai. Do faults stack hain, aur console pehla jo milta hai woh dikhata hai. Port theek karne ke baad badge <code>path</code> ho jaata hai. Yeh normal hai: ek time par ek layer utaro.</p>
<ol>
<li><b>Telemetry</b> kholo, <code>ts-if-kch</code> par <b>Edit</b> dabao.</li>
<li><b>Device port</b> 57401 karo. Apply. Badge ab path kehta hai.</li>
<li><b>Path</b> ko <code>/interfaces/interface[name=Gi0/1]/state/oper-status</code> karo. Apply. Badge hara.</li>
<li><b>Live tools</b> kholo, capture chuno, target R-KCH, filter collector host par. Chalao. Packets saabit karte hain ki traffic flow ho raha hai, aur yeh run audit log mein record hota hai.</li>
<li>Page ke Why sawaal ka jawab apne words mein do: subscription isliye fail hui kyunki port aur path device se match nahi karte the.</li>
</ol>
<p><b>Wire/policy par kya badalta hai?</b> Port edit device par us TCP port ko badalta hai jis par secure channel khulta hai; path edit badalta hai ki stream kaun sa model node le jaati hai. Router configuration mein kuch nahi badla. Router hamesha sahi tha; subscription galat cheezon ki taraf point kar rahi thi. Capture read-only evidence hai.</p>

<h3>Doosra telemetry fault: bahut mota interval</h3>
<p>Tweak <code>microburst</code> ke saath, subscription <code>ts-cnt-hyd</code> queue depth dekhti hai aur 800 ms ka event hota hai. Badge hara hai, data aa raha hai, phir bhi burst dikhta nahi. Yeh stream ki failure nahi hai, yeh design error hai. Test tool sample 10000 ms ke liye event ko hidden dikhata hai. Fix hai us ek subscription par interval 500 ms ya usse kam karna, sab par nahi.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Pehla reason code theek karke jeet maan lena bina yeh dekhe ki badge hara hai. (2) Teen cheezein ek saath badalna, to pata nahi chalta kisne fix kiya. (3) Card edit karke Apply bhool jaana. (4) Router ko blame karna jabki subscription galat thi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Hara "streaming" badge ka matlab hai updates aa rahe hain. Iska matlab yeh nahi ki data aapke sawaal ka jawab deta hai. Event se lamba sample interval use bina kisi error ke chhupa deta hai.</p></div>

<div class="scn"><h4>Hardening ke baad port 57401</h4><p>Ek hardening change ke baad Kochi router ne apni gNMI service doosre port par move kar di. Us router se bharne wale saare dashboards chup ho gaye lekin koi alert fire nahi hua, kyunki alert rules ko evaluate karne ke liye data chahiye tha. Team ne "stream is alive" check jodi aur subscription port sahi kiya.</p><p><b>Seekh:</b> monitoring ko monitor karo: data ke gayab hone par alert karo.</p></div>

<div class="iv"><p class="q">"Telemetry subscription koi data nahi dikha rahi. Kaise troubleshoot karoge?"</p><p>Strong answer: pehle confirm karo ki device up hai, subscription enabled aur applied hai, phir port aur TLS, phir path aur mode model se, phir collector address, aur end mein packet capture se saabit karo. Ek time par ek cheez badlo aur yeh bolo ki chuppi health ka saboot nahi hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Tooti stream chup hoti hai, isliye graph par bharosa karne se pehle saabit karo ki woh zinda hai.</li>
<li>Reason codes: disabled, target-down, gnmi-off, port, tls, path, mode, collector.</li>
<li>Faults stack ho sakte hain: ek fix karo, badge dobara padho, agla fix karo.</li>
<li>Target par collector ke filter wala capture final proof hai.</li>
<li>Bahut mote interval wali hari stream design error hai, bug nahi.</li>
</ul></div>
`}};export{e as default};