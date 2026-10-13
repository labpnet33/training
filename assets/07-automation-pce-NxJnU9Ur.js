var e={id:`automation-pce`,h:{en:`Constraints, auto-bandwidth, auto-tunnels and PCE`,hi:`Constraints, auto-bandwidth, auto-tunnels aur PCE`},body:{en:`
<p>Running a few TE tunnels by hand is fine. Running hundreds is not. Traffic changes every hour, links fail, and nobody wants to edit tunnel bandwidth at midnight. This chapter shows how providers automate TE: tunnels that resize themselves, tunnels and backups that appear automatically, and a central brain that computes paths for the whole network.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Auto-bandwidth measures the tunnel traffic over an interval and re-signals the tunnel with a new bandwidth value."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Measure</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">tunnel traffic</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Adjust</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">auto-bandwidth resizes</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Re-signal</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">make-before-break</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Repeat</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">each cycle</text></svg><p class="cap">Auto-bandwidth measures the tunnel traffic over an interval and re-signals the tunnel with a new bandwidth value.</p></div>
<h3>Constraints CSPF can use</h3>
<table class="cmp"><tr><th>Constraint</th><th>Effect</th><th>Where set</th></tr><tr><td>Bandwidth</td><td>Prune links with less unreserved bandwidth at the setup priority</td><td>Tunnel</td></tr><tr><td>Affinity / attribute flags</td><td>Include or exclude coloured links</td><td>Link and tunnel</td></tr><tr><td>TE metric</td><td>Choose the path with the lowest TE metric, not the IGP metric</td><td>Link and tunnel (path-selection metric te)</td></tr><tr><td>Explicit path / exclude</td><td>Force or avoid specific hops</td><td>Path-option</td></tr><tr><td>SRLG exclusion</td><td>Avoid links in the same risk group</td><td>Link and backup path</td></tr><tr><td>Hop limit</td><td>Limit the number of hops</td><td>Tunnel</td></tr></table>
<p>CSPF tie-breaking is deterministic. Among equal-cost paths it prefers the path with the highest minimum available bandwidth, then fewest hops, then a random choice. You can change the tie-break rules to prefer the least-filled or the most-filled path.</p>
<h3>Auto-bandwidth</h3>
<p><b>Auto-bandwidth</b> lets a tunnel adapt its reservation to the traffic it actually carries. The head end samples the tunnel output rate, finds the highest sample over an interval (the <b>application period</b>), and, if it differs from the current bandwidth by more than a threshold, re-signals the tunnel with the new value using make-before-break. You can set minimum and maximum bounds so the tunnel never reserves absurd values.</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE</span>
interface Tunnel1
 tunnel mpls traffic-eng auto-bw frequency 3600 max-bw 5000000 min-bw 500000
<span class="c">!</span>
mpls traffic-eng auto-bw timers frequency 300
<span class="c">!</span>
<span class="c">! IOS XR</span>
interface tunnel-te1
 auto-bw
  application 60
  bw-limit min 500000 max 5000000
  adjustment-threshold 10</pre>
<h3>Auto-tunnel</h3>
<ul>
<li><b>Auto-tunnel backup.</b> Each PLR builds its own link and node protection backup tunnels automatically for every protected interface. It removes the error-prone manual step from the FRR chapter. IOS XE: <code>mpls traffic-eng auto-tunnel backup</code>. IOS XR: <code>auto-tunnel backup</code> under <code>mpls traffic-eng</code>.</li>
<li><b>Auto-tunnel mesh group.</b> Creates a full mesh of tunnels between all routers in a group (for example all PEs), so you add a new PE to the mesh by flagging its loopback, not by configuring N tunnels.</li>
<li><b>Auto-tunnel primary.</b> Creates tunnels from the head end automatically to destinations learned through the IGP or from a prefix list.</li>
</ul>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
<span class="c">! IOS XE: auto-tunnel backup with node protection</span>
mpls traffic-eng auto-tunnel backup
 tunnel-id min 2000 max 2999
 nhop-only
<span class="c">! IOS XR</span>
mpls traffic-eng
 auto-tunnel backup
  tunnel-id min 2000 max 2999</pre>
<h3>Centralised path computation: PCE</h3>
<p>CSPF at each head end uses only its own TED view, and head ends do not coordinate. Two head ends may both choose the same link at the same moment and cause a collision. A <b>Path Computation Element (PCE)</b> is a server that has the whole TED and computes paths for many head ends. The head end, called a <b>PCC</b> (Path Computation Client), talks to it with <b>PCEP</b> (RFC 5440, TCP port 4189). A <b>stateful PCE</b> also tracks the tunnels already built, and an <b>active stateful PCE</b> can <i>instruct</i> the PCC to create or change a tunnel (RFC 8231 and 8281). This is the basis of today's SDN-style WAN controllers and carries over to segment routing, covered in <code>spcor-sr</code>.</p>
<table class="cmp"><tr><th>Model</th><th>Where the path is computed</th><th>Strength</th><th>Weakness</th></tr><tr><td>Distributed CSPF</td><td>Each head end</td><td>Simple, resilient, no extra server</td><td>No global view; possible collisions</td></tr><tr><td>Stateful PCE</td><td>Central server, head end delegates</td><td>Global optimisation, avoids collisions</td><td>Needs controller, PCEP, and a fallback if it fails</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Tunnel1 is 2G at 08:00 and 6G at 20:00. With auto-bandwidth on a one hour application period, the head end measures the 08:00 peak of 2.1G and keeps a reservation near 2.1G. At 19:00 it measures 5.8G and re-signals Tunnel1 at 5.8G. If a link on the old path has only 3G free, CSPF moves the tunnel to another path during that make-before-break step, which spreads load without a human on the console.</p></div>
<div class="warn"><p><b>Common mistake.</b> Setting auto-bandwidth without min and max bounds. A short burst reserves a huge value and blocks other tunnels, or a quiet night shrinks the reservation so low that a morning surge cannot be placed. Also avoid frequent short application periods in a big network: each resize is signalling and re-optimisation churn.</p></div>
<div class="exam"><p><b>Exam trap.</b> Auto-bandwidth uses <i>measured</i> traffic and re-signals with make-before-break; it does not police traffic. PCEP runs over TCP 4189. Auto-tunnel backup creates backup tunnels at the PLR, not at the head end of the primary tunnel.</p></div>
<div class="scn"><h4>The midnight bandwidth edit</h4><p>A broadcaster edited tunnel bandwidth by hand before every big match. A late edit was forgotten and the tunnel stayed at 1G while traffic reached 8G on a 10G path. After the incident the team enabled auto-bandwidth with a floor of 1G and a ceiling of 8G and an hourly application period. The next match was placed on a path with room, with no manual change.</p><p><b>Lesson:</b> automation needs bounds and a sensible interval; unlimited automation can cause its own incidents.</p></div>
<div class="iv"><p class="q">"What problems do auto-bandwidth, auto-tunnel and PCE solve?"</p><p>Auto-bandwidth resizes tunnel reservations to measured traffic using make-before-break. Auto-tunnel creates backup tunnels, full meshes or primary tunnels automatically, removing manual per-interface and per-pair configuration. PCE centralises path computation with a global TED, avoiding head-end collisions; a stateful active PCE can instruct head ends over PCEP. Mention min and max bounds for auto-bandwidth and a fallback if the PCE fails.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CSPF constraints: bandwidth, affinity, TE metric, explicit hops, SRLG, hop count.</li>
<li>Auto-bandwidth measures traffic, then re-signals with make-before-break within min and max bounds.</li>
<li>Auto-tunnel backup, mesh group and primary remove manual tunnel configuration.</li>
<li>PCE computes paths centrally; PCEP uses TCP 4189; stateful active PCE can instruct head ends.</li>
<li>The segment routing chapters reuse the PCE idea.</li>
</ul></div>
`,hi:`
<p>Haath se kuch TE tunnels chalana theek hai. Saikdon chalana nahi. Traffic har ghante badalta hai, links fail hote hain, aur koi aadhi raat ko tunnel bandwidth edit nahi karna chahta. Yeh chapter dikhata hai ki providers TE ko automate kaise karte hain: tunnels jo apne aap resize hote hain, tunnels aur backups jo apne aap banate hain, aur ek central dimaag jo poore network ke liye paths compute karta hai.</p>
<div class="dia"><svg viewBox="0 0 640 145" role="img" aria-label="Auto-bandwidth interval mein tunnel traffic measure karta hai aur naye bandwidth value ke saath tunnel re-signal karta hai."><rect x="20" y="30" width="133" height="70" rx="10" fill="#bae6fd"/><text x="86.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Measure</text><text x="86.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">tunnel traffic</text><line x1="153" y1="65" x2="175" y2="65" stroke="#64748b" stroke-width="2"/><rect x="175" y="30" width="133" height="70" rx="10" fill="#bbf7d0"/><text x="241.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Adjust</text><text x="241.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">auto-bandwidth resize karta hai</text><line x1="308" y1="65" x2="330" y2="65" stroke="#64748b" stroke-width="2"/><rect x="330" y="30" width="133" height="70" rx="10" fill="#ddd6fe"/><text x="396.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Re-signal</text><text x="396.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">make-before-break</text><line x1="463" y1="65" x2="485" y2="65" stroke="#64748b" stroke-width="2"/><rect x="485" y="30" width="133" height="70" rx="10" fill="#fde68a"/><text x="551.5" y="58" text-anchor="middle" class="svg-ink" font-size="13">Repeat</text><text x="551.5" y="80" text-anchor="middle" class="svg-muted" font-size="12">har cycle</text></svg><p class="cap">Auto-bandwidth interval mein tunnel traffic measure karta hai aur naye bandwidth value ke saath tunnel re-signal karta hai.</p></div>
<h3>CSPF jo constraints use kar sakta hai</h3>
<table class="cmp"><tr><th>Constraint</th><th>Effect</th><th>Kahan set hota hai</th></tr><tr><td>Bandwidth</td><td>Setup priority par kam unreserved bandwidth wale links prune karta hai</td><td>Tunnel</td></tr><tr><td>Affinity / attribute flags</td><td>Coloured links include ya exclude karta hai</td><td>Link aur tunnel</td></tr><tr><td>TE metric</td><td>IGP metric ki jagah sabse kam TE metric wala path chunta hai</td><td>Link aur tunnel (path-selection metric te)</td></tr><tr><td>Explicit path / exclude</td><td>Specific hops force ya avoid karta hai</td><td>Path-option</td></tr><tr><td>SRLG exclusion</td><td>Same risk group ke links avoid karta hai</td><td>Link aur backup path</td></tr><tr><td>Hop limit</td><td>Hops ki ginti limit karta hai</td><td>Tunnel</td></tr></table>
<p>CSPF tie-breaking deterministic hai. Equal-cost paths mein woh sabse zyada minimum available bandwidth wala path prefer karta hai, phir sabse kam hops, phir random choice. Tie-break rules badalkar sabse kam bhara ya sabse zyada bhara path prefer karwa sakte ho.</p>
<h3>Auto-bandwidth</h3>
<p><b>Auto-bandwidth</b> tunnel ko apni reservation us traffic ke hisaab se adapt karne deta hai jo woh asal mein carry karta hai. Head end tunnel output rate sample karta hai, ek interval (<b>application period</b>) mein sabse high sample dhoondta hai, aur woh current bandwidth se threshold se zyada alag ho to make-before-break se naye value ke saath tunnel re-signal karta hai. Minimum aur maximum bounds set kar sakte ho taaki tunnel kabhi bemani values reserve na kare.</p>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XE</span>
interface Tunnel1
 tunnel mpls traffic-eng auto-bw frequency 3600 max-bw 5000000 min-bw 500000
<span class="c">!</span>
mpls traffic-eng auto-bw timers frequency 300
<span class="c">!</span>
<span class="c">! IOS XR</span>
interface tunnel-te1
 auto-bw
  application 60
  bw-limit min 500000 max 5000000
  adjustment-threshold 10</pre>
<h3>Auto-tunnel</h3>
<ul>
<li><b>Auto-tunnel backup.</b> Har PLR har protected interface ke liye apne link aur node protection backup tunnels automatically banata hai. Yeh FRR chapter ke error-prone manual step ko hata deta hai. IOS XE: <code>mpls traffic-eng auto-tunnel backup</code>. IOS XR: <code>mpls traffic-eng</code> ke neeche <code>auto-tunnel backup</code>.</li>
<li><b>Auto-tunnel mesh group.</b> Ek group ke saare routers (jaise saare PEs) ke beech tunnels ka full mesh banata hai, isliye naya PE mesh mein jodne ke liye uska loopback flag karte ho, N tunnels configure nahi karte.</li>
<li><b>Auto-tunnel primary.</b> IGP se seekhe ya prefix list ke destinations tak head end se tunnels automatically banata hai.</li>
</ul>
<pre class="code"><span class="c">! Reference configuration (simulator mein run nahi hoti)</span>
<span class="c">! IOS XE: node protection ke saath auto-tunnel backup</span>
mpls traffic-eng auto-tunnel backup
 tunnel-id min 2000 max 2999
 nhop-only
<span class="c">! IOS XR</span>
mpls traffic-eng
 auto-tunnel backup
  tunnel-id min 2000 max 2999</pre>
<h3>Centralised path computation: PCE</h3>
<p>Har head end par CSPF sirf apna TED view use karta hai, aur head ends aapas mein coordinate nahi karte. Do head ends ek hi samay par ek hi link chun sakte hain aur collision ho sakta hai. <b>Path Computation Element (PCE)</b> ek server hai jiske paas poora TED hota hai aur jo kai head ends ke liye paths compute karta hai. Head end, jise <b>PCC</b> (Path Computation Client) kehte hain, usse <b>PCEP</b> (RFC 5440, TCP port 4189) se baat karta hai. <b>Stateful PCE</b> pehle se bane tunnels bhi track karta hai, aur <b>active stateful PCE</b> PCC ko tunnel banane ya badalne ka <i>hukm</i> de sakta hai (RFC 8231 aur 8281). Yeh aaj ke SDN-style WAN controllers ki buniyaad hai aur segment routing mein bhi chalta hai, jo <code>spcor-sr</code> mein cover hai.</p>
<table class="cmp"><tr><th>Model</th><th>Path kahan compute hota hai</th><th>Strength</th><th>Weakness</th></tr><tr><td>Distributed CSPF</td><td>Har head end</td><td>Simple, resilient, extra server nahi</td><td>Global view nahi; collisions sambhav</td></tr><tr><td>Stateful PCE</td><td>Central server, head end delegate karta hai</td><td>Global optimisation, collisions se bachav</td><td>Controller, PCEP aur fail hone par fallback chahiye</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Tunnel1 08:00 par 2G aur 20:00 par 6G hai. Ek ghante ke application period ke saath auto-bandwidth on ho to head end 08:00 ka 2.1G peak measure karke reservation 2.1G ke aas-paas rakhta hai. 19:00 par woh 5.8G measure karta hai aur Tunnel1 ko 5.8G par re-signal karta hai. Purane path ke link par sirf 3G free ho to CSPF us make-before-break step mein tunnel doosre path par le jaata hai, bina kisi insaan ke console par aaye load spread ho jaata hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Auto-bandwidth ko min aur max bounds ke bina set karna. Chhota burst bahut bada value reserve kar leta hai aur doosre tunnels block karta hai, ya shaant raat reservation itna kam kar deti hai ki subah ka surge place nahi ho paata. Bade network mein chhote application periods bhi avoid karo: har resize signalling aur re-optimisation churn hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Auto-bandwidth <i>measured</i> traffic use karta hai aur make-before-break se re-signal karta hai; traffic police nahi karta. PCEP TCP 4189 par chalta hai. Auto-tunnel backup PLR par backup tunnels banata hai, primary tunnel ke head end par nahi.</p></div>
<div class="scn"><h4>Aadhi raat ka bandwidth edit</h4><p>Ek broadcaster har bade match se pehle tunnel bandwidth haath se edit karta tha. Ek late edit bhool gayi aur tunnel 1G par raha jabki 10G path par traffic 8G tak pahunch gaya. Incident ke baad team ne 1G floor, 8G ceiling aur hourly application period ke saath auto-bandwidth enable kiya. Agla match bina manual change ke us path par place hua jisme jagah thi.</p><p><b>Lesson:</b> automation ko bounds aur samajhdaar interval chahiye; unlimited automation apne incidents bana sakta hai.</p></div>
<div class="iv"><p class="q">"Auto-bandwidth, auto-tunnel aur PCE kaunsi problems solve karte hain?"</p><p>Auto-bandwidth tunnel reservations ko measured traffic ke hisaab se make-before-break se resize karta hai. Auto-tunnel backup tunnels, full meshes ya primary tunnels automatically banata hai, manual per-interface aur per-pair configuration hata kar. PCE global TED ke saath path computation centralise karta hai, head-end collisions se bachata hai; stateful active PCE PCEP se head ends ko instruct kar sakta hai. Auto-bandwidth ke min aur max bounds aur PCE fail hone par fallback ka zikr karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>CSPF constraints: bandwidth, affinity, TE metric, explicit hops, SRLG, hop count.</li>
<li>Auto-bandwidth traffic measure karke min aur max bounds ke andar make-before-break se re-signal karta hai.</li>
<li>Auto-tunnel backup, mesh group aur primary manual tunnel configuration hataate hain.</li>
<li>PCE centrally paths compute karta hai; PCEP TCP 4189; stateful active PCE head ends ko instruct kar sakta hai.</li>
<li>Segment routing chapters PCE idea dobara use karte hain.</li>
</ul></div>
`}};export{e as default};