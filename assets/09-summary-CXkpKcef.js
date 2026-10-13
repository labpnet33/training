var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with a simple idea: a tunnel that is "up" is not necessarily "good". You now have every piece needed to act on that idea: the policy skeleton, the data-policy match and action vocabulary, fixed traffic engineering, the BFD measurement machinery, SLA classes, app-route policy, loss correction, and a troubleshooting workflow. This last chapter packs it into a checklist, a glossary, the most-tested facts and a command cheat-sheet.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="The AAR pipeline in one picture">
<g font-size="12">
<rect x="10" y="40" width="140" height="70" rx="8" fill="#bae6fd"/><text x="80" y="68" text-anchor="middle" class="svg-ink" font-size="13">BFD in IPsec</text><text x="80" y="88" text-anchor="middle" class="svg-muted">loss, latency, jitter</text>
<rect x="170" y="40" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="13">SLA class</text><text x="240" y="88" text-anchor="middle" class="svg-muted">limits per tunnel</text>
<rect x="330" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="400" y="68" text-anchor="middle" class="svg-ink" font-size="13">App-route policy</text><text x="400" y="88" text-anchor="middle" class="svg-muted">app to SLA + colors</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#fde68a"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">Chosen tunnel</text><text x="560" y="88" text-anchor="middle" class="svg-muted">data policy can refine</text>
</g>
<line x1="150" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="3"/><line x1="310" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="3"/><line x1="470" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="3"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">Measure, compare, choose, then verify</text>
</svg><p class="cap">The whole module in four boxes.</p></div>

<h3>Can-do checklist</h3>
<p>You are ready for the exam topic and for interviews if you can do all of these without notes:</p>
<ul>
<li>Explain the difference between centralized control policy, centralized data policy, app-route policy and localized policy, and say where each runs.</li>
<li>Write a data policy with lists, sequences, a default-action and an apply-policy with the right direction (from-service, from-tunnel, all).</li>
<li>List the match conditions (app-list, DSCP, prefixes, ports, protocol) and actions (accept, drop, count, log, set dscp, forwarding-class, local-tloc, tloc, next-hop, vpn, service, nat use-vpn 0, tcp-optimization, loss-protect).</li>
<li>Explain how BFD hellos produce loss, latency and jitter, and calculate a bucket average from the poll interval and multiplier.</li>
<li>Write an SLA class and an app-route policy with preferred-color, backup-sla-preferred-color and strict, and walk through the tunnel-selection ladder.</li>
<li>Choose between AAR, FEC, packet duplication, TCP optimization and static TLOC steering for a given symptom.</li>
<li>State the order of evaluation on the edge and run the six-step troubleshooting workflow.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AAR</dt><dd>Application-aware routing: choosing the tunnel for an application based on measured loss, latency and jitter against an SLA class.</dd>
<dt>SLA class</dt><dd>A named set of maximum loss (percent), latency (ms) and jitter (ms).</dd>
<dt>Bucket</dt><dd>One poll interval of BFD measurements; the last app-route multiplier buckets are averaged.</dd>
<dt>Preferred color</dt><dd>The color favoured among tunnels that meet the SLA.</dd>
<dt>Backup SLA preferred color</dt><dd>The color used when no tunnel meets the SLA.</dd>
<dt>Strict</dt><dd>Drop the traffic if no tunnel meets the SLA.</dd>
<dt>Fallback best tunnel</dt><dd>Use the tunnel closest to the SLA, judged by latency, loss or jitter, when none meets it.</dd>
<dt>Variance</dt><dd>A tolerance that treats near-equal tunnels as equal to avoid flapping.</dd>
<dt>FEC</dt><dd>Forward error correction: one parity packet per four data packets, able to rebuild one lost packet per group.</dd>
<dt>from-service / from-tunnel</dt><dd>Direction of a data policy: packets entering from the LAN, or arriving from the overlay.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>BFD hello interval / multiplier (defaults)</td><td>1000 ms / 7</td></tr>
<tr><td>App-route poll interval / multiplier (defaults)</td><td>600000 ms (10 minutes) / 6</td></tr>
<tr><td>Default DSCP of BFD packets</td><td>48</td></tr>
<tr><td>Direction of an app-route policy</td><td>None; only outbound traffic</td></tr>
<tr><td>Default action of a data policy</td><td>Drop (so end with default-action accept)</td></tr>
<tr><td>Evaluation order on the edge</td><td>Ingress ACL, app-route policy, data policy, forwarding, security policy, encryption, egress ACL</td></tr>
<tr><td>What measures path quality</td><td>BFD, not the policy</td></tr>
<tr><td>What AAR can choose among</td><td>Only tunnels OMP already provides</td></tr>
<tr><td>Where policies are enforced</td><td>On the WAN Edge, distributed by the Controller</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="out">E-BR1# show sdwan policy from-vsmart
E-BR1# show sdwan policy data-policy-filter
E-BR1# show sdwan policy app-route-policy-filter
E-BR1# show sdwan policy service-path vpn 10 interface GigabitEthernet3 source-ip 10.1.10.10 dest-ip 10.100.0.20 protocol 6 dest-port 443
E-BR1# show sdwan app-route stats remote-system-ip 10.255.0.1
E-BR1# show sdwan app-route sla-class
E-BR1# show sdwan bfd sessions
E-BR1# show sdwan omp routes
E-BR1# show sdwan tunnel statistics fec
E-BR1# show sdwan tunnel statistics pkt-dup
E-BR1# show sdwan control connections</pre>

