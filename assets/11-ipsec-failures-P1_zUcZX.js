var e={id:`ipsec-failures`,h:{en:`Phase 2, policy and routing failures: when the tunnel is up but traffic is not`,hi:`Phase 2, policy aur routing failures: tunnel up hai par traffic nahi`},body:{en:`
<p>Chapter 10 showed how to read an IKE negotiation that fails. This chapter covers the harder tickets: the tunnel looks fine, <code>get vpn ipsec tunnel summary</code> shows 1/1, yet users complain. Four layers can hide the problem, and you should check them in order: <b>selectors, firewall policy, routing, return path</b>. It also adds the shortcut-specific failures of lab <b>n7-ipsec-shortcut</b>.</p>

<h3>The ladder</h3>
<ol>
<li><b>Tunnel and selectors.</b> <code>get vpn ipsec tunnel summary</code>: is the second number equal to the first? Counters <code>rx</code> and <code>tx</code> should both grow when you ping. Only tx growing means the far end does not answer (policy, route or filter there).</li>
<li><b>Firewall policy.</b> The local side needs LAN to tunnel; the remote side needs tunnel to LAN. A deny or a missing policy drops the packet silently. Use <code>diagnose debug flow</code> style checks or the policy hit counters; on the hub, remember the hairpin policy.</li>
<li><b>Routing.</b> <code>get router info routing-table all</code>: is there a route for the destination, and does it point into the tunnel? BGP routes need the session Established (<code>get router info bgp summary</code>) and a reachable next hop.</li>
<li><b>Return path.</b> The reply must come back through the same tunnel. A second default route, a more specific static, or an unchanged next hop pointing elsewhere sends the reply away: one-way traffic.</li>
</ol>
<div class="dia"><svg viewBox="0 0 660 200" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="30" width="140" height="80" rx="10" fill="#bae6fd"/><text x="90" y="62" text-anchor="middle" class="svg-ink" font-size="14">1 Selectors</text><text x="90" y="86" text-anchor="middle" class="svg-muted" font-size="12">summary 1/1, rx/tx</text>
<rect x="180" y="30" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="250" y="62" text-anchor="middle" class="svg-ink" font-size="14">2 Policy</text><text x="250" y="86" text-anchor="middle" class="svg-muted" font-size="12">both directions</text>
<rect x="340" y="30" width="140" height="80" rx="10" fill="#bae6fd"/><text x="410" y="62" text-anchor="middle" class="svg-ink" font-size="14">3 Routing</text><text x="410" y="86" text-anchor="middle" class="svg-muted" font-size="12">BGP, next hop</text>
<rect x="500" y="30" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="570" y="62" text-anchor="middle" class="svg-ink" font-size="14">4 Return path</text><text x="570" y="86" text-anchor="middle" class="svg-muted" font-size="12">asymmetric?</text>
<text x="330" y="165" text-anchor="middle" class="svg-ink" font-size="12">Move to the next rung only when the current one is proven</text>
</svg><p class="cap">The same four questions solve almost every "tunnel up, no traffic" ticket.</p></div>

<h3>Common failures and their fingerprints</h3>
<table class="tbl"><tr><th>Symptom</th><th>Evidence</th><th>Fix</th></tr>
<tr><td>selectors 1/0, phase 1 up</td><td>NO_PROPOSAL_CHOSEN or TS_UNACCEPTABLE in phase 2</td><td>align PFS, proposal or selectors</td></tr>
<tr><td>tunnel up, tx grows, rx stays 0</td><td>far end drops or has no route</td><td>check policy and route on the remote unit</td></tr>
<tr><td>spoke cannot reach another spoke</td><td>hub drops at hairpin</td><td>policy KR-ADVPN to KR-ADVPN</td></tr>
<tr><td>no IKE answer, debug says no policy</td><td>"ignoring IKE request, no policy configured"</td><td>add a policy that names the tunnel</td></tr>
<tr><td>shortcut never forms</td><td>"peer does not accept shortcuts"</td><td>enable auto-discovery-receiver on the peer</td></tr>
<tr><td>shortcut exists, hub still carries traffic</td><td>BGP next hop is 10.255.1.1</td><td>remove next-hop-self-rr, clear BGP</td></tr></table>

<h3>Case: shortcut up, no benefit (KR-2377)</h3>
<pre class="out">MDU-FGT # get router info routing-table all
<span class="hl">B       10.30.0.0/24 [200/0] via 10.255.1.1 (recursive is directly connected, TO-HQ)</span>
C       10.255.1.3/32 is directly connected, TO-HQ_0
MDU-FGT # traceroute 10.30.0.10   (from PC-MDU)
1  10.20.0.1
2  <span class="hl">10.255.1.1</span>
3  10.30.0.10</pre>
<p>The shortcut TO-HQ_0 exists and has the /32, but the BGP next hop is the hub, so the /32 is never consulted. On HQ-FGT <code>show router bgp</code> reveals <code>next-hop-self-rr enable</code> in the neighbor-group. Remove it, run <code>execute router clear bgp all</code> on all three units and re-check: next hop 10.255.1.3, interface TO-HQ_0, traceroute with two hops.</p>

<h3>Idle shortcuts and dependent tunnels</h3>
<p>If shortcuts disappear "by themselves", look at <code>idle-timeout</code> and <code>idle-timeoutinterval</code> (minimum 10 minutes) on the spokes: a shortcut without traffic is torn down on purpose. With <code>auto-discovery-shortcuts dependent</code> a shortcut also goes when its parent tunnel to the hub fails; with <code>independent</code> (default) it survives. Neither is a fault; both are design choices to document.</p>
<div class="warn"><p><b>Common mistake.</b> Debugging crypto when the packet never enters the tunnel. If the routing table has no route into the tunnel interface, no IKE message will ever explain it.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Tunnel up" is not a promise of reachability. The exam questions give you summary output with 1/1 and expect you to find a policy, route or next-hop cause.</p></div>

<div class="scn"><h4>Half a conversation</h4><p>After Madurai's firewall was replaced, the branch could send to Chennai but never received replies. The tunnel summary showed tx growing and rx at zero. The new unit had a policy from LAN to tunnel, but not from the tunnel back to the LAN. One extra policy fixed it.</p><p><b>Lesson:</b> policies are directional; check both rungs, not only the one you configured.</p></div>

<div class="iv"><p class="q">"The tunnel is up but users cannot reach the other site. What is your method?"</p><p>I go up a ladder: selectors and counters, then policy on both ends, then routing and next hop, then the return path. I only move up when the rung is proven, and I use the summary counters to know which end is silent.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Check selectors, policy, routing, return path in that order.</li>
<li>tx growing with rx at 0 means the far end drops or lacks a route.</li>
<li>Hairpin policy missing = spoke-to-spoke fails at the hub.</li>
<li>A shortcut helps only if the route resolves through it.</li>
<li>idle-timeout and dependent shortcuts are intentional behaviours.</li>
</ul></div>
`,hi:`
<p>Chapter 10 ne dikhaya ki fail hoti IKE negotiation kaise padhte hain. Yeh chapter mushkil tickets ka hai: tunnel theek dikhta hai, <code>get vpn ipsec tunnel summary</code> 1/1 dikhata hai, phir bhi users shikayat karte hain. Chaar layers problem chhupa sakti hain, aur unhe is order mein check karna chahiye: <b>selectors, firewall policy, routing, return path</b>. Isme lab <b>n7-ipsec-shortcut</b> ke shortcut-specific failures bhi hain.</p>

<h3>Seedhi</h3>
<ol>
<li><b>Tunnel aur selectors.</b> <code>get vpn ipsec tunnel summary</code>: kya doosra number pehle ke barabar hai? Ping karne par <code>rx</code> aur <code>tx</code> counters dono badhne chahiye. Sirf tx badhe to far end jawab nahi deta (wahan policy, route ya filter).</li>
<li><b>Firewall policy.</b> Local side ko LAN se tunnel chahiye; remote side ko tunnel se LAN. Deny ya policy ki kami packet chup-chaap drop kar deti hai. <code>diagnose debug flow</code> jaisi checks ya policy hit counters use karo; hub par hairpin policy yaad rakho.</li>
<li><b>Routing.</b> <code>get router info routing-table all</code>: destination ka route hai, aur kya woh tunnel mein point karta hai? BGP routes ko session Established (<code>get router info bgp summary</code>) aur reachable next hop chahiye.</li>
<li><b>Return path.</b> Reply usi tunnel se wapas aani chahiye. Doosra default route, zyada specific static, ya kahin aur point karta unchanged next hop reply ko door bhej deta hai: one-way traffic.</li>
</ol>
<div class="dia"><svg viewBox="0 0 660 200" role="img" aria-label="Troubleshooting ladder">
<rect x="20" y="30" width="140" height="80" rx="10" fill="#bae6fd"/><text x="90" y="62" text-anchor="middle" class="svg-ink" font-size="14">1 Selectors</text><text x="90" y="86" text-anchor="middle" class="svg-muted" font-size="12">summary 1/1, rx/tx</text>
<rect x="180" y="30" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="250" y="62" text-anchor="middle" class="svg-ink" font-size="14">2 Policy</text><text x="250" y="86" text-anchor="middle" class="svg-muted" font-size="12">dono directions</text>
<rect x="340" y="30" width="140" height="80" rx="10" fill="#bae6fd"/><text x="410" y="62" text-anchor="middle" class="svg-ink" font-size="14">3 Routing</text><text x="410" y="86" text-anchor="middle" class="svg-muted" font-size="12">BGP, next hop</text>
<rect x="500" y="30" width="140" height="80" rx="10" fill="#ddd6fe"/><text x="570" y="62" text-anchor="middle" class="svg-ink" font-size="14">4 Return path</text><text x="570" y="86" text-anchor="middle" class="svg-muted" font-size="12">asymmetric?</text>
<text x="330" y="165" text-anchor="middle" class="svg-ink" font-size="12">Agli seedhi par tabhi jao jab maujooda sabit ho jaye</text>
</svg><p class="cap">Wahi chaar sawaal lagbhag har "tunnel up, traffic nahi" ticket hal kar dete hain.</p></div>

<h3>Common failures aur unki pehchaan</h3>
<table class="tbl"><tr><th>Symptom</th><th>Evidence</th><th>Fix</th></tr>
<tr><td>selectors 1/0, phase 1 up</td><td>phase 2 mein NO_PROPOSAL_CHOSEN ya TS_UNACCEPTABLE</td><td>PFS, proposal ya selectors align karo</td></tr>
<tr><td>tunnel up, tx badhta hai, rx 0</td><td>far end drop karta hai ya route nahi</td><td>remote unit par policy aur route dekho</td></tr>
<tr><td>spoke doosre spoke tak nahi pahunchta</td><td>hub hairpin par drop karta hai</td><td>policy KR-ADVPN se KR-ADVPN</td></tr>
<tr><td>IKE ka jawab nahi, debug mein no policy</td><td>"ignoring IKE request, no policy configured"</td><td>tunnel ka naam rakhne wali policy jodo</td></tr>
<tr><td>shortcut kabhi nahi banta</td><td>"peer does not accept shortcuts"</td><td>peer par auto-discovery-receiver enable karo</td></tr>
<tr><td>shortcut hai, phir bhi hub traffic le jata hai</td><td>BGP next hop 10.255.1.1 hai</td><td>next-hop-self-rr hatao, BGP clear karo</td></tr></table>

<h3>Case: shortcut up, fayda nahi (KR-2377)</h3>
<pre class="out">MDU-FGT # get router info routing-table all
<span class="hl">B       10.30.0.0/24 [200/0] via 10.255.1.1 (recursive is directly connected, TO-HQ)</span>
C       10.255.1.3/32 is directly connected, TO-HQ_0
MDU-FGT # traceroute 10.30.0.10   (PC-MDU se)
1  10.20.0.1
2  <span class="hl">10.255.1.1</span>
3  10.30.0.10</pre>
<p>Shortcut TO-HQ_0 maujood hai aur uska /32 bhi hai, par BGP next hop hub hai, isliye /32 kabhi consult nahi hota. HQ-FGT par <code>show router bgp</code> neighbor-group mein <code>next-hop-self-rr enable</code> dikhata hai. Use hatao, teeno units par <code>execute router clear bgp all</code> chalao aur dobara check karo: next hop 10.255.1.3, interface TO-HQ_0, traceroute mein do hop.</p>

<h3>Idle shortcuts aur dependent tunnels</h3>
<p>Shortcuts "khud" gayab ho jaayein to spokes par <code>idle-timeout</code> aur <code>idle-timeoutinterval</code> (minimum 10 minute) dekho: bina traffic ka shortcut jaan-boojh kar hata diya jata hai. <code>auto-discovery-shortcuts dependent</code> ke saath shortcut tab bhi jata hai jab hub wala parent tunnel fail ho; <code>independent</code> (default) mein woh bach jata hai. Dono fault nahi, design choices hain jo document karne chahiye.</p>
<div class="warn"><p><b>Common mistake.</b> Crypto debug karna jab packet tunnel mein ghusta hi nahi. Routing table mein tunnel interface ka route na ho to koi IKE message use explain nahi karega.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Tunnel up" reachability ka vaada nahi hai. Exam sawaal 1/1 wala summary dete hain aur aapse policy, route ya next-hop cause dhundhne ko kehte hain.</p></div>

<div class="scn"><h4>Aadhi baatcheet</h4><p>Madurai ka firewall badalne ke baad branch Chennai ko bhej sakti thi par reply kabhi nahi aati thi. Tunnel summary mein tx badh raha tha aur rx zero tha. Naye unit mein LAN se tunnel ki policy thi, par tunnel se LAN ki nahi. Ek aur policy ne fix kar diya.</p><p><b>Lesson:</b> policies directional hoti hain; dono rungs check karo, sirf jo aapne configure ki woh nahi.</p></div>

<div class="iv"><p class="q">"Tunnel up hai par users doosri site tak nahi pahunch pa rahe. Aapka method?"</p><p>Main seedhi chadhta hoon: selectors aur counters, phir dono ends par policy, phir routing aur next hop, phir return path. Rung sabit hone par hi upar jaata hoon, aur summary counters se pata karta hoon ki kaunsa end chup hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Selectors, policy, routing, return path: isi order mein check karo.</li>
<li>rx 0 ke saath tx badhna = far end drop karta hai ya route nahi.</li>
<li>Hairpin policy ki kami = spoke-to-spoke hub par fail.</li>
<li>Shortcut tabhi kaam aata hai jab route usi se resolve ho.</li>
<li>idle-timeout aur dependent shortcuts jaan-boojh kar ke behaviours hain.</li>
</ul></div>
`}};export{e as default};