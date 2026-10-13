var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>Before a long drive you check fuel, tyres, lights and documents, in the same order every time, so nothing is forgotten. Use this chapter the same way before the ENARSI exam or a BGP interview: a checklist of skills, the words you must define, the facts that are tested again and again, and the commands you should type without thinking.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Module map">
<rect x="245" y="95" width="150" height="50" rx="10" fill="#fde68a"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="14">ENARSI BGP</text><text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">objective 1.10</text>
<rect x="20" y="15" width="180" height="40" rx="8" fill="#bae6fd"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="12">iBGP rules, loopbacks, NHS</text>
<rect x="230" y="15" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">Route reflectors</text>
<rect x="440" y="15" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="12">Neighbors and hardening</text>
<rect x="20" y="185" width="180" height="40" rx="8" fill="#fed7aa"/><text x="110" y="210" text-anchor="middle" class="svg-ink" font-size="12">Filters, regex, route-maps</text>
<rect x="230" y="185" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">Attributes, best path, multipath</text>
<rect x="440" y="185" width="180" height="40" rx="8" fill="#bae6fd"/><text x="530" y="210" text-anchor="middle" class="svg-ink" font-size="12">4-byte AS, IPv6, workflow</text>
<line x1="110" y1="55" x2="270" y2="95" stroke="#64748b"/><line x1="320" y1="55" x2="320" y2="95" stroke="#64748b"/><line x1="530" y1="55" x2="370" y2="95" stroke="#64748b"/>
<line x1="110" y1="185" x2="270" y2="145" stroke="#64748b"/><line x1="320" y1="185" x2="320" y2="145" stroke="#64748b"/><line x1="530" y1="185" x2="370" y2="145" stroke="#64748b"/>
</svg><p class="cap">The six areas of the module, all part of ENARSI 300-410 objective 1.10.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Explain iBGP split horizon, the full mesh (n(n-1)/2), next hop unchanged, AD 200 and the history of synchronisation.</li>
<li>Build iBGP between loopbacks over OSPF with update-source, and fix an <i>inaccessible</i> next hop with next-hop-self.</li>
<li>Configure a route reflector, apply the three reflection rules, and read ORIGINATOR_ID and CLUSTER_LIST.</li>
<li>Diagnose Idle (Admin), Idle (PfxCt), Active and NOTIFICATION 2/2, including decoding the hex AS.</li>
<li>Peer eBGP between loopbacks with ebgp-multihop or disable-connected-check.</li>
<li>Harden a session: MD5, GTSM, maximum-prefix, timers, bogon and outbound filters.</li>
<li>Write prefix-lists, AS-path regular expressions and route-maps, and apply them with a soft refresh.</li>
<li>Steer outbound traffic with weight and local preference; influence inbound with prepend, MED and communities.</li>
<li>Walk the best-path list for two or three paths and name the deciding step.</li>
<li>Enable multipath, convert asplain and asdot, and run the IPv6 unicast address family.</li>
<li>Troubleshoot in order: session, transport, received, best, RIB, return path.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>iBGP split horizon</dt><dd>Routes learned from an iBGP peer are not advertised to other iBGP peers.</dd>
<dt>next-hop-self</dt><dd>Makes a router advertise its own update-source address as next hop to a neighbor.</dd>
<dt>Route reflector</dt><dd>iBGP router allowed to re-advertise iBGP routes to its clients.</dd>
<dt>ORIGINATOR_ID / CLUSTER_LIST</dt><dd>Attributes added by reflection to prevent loops inside the AS.</dd>
<dt>GTSM</dt><dd>TTL security: send with TTL 255, accept only TTL 255 minus hops or higher.</dd>
<dt>Route refresh</dt><dd>Capability that lets a router ask a peer to resend its routes without a reset.</dd>
<dt>Community</dt><dd>32-bit tag (AA:NN) used to trigger policy; well-known values include no-export and no-advertise.</dd>
<dt>AS_TRANS</dt><dd>AS 23456, used towards 2-byte-only speakers by a router with a 4-byte ASN.</dd>
<dt>Address family</dt><dd>A separate BGP table and policy set, such as IPv4 unicast or IPv6 unicast.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>AD</td><td>eBGP 20, iBGP 200, locally originated/aggregate 200</td></tr>
<tr><td>TTL</td><td>eBGP 1 by default, iBGP 255</td></tr>
<tr><td>Best path</td><td>Weight, local pref, originated, AS path, origin, MED, eBGP over iBGP, IGP metric, oldest eBGP, router ID, cluster list, neighbor address</td></tr>
<tr><td>Defaults</td><td>Weight 0 (32768 local), local pref 100, keepalive 60, hold 180</td></tr>
<tr><td>States</td><td>Idle (Admin) shutdown, Idle (PfxCt) max-prefix, Active TCP failing</td></tr>
<tr><td>NOTIFICATION</td><td>2/2 bad peer AS, 4/0 hold timer expired, 6/x cease</td></tr>
<tr><td>RR rules</td><td>From non-client only to clients; RR keeps next hop</td></tr>
<tr><td>Communities</td><td>Need send-community; no-export stays in AS; no-advertise to nobody</td></tr>
<tr><td>4-byte ASN</td><td>asdot X.Y = X x 65536 + Y; AS_TRANS 23456; private 4200000000 and up</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Sessions and iBGP</span>
neighbor X remote-as N
neighbor X update-source Loopback0
neighbor X next-hop-self
neighbor X route-reflector-client
neighbor X ebgp-multihop 2 | disable-connected-check
<span class="c">! Hardening</span>
neighbor X password KEY
neighbor X ttl-security hops 1
neighbor X maximum-prefix 10 [warning-only]
neighbor X timers 10 30
<span class="c">! Policy</span>
neighbor X prefix-list NAME in|out
neighbor X filter-list N in|out
neighbor X route-map NAME in|out
neighbor X send-community
maximum-paths 2 / maximum-paths ibgp 2
clear ip bgp X soft in|out</pre>
<pre class="out">show ip bgp summary                    show bgp all summary
show ip bgp PREFIX                     show bgp ipv6 unicast
show ip bgp neighbors X                show ip bgp regexp REGEX
show ip bgp neighbors X routes         show ip bgp rib-failure
show ip bgp neighbors X advertised-routes
show ip bgp neighbors X received-routes   <span class="hl">! needs soft-reconfiguration inbound</span></pre>