<div class="exam"><p><b>Last-minute traps.</b> (1) "Loss, latency, jitter are measured by the policy": wrong, BFD measures. (2) "preferred-color forces the color": wrong, only among tunnels that meet the SLA. (3) "Strict is the default": wrong, without strict traffic still flows. (4) "AAR is applied from-service": wrong, app-route policy has no direction. (5) "FEC retransmits lost packets": wrong, it sends parity packets.</p></div>

<div class="scn"><h4>The week of the policy review</h4><p>Before a quarterly review, the Bharat Retail WAN team audited their SD-WAN policies against this checklist. They found one data policy without a default-action (documented as drop), one SLA class tighter than the 4G backup link could ever meet, and two sites missing from a site-list. Fixing those three items removed four recurring tickets and gave the team a one-page standard for future policies.</p><p><b>Lesson:</b> a short, repeatable checklist beats clever policy.</p></div>

<div class="iv"><p class="q">"In two minutes, explain application-aware routing to a non-technical manager."</p><p>It is a navigation app for the WAN. The branch router constantly measures every route to headquarters for delay, loss and wobble, compares each application's needs (voice is picky, backups are not), and sends each application over a route that is good enough, switching automatically when a route degrades. Add the business value: better calls on cheap links and lower MPLS spend, with no manual intervention.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BFD measures, the SLA class defines good enough, the app-route policy chooses; data policy refines and repairs.</li>
<li>Know the defaults: BFD 1000 ms x 7, app-route poll 10 minutes x 6, BFD DSCP 48.</li>
<li>Data policy has a direction and a default-drop; app-route policy has neither.</li>
<li>Order of evaluation: ingress ACL first, then AAR, then data policy.</li>
<li>Troubleshoot top-down: arrived, right site/VPN/direction, matches, simulated path, ACL, measurements.</li>
</ul></div>
`,hi:`
<p>Aapne is module ki shuruaat ek seedhi idea se ki thi: "up" tunnel zaroori nahi ki "good" ho. Ab aapke paas us idea par amal karne ka har tukda hai: policy skeleton, data-policy match aur action vocabulary, fixed traffic engineering, BFD measurement machinery, SLA classes, app-route policy, loss correction aur troubleshooting workflow. Yeh aakhri chapter sab kuch ek checklist, glossary, most-tested facts aur command cheat-sheet mein pack karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="AAR pipeline ek picture mein">
<g font-size="12">
<rect x="10" y="40" width="140" height="70" rx="8" fill="#bae6fd"/><text x="80" y="68" text-anchor="middle" class="svg-ink" font-size="13">IPsec mein BFD</text><text x="80" y="88" text-anchor="middle" class="svg-muted">loss, latency, jitter</text>
<rect x="170" y="40" width="140" height="70" rx="8" fill="#ddd6fe"/><text x="240" y="68" text-anchor="middle" class="svg-ink" font-size="13">SLA class</text><text x="240" y="88" text-anchor="middle" class="svg-muted">har tunnel ki limits</text>
<rect x="330" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="400" y="68" text-anchor="middle" class="svg-ink" font-size="13">App-route policy</text><text x="400" y="88" text-anchor="middle" class="svg-muted">app se SLA + colors</text>
<rect x="490" y="40" width="140" height="70" rx="8" fill="#fde68a"/><text x="560" y="68" text-anchor="middle" class="svg-ink" font-size="13">Chuna hua tunnel</text><text x="560" y="88" text-anchor="middle" class="svg-muted">data policy refine karti hai</text>
</g>
<line x1="150" y1="75" x2="170" y2="75" stroke="#64748b" stroke-width="3"/><line x1="310" y1="75" x2="330" y2="75" stroke="#64748b" stroke-width="3"/><line x1="470" y1="75" x2="490" y2="75" stroke="#64748b" stroke-width="3"/>
<text x="320" y="145" text-anchor="middle" class="svg-accent" font-size="13">Measure karo, compare karo, chuno, phir verify karo</text>
</svg><p class="cap">Poora module chaar boxes mein.</p></div>

