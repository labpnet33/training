var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You now understand how a Junos device works inside. Use this page as your last review before the exam and after the two labs. Everything here maps to the "Junos OS fundamentals" domain of JN0-106.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain the roles of the Routing Engine and the Packet Forwarding Engine and name the internal link between them.</li>
<li>Name the main RE processes: rpd, mgd, chassisd, dcd, snmpd, eventd.</li>
<li>Describe the difference between the routing table and the forwarding table, and read both outputs.</li>
<li>Recite default preferences: Direct 0, Static 5, OSPF internal 10, RIP 100, OSPF external 150, BGP 170.</li>
<li>Build a floating static route and predict which table entry is active, before and after a failure.</li>
<li>Classify a packet as transit or exception and give examples of each.</li>
<li>Explain why traceroute needs the RE and what TTL expired means in PFE statistics.</li>
<li>Build and apply a lo0 input filter, with accept terms first and a counted discard last.</li>
<li>Use commit confirmed to apply risky changes safely, and verify adjacencies afterwards.</li>
<li>Sort a symptom into control plane, forwarding plane or link and choose the right commands.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Summary diagram of the module">
<rect x="10" y="20" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Routing Engine</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="11">rpd, mgd, routing table</text><text x="105" y="82" text-anchor="middle" class="svg-muted" font-size="11">filters on lo0 guard it</text>
<rect x="225" y="20" width="190" height="80" rx="8" fill="#fed7aa"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Forwarding table</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="11">active route only</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="11">copied to every PFE</text>
<rect x="440" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">Packet Forwarding Engine</text><text x="535" y="65" text-anchor="middle" class="svg-muted" font-size="11">transit at line rate</text><text x="535" y="82" text-anchor="middle" class="svg-muted" font-size="11">punts exception traffic</text>
<line x1="200" y1="60" x2="225" y2="60" stroke="#64748b" stroke-width="3"/><line x1="415" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="3"/>
<rect x="10" y="130" width="300" height="60" rx="8" fill="#bbf7d0"/><text x="160" y="155" text-anchor="middle" class="svg-ink" font-size="12">Transit: through the router, PFE only</text><text x="160" y="175" text-anchor="middle" class="svg-muted" font-size="11">ping to a server behind it</text>
<rect x="330" y="130" width="300" height="60" rx="8" fill="#fecaca"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="12">Exception: to the RE</text><text x="480" y="175" text-anchor="middle" class="svg-muted" font-size="11">ping/SSH to router, OSPF, TTL expiry</text>
</svg><p class="cap">The whole module in one picture.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Routing Engine (RE)</dt><dd>Control plane: runs rpd and mgd, holds routing tables and configuration.</dd>
<dt>Packet Forwarding Engine (PFE)</dt><dd>Forwarding plane: looks up the forwarding table and forwards at line rate.</dd>
<dt>Routing table</dt><dd>All routes for a family, e.g. inet.0; active route marked with *.</dd>
<dt>Forwarding table</dt><dd>Active next hops copied to the PFE.</dd>
<dt>Preference</dt><dd>Route trust value; lower wins for identical prefixes.</dd>
<dt>Floating static</dt><dd>Static route with high preference that acts as a backup.</dd>
<dt>Transit traffic</dt><dd>Enters one interface, leaves another, forwarded by the PFE.</dd>
<dt>Exception traffic</dt><dd>Packets punted to the RE: local address, protocols, TTL expiry, IP options.</dd>
<dt>Punt</dt><dd>Send a packet from the PFE up to the RE.</dd>
<dt>lo0 filter</dt><dd>Input filter protecting traffic destined to the RE.</dd>
<dt>Term</dt><dd>One from/then block in a firewall filter; first match wins.</dd></dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Planes</td><td>RE = control (rpd, mgd); PFE = forwarding. A busy RE does not stop transit.</td></tr>
<tr><td>Tables</td><td>show route = RIB (all routes); show route forwarding-table = FIB (active only)</td></tr>
<tr><td>Route choice</td><td>Longest prefix, then lowest preference, then metric</td></tr>
<tr><td>Preferences</td><td>Direct/Local 0, Static 5, OSPF 10, RIP 100, Aggregate 130, OSPF ext 150, BGP 170</td></tr>
<tr><td>Exception</td><td>To the router, routing protocols, TTL expired, IP options</td></tr>
<tr><td>lo0 filter</td><td>Evaluates traffic to the RE from any interface; transit unaffected</td></tr>
<tr><td>Filter logic</td><td>Terms top-down, first match; implicit discard at the end; count is non-terminating</td></tr>
<tr><td>Safe change</td><td>commit confirmed minutes; confirm with commit</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">show route 172.16.30.0/24
show route forwarding-table destination 172.16.30.10
show pfe statistics traffic
show chassis routing-engine
show firewall filter PROTECT-RE
show ospf neighbor
set routing-options static route 172.16.30.0/24 next-hop 10.0.13.2
set routing-options static route 172.16.30.0/24 preference 200
set interfaces lo0 unit 0 family inet filter input PROTECT-RE
commit confirmed 5</pre>

