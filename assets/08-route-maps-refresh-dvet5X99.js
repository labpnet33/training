var e={id:`route-maps`,h:{en:`Route-maps inbound and outbound, soft reconfiguration and route refresh`,hi:`Inbound aur outbound route-maps, soft reconfiguration aur route refresh`},body:{en:`
<p>Picture a parcel sorting line. Every parcel rides a conveyor past numbered stations. At each station an inspector asks a question ("is it going to Mumbai?"). If the answer is yes, the inspector stamps it and it leaves the line; if no, it rides on to the next station. A parcel that reaches the end of the line without a stamp goes to the bin. A <b>route-map</b> is that line: numbered sequences, match questions, set stamps, and an invisible bin at the end.</p>

<h3>Route-map logic in five rules</h3>
<ol>
<li>Sequences are checked from the lowest number up. The <b>first</b> sequence whose match clauses all pass wins; later sequences are not checked.</li>
<li>Several <code>match</code> lines in one sequence are a logical <b>AND</b>. Several values on one match line (<code>match ip address prefix-list A B</code>) are an <b>OR</b>.</li>
<li>A sequence with no <code>match</code> matches everything.</li>
<li><code>permit</code> = accept the route and apply the <code>set</code> clauses; <code>deny</code> = drop the route. The permit or deny inside the prefix-list only decides whether the route <i>matches</i>.</li>
<li>A route that matches no sequence is <b>denied</b> (implicit deny). A route-map that references a prefix-list that does not exist matches everything on IOS, which is a nasty surprise.</li>
</ol>

<h3>Inbound or outbound?</h3>
<p>Apply a route-map <b>inbound</b> when you want to change what <i>you</i> believe: filter what you accept, set weight or local preference to steer your outbound traffic. Apply it <b>outbound</b> when you want to change what your <i>neighbor</i> believes: filter what you send, prepend your AS, set MED or communities to influence the traffic coming back to you.</p>

<pre class="code"><span class="c">! E2 in the weight and local preference lab (task 2)</span>
ip prefix-list MON seq 5 permit 192.0.2.0/24
route-map FROM-VAYU permit 10
 match ip address prefix-list MON
 set weight 300
route-map FROM-VAYU permit 20          <span class="c">! no match = everything else, unchanged</span>
router bgp 65500
 neighbor 100.64.2.1 route-map FROM-VAYU in</pre>
<pre class="out">E2# show route-map FROM-VAYU
route-map FROM-VAYU, permit, sequence 10
  Match clauses:
<span class="hl">    ip address prefix-lists: MON</span>
  Set clauses:
<span class="hl">    weight 300</span>
route-map FROM-VAYU, permit, sequence 20
  Match clauses:
  Set clauses:</pre>

<div class="eg"><p><b>Worked example: the missing sequence 20.</b> Remove <code>route-map FROM-VAYU permit 20</code> and refresh. 192.0.2.0/24 still matches sequence 10 and gets weight 300. But 198.51.100.0/24 matches nothing, so the implicit deny drops it. E2 loses its backup path to 198.51.100.0/24 through Vayu Net, which is exactly what lab task 3 checks. One missing line silently removed a backup path.</p></div>

<h3>Where the policy sits: the three tables</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Adj-RIB-In, Loc-RIB and Adj-RIB-Out">
<rect x="10" y="60" width="130" height="56" rx="8" fill="#e2e8f0"/><text x="75" y="84" text-anchor="middle" class="svg-ink" font-size="13">Adj-RIB-In</text><text x="75" y="102" text-anchor="middle" class="svg-muted" font-size="12">as received</text>
<rect x="170" y="60" width="100" height="56" rx="8" fill="#fde68a"/><text x="220" y="92" text-anchor="middle" class="svg-ink" font-size="13">policy in</text>
<rect x="300" y="60" width="120" height="56" rx="8" fill="#bae6fd"/><text x="360" y="84" text-anchor="middle" class="svg-ink" font-size="13">Loc-RIB</text><text x="360" y="102" text-anchor="middle" class="svg-muted" font-size="12">best path</text>
<rect x="450" y="60" width="80" height="56" rx="8" fill="#fde68a"/><text x="490" y="92" text-anchor="middle" class="svg-ink" font-size="13">policy out</text>
<rect x="540" y="60" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="587" y="84" text-anchor="middle" class="svg-ink" font-size="13">Adj-RIB-Out</text><text x="587" y="102" text-anchor="middle" class="svg-muted" font-size="12">as sent</text>
<line x1="140" y1="88" x2="170" y2="88" stroke="#64748b" stroke-width="2"/><line x1="270" y1="88" x2="300" y2="88" stroke="#64748b" stroke-width="2"/><line x1="420" y1="88" x2="450" y2="88" stroke="#64748b" stroke-width="2"/><line x1="530" y1="88" x2="540" y2="88" stroke="#64748b" stroke-width="2"/>
<text x="75" y="150" text-anchor="middle" class="svg-accent" font-size="12">received-routes</text>
<text x="360" y="150" text-anchor="middle" class="svg-accent" font-size="12">routes / show ip bgp</text>
<text x="587" y="150" text-anchor="middle" class="svg-accent" font-size="12">advertised-routes</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">received-routes works only with soft-reconfiguration inbound</text>
</svg><p class="cap">Each <code>show ip bgp neighbors X ...</code> keyword looks at a different stage.</p></div>

<h3>Applying a changed policy: refresh, not reset</h3>
<p>BGP applies policies to updates as they arrive. If you change a route-map, prefix-list or filter-list, routes already in the table are <b>not</b> re-evaluated. You have three ways to apply the change:</p>
<table class="cmp"><tr><th>Command</th><th>What happens</th><th>Cost</th></tr>
<tr><td><code>clear ip bgp X</code></td><td>Hard reset: TCP session torn down and rebuilt</td><td>Outage for all prefixes of that peer</td></tr>
<tr><td><code>clear ip bgp X soft out</code></td><td>Resend all updates to X through the new outbound policy</td><td>None</td></tr>
<tr><td><code>clear ip bgp X soft in</code></td><td>Ask X for its routes again with a ROUTE-REFRESH message, then apply inbound policy</td><td>None, if route refresh is supported</td></tr>
</table>
<p><b>Route refresh</b> is a capability both peers announce in the OPEN message; every modern IOS supports it. Only if a very old peer lacks it do you need <code>neighbor X soft-reconfiguration inbound</code>, which stores an unmodified copy of everything received (the Adj-RIB-In) and costs memory. That stored copy is also what makes <code>show ip bgp neighbors X received-routes</code> work.</p>
<pre class="out">E2# show ip bgp neighbors 100.64.2.1 | include refresh
<span class="hl">    Route refresh: advertised and received(new)</span>
E2# show ip bgp neighbors 100.64.2.1 received-routes
% Inbound soft reconfiguration not enabled on 100.64.2.1
E2# show ip bgp neighbors 100.64.2.1 routes | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
<span class="hl"> *&gt;  192.0.2.0        100.64.2.1               0           300 64602 i</span>
 *   198.51.100.0     100.64.2.1               0             0 64602 i</pre>

<h3>Useful commands for policy work</h3>
<ul>
<li><code>show ip bgp neighbors X routes</code>: what survived your inbound policy from X.</li>
<li><code>show ip bgp neighbors X advertised-routes</code>: what you actually send to X after outbound policy.</li>
<li><code>show ip bgp route-map NAME</code>: which routes in the table a route-map would match (a dry run).</li>
<li><code>show ip prefix-list detail NAME</code>: hit counts per entry.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the final permit sequence and silently dropping everything else. Using <code>clear ip bgp *</code> in production to apply a policy, which resets every session. Using <code>deny</code> in the prefix-list and <code>deny</code> in the route-map and getting confused by the double negative. Testing <code>received-routes</code> and assuming the peer sends nothing when soft-reconfiguration is simply not enabled.</p></div>

<div class="exam"><p><b>Exam traps.</b> A route-map with only one <code>permit</code> sequence that matches a prefix-list will deny everything else. Match lines in one sequence are AND; values on one line are OR. <code>soft in</code> uses route refresh; <code>soft-reconfiguration inbound</code> is only needed without it. <code>advertised-routes</code> shows post-policy output.</p></div>

<div class="scn"><h4>The policy change that did nothing, then everything</h4><p>An engineer added a route-map setting local preference 200 on routes from the cheaper provider and saw no change in <code>show ip bgp</code>. Assuming the route-map was broken, he ran <code>clear ip bgp *</code> during business hours. Every session dropped for about a minute and the change finally appeared. The route-map had been correct all along; it only needed <code>clear ip bgp 100.64.1.1 soft in</code>.</p><p><b>Lesson:</b> after every policy change, refresh the one neighbor softly and then verify.</p></div>

<div class="iv"><p class="q">"What is the difference between soft-reconfiguration inbound and route refresh?"</p><p>Both let you apply a new inbound policy without resetting the session. soft-reconfiguration inbound stores an unmodified copy of all updates from the neighbor locally, costing memory, and enables <code>received-routes</code>. Route refresh is a negotiated capability: the router asks the neighbor to resend its updates, so nothing extra is stored. Modern routers use route refresh; soft-reconfiguration is kept for troubleshooting (seeing pre-policy routes) or very old peers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route-maps: lowest sequence first, first match wins, implicit deny at the end.</li>
<li>Inbound route-maps change your view (weight, local preference); outbound change your neighbor's (prepend, MED, communities).</li>
<li>Policy changes need <code>clear ip bgp X soft in</code> or <code>soft out</code>, never a hard reset.</li>
<li>Route refresh is negotiated; soft-reconfiguration inbound stores the Adj-RIB-In.</li>
<li><code>received-routes</code> = before policy, <code>routes</code> = after inbound policy, <code>advertised-routes</code> = after outbound policy.</li>
</ul></div>
`,hi:`
<p>Ek parcel sorting line socho. Har parcel conveyor par numbered stations ke paas se guzarta hai. Har station par inspector ek sawaal poochta hai ("kya yeh Mumbai jaa raha hai?"). Agar jawab haan hai, to inspector mohar lagata hai aur parcel line se nikal jaata hai; agar nahi, to woh agle station tak chalta hai. Jo parcel bina mohar ke line ke end tak pahunche, woh dustbin mein jaata hai. <b>Route-map</b> yahi line hai: numbered sequences, match sawaal, set moharein, aur end mein ek invisible dustbin.</p>

<h3>Paanch rules mein route-map logic</h3>
<ol>
<li>Sequences sabse chhote number se upar ki taraf check hote hain. <b>Pehla</b> sequence jiske saare match clauses pass ho jaayein woh jeetta hai; baad ke sequences check nahi hote.</li>
<li>Ek sequence mein kai <code>match</code> lines logical <b>AND</b> hain. Ek match line par kai values (<code>match ip address prefix-list A B</code>) <b>OR</b> hain.</li>
<li>Bina <code>match</code> wala sequence sab kuch match karta hai.</li>
<li><code>permit</code> = route accept karo aur <code>set</code> clauses lagao; <code>deny</code> = route drop karo. Prefix-list ke andar ka permit ya deny sirf yeh decide karta hai ki route <i>match</i> hota hai ya nahi.</li>
<li>Jo route kisi sequence se match na ho woh <b>deny</b> hota hai (implicit deny). Aisa route-map jo non-existent prefix-list ko reference kare, IOS par sab match karta hai, jo ek buri surprise hai.</li>
</ol>

<h3>Inbound ya outbound?</h3>
<p>Route-map <b>inbound</b> tab lagao jab aap badalna chahte ho ki <i>aap</i> kya maante ho: jo accept karte ho use filter karo, apna outbound traffic steer karne ke liye weight ya local preference set karo. <b>Outbound</b> tab lagao jab aap badalna chahte ho ki aapka <i>neighbor</i> kya maanta hai: jo bhejte ho use filter karo, apna AS prepend karo, aapki taraf wapas aane wale traffic ko influence karne ke liye MED ya communities set karo.</p>

<pre class="code"><span class="c">! Weight aur local preference lab mein E2 (task 2)</span>
ip prefix-list MON seq 5 permit 192.0.2.0/24
route-map FROM-VAYU permit 10
 match ip address prefix-list MON
 set weight 300
route-map FROM-VAYU permit 20          <span class="c">! koi match nahi = baaki sab, bina badle</span>
router bgp 65500
 neighbor 100.64.2.1 route-map FROM-VAYU in</pre>
<pre class="out">E2# show route-map FROM-VAYU
route-map FROM-VAYU, permit, sequence 10
  Match clauses:
<span class="hl">    ip address prefix-lists: MON</span>
  Set clauses:
<span class="hl">    weight 300</span>
route-map FROM-VAYU, permit, sequence 20
  Match clauses:
  Set clauses:</pre>

<div class="eg"><p><b>Worked example: gayab sequence 20.</b> <code>route-map FROM-VAYU permit 20</code> hata do aur refresh karo. 192.0.2.0/24 abhi bhi sequence 10 se match hota hai aur weight 300 paata hai. Par 198.51.100.0/24 kisi se match nahi hota, isliye implicit deny use drop kar deta hai. E2 Vayu Net ke through 198.51.100.0/24 ka apna backup path kho deta hai, jo bilkul lab task 3 check karta hai. Ek missing line ne chupchaap backup path hata diya.</p></div>

<h3>Policy kahan baithti hai: teen tables</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Adj-RIB-In, Loc-RIB aur Adj-RIB-Out">
<rect x="10" y="60" width="130" height="56" rx="8" fill="#e2e8f0"/><text x="75" y="84" text-anchor="middle" class="svg-ink" font-size="13">Adj-RIB-In</text><text x="75" y="102" text-anchor="middle" class="svg-muted" font-size="12">jaisa aaya</text>
<rect x="170" y="60" width="100" height="56" rx="8" fill="#fde68a"/><text x="220" y="92" text-anchor="middle" class="svg-ink" font-size="13">policy in</text>
<rect x="300" y="60" width="120" height="56" rx="8" fill="#bae6fd"/><text x="360" y="84" text-anchor="middle" class="svg-ink" font-size="13">Loc-RIB</text><text x="360" y="102" text-anchor="middle" class="svg-muted" font-size="12">best path</text>
<rect x="450" y="60" width="80" height="56" rx="8" fill="#fde68a"/><text x="490" y="92" text-anchor="middle" class="svg-ink" font-size="13">policy out</text>
<rect x="540" y="60" width="95" height="56" rx="8" fill="#bbf7d0"/><text x="587" y="84" text-anchor="middle" class="svg-ink" font-size="13">Adj-RIB-Out</text><text x="587" y="102" text-anchor="middle" class="svg-muted" font-size="12">jaisa bheja</text>
<line x1="140" y1="88" x2="170" y2="88" stroke="#64748b" stroke-width="2"/><line x1="270" y1="88" x2="300" y2="88" stroke="#64748b" stroke-width="2"/><line x1="420" y1="88" x2="450" y2="88" stroke="#64748b" stroke-width="2"/><line x1="530" y1="88" x2="540" y2="88" stroke="#64748b" stroke-width="2"/>
<text x="75" y="150" text-anchor="middle" class="svg-accent" font-size="12">received-routes</text>
<text x="360" y="150" text-anchor="middle" class="svg-accent" font-size="12">routes / show ip bgp</text>
<text x="587" y="150" text-anchor="middle" class="svg-accent" font-size="12">advertised-routes</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">received-routes sirf soft-reconfiguration inbound ke saath chalta hai</text>
</svg><p class="cap">Har <code>show ip bgp neighbors X ...</code> keyword alag stage dekhta hai.</p></div>

<h3>Badli hui policy lagana: refresh, reset nahi</h3>
<p>BGP policies ko updates aate waqt lagata hai. Agar aap route-map, prefix-list ya filter-list badalte ho, to table mein pehle se maujood routes dobara evaluate <b>nahi</b> hote. Change lagane ke teen tareeke hain:</p>
<table class="cmp"><tr><th>Command</th><th>Kya hota hai</th><th>Keemat</th></tr>
<tr><td><code>clear ip bgp X</code></td><td>Hard reset: TCP session tootta aur dobara banta hai</td><td>Us peer ke saare prefixes ka outage</td></tr>
<tr><td><code>clear ip bgp X soft out</code></td><td>Nayi outbound policy ke through X ko saare updates dobara bhejo</td><td>Kuch nahi</td></tr>
<tr><td><code>clear ip bgp X soft in</code></td><td>ROUTE-REFRESH message se X se routes dobara maango, phir inbound policy lagao</td><td>Kuch nahi, agar route refresh supported hai</td></tr>
</table>
<p><b>Route refresh</b> ek capability hai jo dono peers OPEN message mein announce karte hain; har modern IOS ise support karta hai. Sirf agar bahut purane peer mein yeh na ho tab aapko <code>neighbor X soft-reconfiguration inbound</code> chahiye, jo har received cheez ki unmodified copy (Adj-RIB-In) store karta hai aur memory khata hai. Wahi stored copy <code>show ip bgp neighbors X received-routes</code> ko kaam karne deti hai.</p>
<pre class="out">E2# show ip bgp neighbors 100.64.2.1 | include refresh
<span class="hl">    Route refresh: advertised and received(new)</span>
E2# show ip bgp neighbors 100.64.2.1 received-routes
% Inbound soft reconfiguration not enabled on 100.64.2.1
E2# show ip bgp neighbors 100.64.2.1 routes | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
<span class="hl"> *&gt;  192.0.2.0        100.64.2.1               0           300 64602 i</span>
 *   198.51.100.0     100.64.2.1               0             0 64602 i</pre>

<h3>Policy kaam ke liye useful commands</h3>
<ul>
<li><code>show ip bgp neighbors X routes</code>: X se kya aapki inbound policy se bach gaya.</li>
<li><code>show ip bgp neighbors X advertised-routes</code>: outbound policy ke baad aap X ko asal mein kya bhejte ho.</li>
<li><code>show ip bgp route-map NAME</code>: table ke kaunse routes route-map match karega (dry run).</li>
<li><code>show ip prefix-list detail NAME</code>: har entry ke hit counts.</li>
</ul>

<div class="warn"><p><b>Common galtiyan.</b> Aakhri permit sequence bhool jaana aur baaki sab chupchaap drop kar dena. Policy lagane ke liye production mein <code>clear ip bgp *</code> use karna, jo har session reset kar deta hai. Prefix-list mein <code>deny</code> aur route-map mein <code>deny</code> use karke double negative mein uljhna. <code>received-routes</code> test karke maan lena ki peer kuch nahi bhejta jabki soft-reconfiguration bas enable nahi hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Sirf ek <code>permit</code> sequence wala route-map jo prefix-list match kare, baaki sab deny kar dega. Ek sequence ki match lines AND hain; ek line ki values OR hain. <code>soft in</code> route refresh use karta hai; <code>soft-reconfiguration inbound</code> sirf uske bina chahiye. <code>advertised-routes</code> post-policy output dikhata hai.</p></div>

<div class="scn"><h4>Policy change jisne pehle kuch nahi kiya, phir sab kuch</h4><p>Ek engineer ne saste provider se aane wale routes par local preference 200 set karne wala route-map joda aur <code>show ip bgp</code> mein koi change nahi dekha. Route-map toota hua maan kar usne business hours mein <code>clear ip bgp *</code> chala diya. Har session lagbhag ek minute ke liye gira aur aakhir mein change dikha. Route-map shuru se sahi tha; use bas <code>clear ip bgp 100.64.1.1 soft in</code> chahiye tha.</p><p><b>Seekh:</b> har policy change ke baad sirf us ek neighbor ko softly refresh karo aur phir verify karo.</p></div>

<div class="iv"><p class="q">"soft-reconfiguration inbound aur route refresh mein kya farak hai?"</p><p>Dono se aap session reset kiye bina nayi inbound policy laga sakte ho. soft-reconfiguration inbound neighbor ke saare updates ki unmodified copy locally store karta hai, memory khata hai, aur <code>received-routes</code> enable karta hai. Route refresh ek negotiated capability hai: router neighbor se apne updates dobara bhejne ko kehta hai, isliye kuch extra store nahi hota. Modern routers route refresh use karte hain; soft-reconfiguration troubleshooting (pre-policy routes dekhna) ya bahut purane peers ke liye rakha jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route-maps: sabse chhota sequence pehle, pehla match jeetta hai, end mein implicit deny.</li>
<li>Inbound route-maps aapka view badalte hain (weight, local preference); outbound aapke neighbor ka (prepend, MED, communities).</li>
<li>Policy changes ko <code>clear ip bgp X soft in</code> ya <code>soft out</code> chahiye, kabhi hard reset nahi.</li>
<li>Route refresh negotiate hota hai; soft-reconfiguration inbound Adj-RIB-In store karta hai.</li>
<li><code>received-routes</code> = policy se pehle, <code>routes</code> = inbound policy ke baad, <code>advertised-routes</code> = outbound policy ke baad.</li>
</ul></div>
`}};export{e as default};