<div class="eg"><p><b>Worked example: one-minute exam triage.</b> A question shows <code>show ip bgp</code> on an internal router with a path lacking <code>*</code>, and <code>show ip bgp PREFIX</code> says <i>inaccessible</i>. Before reading the four options, you already know the answer family: next-hop reachability, so next-hop-self on the edge or the edge link in the IGP. Eliminate any option about filters, weight or multihop.</p></div>

<div class="warn"><p><b>Last-minute reminders.</b> Weight is highest-wins and local; MED is lowest-wins and compared only between paths from the same neighbor AS. Policies need a soft refresh. <code>no bgp default ipv4-unicast</code> requires explicit activate. GTSM must be on both ends and is not combined with ebgp-multihop.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> "Synchronisation" is almost never the answer on modern IOS. A route reflector does not change the next hop. An Established session with 0 prefixes points to filters, activation or the peer's own outbound policy. Active means TCP failure, not success.</p></div>

<div class="scn"><h4>From three tickets to one checklist</h4><p>A NOC team saw the same three BGP problems month after month: missing next-hop-self on new edges, forgotten <code>neighbor shutdown</code> after maintenance, and policies that never took effect because nobody ran a soft refresh. They turned this chapter's workflow into a post-change checklist: session counts, <code>show ip bgp PREFIX</code> for one key prefix on an internal router, and <code>advertised-routes</code> towards each external peer. Repeat incidents dropped to zero within a quarter.</p><p><b>Lesson:</b> the checks that solve tickets also prevent them when you run them after every change.</p></div>