<h3>Can-do checklist</h3>
<p>Aap exam topic aur interviews ke liye ready ho agar yeh sab bina notes ke kar sakte ho:</p>
<ul>
<li>Centralized control policy, centralized data policy, app-route policy aur localized policy ka difference samjhao, aur batao ki har ek kahan chalti hai.</li>
<li>Lists, sequences, default-action aur sahi direction (from-service, from-tunnel, all) wale apply-policy ke saath data policy likho.</li>
<li>Match conditions (app-list, DSCP, prefixes, ports, protocol) aur actions (accept, drop, count, log, set dscp, forwarding-class, local-tloc, tloc, next-hop, vpn, service, nat use-vpn 0, tcp-optimization, loss-protect) list karo.</li>
<li>Samjhao ki BFD hellos se loss, latency aur jitter kaise bante hain, aur poll interval aur multiplier se bucket average calculate karo.</li>
<li>preferred-color, backup-sla-preferred-color aur strict ke saath SLA class aur app-route policy likho, aur tunnel-selection ladder walk-through karo.</li>
<li>Diye gaye symptom ke liye AAR, FEC, packet duplication, TCP optimization aur static TLOC steering mein se chuno.</li>
<li>Edge par evaluation order batao aur chhe-step troubleshooting workflow chalao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>AAR</dt><dd>Application-aware routing: SLA class ke against measured loss, latency aur jitter ke basis par application ke liye tunnel chunna.</dd>
<dt>SLA class</dt><dd>Maximum loss (percent), latency (ms) aur jitter (ms) ka naam wala set.</dd>
<dt>Bucket</dt><dd>BFD measurements ka ek poll interval; pichhle app-route multiplier buckets ka average liya jaata hai.</dd>
<dt>Preferred color</dt><dd>Woh color jo SLA meet karne wale tunnels ke beech favour kiya jaata hai.</dd>
<dt>Backup SLA preferred color</dt><dd>Woh color jo tab use hota hai jab koi tunnel SLA meet na kare.</dd>
<dt>Strict</dt><dd>Agar koi tunnel SLA meet na kare to traffic drop karo.</dd>
<dt>Fallback best tunnel</dt><dd>Jab koi meet na kare to SLA ke sabse kareeb wala tunnel (latency, loss ya jitter ke hisaab se) use karo.</dd>
<dt>Variance</dt><dd>Tolerance jo lagbhag barabar tunnels ko barabar maanta hai taaki flapping na ho.</dd>
<dt>FEC</dt><dd>Forward error correction: har chaar data packets par ek parity packet, jo group ka ek lost packet rebuild kar sakta hai.</dd>
<dt>from-service / from-tunnel</dt><dd>Data policy ki direction: LAN se enter karne wale packets, ya overlay se aane wale packets.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Value</th></tr>
<tr><td>BFD hello interval / multiplier (defaults)</td><td>1000 ms / 7</td></tr>
<tr><td>App-route poll interval / multiplier (defaults)</td><td>600000 ms (10 minutes) / 6</td></tr>
<tr><td>BFD packets ka default DSCP</td><td>48</td></tr>
<tr><td>App-route policy ki direction</td><td>Koi nahi; sirf outbound traffic</td></tr>
<tr><td>Data policy ka default action</td><td>Drop (isliye default-action accept se khatam karo)</td></tr>
<tr><td>Edge par evaluation order</td><td>Ingress ACL, app-route policy, data policy, forwarding, security policy, encryption, egress ACL</td></tr>
<tr><td>Path quality kaun measure karta hai</td><td>BFD, policy nahi</td></tr>
<tr><td>AAR kiske beech chun sakta hai</td><td>Sirf un tunnels ke beech jo OMP pehle se deta hai</td></tr>
<tr><td>Policies kahan enforce hoti hain</td><td>WAN Edge par, Controller distribute karta hai</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="out">E-BR1# show sdwan policy from-vsmart
E-BR1# show sdwan policy data-policy-filter
E-BR1# show sdwan policy app-route-policy-filter
E-BR1# show sdwan policy service-path vpn 10 interface GigabitEthernet3 source-ip 10.1.10.10 dest-ip 10.100.0.20 protocol 6 dest-port 443
E-BR1# show sdwan app-route stats remote-system-ip 10.255.0.1
E-BR1# show sdwan app-route sla-class
E-BR1# show sdwan bfd sessions
E-BR1# show sdwan omp routes
E-BR1# show sdwan tunnel statistics fec
E-BR1# show sdwan tunnel statistics pkt-dup
E-BR1# show sdwan control connections</pre>