<h3>The two labs at a glance</h3>
<table class="cmp"><tr><th>Lab</th><th>Key facts</th></tr>
<tr><td>Transit or exception? Count it</td><td>PROTECT-RE on R2 lo0: ospf accept, ssh accept, icmp count re-icmp accept, rest count re-drop discard. Ping to 10.255.0.2 raises re-icmp; ping to SRV raises transit packets, re-icmp grows by 0; traceroute raises TTL expired.</td></tr>
<tr><td>Routing table vs forwarding table</td><td>Floating static 172.16.30.0/24 via 10.0.13.2 preference 200. inet.0 holds 2 routes; FIB next hop 10.0.12.2. After disabling ge-0/0/0 the static is active and FIB uses 10.0.13.2.</td></tr></table>

<div class="warn"><p><b>Most common mistakes.</b> Missing OSPF term in a lo0 filter; backup route with a better preference than the primary; expecting a lo0 filter to affect transit; forgetting to commit.</p></div>

<div class="exam"><p><b>Exam trap.</b> The forwarding table has only active routes; the routing table has all of them. A lo0 filter does not filter traffic passing through the router.</p></div>

<div class="scn"><h4>One ticket, all concepts</h4><p>A branch complained that pings to its router worked but VoIP to HQ failed after a link failure. The engineer checked show route: the floating static was active. The forwarding table pointed at the backup next hop. PFE counters showed transit packets rising, but the far end had no route back, so replies never returned. Adding the return route fixed it. Along the way the engineer used RIB versus FIB, transit versus exception and the troubleshooting flow.</p><p><b>Lesson:</b> the concepts are tools; combine them to locate the fault quickly.</p></div>