<div class="iv"><p class="q">"Summarise how you would design and operate BGP in a dual-homed enterprise."</p><p>OSPF for loopbacks and links; iBGP between loopbacks, full mesh or a route reflector; next-hop-self on edges; local preference to choose the primary exit, prepend or provider communities for inbound; outbound filter <code>^$</code> to avoid transit; hardening with MD5, GTSM and maximum-prefix; multipath where paths are equal; and a six-step troubleshooting workflow with evidence for every change. Keep the answer structured and name a verification command for each part.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Most iBGP issues are split horizon, next hop or missing sessions.</li>
<li>Session states and NOTIFICATION codes point to one root cause each.</li>
<li>Filters and route-maps need soft refresh; outbound filters keep you from becoming transit.</li>
<li>Best path stops at the first difference; know the order and the direction.</li>
<li>Troubleshoot in layers and close every ticket with evidence.</li>
</ul></div>
`,hi:`
<p>Lambi drive se pehle aap fuel, tyres, lights aur documents check karte ho, har baar same order mein, taaki kuch na chhoote. Is chapter ko ENARSI exam ya BGP interview se pehle isi tarah use karo: skills ki checklist, woh words jo aapko define karne aane chahiye, woh facts jo baar baar test hote hain, aur woh commands jo bina soche type honi chahiye.</p>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Module map">
<rect x="245" y="95" width="150" height="50" rx="10" fill="#fde68a"/><text x="320" y="118" text-anchor="middle" class="svg-ink" font-size="14">ENARSI BGP</text><text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">objective 1.10</text>
<rect x="20" y="15" width="180" height="40" rx="8" fill="#bae6fd"/><text x="110" y="40" text-anchor="middle" class="svg-ink" font-size="12">iBGP rules, loopbacks, NHS</text>
<rect x="230" y="15" width="180" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">Route reflectors</text>
<rect x="440" y="15" width="180" height="40" rx="8" fill="#bbf7d0"/><text x="530" y="40" text-anchor="middle" class="svg-ink" font-size="12">Neighbors aur hardening</text>
<rect x="20" y="185" width="180" height="40" rx="8" fill="#fed7aa"/><text x="110" y="210" text-anchor="middle" class="svg-ink" font-size="12">Filters, regex, route-maps</text>
<rect x="230" y="185" width="180" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="210" text-anchor="middle" class="svg-ink" font-size="12">Attributes, best path, multipath</text>
<rect x="440" y="185" width="180" height="40" rx="8" fill="#bae6fd"/><text x="530" y="210" text-anchor="middle" class="svg-ink" font-size="12">4-byte AS, IPv6, workflow</text>
<line x1="110" y1="55" x2="270" y2="95" stroke="#64748b"/><line x1="320" y1="55" x2="320" y2="95" stroke="#64748b"/><line x1="530" y1="55" x2="370" y2="95" stroke="#64748b"/>
<line x1="110" y1="185" x2="270" y2="145" stroke="#64748b"/><line x1="320" y1="185" x2="320" y2="145" stroke="#64748b"/><line x1="530" y1="185" x2="370" y2="145" stroke="#64748b"/>
</svg><p class="cap">Module ke chhe areas, sab ENARSI 300-410 objective 1.10 ka hissa.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>iBGP split horizon, full mesh (n(n-1)/2), next hop unchanged, AD 200 aur synchronisation ki history samjhana.</li>
<li>OSPF ke upar loopbacks ke beech update-source ke saath iBGP banana, aur next-hop-self se <i>inaccessible</i> next hop fix karna.</li>
<li>Route reflector configure karna, teen reflection rules lagana, aur ORIGINATOR_ID aur CLUSTER_LIST padhna.</li>
<li>Idle (Admin), Idle (PfxCt), Active aur NOTIFICATION 2/2 diagnose karna, hex AS decode karne samet.</li>
<li>ebgp-multihop ya disable-connected-check ke saath loopbacks ke beech eBGP peer karna.</li>
<li>Session harden karna: MD5, GTSM, maximum-prefix, timers, bogon aur outbound filters.</li>
<li>Prefix-lists, AS-path regular expressions aur route-maps likhna, aur unhe soft refresh se lagana.</li>
<li>Weight aur local preference se outbound traffic steer karna; prepend, MED aur communities se inbound influence karna.</li>
<li>Do ya teen paths ke liye best-path list chalana aur deciding step ka naam lena.</li>
<li>Multipath enable karna, asplain aur asdot convert karna, aur IPv6 unicast address family chalana.</li>
<li>Order mein troubleshoot karna: session, transport, received, best, RIB, return path.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>iBGP split horizon</dt><dd>iBGP peer se seekhe routes dusre iBGP peers ko advertise nahi hote.</dd>
<dt>next-hop-self</dt><dd>Router ko neighbor ke liye next hop ke roop mein apna update-source address advertise karwata hai.</dd>
<dt>Route reflector</dt><dd>iBGP router jise apne clients ko iBGP routes re-advertise karne ki ijaazat hai.</dd>
<dt>ORIGINATOR_ID / CLUSTER_LIST</dt><dd>AS ke andar loops rokne ke liye reflection se jude attributes.</dd>
<dt>GTSM</dt><dd>TTL security: TTL 255 ke saath bhejo, sirf TTL 255 minus hops ya zyada accept karo.</dd>
<dt>Route refresh</dt><dd>Capability jo router ko bina reset peer se routes dobara maangne deti hai.</dd>
<dt>Community</dt><dd>Policy trigger karne ke liye 32-bit tag (AA:NN); well-known values mein no-export aur no-advertise hain.</dd>
<dt>AS_TRANS</dt><dd>AS 23456, jo 4-byte ASN wala router sirf-2-byte speakers ki taraf use karta hai.</dd>
<dt>Address family</dt><dd>Alag BGP table aur policy set, jaise IPv4 unicast ya IPv6 unicast.</dd>
</dl>

