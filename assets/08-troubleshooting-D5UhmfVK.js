var e={id:`troubleshooting`,h:{en:`Routing troubleshooting workflow and the three lab tickets`,hi:`Routing troubleshooting workflow aur teen lab tickets`},body:{en:`
<p>Routing problems feel mysterious until you follow a checklist. Almost all of them come down to one of four things: the route is missing, the wrong route wins, the next hop is unusable, or the return path is broken. This chapter gives you a workflow and then solves the three lab tickets.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Routing troubleshooting flow">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">1. Is the next hop</text><text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="12">reachable? (ping)</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="45" text-anchor="middle" class="svg-ink" font-size="12">2. Does a route</text><text x="240" y="62" text-anchor="middle" class="svg-ink" font-size="12">exist? show route</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="45" text-anchor="middle" class="svg-ink" font-size="12">3. Is it the active</text><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="12">one? star, detail</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="12">4. Where does it</text><text x="560" y="62" text-anchor="middle" class="svg-ink" font-size="12">stop? traceroute</text>
<rect x="170" y="110" width="300" height="60" rx="8" fill="#fed7aa"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">5. Check the RETURN path from the far end</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="11">then fix one thing, verify, repeat</text>
<line x1="150" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
<path d="M560 80 L560 140 L470 140" fill="none" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Five questions that locate nearly every routing fault.</p></div>
<ol>
<li><b>Next hop reachable?</b> Ping the next hop. If it fails, the issue is interface or addressing, not the route.</li>
<li><b>Route exists?</b> <code>show route destination</code>. Look for a route that matches. Nothing means a missing route.</li>
<li><b>Right route active?</b> Look for the asterisk and the [Protocol/preference]. Use <code>detail</code> for the inactive reason.</li>
<li><b>Where does it stop?</b> <code>traceroute</code>; an <code>!H</code> marks the router with no route.</li>
<li><b>Return path.</b> Repeat from the other end towards the source.</li></ol>

<h3>Ticket 1: Static routing across three sites (Nagpur)</h3>
<p><b>Symptom:</b> interfaces are addressed, but PC1 192.168.10.10 cannot reach SRV 172.16.30.10.</p>
<ol>
<li>R1 and R3 are stub routers: one default route each. On R1 <code>set routing-options static route 0.0.0.0/0 next-hop 10.1.12.2</code>; on R3 the default goes to 10.1.23.1.</li>
<li>R2 needs a specific route per LAN: <code>192.168.10.0/24 next-hop 10.1.12.1</code> and <code>172.16.30.0/24 next-hop 10.1.23.2</code>.</li>
<li>Verify with show route protocol static on each router, then <code>ping 172.16.30.10</code> from PC1 and <code>ping 192.168.10.10</code> from SRV (both directions).</li>
<li>Add the safety black hole on R2: <code>set routing-options static route 192.168.0.0/16 discard</code>. Check <code>show route 192.168.0.0/16 longer</code> and re-ping to prove the Nagpur LAN still works, because the /24 is longer than the /16.</li></ol>

<h3>Ticket 2: Floating static (Surat)</h3>
<p><b>Symptom:</b> the payroll server must stay reachable if the fibre fails.</p>
<ol>
<li>R1 primary: <code>set routing-options static route 172.16.40.0/24 next-hop 10.2.13.2</code>.</li>
<li>R1 backup: <code>set routing-options static route 172.16.40.0/24 qualified-next-hop 10.2.12.2 preference 20</code>; commit.</li>
<li>Run <code>show route 172.16.40.0/24</code>. The asterisk is on <code>[Static/5]</code> via 10.2.13.2; <code>[Static/20]</code> via 10.2.12.2 is the inactive backup.</li>
<li>Cut the fibre: <code>set interfaces ge-0/0/0 disable</code>, commit. Now *[Static/20] via 10.2.12.2 is active. A <code>traceroute 172.16.40.10</code> from R1 shows R2 as the first hop. PC1 still reaches the server because R3 already has its floating return route.</li></ol>

<h3>Ticket 3: Preference decides (Kochi)</h3>
<p><b>Symptom:</b> the analytics server 172.16.60.10 is slow although OSPF has a fast path.</p>
<ol>
<li>On R1: <code>show route 172.16.60.0/24</code> (add <code>detail</code> to see the inactive reason).</li>
<li>The active (*) route is <b>Static</b>, preference 5, pointing at the slow radio link 10.3.13.2. The inactive route is OSPF with preference <b>10</b>.</li>
<li>Fix: keep the static but raise it, <code>set routing-options static route 172.16.60.0/24 preference 200</code>, commit.</li>
<li>Verify: now *[OSPF/10] via 10.3.12.2 (R2); the static is listed as [Static/200]. <code>traceroute 172.16.60.10</code> from R1 starts with 10.3.12.2 and PC1 still reaches the server.</li></ol>
<pre class="out">lab@R1-KOCHI&gt; show route 172.16.60.0/24 detail
172.16.60.0/24 (2 entries, 1 announced)
        *OSPF   Preference: 10
                Next hop: 10.3.12.2 via ge-0/0/0.0, selected
        Static  Preference: 200
                Next hop: 10.3.13.2 via ge-0/0/1.0
                <span class="hl">Inactive reason: Route Preference</span>
</pre>

<div class="warn"><p><b>Common mistake.</b> Deleting the slow static route instead of raising its preference. That removes the safety net: if OSPF fails, the backup is gone.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam shows a show route output and asks which route is used, or what happens after a failure. Read the asterisk, read [Protocol/preference], and remember that an inactive route with a higher preference takes over automatically.</p></div>

<div class="scn"><h4>The ping that left but never came back</h4><p>After building the Nagpur chain, an engineer could ping from R1 to the server but PC1's ping timed out. R3 had been given a default route, but R2 still lacked the route to 192.168.10.0/24. Packets reached the server; replies were forwarded by R2 to nowhere. Adding the missing specific route on R2 fixed it at once.</p><p><b>Lesson:</b> when a ping fails but traceroute reaches the destination, suspect the return path.</p></div>

<div class="iv"><p class="q">"A route is in the routing table but traffic does not use it. Why might that be?"</p><p>It may be inactive because another route to the same prefix has a lower preference; it may be hidden because the next hop is not reachable; a longer prefix may match instead; or the return path may be broken. Use show route detail, show route forwarding-table, ping the next hop and traceroute.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ask five questions: next hop reachable, route exists, right route active, where it stops, return path.</li>
<li>Nagpur: defaults on stub routers, specifics on the core, a discard /16 for the future.</li>
<li>Surat: primary at 5, qualified-next-hop at 20, test by disabling the primary.</li>
<li>Kochi: static 5 beats OSPF 10; raise the static to 200 and keep it as a backup.</li>
<li>Always verify both directions end to end.</li>
</ul></div>
`,hi:`
<p>Routing problems tab tak rahasyamayi lagti hain jab tak aap checklist follow nahi karte. Lagbhag sab chaar cheezon mein se ek hoti hain: route missing hai, galat route jeet raha hai, next hop unusable hai, ya return path toota hai. Yeh chapter workflow deta hai aur phir teeno lab tickets solve karta hai.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Routing troubleshooting flow">
<rect x="10" y="20" width="140" height="60" rx="8" fill="#bae6fd"/><text x="80" y="45" text-anchor="middle" class="svg-ink" font-size="12">1. Next hop reachable</text><text x="80" y="62" text-anchor="middle" class="svg-ink" font-size="12">hai? (ping)</text>
<rect x="170" y="20" width="140" height="60" rx="8" fill="#ddd6fe"/><text x="240" y="45" text-anchor="middle" class="svg-ink" font-size="12">2. Route hai?</text><text x="240" y="62" text-anchor="middle" class="svg-ink" font-size="12">show route</text>
<rect x="330" y="20" width="140" height="60" rx="8" fill="#fde68a"/><text x="400" y="45" text-anchor="middle" class="svg-ink" font-size="12">3. Active wahi hai?</text><text x="400" y="62" text-anchor="middle" class="svg-ink" font-size="12">star, detail</text>
<rect x="490" y="20" width="140" height="60" rx="8" fill="#bbf7d0"/><text x="560" y="45" text-anchor="middle" class="svg-ink" font-size="12">4. Kahan rukta hai?</text><text x="560" y="62" text-anchor="middle" class="svg-ink" font-size="12">traceroute</text>
<rect x="170" y="110" width="300" height="60" rx="8" fill="#fed7aa"/><text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">5. Far end se RETURN path check karo</text><text x="320" y="152" text-anchor="middle" class="svg-muted" font-size="11">phir ek cheez fix, verify, dohrao</text>
<line x1="150" y1="50" x2="170" y2="50" stroke="#64748b" stroke-width="2"/><line x1="310" y1="50" x2="330" y2="50" stroke="#64748b" stroke-width="2"/><line x1="470" y1="50" x2="490" y2="50" stroke="#64748b" stroke-width="2"/>
<path d="M560 80 L560 140 L470 140" fill="none" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Paanch sawaal jo lagbhag har routing fault dhoondh nikalte hain.</p></div>
<ol>
<li><b>Next hop reachable?</b> Next hop ko ping karo. Fail ho to issue interface ya addressing ka hai, route ka nahi.</li>
<li><b>Route hai?</b> <code>show route destination</code>. Match karne wala route dhoondho. Kuch nahi matlab missing route.</li>
<li><b>Sahi route active hai?</b> Asterisk aur [Protocol/preference] dekho. Inactive reason ke liye <code>detail</code>.</li>
<li><b>Kahan rukta hai?</b> <code>traceroute</code>; <code>!H</code> route-less router ko mark karta hai.</li>
<li><b>Return path.</b> Doosre end se source ki taraf dohrao.</li></ol>

<h3>Ticket 1: Teen sites ke beech static routing (Nagpur)</h3>
<p><b>Symptom:</b> interfaces par address hain, lekin PC1 192.168.10.10 SRV 172.16.30.10 tak nahi pahunch pa raha.</p>
<ol>
<li>R1 aur R3 stub routers hain: har ek ko ek default route. R1 par <code>set routing-options static route 0.0.0.0/0 next-hop 10.1.12.2</code>; R3 ka default 10.1.23.1 ko jaata hai.</li>
<li>R2 ko har LAN ka specific route chahiye: <code>192.168.10.0/24 next-hop 10.1.12.1</code> aur <code>172.16.30.0/24 next-hop 10.1.23.2</code>.</li>
<li>Har router par show route protocol static se verify karo, phir PC1 se <code>ping 172.16.30.10</code> aur SRV se <code>ping 192.168.10.10</code> (dono directions).</li>
<li>R2 par safety black hole lagao: <code>set routing-options static route 192.168.0.0/16 discard</code>. <code>show route 192.168.0.0/16 longer</code> check karo aur dobara ping karke saabit karo ki Nagpur LAN chal raha hai, kyunki /24 /16 se lamba hai.</li></ol>

<h3>Ticket 2: Floating static (Surat)</h3>
<p><b>Symptom:</b> fibre fail ho to bhi payroll server reachable rehna chahiye.</p>
<ol>
<li>R1 primary: <code>set routing-options static route 172.16.40.0/24 next-hop 10.2.13.2</code>.</li>
<li>R1 backup: <code>set routing-options static route 172.16.40.0/24 qualified-next-hop 10.2.12.2 preference 20</code>; commit.</li>
<li><code>show route 172.16.40.0/24</code> chalao. Asterisk 10.2.13.2 ke through <code>[Static/5]</code> par hai; 10.2.12.2 ke through <code>[Static/20]</code> inactive backup hai.</li>
<li>Fibre kaato: <code>set interfaces ge-0/0/0 disable</code>, commit. Ab 10.2.12.2 ke through *[Static/20] active hai. R1 se <code>traceroute 172.16.40.10</code> pehla hop R2 dikhata hai. PC1 phir bhi server tak pahunchta hai kyunki R3 ke paas floating return route pehle se hai.</li></ol>

<h3>Ticket 3: Preference faisla karti hai (Kochi)</h3>
<p><b>Symptom:</b> OSPF ka tez path hone ke bawajood analytics server 172.16.60.10 slow hai.</p>
<ol>
<li>R1 par: <code>show route 172.16.60.0/24</code> (inactive reason dekhne ke liye <code>detail</code> lagao).</li>
<li>Active (*) route <b>Static</b> hai, preference 5, slow radio link 10.3.13.2 ki taraf. Inactive route OSPF hai, preference <b>10</b>.</li>
<li>Fix: static rakho lekin uthao, <code>set routing-options static route 172.16.60.0/24 preference 200</code>, commit.</li>
<li>Verify: ab *[OSPF/10] via 10.3.12.2 (R2); static [Static/200] ke roop mein list hai. R1 se <code>traceroute 172.16.60.10</code> 10.3.12.2 se shuru hota hai aur PC1 phir bhi server tak pahunchta hai.</li></ol>
<pre class="out">lab@R1-KOCHI&gt; show route 172.16.60.0/24 detail
172.16.60.0/24 (2 entries, 1 announced)
        *OSPF   Preference: 10
                Next hop: 10.3.12.2 via ge-0/0/0.0, selected
        Static  Preference: 200
                Next hop: 10.3.13.2 via ge-0/0/1.0
                <span class="hl">Inactive reason: Route Preference</span>
</pre>

<div class="warn"><p><b>Common mistake.</b> Slow static route ko delete karna, preference badhane ki jagah. Isse safety net hat jaata hai: OSPF fail ho to backup nahi bachta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam show route output dikhata hai aur poochta hai kaunsa route use hota hai, ya failure ke baad kya hota hai. Asterisk padho, [Protocol/preference] padho, aur yaad rakho ki zyada preference wala inactive route automatically le leta hai.</p></div>

<div class="scn"><h4>Ping jo gayi lekin wapas nahi aayi</h4><p>Nagpur chain banane ke baad engineer R1 se server ko ping kar paaya lekin PC1 ki ping time out hui. R3 ko default route diya gaya tha, lekin R2 ke paas abhi bhi 192.168.10.0/24 ka route nahi tha. Packets server tak pahunche; replies R2 ne kahin nahi bheje. R2 par missing specific route lagane se turant theek hua.</p><p><b>Lesson:</b> ping fail ho lekin traceroute destination tak pahunche to return path par shak karo.</p></div>

<div class="iv"><p class="q">"Route routing table mein hai lekin traffic use nahi karta. Kyun ho sakta hai?"</p><p>Woh inactive ho sakta hai kyunki same prefix ka koi aur route kam preference wala hai; hidden ho sakta hai kyunki next hop reachable nahi; zyada lamba prefix match kar sakta hai; ya return path toota ho sakta hai. show route detail, show route forwarding-table, next hop ping aur traceroute use karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch sawaal: next hop reachable, route hai, sahi route active, kahan rukta hai, return path.</li>
<li>Nagpur: stub routers par defaults, core par specifics, future ke liye discard /16.</li>
<li>Surat: primary 5, qualified-next-hop 20, primary disable karke test.</li>
<li>Kochi: static 5 OSPF 10 ko haraata hai; static ko 200 karo aur backup rakho.</li>
<li>Hamesha dono directions end to end verify karo.</li>
</ul></div>
`}};export{e as default};