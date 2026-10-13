var e={id:`token-bucket`,h:{en:`The token bucket: CIR, Bc, Be, Tc, and policing versus shaping`,hi:`Token bucket: CIR, Bc, Be, Tc, aur policing vs shaping`},body:{en:`
<p>Every rate limit in networking, policing or shaping, is built on one small idea: the <b>token bucket</b>. Learn it once and the commands in the next chapters become obvious.</p>

<h3>An analogy: a coin tap and a bucket</h3>
<p>Picture a tap that drops coins into a bucket at a steady speed. One coin lets you send one byte (or one bit, depending on the feature). The bucket can hold only a limited number of coins; extra coins spill on the floor. When a packet arrives, you must pay with coins: a 1500-byte packet costs 1500 coins. If the bucket holds enough coins you pay and the packet goes. If not, something must be decided about that packet. <i>What</i> is decided is the only difference between a policer and a shaper.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Token bucket">
<rect x="20" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">Token tap: CIR</text>
<line x1="95" y1="60" x2="95" y2="95" stroke="#64748b" stroke-width="2"/><polygon points="88,92 102,92 95,104" fill="#64748b"/>
<path d="M45 105 L45 195 L145 195 L145 105" fill="#fde68a" stroke="#64748b" stroke-width="2"/>
<rect x="46" y="150" width="98" height="44" fill="#fbbf24" opacity="0.7"/>
<text x="95" y="130" text-anchor="middle" class="svg-ink" font-size="12">Bucket size Bc</text>
<text x="95" y="215" text-anchor="middle" class="svg-muted" font-size="12">tokens left over spill</text>
<rect x="240" y="95" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="295" y="120" text-anchor="middle" class="svg-ink" font-size="13">Packet arrives</text>
<line x1="145" y1="150" x2="240" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="105" x2="430" y2="55" stroke="#64748b" stroke-width="2"/><line x1="350" y1="125" x2="430" y2="175" stroke="#64748b" stroke-width="2"/>
<rect x="430" y="30" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="13">Enough tokens: conform</text><text x="525" y="70" text-anchor="middle" class="svg-muted" font-size="12">send, tokens are spent</text>
<rect x="430" y="150" width="190" height="50" rx="8" fill="#fed7aa"/><text x="525" y="172" text-anchor="middle" class="svg-ink" font-size="13">Not enough: exceed</text><text x="525" y="190" text-anchor="middle" class="svg-muted" font-size="12">policer drops or remarks; shaper waits</text>
</svg><p class="cap">One bucket, two behaviours. The policer acts at once; the shaper queues the packet until tokens arrive.</p></div>

<h3>The vocabulary</h3>
<dl class="terms">
<dt>CIR (committed information rate)</dt><dd>The long-term average speed, in bits per second. The tap speed.</dd>
<dt>Bc (committed burst)</dt><dd>The size of the bucket: how much may be sent at line speed in one go. In MQC <code>police</code> it is written in <b>bytes</b>; in <code>shape average</code> it is written in <b>bits</b>.</dd>
<dt>Tc (time interval)</dt><dd>The time the bucket takes to refill: <code>Tc = Bc / CIR</code>. A shaper sends Bc bits in each Tc and then waits.</dd>
<dt>Be (excess burst)</dt><dd>A second, optional bucket that collects the tokens spilling from the first. Packets that find Bc empty but Be non-empty are <b>exceeding</b>; packets that find both empty <b>violate</b>.</dd>
<dt>PIR / EIR</dt><dd>Peak and excess information rate, used by dual-rate policers. Concept only in this simulator: it models single-rate policers.</dd>
</dl>

<h3>Numbers you can check by hand</h3>
<div class="eg"><p><b>Shaper.</b> A 19 Mbps shaper with the default Tc of 4 ms has <code>Bc = 19,000,000 x 0.004 = 76,000 bits</code> (9,500 bytes, about six full-size frames). On a 1 Gbps port those 76,000 bits leave in 76 microseconds, then the port is silent for the rest of the 4 ms. Average rate: exactly 19 Mbps. In the lab output you will see <code>shape (average) cir 19000000, bc 76000, be 76000</code>.</p>
<p><b>Policer.</b> A 2 Mbps policer with default Bc: the router uses <code>CIR / 32</code> bytes, that is 62,500 bytes, a quarter of a second of traffic. A burst of 62,500 bytes can pass at once; after that the flow is limited to 250,000 bytes per second.</p></div>

<h3>Policing versus shaping</h3>
<table class="cmp"><tr><th></th><th>Policer</th><th>Shaper</th></tr>
<tr><td>What happens to excess</td><td>Dropped, or transmitted with a new marking</td><td>Queued and sent later</td></tr>
<tr><td>Delay added</td><td>None</td><td>Up to the queue depth divided by the rate</td></tr>
<tr><td>Direction</td><td>Input or output</td><td>Output only</td></tr>
<tr><td>What TCP sees</td><td>Loss, so it slows down in jerks</td><td>Delay, so it slows down smoothly</td></tr>
<tr><td>Output looks like</td><td>Jagged: bursts up to Bc then gaps</td><td>Smooth at the CIR</td></tr>
<tr><td>Typical use</td><td>Enforce a contract, cap a class, CoPP</td><td>Match a slower circuit, smooth before a provider policer</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Policed and shaped traffic compared">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Offered traffic</text>
<polyline points="20,130 50,40 80,130 110,60 140,130 170,30 200,130 230,70 260,130 290,50" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">After the limit</text>
<line x1="330" y1="75" x2="630" y2="75" stroke="#ef4444" stroke-dasharray="4 3"/><text x="620" y="68" text-anchor="end" class="svg-muted" font-size="11">CIR</text>
<polyline points="340,130 360,75 395,75 400,130 420,130 440,75 470,75 475,130" fill="none" stroke="#f97316" stroke-width="2.5"/><text x="400" y="150" text-anchor="middle" class="svg-muted" font-size="11">policer: peaks cut off</text>
<polyline points="510,128 540,78 630,76" fill="none" stroke="#16a34a" stroke-width="2.5"/><text x="570" y="150" text-anchor="middle" class="svg-muted" font-size="11">shaper: smoothed, delayed</text>
</svg><p class="cap">The area cut off by the policer is lost; the shaper keeps it and spreads it over time.</p></div>

<h3>Why Tc matters for voice</h3>
<p>A shaper releases traffic in bursts of Bc, one per Tc. A voice packet that arrives just after a burst waits up to a whole Tc. With Tc of 4 ms that is invisible; with Tc of 100 ms, as you would get from a very large Bc on a slow link, it is audible jitter. So the usual advice is to keep Tc at or below 10 ms and to avoid hand-tuning Bc unless you have a reason.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Mixing units: police Bc is bytes, shape Bc is bits. (2) Setting a tiny Bc on a policer, for example 1500 bytes on a 100 Mbps rate: a single TCP window burst exceeds it and throughput collapses far below the CIR. (3) Thinking the average is enforced instantly; it is enforced over time, which is why bursts pass.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the formulas <code>Tc = Bc / CIR</code> and <code>Bc = CIR x Tc</code>, and that Be only adds tokens that spilled from Bc. A single-rate, three-colour policer has conform, exceed and violate; a two-colour one only conform and exceed.</p></div>

<div class="scn"><h4>The provider link that never reaches its rate</h4><p>A 100 Mbps MPLS service for Sahyadri University delivers only 18 Mbps of file-copy throughput, although a speed test with many parallel flows fills it. The provider confirms the policer is set to 100 Mbps. The engineer reads the policer details and finds a committed burst of 1500 bytes, one frame. A single TCP flow sends windows of many frames back to back, the policer sees the second frame as exceeding, drops it, and the flow collapses to a low rate. The provider raises Bc to 3 MB (about 250 ms of CIR) and one flow now reaches 90 Mbps.</p><p><b>Lesson:</b> a rate is more than a number. Bc decides whether normal bursts survive.</p></div>
<div class="iv"><p class="q">"What is Tc and why do you care?"</p><p>Tc is Bc divided by CIR: the interval in which a shaper may send one Bc. It sets the burst pattern, so it sets jitter. For voice I want a Tc of 10 ms or less; the IOS XE default of 4 ms on most platforms is fine. I only change Bc when a platform or provider requires it.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A token bucket has a fill rate (CIR) and a size (Bc); packets spend tokens.</li>
<li>A policer decides at once: transmit, remark or drop. A shaper queues what does not fit.</li>
<li><code>Tc = Bc / CIR</code>; default shaper Tc is 4 ms; default policer Bc is CIR/32 bytes.</li>
<li>Be gives a third colour: conform, exceed, violate.</li>
<li>Police Bc is in bytes, shape Bc is in bits.</li>
</ul></div>
`,hi:`
<p>Networking mein har rate limit, policing ho ya shaping, ek chhote se idea par bani hai: <b>token bucket</b>. Ek baar samajh lo to agle chapters ke commands saaf ho jaate hain.</p>

<h3>Ek analogy: coin tap aur bucket</h3>
<p>Ek tap sochiye jo ek bucket mein ek sthir raftaar se coins girata hai. Ek coin se ek byte (ya feature ke hisaab se ek bit) bheja ja sakta hai. Bucket sirf limited coins rakh sakta hai; extra coins zameen par gir jaate hain. Jab packet aata hai to aapko coins se paisa dena padta hai: 1500-byte packet ke 1500 coins lagte hain. Agar bucket mein kaafi coins hain to aap pay karte ho aur packet chala jaata hai. Nahi to us packet ke baare mein kuch tay karna padta hai. <i>Kya</i> tay hota hai, wahi policer aur shaper ka ekmaatra farq hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Token bucket">
<rect x="20" y="20" width="150" height="40" rx="8" fill="#bae6fd"/><text x="95" y="45" text-anchor="middle" class="svg-ink" font-size="13">Token tap: CIR</text>
<line x1="95" y1="60" x2="95" y2="95" stroke="#64748b" stroke-width="2"/><polygon points="88,92 102,92 95,104" fill="#64748b"/>
<path d="M45 105 L45 195 L145 195 L145 105" fill="#fde68a" stroke="#64748b" stroke-width="2"/>
<rect x="46" y="150" width="98" height="44" fill="#fbbf24" opacity="0.7"/>
<text x="95" y="130" text-anchor="middle" class="svg-ink" font-size="12">Bucket size Bc</text>
<text x="95" y="215" text-anchor="middle" class="svg-muted" font-size="12">bache tokens gir jaate hain</text>
<rect x="240" y="95" width="110" height="40" rx="8" fill="#e2e8f0"/><text x="295" y="120" text-anchor="middle" class="svg-ink" font-size="13">Packet aaya</text>
<line x1="145" y1="150" x2="240" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="350" y1="105" x2="430" y2="55" stroke="#64748b" stroke-width="2"/><line x1="350" y1="125" x2="430" y2="175" stroke="#64748b" stroke-width="2"/>
<rect x="430" y="30" width="190" height="50" rx="8" fill="#bbf7d0"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="13">Kaafi tokens: conform</text><text x="525" y="70" text-anchor="middle" class="svg-muted" font-size="12">bhejo, tokens kharch</text>
<rect x="430" y="150" width="190" height="50" rx="8" fill="#fed7aa"/><text x="525" y="172" text-anchor="middle" class="svg-ink" font-size="13">Kam: exceed</text><text x="525" y="190" text-anchor="middle" class="svg-muted" font-size="12">policer drop/remark; shaper intezaar</text>
</svg><p class="cap">Ek bucket, do behaviours. Policer turant kaam karta hai; shaper packet ko queue mein rakhta hai jab tak tokens na aa jaayein.</p></div>

<h3>Shabdavali</h3>
<dl class="terms">
<dt>CIR (committed information rate)</dt><dd>Lambe samay ki average speed, bits per second mein. Tap ki raftaar.</dd>
<dt>Bc (committed burst)</dt><dd>Bucket ka size: ek baar mein line speed par kitna bheja ja sakta hai. MQC <code>police</code> mein yeh <b>bytes</b> mein likha jaata hai; <code>shape average</code> mein <b>bits</b> mein.</dd>
<dt>Tc (time interval)</dt><dd>Bucket ke dobara bharne ka samay: <code>Tc = Bc / CIR</code>. Shaper har Tc mein Bc bits bhejta hai aur phir ruk jaata hai.</dd>
<dt>Be (excess burst)</dt><dd>Doosra, optional bucket jo pehle bucket se girne wale tokens ikattha karta hai. Jin packets ko Bc khaali par Be bhara milta hai woh <b>exceeding</b> hain; jinhe dono khaali milte hain woh <b>violate</b> karte hain.</dd>
<dt>PIR / EIR</dt><dd>Peak aur excess information rate, dual-rate policers mein use hote hain. Is simulator mein sirf concept hai: yeh single-rate policers model karta hai.</dd>
</dl>

<h3>Hisaab jo haath se check ho sakta hai</h3>
<div class="eg"><p><b>Shaper.</b> 19 Mbps shaper ka default Tc 4 ms ho to <code>Bc = 19,000,000 x 0.004 = 76,000 bits</code> (9,500 bytes, lagbhag chhe full-size frames). 1 Gbps port par yeh 76,000 bits 76 microsecond mein nikal jaate hain, phir baaki 4 ms port chup rehta hai. Average rate: theek 19 Mbps. Lab output mein aapko <code>shape (average) cir 19000000, bc 76000, be 76000</code> dikhega.</p>
<p><b>Policer.</b> Default Bc wala 2 Mbps policer: router <code>CIR / 32</code> bytes use karta hai, yaani 62,500 bytes, traffic ka ek chauthai second. 62,500 bytes ka burst ek saath nikal sakta hai; uske baad flow 250,000 bytes per second tak limited ho jaata hai.</p></div>

<h3>Policing vs shaping</h3>
<table class="cmp"><tr><th></th><th>Policer</th><th>Shaper</th></tr>
<tr><td>Excess ka kya hota hai</td><td>Drop, ya naye marking ke saath transmit</td><td>Queue mein, baad mein bheja jaata hai</td></tr>
<tr><td>Delay</td><td>Nahi</td><td>Queue depth ko rate se bhaag do</td></tr>
<tr><td>Direction</td><td>Input ya output</td><td>Sirf output</td></tr>
<tr><td>TCP ko kya dikhta hai</td><td>Loss, isliye jhatke se dheema hota hai</td><td>Delay, isliye smoothly dheema hota hai</td></tr>
<tr><td>Output kaisa dikhta hai</td><td>Jagged: Bc tak bursts phir gaps</td><td>CIR par smooth</td></tr>
<tr><td>Aam use</td><td>Contract lagu karna, class cap, CoPP</td><td>Dheeme circuit se match, provider policer se pehle smooth karna</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Police aur shape ki tulna">
<text x="160" y="18" text-anchor="middle" class="svg-ink" font-size="13">Offered traffic</text>
<polyline points="20,130 50,40 80,130 110,60 140,130 170,30 200,130 230,70 260,130 290,50" fill="none" stroke="#64748b" stroke-width="2"/>
<text x="480" y="18" text-anchor="middle" class="svg-ink" font-size="13">Limit ke baad</text>
<line x1="330" y1="75" x2="630" y2="75" stroke="#ef4444" stroke-dasharray="4 3"/><text x="620" y="68" text-anchor="end" class="svg-muted" font-size="11">CIR</text>
<polyline points="340,130 360,75 395,75 400,130 420,130 440,75 470,75 475,130" fill="none" stroke="#f97316" stroke-width="2.5"/><text x="400" y="150" text-anchor="middle" class="svg-muted" font-size="11">policer: peaks kat gaye</text>
<polyline points="510,128 540,78 630,76" fill="none" stroke="#16a34a" stroke-width="2.5"/><text x="570" y="150" text-anchor="middle" class="svg-muted" font-size="11">shaper: smooth, delayed</text>
</svg><p class="cap">Policer ne jo hissa kaata woh kho gaya; shaper use rakhta hai aur samay par failata hai.</p></div>

<h3>Voice ke liye Tc kyun matter karta hai</h3>
<p>Shaper traffic ko Bc ke bursts mein chhodta hai, har Tc mein ek. Burst ke turant baad aaya voice packet poore ek Tc tak ruk sakta hai. 4 ms ke Tc par yeh dikhta nahi; slow link par bahut bade Bc se 100 ms ka Tc mil jaaye to jitter sunai deta hai. Isliye aam salah hai: Tc ko 10 ms ya kam rakho aur jab tak koi wajah na ho Bc haath se tune mat karo.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Units mix karna: police Bc bytes hai, shape Bc bits hai. (2) Policer par bahut chhota Bc rakhna, jaise 100 Mbps rate par 1500 bytes: ek TCP window ka burst hi usse upar chala jaata hai aur throughput CIR se bahut neeche gir jaata hai. (3) Sochna ki average turant lagu hota hai; woh samay ke saath lagu hota hai, isliye bursts nikal jaate hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Formulas yaad rakho <code>Tc = Bc / CIR</code> aur <code>Bc = CIR x Tc</code>, aur yeh ki Be sirf Bc se gire tokens jodta hai. Single-rate, three-colour policer mein conform, exceed aur violate hote hain; two-colour mein sirf conform aur exceed.</p></div>

<div class="scn"><h4>Provider link jo apne rate tak nahi pahunchta</h4><p>Sahyadri University ki 100 Mbps MPLS service file-copy mein sirf 18 Mbps deti hai, jabki bahut saari parallel flows wala speed test link bhar deta hai. Provider confirm karta hai ki policer 100 Mbps par hai. Engineer policer details padhta hai aur committed burst 1500 bytes, yaani ek frame, paata hai. Ek TCP flow kai frames peeche-peeche bhejta hai, policer doosre frame ko exceeding maanta hai, gira deta hai, aur flow neeche gir jaata hai. Provider Bc ko 3 MB (CIR ka lagbhag 250 ms) kar deta hai aur ek flow ab 90 Mbps tak pahunchti hai.</p><p><b>Lesson:</b> rate sirf ek number nahi hai. Bc tay karta hai ki aam bursts bachte hain ya nahi.</p></div>
<div class="iv"><p class="q">"Tc kya hai aur aap uski parwah kyun karte ho?"</p><p>Tc, Bc ko CIR se bhaag dene par milta hai: woh interval jisme shaper ek Bc bhej sakta hai. Yeh burst pattern tay karta hai, isliye jitter bhi. Voice ke liye mujhe 10 ms ya kam ka Tc chahiye; zyadatar platforms par IOS XE ka default 4 ms theek hai. Bc tabhi badalta hoon jab platform ya provider maange.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Token bucket ka ek fill rate (CIR) aur ek size (Bc) hota hai; packets tokens kharch karte hain.</li>
<li>Policer turant tay karta hai: transmit, remark ya drop. Shaper jo fit nahi hota use queue mein rakhta hai.</li>
<li><code>Tc = Bc / CIR</code>; shaper ka default Tc 4 ms; policer ka default Bc CIR/32 bytes.</li>
<li>Be teesra colour deta hai: conform, exceed, violate.</li>
<li>Police Bc bytes mein, shape Bc bits mein.</li>
</ul></div>
`}};export{e as default};