<div class="iv"><p class="q">"Explain Junos architecture and how you would protect the control plane."</p><p>Separate RE and PFE; RE builds routing tables and the forwarding table, PFE forwards transit traffic and punts exception traffic. Protect the RE with an input filter on lo0: accept routing protocols, management from trusted sources and counted ICMP, discard the rest, apply with commit confirmed and verify adjacencies and counters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Two planes: RE (control) and PFE (forwarding), joined by an internal link.</li>
<li>Routing table holds all routes; forwarding table holds only active next hops.</li>
<li>Transit is handled by the PFE alone; exception traffic goes to the RE.</li>
<li>A lo0 input filter protects the RE; order terms carefully and allow routing protocols.</li>
<li>Next: the CLI module, with candidate configuration, commit and rollback in depth.</li>
</ul></div>
`,hi:`
<p>Ab aap samajhte ho ki Junos device andar se kaise kaam karta hai. Is page ko exam se pehle aakhri review aur dono labs ke baad ke liye use karo. Yahan sab kuch JN0-106 ke "Junos OS fundamentals" domain se jura hai.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Routing Engine aur Packet Forwarding Engine ke roles samjhao aur dono ke beech internal link ka naam batao.</li>
<li>Mukhya RE processes batao: rpd, mgd, chassisd, dcd, snmpd, eventd.</li>
<li>Routing table aur forwarding table ka fark describe karo, aur dono outputs padho.</li>
<li>Default preferences yaad rakho: Direct 0, Static 5, OSPF internal 10, RIP 100, OSPF external 150, BGP 170.</li>
<li>Floating static route banao aur failure se pehle aur baad kaunsi table entry active hogi, predict karo.</li>
<li>Packet ko transit ya exception classify karo aur dono ke examples do.</li>
<li>Samjhao traceroute ko RE kyun chahiye aur PFE statistics mein TTL expired ka kya matlab hai.</li>
<li>lo0 input filter banao aur lagao, accept terms pehle aur counted discard aakhir mein.</li>
<li>Risky changes safely apply karne ke liye commit confirmed use karo, aur baad mein adjacencies verify karo.</li>
<li>Symptom ko control plane, forwarding plane ya link mein sort karo aur sahi commands chuno.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Module ka summary diagram">
<rect x="10" y="20" width="190" height="80" rx="8" fill="#ddd6fe"/><text x="105" y="45" text-anchor="middle" class="svg-ink" font-size="13">Routing Engine</text><text x="105" y="65" text-anchor="middle" class="svg-muted" font-size="11">rpd, mgd, routing table</text><text x="105" y="82" text-anchor="middle" class="svg-muted" font-size="11">lo0 filters ise guard karte hain</text>
<rect x="225" y="20" width="190" height="80" rx="8" fill="#fed7aa"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="13">Forwarding table</text><text x="320" y="65" text-anchor="middle" class="svg-muted" font-size="11">sirf active route</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="11">har PFE ko copy</text>
<rect x="440" y="20" width="190" height="80" rx="8" fill="#bae6fd"/><text x="535" y="45" text-anchor="middle" class="svg-ink" font-size="13">Packet Forwarding Engine</text><text x="535" y="65" text-anchor="middle" class="svg-muted" font-size="11">line rate par transit</text><text x="535" y="82" text-anchor="middle" class="svg-muted" font-size="11">exception traffic punt</text>
<line x1="200" y1="60" x2="225" y2="60" stroke="#64748b" stroke-width="3"/><line x1="415" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="3"/>
<rect x="10" y="130" width="300" height="60" rx="8" fill="#bbf7d0"/><text x="160" y="155" text-anchor="middle" class="svg-ink" font-size="12">Transit: router ke through, sirf PFE</text><text x="160" y="175" text-anchor="middle" class="svg-muted" font-size="11">peeche ke server ko ping</text>
<rect x="330" y="130" width="300" height="60" rx="8" fill="#fecaca"/><text x="480" y="155" text-anchor="middle" class="svg-ink" font-size="12">Exception: RE ko</text><text x="480" y="175" text-anchor="middle" class="svg-muted" font-size="11">router ko ping/SSH, OSPF, TTL expiry</text>
</svg><p class="cap">Poora module ek tasveer mein.</p></div>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>Routing Engine (RE)</dt><dd>Control plane: rpd aur mgd chalata hai, routing tables aur configuration rakhta hai.</dd>
<dt>Packet Forwarding Engine (PFE)</dt><dd>Forwarding plane: forwarding table dekhta hai aur line rate par forward karta hai.</dd>
<dt>Routing table</dt><dd>Ek family ke saare routes, jaise inet.0; active route par *.</dd>
<dt>Forwarding table</dt><dd>PFE ko copy kiye gaye active next hops.</dd>
<dt>Preference</dt><dd>Route trust value; identical prefixes ke liye kam jeetti hai.</dd>
<dt>Floating static</dt><dd>Ucchi preference wala static route jo backup ka kaam karta hai.</dd>
<dt>Transit traffic</dt><dd>Ek interface se aata hai, doosre se nikalta hai, PFE forward karta hai.</dd>
<dt>Exception traffic</dt><dd>RE ko punt hone wale packets: local address, protocols, TTL expiry, IP options.</dd>
<dt>Punt</dt><dd>Packet ko PFE se upar RE tak bhejna.</dd>
<dt>lo0 filter</dt><dd>RE ke liye jaate traffic ki raksha karne wala input filter.</dd>
<dt>Term</dt><dd>Firewall filter ka ek from/then block; pehla match jeetta hai.</dd></dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Planes</td><td>RE = control (rpd, mgd); PFE = forwarding. Busy RE transit nahi rokta.</td></tr>
<tr><td>Tables</td><td>show route = RIB (saare routes); show route forwarding-table = FIB (sirf active)</td></tr>
<tr><td>Route choice</td><td>Longest prefix, phir kam preference, phir metric</td></tr>
<tr><td>Preferences</td><td>Direct/Local 0, Static 5, OSPF 10, RIP 100, Aggregate 130, OSPF ext 150, BGP 170</td></tr>
<tr><td>Exception</td><td>Router ko, routing protocols, TTL expired, IP options</td></tr>
<tr><td>lo0 filter</td><td>Kisi bhi interface se RE ke traffic ko evaluate karta hai; transit unaffected</td></tr>
<tr><td>Filter logic</td><td>Terms upar se neeche, pehla match; end par implicit discard; count non-terminating</td></tr>
<tr><td>Safe change</td><td>commit confirmed minutes; commit se confirm</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code">show route 172.16.30.0/24
show route forwarding-table destination 172.16.30.10
show pfe statistics traffic
show chassis routing-engine
show firewall filter PROTECT-RE
show ospf neighbor
set routing-options static route 172.16.30.0/24 next-hop 10.0.13.2
set routing-options static route 172.16.30.0/24 preference 200
set interfaces lo0 unit 0 family inet filter input PROTECT-RE
commit confirmed 5</pre>

