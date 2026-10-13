var e={id:`security-troubleshooting`,h:{en:`Troubleshooting SD-WAN security: a six-step workflow`,hi:`SD-WAN security troubleshooting: six-step workflow`},body:{en:`
<p>Security problems often look like network problems: a branch is offline, a site is blocked, an application is slow. The skill is to find which <b>security layer</b> caused it, using evidence instead of guesses, and to fix it without weakening the control. Work from the outside in: identity first, then the tunnels, then the policies that inspect traffic.</p>

<h3>Analogy: why did the visitor not get in?</h3>
<p>A visitor is stuck at the gate. The reason could be a fake or expired ID (certificate), a name that is not on today's list (authorization), a locked corridor (segmentation or ACL), the security desk blocking a bag (firewall or IPS), or a phone directory that refused to give a number (DNS security). A good guard checks them in order and writes down which one it was.</p>

<h3>The six-step workflow</h3>
<ol>
<li><b>Describe the symptom exactly.</b> Which device, which VPN, which destination, since when, and what changed (certificate, policy, signature update, firewall)?</li>
<li><b>Check the clock and the control connections.</b> <code>show clock</code>, then <code>show sdwan control connections</code>. Wrong time looks like an expired certificate. If a connection is not up, run <code>show sdwan control connection-history</code> and read the reason.</li>
<li><b>Check identity.</b> <code>show sdwan control local-properties</code> (organization name, certificate validity, serial) and <code>show sdwan certificate validity</code>. Then confirm the device is on the WAN Edge list as valid and the list was sent to the Controllers.</li>
<li><b>Check the data plane.</b> <code>show sdwan bfd sessions</code>: sessions up between the right TLOCs? If they are down while control is up, look at transport firewalls, IPsec parameters and key exchange; if they flap, look at anti-replay drops and the replay window.</li>
<li><b>Check the inspection layers.</b> Firewall: <code>show sdwan zbfw drop-statistics</code> and <code>show sdwan zbfw zonepair-statistics</code>. UTD: <code>show utd engine standard status</code>. DNS security and SIG: check registration, bypass list and tunnel state in Manager.</li>
<li><b>Fix one thing, then verify and document.</b> Change the smallest possible item, re-test the original symptom, confirm nothing else broke, and record the cause in the ticket.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Order of security checks">
<rect x="10" y="60" width="90" height="70" rx="8" fill="#fde68a"/><text x="55" y="90" text-anchor="middle" class="svg-ink" font-size="12">1 Clock</text><text x="55" y="108" text-anchor="middle" class="svg-muted" font-size="11">and symptom</text>
<rect x="115" y="60" width="90" height="70" rx="8" fill="#fde68a"/><text x="160" y="90" text-anchor="middle" class="svg-ink" font-size="12">2 Control</text><text x="160" y="108" text-anchor="middle" class="svg-muted" font-size="11">connections</text>
<rect x="220" y="60" width="90" height="70" rx="8" fill="#fde68a"/><text x="265" y="90" text-anchor="middle" class="svg-ink" font-size="12">3 Identity</text><text x="265" y="108" text-anchor="middle" class="svg-muted" font-size="11">cert and list</text>
<rect x="325" y="60" width="90" height="70" rx="8" fill="#fde68a"/><text x="370" y="90" text-anchor="middle" class="svg-ink" font-size="12">4 Data plane</text><text x="370" y="108" text-anchor="middle" class="svg-muted" font-size="11">BFD, IPsec</text>
<rect x="430" y="60" width="90" height="70" rx="8" fill="#fde68a"/><text x="475" y="90" text-anchor="middle" class="svg-ink" font-size="12">5 Inspect</text><text x="475" y="108" text-anchor="middle" class="svg-muted" font-size="11">FW, UTD, DNS</text>
<rect x="535" y="60" width="95" height="70" rx="8" fill="#bbf7d0"/><text x="582" y="90" text-anchor="middle" class="svg-ink" font-size="12">6 Fix and</text><text x="582" y="108" text-anchor="middle" class="svg-muted" font-size="11">verify</text>
<line x1="100" y1="95" x2="115" y2="95" stroke="#64748b" stroke-width="2"/><line x1="205" y1="95" x2="220" y2="95" stroke="#64748b" stroke-width="2"/><line x1="310" y1="95" x2="325" y2="95" stroke="#64748b" stroke-width="2"/><line x1="415" y1="95" x2="430" y2="95" stroke="#64748b" stroke-width="2"/><line x1="520" y1="95" x2="535" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Outside in: identity, then tunnels, then inspection</text>
</svg><p class="cap">Follow the order. The first failing layer is usually the cause.</p></div>

<h3>Symptom to cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Evidence</th></tr>
<tr><td>Control connection stuck in connect or challenge state</td><td>Device not authorized, or certificate or root chain problem</td><td>Reason code in <code>show sdwan control connection-history</code> (for example CRTREJSER, BIDNTVRFD)</td></tr>
<tr><td>All connections dropped on one date</td><td>Certificate expiry or wrong clock</td><td><code>show sdwan certificate validity</code>, <code>show clock</code></td></tr>
<tr><td>Control up, BFD down to one site</td><td>Transport firewall or keys</td><td><code>show sdwan bfd sessions</code></td></tr>
<tr><td>BFD flaps under load</td><td>Reordering and a small replay window</td><td>Anti-replay drop counters</td></tr>
<tr><td>One application blocked at a branch</td><td>Firewall policy or IPS signature or URL category</td><td>Drop statistics, UTD alerts</td></tr>
<tr><td>Internal names fail after DNS security</td><td>Missing local domain bypass</td><td>Policy settings in Manager</td></tr>
<tr><td>UTD not running</td><td>Not enough memory or image mismatch</td><td><code>show utd engine standard status</code></td></tr></table>

<h3>Safe fixes</h3>
<ul>
<li>Authorization problem: add the serial as valid and send the WAN Edge list to the Controllers.</li>
<li>Root chain missing on a device: install the root certificate chain (for example with <code>request platform software sdwan root-cert-chain install</code> from a file on the device).</li>
<li>Anti-replay drops: enlarge the replay window; do not turn the feature off.</li>
<li>False positive: tune the specific signature or application rule, with approval and a note, instead of disabling the engine.</li>
<li>Suspected key exposure: rotate with <code>request platform software sdwan security ipsec-rekey</code> and investigate.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> E-BR1 at Pune lost all overlay connectivity at 06:00. <code>show clock</code> shows the year 2012: the clock reset after a power cut. The certificates look not yet valid and <code>show sdwan control connection-history</code> shows the handshake failing. The engineer corrects the time source, the control connections come back up within minutes, and BFD sessions to E-DC follow. No security setting was changed.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Disabling the firewall or IPS "to test" and forgetting to turn it back. (2) Rebooting before reading the reason code. (3) Changing certificates, keys and policy together. (4) Ignoring time and NTP. (5) Opening broad access rules to make a symptom go away.</p></div>

<div class="exam"><p><b>Exam trap.</b> Control connection down is an identity or reachability problem (certificate, authorization, clock, ports). BFD down with control up is a data plane problem. Blocked traffic with both up points to firewall, IPS, URL, DNS or ACL.</p></div>

<div class="scn"><h4>New branch router never joins</h4><p>A router for the Nashik kiosk stays in the connect state. The reason code in the connection history is BIDNTVRFD, meaning the board ID could not be verified. The device certificate chain on the Controller side did not include the right root. After installing the correct root chain in Manager and re-sending the list, the router connected.</p><p><b>Lesson:</b> the reason code tells you which layer to inspect.</p></div>

<div class="iv"><p class="q">"A branch lost connectivity and you suspect a security cause. What do you check?"</p><p>I follow the layers: clock and NTP, control connections and the history reason code, certificate validity and organization name, WAN Edge list authorization, BFD sessions for the data plane, then the inspection layers: firewall drop statistics, UTD status and DNS or SIG settings. I change one item at a time, verify, and document. I never disable a control permanently to make a symptom disappear.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outside in: clock, control, identity, data plane, inspection, then fix and verify.</li>
<li>Reason codes in <code>show sdwan control connection-history</code> point to the cause.</li>
<li>Expired certificates and wrong clocks cause fabric-wide failures.</li>
<li>BFD down with control up is a data plane problem; enlarge the replay window for reordering.</li>
<li>Fix the smallest thing and never weaken controls permanently.</li>
</ul></div>
`,hi:`
<p>Security problems aksar network problems jaisi dikhti hain: branch offline hai, site blocked hai, application slow hai. Hunar yeh hai ki evidence se pata lagao ki kaunsi <b>security layer</b> ne yeh kiya, andaze se nahi, aur control ko kamzor kiye bina fix karo. Bahar se andar ki taraf kaam karo: pehle identity, phir tunnels, phir woh policies jo traffic inspect karti hain.</p>

<h3>Analogy: visitor andar kyun nahi aaya?</h3>
<p>Visitor gate par atka hai. Wajah nakli ya expired ID (certificate), aaj ki list mein na hone wala naam (authorization), locked corridor (segmentation ya ACL), bag ko rokta security desk (firewall ya IPS), ya number dene se mana karta phone directory (DNS security) ho sakti hai. Achha guard inhe order mein check karta hai aur likhta hai ki kaunsi wajah thi.</p>

<h3>Six-step workflow</h3>
<ol>
<li><b>Symptom saaf bayan karo.</b> Kaunsa device, kaunsa VPN, kaunsi destination, kab se, aur kya badla (certificate, policy, signature update, firewall)?</li>
<li><b>Clock aur control connections check karo.</b> <code>show clock</code>, phir <code>show sdwan control connections</code>. Galat time expired certificate jaisa dikhta hai. Agar connection up nahi hai to <code>show sdwan control connection-history</code> chalao aur reason padho.</li>
<li><b>Identity check karo.</b> <code>show sdwan control local-properties</code> (organization name, certificate validity, serial) aur <code>show sdwan certificate validity</code>. Phir confirm karo ki device WAN Edge list mein valid hai aur list Controllers ko bheji gayi.</li>
<li><b>Data plane check karo.</b> <code>show sdwan bfd sessions</code>: sahi TLOCs ke beech sessions up hain? Control up hone par bhi agar down hain to transport firewalls, IPsec parameters aur key exchange dekho; agar flap karte hain to anti-replay drops aur replay window dekho.</li>
<li><b>Inspection layers check karo.</b> Firewall: <code>show sdwan zbfw drop-statistics</code> aur <code>show sdwan zbfw zonepair-statistics</code>. UTD: <code>show utd engine standard status</code>. DNS security aur SIG: Manager mein registration, bypass list aur tunnel state dekho.</li>
<li><b>Ek cheez fix karo, phir verify aur document karo.</b> Sabse chhota item badlo, original symptom dobara test karo, confirm karo ki kuch aur nahi toota, aur ticket mein cause likho.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Security checks ka order">
<rect x="10" y="60" width="90" height="70" rx="8" fill="#fde68a"/><text x="55" y="90" text-anchor="middle" class="svg-ink" font-size="12">1 Clock</text><text x="55" y="108" text-anchor="middle" class="svg-muted" font-size="11">aur symptom</text>
<rect x="115" y="60" width="90" height="70" rx="8" fill="#fde68a"/><text x="160" y="90" text-anchor="middle" class="svg-ink" font-size="12">2 Control</text><text x="160" y="108" text-anchor="middle" class="svg-muted" font-size="11">connections</text>
<rect x="220" y="60" width="90" height="70" rx="8" fill="#fde68a"/><text x="265" y="90" text-anchor="middle" class="svg-ink" font-size="12">3 Identity</text><text x="265" y="108" text-anchor="middle" class="svg-muted" font-size="11">cert aur list</text>
<rect x="325" y="60" width="90" height="70" rx="8" fill="#fde68a"/><text x="370" y="90" text-anchor="middle" class="svg-ink" font-size="12">4 Data plane</text><text x="370" y="108" text-anchor="middle" class="svg-muted" font-size="11">BFD, IPsec</text>
<rect x="430" y="60" width="90" height="70" rx="8" fill="#fde68a"/><text x="475" y="90" text-anchor="middle" class="svg-ink" font-size="12">5 Inspect</text><text x="475" y="108" text-anchor="middle" class="svg-muted" font-size="11">FW, UTD, DNS</text>
<rect x="535" y="60" width="95" height="70" rx="8" fill="#bbf7d0"/><text x="582" y="90" text-anchor="middle" class="svg-ink" font-size="12">6 Fix aur</text><text x="582" y="108" text-anchor="middle" class="svg-muted" font-size="11">verify</text>
<line x1="100" y1="95" x2="115" y2="95" stroke="#64748b" stroke-width="2"/><line x1="205" y1="95" x2="220" y2="95" stroke="#64748b" stroke-width="2"/><line x1="310" y1="95" x2="325" y2="95" stroke="#64748b" stroke-width="2"/><line x1="415" y1="95" x2="430" y2="95" stroke="#64748b" stroke-width="2"/><line x1="520" y1="95" x2="535" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-accent" font-size="12">Bahar se andar: identity, phir tunnels, phir inspection</text>
</svg><p class="cap">Order follow karo. Pehli fail hone wali layer aksar cause hoti hai.</p></div>

<h3>Symptom se cause ki table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Sambhavit cause</th><th>Evidence</th></tr>
<tr><td>Control connection connect ya challenge state mein atka</td><td>Device authorized nahi, ya certificate ya root chain problem</td><td><code>show sdwan control connection-history</code> mein reason code (jaise CRTREJSER, BIDNTVRFD)</td></tr>
<tr><td>Ek date par saare connections gire</td><td>Certificate expiry ya galat clock</td><td><code>show sdwan certificate validity</code>, <code>show clock</code></td></tr>
<tr><td>Control up, ek site tak BFD down</td><td>Transport firewall ya keys</td><td><code>show sdwan bfd sessions</code></td></tr>
<tr><td>Load mein BFD flap</td><td>Reordering aur chhota replay window</td><td>Anti-replay drop counters</td></tr>
<tr><td>Branch par ek application blocked</td><td>Firewall policy ya IPS signature ya URL category</td><td>Drop statistics, UTD alerts</td></tr>
<tr><td>DNS security ke baad internal names fail</td><td>Local domain bypass missing</td><td>Manager mein policy settings</td></tr>
<tr><td>UTD not running</td><td>Memory kam ya image mismatch</td><td><code>show utd engine standard status</code></td></tr></table>

<h3>Safe fixes</h3>
<ul>
<li>Authorization problem: serial ko valid ke roop mein jodo aur WAN Edge list Controllers ko bhejo.</li>
<li>Device par root chain missing: root certificate chain install karo (jaise device par file se <code>request platform software sdwan root-cert-chain install</code> se).</li>
<li>Anti-replay drops: replay window badhao; feature band mat karo.</li>
<li>False positive: engine disable karne ke bajaye specific signature ya application rule ko approval aur note ke saath tune karo.</li>
<li>Key exposure ka shak: <code>request platform software sdwan security ipsec-rekey</code> se rotate karo aur investigate karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Pune ka E-BR1 06:00 baje poora overlay connectivity kho deta hai. <code>show clock</code> saal 2012 dikhata hai: power cut ke baad clock reset ho gayi. Certificates not yet valid dikhte hain aur <code>show sdwan control connection-history</code> mein handshake fail dikhta hai. Engineer time source theek karta hai, control connections kuch minutes mein wapas up aate hain, aur E-DC tak BFD sessions unke baad. Koi security setting nahi badli gayi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) "Test ke liye" firewall ya IPS disable karke wapas on karna bhool jaana. (2) Reason code padhne se pehle reboot. (3) Certificates, keys aur policy ek saath badalna. (4) Time aur NTP ignore karna. (5) Symptom hatane ke liye broad access rules kholna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Control connection down identity ya reachability problem hai (certificate, authorization, clock, ports). Control up ke saath BFD down data plane problem hai. Dono up hone par blocked traffic firewall, IPS, URL, DNS ya ACL ki taraf ishara karta hai.</p></div>

<div class="scn"><h4>Naya branch router kabhi join nahi karta</h4><p>Nashik kiosk ka router connect state mein atka hai. Connection history mein reason code BIDNTVRFD hai, jiska matlab board ID verify nahi ho paya. Controller side par device certificate chain mein sahi root nahi tha. Manager mein sahi root chain install karke list dobara bhejne ke baad router connect ho gaya.</p><p><b>Lesson:</b> reason code batata hai ki kaunsi layer inspect karni hai.</p></div>

<div class="iv"><p class="q">"Branch ne connectivity kho di aur tumhe security cause ka shak hai. Kya check karoge?"</p><p>Main layers follow karta hoon: clock aur NTP, control connections aur history ka reason code, certificate validity aur organization name, WAN Edge list authorization, data plane ke liye BFD sessions, phir inspection layers: firewall drop statistics, UTD status aur DNS ya SIG settings. Ek item ek baar mein badalta hoon, verify aur document karta hoon. Symptom hatane ke liye main kisi control ko permanently disable nahi karta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bahar se andar: clock, control, identity, data plane, inspection, phir fix aur verify.</li>
<li><code>show sdwan control connection-history</code> ke reason codes cause ki taraf ishara karte hain.</li>
<li>Expired certificates aur galat clocks fabric-wide failures karte hain.</li>
<li>Control up ke saath BFD down data plane problem hai; reordering ke liye replay window badhao.</li>
<li>Sabse chhoti cheez fix karo aur controls ko kabhi permanently kamzor mat karo.</li>
</ul></div>
`}};export{e as default};