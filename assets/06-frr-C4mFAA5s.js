var e={id:`frr`,h:{en:`MPLS-TE Fast Reroute: link and node protection`,hi:`MPLS-TE Fast Reroute: link aur node protection`},body:{en:`
<p>Imagine a motorway with a pre-built emergency bypass at every junction. When a bridge closes, the cars at the closed junction are already waved onto the bypass within a blink, while the traffic control centre works out a permanent new route. <b>Fast Reroute (FRR)</b> does this for LSPs. Without it, a link failure makes the head end learn about the failure, recompute a path and signal a new LSP, taking seconds. With FRR the router next to the failure repairs locally in about <b>50 milliseconds</b>, the same target as SONET and SDH protection.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="The PLR detects the failure and pushes traffic onto a pre-signalled backup tunnel that merges back at the MP."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">head end</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">PLR P1</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">point of local repair</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">P2</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">protected node</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">MP P3</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">merge point</text><text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">Backup path P1 - P4 - P3 already exists before the failure</text></svg><p class="cap">The PLR detects the failure and pushes traffic onto a pre-signalled backup tunnel that merges back at the MP.</p></div>
<h3>Terms</h3>
<ul>
<li><b>PLR (Point of Local Repair).</b> The router that detects the failure and performs the repair; it is the head end of the backup tunnel.</li>
<li><b>MP (Merge Point).</b> The router where the backup tunnel rejoins the protected LSP; it is the tail end of the backup tunnel.</li>
<li><b>Link protection.</b> The backup protects against failure of the link between PLR and the next hop. MP is the next hop (NHOP).</li>
<li><b>Node protection.</b> The backup also protects against failure of the next hop router. MP is the next-next hop (NNHOP).</li>
</ul>
<h3>How the repair works: facility backup</h3>
<p>Cisco uses <b>facility backup</b> (also called many-to-one): one backup tunnel protects <i>all</i> LSPs that use the protected link or node. Before any failure, the PLR holds a pre-signalled backup tunnel that avoids the protected element. When the failure occurs, the PLR switches affected LSPs onto the backup by <b>pushing an additional label</b>: the label the MP expects for the protected LSP is the inner label, and the backup tunnel label is the outer one. The penultimate hop of the backup pops the outer label, so the packet arrives at the MP with the label it expected. Because a single backup covers many LSPs, the backup scales well. The alternative, <b>one-to-one (detour)</b>, builds a separate detour for each LSP at each hop and is rarely used.</p>
<table class="cmp"><tr><th>Method</th><th>Backups</th><th>Scale</th><th>Used by Cisco</th></tr><tr><td>Facility backup (many-to-one)</td><td>One bypass per protected link or node</td><td>Good</td><td>Yes</td></tr><tr><td>One-to-one (detour)</td><td>One detour per LSP per hop</td><td>Poor</td><td>Not on Cisco IOS XE or XR</td></tr></table>
<h3>Configuration: protect the tunnel, create the backup</h3>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE, on the head end of the protected tunnel</span>
interface Tunnel1
 tunnel mpls traffic-eng fast-reroute
<span class="c"> ! add node-protect for node protection</span>
<span class="c">!</span>
<span class="c">! On the PLR, a backup tunnel that avoids the protected link</span>
ip explicit-path name AVOID-LINK enable
 exclude-address 198.51.100.2
<span class="c">!</span>
interface Tunnel100
 ip unnumbered Loopback0
 tunnel mode mpls traffic-eng
 tunnel destination 192.0.2.3
 tunnel mpls traffic-eng path-option 1 explicit name AVOID-LINK
<span class="c">!</span>
interface TenGigabitEthernet0/0/2
 mpls traffic-eng backup-path Tunnel100
<span class="c">!</span>
<span class="c">! IOS XR</span>
interface tunnel-te1
 fast-reroute
<span class="c">!</span>
mpls traffic-eng
 interface TenGigE0/0/0/2
  backup-path tunnel-te 100
<span class="c"> !</span></pre>
<p>Two things must exist: the protected tunnel must <b>request</b> protection (<code>fast-reroute</code> in the head end tunnel), and each PLR must have a <b>backup tunnel</b> assigned to the protected interface. The backup tunnel is created at the PLR and ends at the MP; for node protection it ends at the next-next hop and must avoid the next hop node. The SESSION_ATTRIBUTE flag "local protection desired" and the RRO carry the intent and the protection state, so you can see on the head end whether each hop is protected.</p>
<h3>Backup bandwidth, auto-tunnel and SRLG</h3>
<ul>
<li><b>Backup bandwidth</b> can be reserved (<code>bandwidth</code> on the backup tunnel) or left at zero. A bypass without bandwidth does not guarantee capacity during the repair, and the primary LSPs may compete for the same links. Many providers rely on over-provisioning during the short repair window.</li>
<li><b>Auto-tunnel backup</b> lets the PLR build backups automatically (see the next chapter).</li>
<li><b>SRLG</b>: if the primary link and the backup path share a fibre duct, one cut fails both. Mark them with a shared risk group and ask CSPF to avoid SRLGs for the backup.</li>
</ul>
<h3>Detection and the repair timeline</h3>
<p>The repair is fast only if the failure is <b>detected</b> fast. On a direct fibre, loss of signal triggers it in a few milliseconds. On non-direct links, BFD (see <code>spcor-ha</code>) or RSVP hellos are needed. After the local repair, the head end learns of the failure through PathErr or the IGP and runs a global <b>re-optimisation</b>, building a new primary LSP with make-before-break and switching traffic from the temporary bypass to it.</p>
<div class="eg"><p><b>Worked example.</b> Primary LSP: PE1, P1, P2, PE2. The P1 to P2 link carries Tunnel1. A bypass Tunnel100 from P1 to P2 goes P1, P4, P2. Link failure: P1 detects loss of signal in 3 ms, switches Tunnel1 to Tunnel100 by adding the backup label, traffic flows P1, P4, P2 again in under 50 ms. PE1 then computes a new primary, perhaps PE1, P1, P4, P2, PE2, signals it make-before-break, and the bypass is released.</p></div>
<div class="warn"><p><b>Common mistake.</b> Configuring <code>fast-reroute</code> on the tunnel but never creating the backup tunnel on the PLR, or assigning a backup that uses the same link it protects. The LSP shows as "protection desired" but "not ready" and nothing is repaired. Always check both on the PLR. Another trap: a backup tunnel does not protect against a head end or tail end failure.</p></div>
<div class="exam"><p><b>Exam trap.</b> Link protection MP is the next hop; node protection MP is the next-next hop. Cisco uses facility backup (one backup for many LSPs) with a two-label stack. FRR repair time is about 50 ms and depends on fast failure detection. FRR is a <i>local, temporary</i> repair; the head end later re-optimises.</p></div>
<div class="scn"><h4>The backup that was not ready</h4><p>During a fibre cut, a core router dropped traffic for several seconds even though the tunnel had fast-reroute configured. The PLR had no backup tunnel assigned to the failed interface: the template for that interface had been skipped during a migration. The post-incident audit added auto-tunnel backup on every core interface, so every protected link now has a backup by default.</p><p><b>Lesson:</b> FRR needs three things: protected tunnel, backup tunnel on each PLR, and fast failure detection. Audit all three.</p></div>
<div class="iv"><p class="q">"Explain MPLS-TE FRR and the difference between link and node protection."</p><p>FRR pre-signals a backup tunnel at each point of local repair. On failure the PLR pushes the backup tunnel label on top of the protected LSP label so traffic reaches the merge point within about 50 ms. Link protection uses the next hop as merge point and protects a link failure; node protection uses the next-next hop, so the backup avoids the next hop router and covers its failure. Cisco uses facility backup, one bypass for many LSPs. After the repair, the head end re-optimises.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FRR is a pre-signalled local repair in about 50 ms.</li>
<li>PLR starts the backup tunnel; MP ends it. Link protection MP is NHOP, node protection MP is NNHOP.</li>
<li>Facility backup: one bypass protects many LSPs using a two-label stack.</li>
<li>You need the protected tunnel with fast-reroute and a backup tunnel assigned on the PLR interface.</li>
<li>Detection speed (LOS, BFD) decides the real repair time; SRLGs prevent shared-fate backups.</li>
</ul></div>
`,hi:`
<p>Ek motorway ki socho jisme har junction par pehle se bana emergency bypass hai. Bridge band ho to band junction ke cars palak jhapakte hi bypass par bhej diye jaate hain, jabki traffic control centre permanent naya route nikalta hai. <b>Fast Reroute (FRR)</b> LSPs ke liye yahi karta hai. Iske bina link failure ke baad head end ko failure pata chalta hai, naya path compute karta hai aur naya LSP signal karta hai, jisme seconds lagte hain. FRR ke saath failure ke paas wala router lagbhag <b>50 millisecond</b> mein locally repair kar deta hai, jo SONET aur SDH protection ka bhi target hai.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="PLR failure detect karke traffic ko pre-signalled backup tunnel par daalta hai jo MP par wapas merge hota hai."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">head end</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">PLR P1</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">point of local repair</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">P2</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">protected node</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">MP P3</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">merge point</text><text x="320" y="128" text-anchor="middle" class="svg-accent" font-size="12">Backup path P1 - P4 - P3 failure se pehle se maujood hai</text></svg><p class="cap">PLR failure detect karke traffic ko pre-signalled backup tunnel par daalta hai jo MP par wapas merge hota hai.</p></div>
<h3>Terms</h3>
<ul>
<li><b>PLR (Point of Local Repair).</b> Woh router jo failure detect karke repair karta hai; yeh backup tunnel ka head end hai.</li>
<li><b>MP (Merge Point).</b> Woh router jahan backup tunnel protected LSP se dobara judta hai; yeh backup tunnel ka tail end hai.</li>
<li><b>Link protection.</b> Backup PLR aur next hop ke beech ke link failure se bachata hai. MP next hop (NHOP) hai.</li>
<li><b>Node protection.</b> Backup next hop router ke failure se bhi bachata hai. MP next-next hop (NNHOP) hai.</li>
</ul>
<h3>Repair kaise kaam karta hai: facility backup</h3>
<p>Cisco <b>facility backup</b> (many-to-one bhi kehte hain) use karta hai: ek backup tunnel us protected link ya node se guzarne wale <i>saare</i> LSPs ko protect karta hai. Kisi failure se pehle PLR ke paas protected element se bachne wala pre-signalled backup tunnel hota hai. Failure hone par PLR affected LSPs ko backup par switch karta hai ek <b>additional label push</b> karke: MP jo label protected LSP ke liye expect karta hai woh inner label hota hai, aur backup tunnel label outer. Backup ka penultimate hop outer label pop karta hai, isliye packet MP par expected label ke saath pahunchta hai. Ek backup kai LSPs cover karta hai, isliye achha scale karta hai. Alternative, <b>one-to-one (detour)</b>, har LSP ke liye har hop par alag detour banata hai aur kam use hota hai.</p>
<table class="cmp"><tr><th>Method</th><th>Backups</th><th>Scale</th><th>Cisco use karta hai</th></tr><tr><td>Facility backup (many-to-one)</td><td>Har protected link ya node ke liye ek bypass</td><td>Achha</td><td>Haan</td></tr><tr><td>One-to-one (detour)</td><td>Har LSP ke liye har hop par ek detour</td><td>Kamzor</td><td>Cisco IOS XE ya XR par nahi</td></tr></table>
<h3>Configuration: tunnel protect karo, backup banao</h3>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XE, protected tunnel ke head end par</span>
interface Tunnel1
 tunnel mpls traffic-eng fast-reroute
<span class="c"> ! node protection ke liye node-protect jodo</span>
<span class="c">!</span>
<span class="c">! PLR par, protected link se bachne wala backup tunnel</span>
ip explicit-path name AVOID-LINK enable
 exclude-address 198.51.100.2
<span class="c">!</span>
interface Tunnel100
 ip unnumbered Loopback0
 tunnel mode mpls traffic-eng
 tunnel destination 192.0.2.3
 tunnel mpls traffic-eng path-option 1 explicit name AVOID-LINK
<span class="c">!</span>
interface TenGigabitEthernet0/0/2
 mpls traffic-eng backup-path Tunnel100
<span class="c">!</span>
<span class="c">! IOS XR</span>
interface tunnel-te1
 fast-reroute
<span class="c">!</span>
mpls traffic-eng
 interface TenGigE0/0/0/2
  backup-path tunnel-te 100
<span class="c"> !</span></pre>
<p>Do cheezein maujood honi chahiye: protected tunnel ko protection <b>request</b> karni hogi (head end tunnel mein <code>fast-reroute</code>), aur har PLR ke paas protected interface par assigned <b>backup tunnel</b> hona chahiye. Backup tunnel PLR par banta hai aur MP par khatam hota hai; node protection ke liye woh next-next hop par khatam hota hai aur next hop node se bachna chahiye. SESSION_ATTRIBUTE ka flag "local protection desired" aur RRO intent aur protection state carry karte hain, isliye head end par dekh sakte ho ki har hop protected hai ya nahi.</p>
<h3>Backup bandwidth, auto-tunnel aur SRLG</h3>
<ul>
<li><b>Backup bandwidth</b> reserve ho sakti hai (backup tunnel par <code>bandwidth</code>) ya zero rakhi ja sakti hai. Bandwidth ke bina bypass repair ke dauran capacity guarantee nahi karta, aur primary LSPs wahi links ke liye compete kar sakte hain. Kai providers us chhoti repair window mein over-provisioning par bharosa karte hain.</li>
<li><b>Auto-tunnel backup</b> PLR ko backups apne aap banane deta hai (agla chapter dekho).</li>
<li><b>SRLG</b>: primary link aur backup path ek hi fibre duct share karein to ek cut dono ko fail karta hai. Unhe shared risk group se mark karo aur CSPF ko backup ke liye SRLGs avoid karne ko kaho.</li>
</ul>
<h3>Detection aur repair timeline</h3>
<p>Repair tabhi tez hai jab failure <b>detect</b> tez ho. Direct fibre par loss of signal ise kuch milliseconds mein trigger karta hai. Non-direct links par BFD (<code>spcor-ha</code> dekho) ya RSVP hellos chahiye. Local repair ke baad head end ko PathErr ya IGP se failure pata chalta hai aur woh global <b>re-optimisation</b> chalata hai, make-before-break se naya primary LSP banata hai aur traffic ko temporary bypass se usme switch karta hai.</p>
<div class="eg"><p><b>Worked example.</b> Primary LSP: PE1, P1, P2, PE2. P1 se P2 link Tunnel1 carry karta hai. P1 se P2 tak bypass Tunnel100 P1, P4, P2 se jaata hai. Link failure: P1 3 ms mein loss of signal detect karta hai, backup label jodkar Tunnel1 ko Tunnel100 par switch karta hai, traffic 50 ms se kam mein P1, P4, P2 se phir chalne lagta hai. Phir PE1 naya primary compute karta hai, shayad PE1, P1, P4, P2, PE2, use make-before-break se signal karta hai, aur bypass release ho jaata hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Tunnel par <code>fast-reroute</code> configure karna lekin PLR par backup tunnel kabhi na banana, ya aisa backup assign karna jo wahi link use karta hai jise woh protect karta hai. LSP "protection desired" lekin "not ready" dikhata hai aur kuch repair nahi hota. PLR par dono check karo. Ek aur trap: backup tunnel head end ya tail end failure se nahi bachata.</p></div>
<div class="exam"><p><b>Exam trap.</b> Link protection ka MP next hop hai; node protection ka MP next-next hop. Cisco facility backup (kai LSPs ke liye ek backup) do-label stack ke saath use karta hai. FRR repair time lagbhag 50 ms hai aur fast failure detection par depend karta hai. FRR <i>local, temporary</i> repair hai; head end baad mein re-optimise karta hai.</p></div>
<div class="scn"><h4>Backup jo ready nahi tha</h4><p>Fibre cut ke dauran core router ne kai seconds traffic girayi jabki tunnel par fast-reroute configured tha. PLR ke paas failed interface par koi backup tunnel assigned nahi tha: migration ke dauran us interface ka template chhoot gaya tha. Post-incident audit ne har core interface par auto-tunnel backup jod diya, ab har protected link ka default mein backup hota hai.</p><p><b>Lesson:</b> FRR ko teen cheezein chahiye: protected tunnel, har PLR par backup tunnel, aur fast failure detection. Teeno audit karo.</p></div>
<div class="iv"><p class="q">"MPLS-TE FRR samjhao aur link aur node protection ka fark batao."</p><p>FRR har point of local repair par backup tunnel pre-signal karta hai. Failure par PLR protected LSP label ke upar backup tunnel label push karta hai taaki traffic lagbhag 50 ms mein merge point tak pahunche. Link protection next hop ko merge point banata hai aur link failure se bachata hai; node protection next-next hop use karta hai, isliye backup next hop router se bachta hai aur uska failure cover karta hai. Cisco facility backup use karta hai, kai LSPs ke liye ek bypass. Repair ke baad head end re-optimise karta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FRR lagbhag 50 ms mein pre-signalled local repair hai.</li>
<li>PLR backup tunnel shuru karta hai; MP khatam karta hai. Link protection MP NHOP, node protection MP NNHOP.</li>
<li>Facility backup: ek bypass do-label stack se kai LSPs protect karta hai.</li>
<li>Protected tunnel par fast-reroute aur PLR interface par assigned backup tunnel chahiye.</li>
<li>Detection speed (LOS, BFD) asli repair time decide karti hai; SRLGs shared-fate backups rokte hain.</li>
</ul></div>
`}};export{e as default};