<h3>Sabse zyada test hone wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>AD</td><td>eBGP 20, iBGP 200, locally originated/aggregate 200</td></tr>
<tr><td>TTL</td><td>eBGP default mein 1, iBGP 255</td></tr>
<tr><td>Best path</td><td>Weight, local pref, originated, AS path, origin, MED, eBGP over iBGP, IGP metric, oldest eBGP, router ID, cluster list, neighbor address</td></tr>
<tr><td>Defaults</td><td>Weight 0 (local 32768), local pref 100, keepalive 60, hold 180</td></tr>
<tr><td>States</td><td>Idle (Admin) shutdown, Idle (PfxCt) max-prefix, Active TCP fail</td></tr>
<tr><td>NOTIFICATION</td><td>2/2 bad peer AS, 4/0 hold timer expired, 6/x cease</td></tr>
<tr><td>RR rules</td><td>Non-client se sirf clients ko; RR next hop nahi badalta</td></tr>
<tr><td>Communities</td><td>send-community chahiye; no-export AS mein rehta hai; no-advertise kisi ko nahi</td></tr>
<tr><td>4-byte ASN</td><td>asdot X.Y = X x 65536 + Y; AS_TRANS 23456; private 4200000000 aur upar</td></tr>
</table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Sessions aur iBGP</span>
neighbor X remote-as N
neighbor X update-source Loopback0
neighbor X next-hop-self
neighbor X route-reflector-client
neighbor X ebgp-multihop 2 | disable-connected-check
<span class="c">! Hardening</span>
neighbor X password KEY
neighbor X ttl-security hops 1
neighbor X maximum-prefix 10 [warning-only]
neighbor X timers 10 30
<span class="c">! Policy</span>
neighbor X prefix-list NAME in|out
neighbor X filter-list N in|out
neighbor X route-map NAME in|out
neighbor X send-community
maximum-paths 2 / maximum-paths ibgp 2
clear ip bgp X soft in|out</pre>
<pre class="out">show ip bgp summary                    show bgp all summary
show ip bgp PREFIX                     show bgp ipv6 unicast
show ip bgp neighbors X                show ip bgp regexp REGEX
show ip bgp neighbors X routes         show ip bgp rib-failure
show ip bgp neighbors X advertised-routes
show ip bgp neighbors X received-routes   <span class="hl">! soft-reconfiguration inbound chahiye</span></pre>