<div class="exam"><p><b>Last-minute traps.</b> (1) "Loss, latency, jitter policy measure karti hai": galat, BFD measure karta hai. (2) "preferred-color color force karta hai": galat, sirf un tunnels ke beech jo SLA meet karte hain. (3) "Strict default hai": galat, strict ke bina traffic phir bhi chalta hai. (4) "AAR from-service apply hota hai": galat, app-route policy ki koi direction nahi hoti. (5) "FEC lost packets retransmit karta hai": galat, woh parity packets bhejta hai.</p></div>

<div class="scn"><h4>Policy review ka hafta</h4><p>Quarterly review se pehle Bharat Retail WAN team ne apni SD-WAN policies ko is checklist se audit kiya. Unhe ek data policy bina default-action ke mili (jo drop hota hai), ek SLA class jo 4G backup link kabhi meet nahi kar sakta tha utni tight, aur do sites ek site-list se missing. In teen cheezein theek karne se chaar recurring tickets khatam hue aur team ko future policies ke liye ek-page ka standard mil gaya.</p><p><b>Lesson:</b> chhoti, repeatable checklist clever policy se behtar hai.</p></div>

<div class="iv"><p class="q">"Do minute mein non-technical manager ko application-aware routing samjhao."</p><p>Yeh WAN ke liye navigation app hai. Branch router headquarters tak har route ko delay, loss aur wobble ke liye lagatar measure karta hai, har application ki zarooraton se compare karta hai (voice nakhrewali hai, backups nahi), aur har application ko aise route par bhejta hai jo kaafi accha ho, route degrade hone par automatically switch karke. Business value jodo: sasti links par behtar calls aur kam MPLS kharch, bina manual intervention ke.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BFD measure karta hai, SLA class "kaafi accha" define karti hai, app-route policy chunti hai; data policy refine aur repair karti hai.</li>
<li>Defaults yaad rakho: BFD 1000 ms x 7, app-route poll 10 minutes x 6, BFD DSCP 48.</li>
<li>Data policy ki direction aur default-drop hota hai; app-route policy mein dono nahi.</li>
<li>Evaluation order: pehle ingress ACL, phir AAR, phir data policy.</li>
<li>Top-down troubleshoot karo: pahunchi, sahi site/VPN/direction, match, simulated path, ACL, measurements.</li>
</ul></div>
`}};export{e as default};