<h3>Dono labs ek nazar mein</h3>
<table class="cmp"><tr><th>Lab</th><th>Key facts</th></tr>
<tr><td>Transit or exception? Count it</td><td>R2 ke lo0 par PROTECT-RE: ospf accept, ssh accept, icmp count re-icmp accept, rest count re-drop discard. 10.255.0.2 ko ping re-icmp badhata hai; SRV ko ping transit packets badhata hai, re-icmp 0 se badhta hai; traceroute TTL expired badhata hai.</td></tr>
<tr><td>Routing table vs forwarding table</td><td>Floating static 172.16.30.0/24 via 10.0.13.2 preference 200. inet.0 mein 2 routes; FIB next hop 10.0.12.2. ge-0/0/0 disable karne ke baad static active aur FIB 10.0.13.2 use karti hai.</td></tr></table>

<div class="warn"><p><b>Sabse common galtiyan.</b> lo0 filter mein OSPF term missing; backup route ki preference primary se behtar; lo0 filter se transit affect hone ki ummeed; commit bhool jaana.</p></div>

<div class="exam"><p><b>Exam trap.</b> Forwarding table mein sirf active routes hote hain; routing table mein saare. lo0 filter router ke through jaate traffic ko filter nahi karta.</p></div>

<div class="scn"><h4>Ek ticket, saare concepts</h4><p>Ek branch ne shikayat ki ki router ko ping chalte hain lekin link failure ke baad HQ ko VoIP fail ho gaya. Engineer ne show route check kiya: floating static active tha. Forwarding table backup next hop ko point kar rahi thi. PFE counters mein transit packets badh rahe the, lekin far end ke paas wapas ka route nahi tha, isliye replies kabhi nahi lautte the. Return route jodne se theek ho gaya. Is dauran engineer ne RIB versus FIB, transit versus exception aur troubleshooting flow sab use kiye.</p><p><b>Lesson:</b> concepts tools hain; unhe jodkar fault jaldi dhoondho.</p></div>

<div class="iv"><p class="q">"Junos architecture samjhao aur control plane ki suraksha kaise karoge?"</p><p>RE aur PFE alag; RE routing tables aur forwarding table banata hai, PFE transit traffic forward karta hai aur exception traffic punt karta hai. RE ko lo0 par input filter se protect karo: routing protocols, trusted sources se management aur counted ICMP accept karo, baaki discard, commit confirmed se lagao aur adjacencies aur counters verify karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do planes: RE (control) aur PFE (forwarding), internal link se jude.</li>
<li>Routing table mein saare routes; forwarding table mein sirf active next hops.</li>
<li>Transit sirf PFE sambhalta hai; exception traffic RE ko jaata hai.</li>
<li>lo0 input filter RE ki raksha karta hai; terms ka order dhyan se rakho aur routing protocols allow karo.</li>
<li>Aage: CLI module, jisme candidate configuration, commit aur rollback gehrai se.</li>
</ul></div>
`}};export{e as default};