<div class="eg"><p><b>Worked example: ek minute ka exam triage.</b> Question ek internal router par <code>show ip bgp</code> dikhata hai jismein ek path bina <code>*</code> ke hai, aur <code>show ip bgp PREFIX</code> <i>inaccessible</i> kehta hai. Chaar options padhne se pehle hi aapko answer family pata hai: next-hop reachability, yaani edge par next-hop-self ya edge link IGP mein. Filters, weight ya multihop wale har option ko hata do.</p></div>

<div class="warn"><p><b>Aakhri minute ke reminders.</b> Weight mein sabse zyada jeetta hai aur woh local hai; MED mein sabse kam jeetta hai aur sirf same neighbor AS ke paths ke beech compare hota hai. Policies ko soft refresh chahiye. <code>no bgp default ipv4-unicast</code> ko explicit activate chahiye. GTSM dono ends par hona chahiye aur ebgp-multihop ke saath nahi lagta.</p></div>

<div class="exam"><p><b>Exam traps recap.</b> Modern IOS par "synchronisation" lagbhag kabhi answer nahi hota. Route reflector next hop nahi badalta. 0 prefixes wala Established session filters, activation ya peer ki apni outbound policy ki taraf ishara karta hai. Active matlab TCP failure, success nahi.</p></div>

<div class="scn"><h4>Teen tickets se ek checklist tak</h4><p>Ek NOC team har mahine wahi teen BGP problems dekhti thi: naye edges par missing next-hop-self, maintenance ke baad bhoola hua <code>neighbor shutdown</code>, aur policies jo kabhi lagu nahi hui kyunki kisi ne soft refresh nahi chalaya. Unhone is chapter ke workflow ko post-change checklist bana diya: session counts, internal router par ek key prefix ke liye <code>show ip bgp PREFIX</code>, aur har external peer ki taraf <code>advertised-routes</code>. Ek quarter mein repeat incidents zero ho gaye.</p><p><b>Seekh:</b> jo checks tickets solve karte hain, woh har change ke baad chalane par unhe rokte bhi hain.</p></div>

<div class="iv"><p class="q">"Dual-homed enterprise mein aap BGP ko kaise design aur operate karoge, summary do."</p><p>Loopbacks aur links ke liye OSPF; loopbacks ke beech iBGP, full mesh ya route reflector; edges par next-hop-self; primary exit chunne ke liye local preference, inbound ke liye prepend ya provider communities; transit se bachne ke liye outbound filter <code>^$</code>; MD5, GTSM aur maximum-prefix se hardening; jahan paths barabar hon wahan multipath; aur har change ke liye evidence ke saath chhe-step troubleshooting workflow. Answer structured rakho aur har hisse ke liye ek verification command ka naam lo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zyada tar iBGP issues split horizon, next hop ya missing sessions hote hain.</li>
<li>Session states aur NOTIFICATION codes har ek ek root cause ki taraf ishara karte hain.</li>
<li>Filters aur route-maps ko soft refresh chahiye; outbound filters aapko transit banne se rokte hain.</li>
<li>Best path pehle farak par rukta hai; order aur direction yaad rakho.</li>
<li>Layers mein troubleshoot karo aur har ticket evidence ke saath close karo.</li>
</ul></div>
`}};export{e as default};