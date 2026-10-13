var e={id:`summary-checklist`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<h3>The module on one page</h3>
<p>Digital experience monitoring measures how the whole path feels from the user's side. Small probes visit the application, the portal records values for five hops, compares each hop with its own baseline and gives a score that falls in a bucket. The cause is the hop furthest above its baseline. An alert threshold per application decides when a human is told. Monitoring observes only; it never allows or blocks anything.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Experience summary">
<rect x="10" y="30" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="65" text-anchor="middle" class="svg-ink" font-size="13">Probe on</text>
<rect x="150" y="30" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="210" y="65" text-anchor="middle" class="svg-ink" font-size="13">5 hop values</text>
<rect x="290" y="30" width="120" height="60" rx="8" fill="#fde68a"/><text x="350" y="65" text-anchor="middle" class="svg-ink" font-size="13">vs baseline</text>
<rect x="430" y="30" width="90" height="60" rx="8" fill="#ddd6fe"/><text x="475" y="65" text-anchor="middle" class="svg-ink" font-size="13">Score</text>
<rect x="535" y="30" width="95" height="60" rx="8" fill="#fed7aa"/><text x="582" y="65" text-anchor="middle" class="svg-ink" font-size="13">Alert</text>
<line x1="130" y1="60" x2="150" y2="60" stroke="#64748b" stroke-width="2"/><line x1="270" y1="60" x2="290" y2="60" stroke="#64748b" stroke-width="2"/><line x1="410" y1="60" x2="430" y2="60" stroke="#64748b" stroke-width="2"/><line x1="520" y1="60" x2="535" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Good 66 or more, Okay 34 to 65, Poor below 34</text>
</svg><p class="cap">From probe to alert in five boxes.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain why green device dashboards can coexist with unhappy users.</li>
<li>Name the five hops in order: Device, Wi-Fi, Internet circuit, Cloud path, Application.</li>
<li>State the three buckets and their limits.</li>
<li>Explain why a probe must be enabled for an application to score.</li>
<li>Choose a sensible alert threshold and explain the two failure modes.</li>
<li>Find the cause: the hop furthest above its own baseline.</li>
<li>Scope a complaint by comparing users, sites and applications.</li>
<li>Complete lab zs-zdx-1 (probes and thresholds) and zs-zdx-2 (find the slow hop), and ticket 321110 with evidence.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Probe</dt><dd>A small regular test from the device toward an application.</dd>
<dt>Hop</dt><dd>One segment of the path with its own measurement.</dd>
<dt>Baseline</dt><dd>The normal value for a hop.</dd>
<dt>Score</dt><dd>One number summarising experience; Good, Okay or Poor.</dd>
<dt>Cause</dt><dd>The hop furthest above its baseline.</dd>
<dt>Alert threshold</dt><dd>The score below which an alert is raised.</dd>
<dt>Round-trip time (RTT)</dt><dd>Time for a packet to go and come back.</dd>
<dt>Packet loss</dt><dd>Share of packets that never arrive.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Question</th><th>Answer</th></tr>
<tr><td>Good, Okay, Poor limits</td><td>66 or more, 34 to 65, below 34</td></tr>
<tr><td>No score for an application</td><td>The probe is not enabled (global or per application)</td></tr>
<tr><td>Which hop is the cause?</td><td>Furthest above its own baseline</td></tr>
<tr><td>Users Poor, no alert</td><td>Probe off or threshold far too low</td></tr>
<tr><td>Does monitoring block traffic?</td><td>No, it only observes</td></tr>
</table>

<div class="note"><p><b>What does this change on the wire/policy?</b> Probe settings add test traffic; thresholds change who is told. Neither changes forwarding, identity or policy. Say this sentence whenever an exam asks what a digital experience setting does.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading raw numbers instead of baseline distance, leaving probes off, and treating alerts as proof of cause.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exact weights, intervals and probe sizes are vendor details. Questions here test the buckets, the five hops and the cause rule; use vendor documentation for the rest.</p></div>

<div class="scn"><h4>The one-page evidence pack</h4><p>For every experience ticket a senior engineer attached the same pack: score and bucket, hop table with baselines, a comparison of two colleagues, and the owner of the named hop. Resolution time halved because nobody had to ask for more data.</p><p><b>Lesson:</b> standard evidence makes tickets fast.</p></div>

<div class="iv"><p class="q">"Explain digital experience scoring to a manager."</p><p>It watches the whole route from the user's laptop to the application, breaks it into five parts, compares each with what is normal, and tells us the part that is worst. Users are Good, Okay or Poor, and alerts tell us before they complain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five hops; buckets 66 or more, 34 to 65, below 34.</li>
<li>No probe, no score.</li>
<li>Cause equals the hop furthest above baseline.</li>
<li>Thresholds balance silence against noise.</li>
<li>Monitoring observes; fix the hop with its owner and verify.</li>
</ul></div>
`,hi:`
<h3>Module ek page par</h3>
<p>Digital experience monitoring user ki taraf se measure karti hai ki poora path kaisa feel hota hai. Chhote probes application par visit karte hain, portal paanch hops ki values record karta hai, har hop ko uski apni baseline se compare karta hai aur ek score deta hai jo bucket mein girta hai. Cause woh hop hai jo apni baseline se sabse upar hai. Har application ka alert threshold decide karta hai ki insaan ko kab batana hai. Monitoring sirf observe karti hai; kuch allow ya block nahi karti.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Experience summary">
<rect x="10" y="30" width="120" height="60" rx="8" fill="#bae6fd"/><text x="70" y="65" text-anchor="middle" class="svg-ink" font-size="13">Probe on</text>
<rect x="150" y="30" width="120" height="60" rx="8" fill="#bbf7d0"/><text x="210" y="65" text-anchor="middle" class="svg-ink" font-size="13">5 hop values</text>
<rect x="290" y="30" width="120" height="60" rx="8" fill="#fde68a"/><text x="350" y="65" text-anchor="middle" class="svg-ink" font-size="13">vs baseline</text>
<rect x="430" y="30" width="90" height="60" rx="8" fill="#ddd6fe"/><text x="475" y="65" text-anchor="middle" class="svg-ink" font-size="13">Score</text>
<rect x="535" y="30" width="95" height="60" rx="8" fill="#fed7aa"/><text x="582" y="65" text-anchor="middle" class="svg-ink" font-size="13">Alert</text>
<line x1="130" y1="60" x2="150" y2="60" stroke="#64748b" stroke-width="2"/><line x1="270" y1="60" x2="290" y2="60" stroke="#64748b" stroke-width="2"/><line x1="410" y1="60" x2="430" y2="60" stroke="#64748b" stroke-width="2"/><line x1="520" y1="60" x2="535" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Good 66 ya zyada, Okay 34 se 65, Poor 34 se kam</text>
</svg><p class="cap">Probe se alert tak paanch boxes mein.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Samjhao ki green device dashboards aur naakhush users saath kyun reh sakte hain.</li>
<li>Paanch hops order mein batao: Device, Wi-Fi, Internet circuit, Cloud path, Application.</li>
<li>Teen buckets aur unki limits batao.</li>
<li>Samjhao ki application ko score ke liye probe enabled kyun chahiye.</li>
<li>Sensible alert threshold chuno aur do failure modes samjhao.</li>
<li>Cause dhundo: apni baseline se sabse upar wala hop.</li>
<li>Users, sites aur applications compare karke complaint ko scope karo.</li>
<li>Lab zs-zdx-1 (probes aur thresholds) aur zs-zdx-2 (slow hop dhundo), aur ticket 321110 evidence ke saath complete karo.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Probe</dt><dd>Device se application ki taraf chhota regular test.</dd>
<dt>Hop</dt><dd>Path ka ek segment jiski apni measurement hai.</dd>
<dt>Baseline</dt><dd>Hop ki normal value.</dd>
<dt>Score</dt><dd>Experience ko summarise karne wala ek number; Good, Okay ya Poor.</dd>
<dt>Cause</dt><dd>Apni baseline se sabse upar wala hop.</dd>
<dt>Alert threshold</dt><dd>Woh score jisse neeche alert raise hota hai.</dd>
<dt>Round-trip time (RTT)</dt><dd>Packet ke jaane aur wapas aane ka time.</dd>
<dt>Packet loss</dt><dd>Packets ka woh hissa jo kabhi pahunchta nahi.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Sawaal</th><th>Jawab</th></tr>
<tr><td>Good, Okay, Poor ki limits</td><td>66 ya zyada, 34 se 65, 34 se kam</td></tr>
<tr><td>Application ka score nahi</td><td>Probe enabled nahi hai (global ya per application)</td></tr>
<tr><td>Kaun sa hop cause hai?</td><td>Apni baseline se sabse upar wala</td></tr>
<tr><td>Users Poor, alert nahi</td><td>Probe off ya threshold bahut low</td></tr>
<tr><td>Kya monitoring traffic block karti hai?</td><td>Nahi, sirf observe karti hai</td></tr>
</table>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> Probe settings test traffic jodti hain; thresholds badalte hain ki kise bataya jaye. Koi bhi forwarding, identity ya policy nahi badalta. Jab bhi exam poochhe ki digital experience setting kya karti hai, yeh sentence bolo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Baseline distance ki jagah raw numbers padhna, probes off chhodna, aur alerts ko cause ka proof samajhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exact weights, intervals aur probe sizes vendor details hain. Yahan ke sawal buckets, paanch hops aur cause rule test karte hain; baaki ke liye vendor documentation use karo.</p></div>

<div class="scn"><h4>Ek-page evidence pack</h4><p>Har experience ticket ke saath ek senior engineer wahi pack attach karta tha: score aur bucket, baselines ke saath hop table, do colleagues ka comparison, aur named hop ka owner. Resolution time aadha ho gaya kyunki kisi ko aur data nahi maangna padta tha.</p><p><b>Seekh:</b> standard evidence tickets ko tez banata hai.</p></div>

<div class="iv"><p class="q">"Manager ko digital experience scoring samjhao."</p><p>Yeh user ke laptop se application tak poora route dekhta hai, use paanch hisson mein todta hai, har ek ko normal se compare karta hai, aur batata hai sabse kharab hissa kaun sa hai. Users Good, Okay ya Poor hote hain, aur alerts unke complain karne se pehle bata dete hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch hops; buckets 66 ya zyada, 34 se 65, 34 se kam.</li>
<li>Probe nahi, score nahi.</li>
<li>Cause matlab baseline se sabse upar wala hop.</li>
<li>Thresholds chup aur shor ke beech balance hain.</li>
<li>Monitoring observe karti hai; hop ko uske owner ke saath fix karo aur verify karo.</li>
</ul></div>
`}};export{e as default};