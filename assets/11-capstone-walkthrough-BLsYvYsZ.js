var e={id:`capstone-walkthrough`,h:{en:`Capstone walk-through: three faults, three layers (lab vs-capstone-incident)`,hi:`Capstone walk-through: teen faults, teen layers (lab vs-capstone-incident)`},body:{en:`
<p>A doctor treating a patient who has a fever, a sprained ankle and low blood sugar does not pick the most dramatic symptom and stop. She treats each problem, re-checks after each treatment, and keeps going until all are resolved. The capstone is that kind of case. A rushed change left Bengaluru (Branch2, site-id 102, Internet and MPLS only, no LTE) with <b>three problems on three different layers</b>: the Internet underlay, the overlay mapping and the voice policy. You will apply everything from this module: scope, layered method, smallest change, verification, and a short report.</p>

<h3>The ticket</h3>
<p>"After last night's change Bengaluru has lost connection to Delhi and the headend. Restore each problem with the smallest change, then prove LAN reachability to Delhi and that voice follows MPLS." Branch2 facts: Internet 203.0.113.8/30 (carrier 203.0.113.9, branch .10) on vni-0/0; MPLS 172.31.2.0/30 (PE .1, CE .2) on vni-0/1; LAN 10.1.2.0/24 with PC2 at 10.1.2.10. Delhi PC1 is 10.1.1.10. Controller 198.51.100.20.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three faults">
<rect x="20" y="30" width="170" height="190" rx="10" fill="#bae6fd"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="14">Branch2 Bengaluru</text>
<rect x="34" y="66" width="142" height="40" rx="6" fill="#fecaca"/><text x="105" y="84" text-anchor="middle" class="svg-ink" font-size="12">Fault 1 underlay</text><text x="105" y="98" text-anchor="middle" class="svg-muted" font-size="11">default route next hop</text>
<rect x="34" y="114" width="142" height="40" rx="6" fill="#fecaca"/><text x="105" y="132" text-anchor="middle" class="svg-ink" font-size="12">Fault 2 overlay</text><text x="105" y="146" text-anchor="middle" class="svg-muted" font-size="11">vni-0/1 not bound</text>
<rect x="34" y="162" width="142" height="40" rx="6" fill="#fecaca"/><text x="105" y="180" text-anchor="middle" class="svg-ink" font-size="12">Fault 3 policy</text><text x="105" y="194" text-anchor="middle" class="svg-muted" font-size="11">R-VOICE matches video</text>
<rect x="290" y="30" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="345" y="66" text-anchor="middle" class="svg-ink" font-size="13">INET</text>
<rect x="290" y="150" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="345" y="186" text-anchor="middle" class="svg-ink" font-size="13">MPLS</text>
<rect x="500" y="90" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="560" y="120" text-anchor="middle" class="svg-ink" font-size="13">Controller +</text><text x="560" y="138" text-anchor="middle" class="svg-ink" font-size="13">Branch1 Delhi</text>
<line x1="190" y1="60" x2="290" y2="60" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/><line x1="190" y1="180" x2="290" y2="180" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/><line x1="400" y1="60" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><line x1="400" y1="180" x2="500" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Fix them bottom-up: underlay first, then overlay mapping, then policy. Each fix reveals the next.</p></div>

<h3>Step 1: scope and first evidence</h3>
<pre class="out">admin@Branch2-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 102   Hostname: Branch2
Controller: 198.51.100.20 (CTL)   Overlay (MP-BGP): <span class="hl">Idle</span>  [no transport tunnel is up]
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    down    <span class="hl">Controller Internet address 198.51.100.20 is unreachable</span>

admin@Branch2-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      203.0.113.10/30
vni-0/1     up      up      172.31.2.2/30
vni-0/3     up      up      10.1.2.1/24</pre>
<p>Two observations already. First, the overlay is Idle with only <b>one</b> transport row: there is no MPLS row at all, which is a hint for fault 2. Second, the Internet tunnel fails with "unreachable" while the interface is up and correctly addressed, which points at the route (fault 1). Do not fix anything yet; read the routes.</p>
<pre class="out">admin@Branch2-cli&gt; show route routing-instance Internet-Transport-VR
0.0.0.0/0   next-hop <span class="hl">203.0.113.13</span>
203.0.113.8/30   connected vni-0/0

admin@Branch2-cli&gt; ping 198.51.100.20
PING 198.51.100.20 56 data bytes
From 198.51.100.20 icmp_seq=1 Destination Host Unreachable
From 198.51.100.20 icmp_seq=2 Destination Host Unreachable
From 198.51.100.20 icmp_seq=3 Destination Host Unreachable
From 198.51.100.20 icmp_seq=4 Destination Host Unreachable
--- 198.51.100.20 ping statistics ---
4 packets transmitted, 0 received, 100% packet loss</pre>
<p>The default route points at 203.0.113.13, which is not on the connected 203.0.113.8/30 subnet. The carrier gateway is 203.0.113.9. (Route listing layout is indicative; use the routing-table view of your lab.) The wrong next hop is a one-octet slip.</p>

<h3>Fix 1: the underlay, smallest change</h3>
<pre class="code">admin@Branch2-cli&gt; configure
admin@Branch2-cli% delete routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.13
admin@Branch2-cli% set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.9
admin@Branch2-cli% show | compare
admin@Branch2-cli% commit
admin@Branch2-cli% exit

admin@Branch2-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 102   Hostname: Branch2
Controller: 198.51.100.20 (CTL)   Overlay (MP-BGP): <span class="hl">Established</span>
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -</pre>
<p>The overlay is Established through Internet alone. The task list says "restore the route and prove the Internet tunnel": done. But look again: still only one row. Established does not mean healthy (chapter 5 exam trap).</p>

<h3>Fix 2: the overlay mapping</h3>
<p>The MPLS interface vni-0/1 is up and addressed, and the MPLS transport VR has its route, but the SD-WAN configuration no longer binds vni-0/1 to the MPLS transport, so no tunnel is built. The missing row is the evidence.</p>
<pre class="code">admin@Branch2-cli&gt; configure
admin@Branch2-cli% set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
admin@Branch2-cli% show | compare
admin@Branch2-cli% commit
admin@Branch2-cli% exit

admin@Branch2-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 102   Hostname: Branch2
Controller: 198.51.100.20 (CTL)   Overlay (MP-BGP): Established
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    <span class="hl">up</span>      -</pre>

<h3>Fix 3: the voice policy</h3>
<p>Now the policy view. With the overlay healthy, the rule table is readable.</p>
<pre class="out">admin@Branch2-cli&gt; show orgs org-services Acme sd-wan policies
Policy      Rule          Application  Forwarding profile
CORP        R-VOICE       <span class="hl">video</span>        VOICE-FP

admin@Branch2-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: ecmp via Internet,MPLS
Reason: No policy rule matches; traffic is load-balanced across every tunnel that is up
(Learning-model helper: shows what the policy would choose now.)</pre>
<p>Rule R-VOICE exists but matches application <b>video</b>, so voice matches nothing and is load-balanced. The smallest fix is the match only. Do not touch the forwarding profile or the SLA profile; they are correct (VOICE-FP: MPLS then Internet, fallback allow; VOICE: 150 ms, 30 ms, 1 percent).</p>
<pre class="code">admin@Branch2-cli&gt; configure
admin@Branch2-cli% set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
admin@Branch2-cli% show | compare
admin@Branch2-cli% commit
admin@Branch2-cli% exit

admin@Branch2-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: forward via MPLS
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: First transport in the priority list that is up and meets the SLA</pre>

<h3>Proof from the user's side</h3>
<pre class="out">admin@Branch2-cli&gt; show orgs org Acme sd-wan sites
Remote site  Site-ID  LAN prefix (learned via MP-BGP)
Branch1      101      10.1.1.0/24

PC2&gt; ping 10.1.1.10
PING 10.1.1.10 56 data bytes
64 bytes from 10.1.1.10: icmp_seq=1 ttl=63 time=<span class="hl">80.0</span> ms
--- 10.1.1.10 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>The final checks cover each layer: BGP Established, both tunnels up, Delhi's LAN prefix learned, ping PC2 to PC1 succeeds, voice via MPLS. Add the negative check: web (no rule) must still be load-balanced, proving you did not widen the policy:</p>
<pre class="out">admin@Branch2-cli&gt; show orgs org Acme sd-wan path-selection application web
Application: web
Result: ecmp via Internet,MPLS
Reason: No policy rule matches; traffic is load-balanced across every tunnel that is up</pre>

<div class="eg"><p><b>Worked example: why the order matters.</b> Suppose you fixed the policy first. You could not even test it: with the overlay Idle the path result is "none" with reason "Overlay is down". Suppose instead you bound MPLS first: MPLS has its own transport VR and route, so the MPLS tunnel would come up and the site would recover partly, which can hide the Internet fault behind a working service. That is why you walk every layer to the end even after the site "works".</p></div>

<div class="warn"><p><b>Common mistakes.</b> Stopping after the overlay turns Established; adding a second default route "just in case"; editing the forwarding profile when only the match is wrong; changing three things in one commit; not re-checking after each commit; declaring done without the PC ping.</p></div>
<div class="exam"><p><b>Exam trap.</b> A missing row in the tunnel table means a missing binding, not a failing circuit. And "overlay Established" with one tunnel is not full recovery.</p></div>

<div class="scn"><h4>Capstone in the field</h4><p>A managed service provider received a late-night call: "Bengaluru is cut off after the engineer's change". The on-call engineer followed this exact method. She spent four minutes scoping, found the wrong next hop, fixed it, noticed the one-row tunnel table, bound MPLS, and found voice being load-balanced. Three small commits, each verified, 22 minutes total. The morning review compared the commits with the change record and discovered that the original change had no pilot and no verification list, which led to a new template check.</p><p><b>Lesson:</b> the method works under pressure because it is boring.</p></div>

<div class="iv"><p class="q">"You find one fault and the site comes back. Are you done?"</p><p>No. Keep walking the layers: check every transport row, the learned prefixes, the policy result for the critical application, and a user-side test, plus negative tests that nothing was widened. Multi-fault incidents hide later faults behind earlier ones.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Fix bottom-up: underlay route, then transport binding, then policy match.</li>
<li>Read the tunnel table carefully: missing row versus down row mean different faults.</li>
<li>Smallest change per commit, with compare and a check after each.</li>
<li>Prove with BGP, tunnels, learned prefixes, PC ping and the policy result.</li>
<li>Add negative checks so the fix does not widen behaviour.</li>
</ul></div>
`,hi:`
<p>Jis patient ko bukhar, moch aur low blood sugar teeno hon, uska doctor sabse dramatic symptom chunke ruk nahi jati. Wo har problem ka treatment karti hai, har treatment ke baad re-check karti hai, aur tab tak chalti hai jab tak sab resolve na ho jaye. Capstone aisa hi case hai. Rushed change ne Bengaluru (Branch2, site-id 102, sirf Internet aur MPLS, LTE nahi) mein <b>teen alag layers par teen problems</b> chhod di: Internet underlay, overlay mapping aur voice policy. Aap is module ki har cheez lagaoge: scope, layered method, smallest change, verification aur chhoti report.</p>

<h3>Ticket</h3>
<p>"Kal raat ke change ke baad Bengaluru ka Delhi aur headend se connection toot gaya hai. Har problem ko smallest change se restore karo, phir Delhi tak LAN reachability aur voice ka MPLS follow karna prove karo." Branch2 facts: Internet 203.0.113.8/30 (carrier 203.0.113.9, branch .10) vni-0/0 par; MPLS 172.31.2.0/30 (PE .1, CE .2) vni-0/1 par; LAN 10.1.2.0/24 jisme PC2 10.1.2.10 par. Delhi PC1 10.1.1.10. Controller 198.51.100.20.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Three faults">
<rect x="20" y="30" width="170" height="190" rx="10" fill="#bae6fd"/><text x="105" y="52" text-anchor="middle" class="svg-ink" font-size="14">Branch2 Bengaluru</text>
<rect x="34" y="66" width="142" height="40" rx="6" fill="#fecaca"/><text x="105" y="84" text-anchor="middle" class="svg-ink" font-size="12">Fault 1 underlay</text><text x="105" y="98" text-anchor="middle" class="svg-muted" font-size="11">default route next hop</text>
<rect x="34" y="114" width="142" height="40" rx="6" fill="#fecaca"/><text x="105" y="132" text-anchor="middle" class="svg-ink" font-size="12">Fault 2 overlay</text><text x="105" y="146" text-anchor="middle" class="svg-muted" font-size="11">vni-0/1 bound nahi</text>
<rect x="34" y="162" width="142" height="40" rx="6" fill="#fecaca"/><text x="105" y="180" text-anchor="middle" class="svg-ink" font-size="12">Fault 3 policy</text><text x="105" y="194" text-anchor="middle" class="svg-muted" font-size="11">R-VOICE video match</text>
<rect x="290" y="30" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="345" y="66" text-anchor="middle" class="svg-ink" font-size="13">INET</text>
<rect x="290" y="150" width="110" height="60" rx="8" fill="#e2e8f0"/><text x="345" y="186" text-anchor="middle" class="svg-ink" font-size="13">MPLS</text>
<rect x="500" y="90" width="120" height="70" rx="8" fill="#ddd6fe"/><text x="560" y="120" text-anchor="middle" class="svg-ink" font-size="13">Controller +</text><text x="560" y="138" text-anchor="middle" class="svg-ink" font-size="13">Branch1 Delhi</text>
<line x1="190" y1="60" x2="290" y2="60" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/><line x1="190" y1="180" x2="290" y2="180" stroke="#ef4444" stroke-width="2" stroke-dasharray="5 4"/><line x1="400" y1="60" x2="500" y2="110" stroke="#64748b" stroke-width="2"/><line x1="400" y1="180" x2="500" y2="140" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Bottom-up fix karo: pehle underlay, phir overlay mapping, phir policy. Har fix agla fault dikhata hai.</p></div>

<h3>Step 1: scope aur pehla evidence</h3>
<pre class="out">admin@Branch2-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 102   Hostname: Branch2
Controller: 198.51.100.20 (CTL)   Overlay (MP-BGP): <span class="hl">Idle</span>  [no transport tunnel is up]
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    down    <span class="hl">Controller Internet address 198.51.100.20 is unreachable</span>

admin@Branch2-cli&gt; show interfaces brief
Interface   Admin   Oper    Address
vni-0/0     up      up      203.0.113.10/30
vni-0/1     up      up      172.31.2.2/30
vni-0/3     up      up      10.1.2.1/24</pre>
<p>Do observations pehle hi mil gaye. Pehla, overlay Idle hai aur sirf <b>ek</b> transport row hai: MPLS ki row hi nahi, ye fault 2 ka hint hai. Doosra, Internet tunnel "unreachable" ke saath fail hai jabki interface up aur sahi addressed hai, jo route (fault 1) ki taraf ishara karta hai. Abhi kuch fix mat karo; routes padho.</p>
<pre class="out">admin@Branch2-cli&gt; show route routing-instance Internet-Transport-VR
0.0.0.0/0   next-hop <span class="hl">203.0.113.13</span>
203.0.113.8/30   connected vni-0/0

admin@Branch2-cli&gt; ping 198.51.100.20
PING 198.51.100.20 56 data bytes
From 198.51.100.20 icmp_seq=1 Destination Host Unreachable
From 198.51.100.20 icmp_seq=2 Destination Host Unreachable
From 198.51.100.20 icmp_seq=3 Destination Host Unreachable
From 198.51.100.20 icmp_seq=4 Destination Host Unreachable
--- 198.51.100.20 ping statistics ---
4 packets transmitted, 0 received, 100% packet loss</pre>
<p>Default route 203.0.113.13 ko point karti hai, jo connected 203.0.113.8/30 subnet par nahi hai. Carrier gateway 203.0.113.9 hai. (Route listing ka layout indicative hai; apne lab ka routing-table view use karo.) Galat next hop ek octet ki slip hai.</p>

<h3>Fix 1: underlay, smallest change</h3>
<pre class="code">admin@Branch2-cli&gt; configure
admin@Branch2-cli% delete routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.13
admin@Branch2-cli% set routing-instances Internet-Transport-VR routing-options static route 0.0.0.0/0 next-hop 203.0.113.9
admin@Branch2-cli% show | compare
admin@Branch2-cli% commit
admin@Branch2-cli% exit

admin@Branch2-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 102   Hostname: Branch2
Controller: 198.51.100.20 (CTL)   Overlay (MP-BGP): <span class="hl">Established</span>
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -</pre>
<p>Overlay sirf Internet se Established hai. Task list kehti hai "route restore karo aur Internet tunnel prove karo": ho gaya. Lekin dobara dekho: abhi bhi sirf ek row. Established ka matlab healthy nahi (chapter 5 ka exam trap).</p>

<h3>Fix 2: overlay mapping</h3>
<p>MPLS interface vni-0/1 up aur addressed hai, MPLS transport VR ki route bhi hai, lekin SD-WAN configuration ab vni-0/1 ko MPLS transport se bind nahi karti, isliye tunnel nahi banta. Missing row hi evidence hai.</p>
<pre class="code">admin@Branch2-cli&gt; configure
admin@Branch2-cli% set orgs org Acme sd-wan wan-interfaces vni-0/1 transport MPLS
admin@Branch2-cli% show | compare
admin@Branch2-cli% commit
admin@Branch2-cli% exit

admin@Branch2-cli&gt; show orgs org Acme sd-wan brief
Org: Acme   Site-ID: 102   Hostname: Branch2
Controller: 198.51.100.20 (CTL)   Overlay (MP-BGP): Established
Transport  Interface  Tunnel  Reason
Internet   vni-0/0    up      -
MPLS       vni-0/1    <span class="hl">up</span>      -</pre>

<h3>Fix 3: voice policy</h3>
<p>Ab policy view. Overlay healthy hone par rule table padhne layak hai.</p>
<pre class="out">admin@Branch2-cli&gt; show orgs org-services Acme sd-wan policies
Policy      Rule          Application  Forwarding profile
CORP        R-VOICE       <span class="hl">video</span>        VOICE-FP

admin@Branch2-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: ecmp via Internet,MPLS
Reason: No policy rule matches; traffic is load-balanced across every tunnel that is up
(Learning-model helper: shows what the policy would choose now.)</pre>
<p>Rule R-VOICE hai lekin application <b>video</b> match karta hai, isliye voice kuch match nahi karti aur load-balance hoti hai. Smallest fix sirf match hai. Forwarding profile ya SLA profile ko haath mat lagao; wo sahi hain (VOICE-FP: MPLS phir Internet, fallback allow; VOICE: 150 ms, 30 ms, 1 percent).</p>
<pre class="code">admin@Branch2-cli&gt; configure
admin@Branch2-cli% set orgs org-services Acme sd-wan policies CORP rules R-VOICE match application voice
admin@Branch2-cli% show | compare
admin@Branch2-cli% commit
admin@Branch2-cli% exit

admin@Branch2-cli&gt; show orgs org Acme sd-wan path-selection application voice
Application: voice
Result: forward via MPLS
Rule: R-VOICE  Forwarding profile: VOICE-FP  SLA profile: VOICE
Reason: First transport in the priority list that is up and meets the SLA</pre>

<h3>User ki taraf se proof</h3>
<pre class="out">admin@Branch2-cli&gt; show orgs org Acme sd-wan sites
Remote site  Site-ID  LAN prefix (learned via MP-BGP)
Branch1      101      10.1.1.0/24

PC2&gt; ping 10.1.1.10
PING 10.1.1.10 56 data bytes
64 bytes from 10.1.1.10: icmp_seq=1 ttl=63 time=<span class="hl">80.0</span> ms
--- 10.1.1.10 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss</pre>
<p>Final checks har layer cover karte hain: BGP Established, dono tunnels up, Delhi ka LAN prefix learned, PC2 se PC1 ping succeed, voice MPLS se. Negative check jodo: web (koi rule nahi) abhi bhi load-balanced rehni chahiye, jo prove karta hai ki aapne policy widen nahi ki:</p>
<pre class="out">admin@Branch2-cli&gt; show orgs org Acme sd-wan path-selection application web
Application: web
Result: ecmp via Internet,MPLS
Reason: No policy rule matches; traffic is load-balanced across every tunnel that is up</pre>

<div class="eg"><p><b>Worked example: order kyun matter karta hai.</b> Maan lo aapne policy pehle fix ki. Aap use test bhi nahi kar sakte: overlay Idle ho to path result "none" aur reason "Overlay is down" hota hai. Ya maan lo aapne MPLS pehle bind kiya: MPLS ka apna transport VR aur route hai, isliye MPLS tunnel aa jata aur site aanshik recover ho jati, jo Internet fault ko chhupa sakta hai. Isiliye site "chalne" ke baad bhi har layer ko aakhir tak walk karte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Overlay Established hote hi ruk jana; "just in case" doosri default route jodna; sirf match galat hone par forwarding profile edit karna; ek commit mein teen cheezein badalna; har commit ke baad re-check na karna; PC ping ke bina done kehna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Tunnel table mein missing row matlab missing binding, failing circuit nahi. Aur ek tunnel ke saath "overlay Established" full recovery nahi hai.</p></div>

<div class="scn"><h4>Field mein capstone</h4><p>Ek managed service provider ko raat ko call aaya: "Engineer ke change ke baad Bengaluru cut off hai". On-call engineer ne yahi method follow kiya. Chaar minute scoping, galat next hop mila aur fix kiya, ek-row tunnel table notice ki, MPLS bind kiya, aur voice ko load-balanced paya. Teen chhote commits, har ek verified, total 22 minute. Subah ke review mein commits ko change record se compare kiya gaya aur pata chala ki original change mein pilot aur verification list nahi thi, jisse nayi template check bani.</p><p><b>Lesson:</b> method pressure mein isliye kaam karta hai kyunki wo boring hai.</p></div>

<div class="iv"><p class="q">"Ek fault mila aur site wapas aa gayi. Kya aap done ho?"</p><p>Nahi. Layers chalte raho: har transport row, learned prefixes, critical application ka policy result, aur user-side test, saath mein negative tests ki kuch widen nahi hua. Multi-fault incidents mein baad ke faults pehle ke peeche chhupe hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Bottom-up fix karo: underlay route, phir transport binding, phir policy match.</li>
<li>Tunnel table dhyan se padho: missing row aur down row alag faults hain.</li>
<li>Har commit mein smallest change, compare aur har ke baad check.</li>
<li>BGP, tunnels, learned prefixes, PC ping aur policy result se prove karo.</li>
<li>Negative checks jodo taaki fix behaviour widen na kare.</li>
</ul></div>
`}};export{e as default};