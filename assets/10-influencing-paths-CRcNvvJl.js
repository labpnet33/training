var e={id:`influence`,h:{en:`Influencing path selection: weight, local preference, AS-path prepend and MED`,hi:`Path selection ko prabhavit karna: weight, local preference, AS-path prepend aur MED`},body:{en:`
<p>You decide which road you take when you leave your house, but you cannot decide which road your guests take to reach you. You can only suggest: put up a sign, give directions, make one route look longer. BGP traffic engineering has the same split. <b>Outbound</b> traffic (leaving your AS) is fully under your control. <b>Inbound</b> traffic (coming into your AS) is decided by other ASes; you can only influence it.</p>

<h3>The four basic knobs</h3>
<table class="cmp"><tr><th>Knob</th><th>Controls</th><th>Scope</th><th>Wins when</th></tr>
<tr><td><b>Weight</b></td><td>Outbound</td><td>One router only</td><td>Higher</td></tr>
<tr><td><b>Local preference</b></td><td>Outbound</td><td>Whole AS (via iBGP)</td><td>Higher</td></tr>
<tr><td><b>AS-path prepend</b></td><td>Inbound</td><td>Other ASes see a longer path</td><td>Shorter path preferred by them</td></tr>
<tr><td><b>MED</b></td><td>Inbound</td><td>The directly connected neighbour AS only</td><td>Lower</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Dual-homed customer influencing traffic">
<rect x="230" y="150" width="180" height="56" rx="8" fill="#bae6fd"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">CUST-EDGE AS 65010</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.0/24</text>
<rect x="40" y="30" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="125" y="52" text-anchor="middle" class="svg-ink" font-size="13">ISP-A AS 64500</text><text x="125" y="70" text-anchor="middle" class="svg-muted" font-size="12">100.64.10.1, primary</text>
<rect x="430" y="30" width="170" height="50" rx="8" fill="#fde68a"/><text x="515" y="52" text-anchor="middle" class="svg-ink" font-size="13">ISP-B AS 64510</text><text x="515" y="70" text-anchor="middle" class="svg-muted" font-size="12">100.64.20.1, backup</text>
<line x1="150" y1="80" x2="270" y2="150" stroke="#64748b" stroke-width="3"/><line x1="490" y1="80" x2="370" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="150" y="125" text-anchor="middle" class="svg-accent" font-size="12">LP 200 in</text>
<text x="500" y="125" text-anchor="middle" class="svg-accent" font-size="12">prepend x3 out</text>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">Outbound: local preference. Inbound: prepend towards the backup.</text>
</svg><p class="cap">A classic primary and backup design for a customer with two providers.</p></div>

<h3>Weight: one router's private opinion</h3>
<pre class="code">router bgp 65010
 neighbor 100.64.10.1 weight 200
<span class="c">! every path from ISP-A gets weight 200 on this router only</span></pre>
<p>Simple and powerful, but it does not travel. If the AS has two edge routers, each needs its own setting, and they may disagree. It can also be set selectively with <code>set weight</code> in an inbound route-map.</p>

<h3>Local preference: the AS-wide exit choice</h3>
<pre class="code">route-map ISP-A-IN permit 10
 set local-preference 200
<span class="c">! no match clause: applies to every route from ISP-A</span>
!
router bgp 65010
 neighbor 100.64.10.1 route-map ISP-A-IN in</pre>
<p>The value is carried to every iBGP peer in the AS, so all internal routers agree on the same exit. <code>bgp default local-preference 150</code> changes the default for all routes instead of 100. After changing an inbound policy, run <code>clear ip bgp 100.64.10.1 soft in</code>.</p>

<h3>AS-path prepend: make a path look longer</h3>
<pre class="code">route-map ISP-B-OUT permit 10
 set as-path prepend 65010 65010 65010
<span class="c">! always prepend your own ASN</span>
!
router bgp 65010
 neighbor 100.64.20.1 route-map ISP-B-OUT out</pre>
<p>ISP-B and everyone behind it now see 192.168.50.0/24 with path <code>65010 65010 65010 65010</code> (the three prepends plus the normal one), while via ISP-A the path is just <code>65010</code>. Remote ASes compare AS_PATH length at step 5 and prefer ISP-A. Prepending is a <b>suggestion</b>: an AS that sets local preference on its customer routes will ignore your prepends.</p>

<h3>MED: a hint to one neighbour</h3>
<pre class="code">route-map TO-ISP-A-LINK2 permit 10
 set metric 100
<span class="c">! higher MED on the backup link to the same provider</span>
!
router bgp 65010
 neighbor 100.64.11.1 route-map TO-ISP-A-LINK2 out</pre>
<p>MED is useful when you have <b>two links to the same provider</b>: the provider compares MED only among paths from your AS and prefers the lower one. It does not pass beyond that provider, and by default it is not compared between different neighbouring ASes.</p>

<div class="eg"><p><b>Worked example.</b> Before any policy, CUST-EDGE sends outbound traffic to 203.0.113.0/24 via ISP-A (AS_PATH 1 against 2). The company wants ISP-A as primary for <b>everything</b>, including prefixes where ISP-B's path is shorter. For 198.51.100.0/24, ISP-B offers <code>64510</code> (length 1) and ISP-A offers <code>64500 64496</code> (length 2): without policy, ISP-B wins. With <code>set local-preference 200</code> on routes from ISP-A, step 2 (local preference 200 against 100) decides before AS_PATH is ever compared, and ISP-A wins every prefix it offers.</p></div>

<div class="warn"><p><b>Common mistake.</b> Writing a route-map with a <code>match</code> for one prefix and forgetting a final permit clause. Route-maps end with an implicit deny, so every other prefix from that neighbor is silently dropped. Add <code>route-map NAME permit 20</code> with no match to let the rest through unchanged.</p></div>

<div class="exam"><p><b>Exam trap.</b> Local preference and weight influence <b>outbound</b> traffic; AS-path prepend and MED influence <b>inbound</b> traffic. Local preference is applied <b>inbound</b> on the route-map (to routes you receive) even though it controls traffic you send. Prepend is applied <b>outbound</b>.</p></div>

<div class="scn"><h4>Backup link carrying half the traffic</h4><p>A company prepended its ASN three times towards its backup provider, yet about half of inbound traffic still arrived on the backup link. A looking glass showed that many remote networks were customers of the backup provider itself. The backup provider assigned its own customer routes a higher local preference, which beats AS_PATH length inside its AS. The fix was the backup provider's documented community that lowers local preference for the route, sent with <code>send-community</code>.</p><p><b>Lesson:</b> prepending only affects ASes that reach AS_PATH in their decision; local preference in another AS always overrides it.</p></div>

<div class="iv"><p class="q">"You have two ISPs. How do you make one the primary for both inbound and outbound traffic?"</p><p>Strong answer: outbound, raise local preference (or weight on a single router) on routes received from the primary with an inbound route-map. Inbound, prepend your ASN on advertisements to the backup with an outbound route-map, and if the backup provider supports it, send a community that lowers its local preference. Mention MED only for two links to the same provider, soft clears to apply the policy, and the implicit deny at the end of route-maps.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outbound traffic: weight (one router) and local preference (whole AS), both higher wins.</li>
<li>Inbound traffic: AS-path prepend towards the less preferred path; MED between links to the same neighbour AS.</li>
<li>Local preference is set on inbound route-maps; prepend and MED on outbound route-maps.</li>
<li>Route-maps end in an implicit deny; add a final permit clause.</li>
<li>Apply changes with <code>clear ip bgp x soft in</code> or <code>soft out</code>.</li>
</ul></div>
`,hi:`
<p>Ghar se nikalte waqt kaunsi sadak loge yeh aap tay karte ho, par aapke mehmaan aap tak kaunsi sadak se aayenge yeh aap tay nahi kar sakte. Aap sirf suggest kar sakte ho: board lagao, directions do, ek raasta lamba dikhao. BGP traffic engineering mein bhi yahi bantwara hai. <b>Outbound</b> traffic (aapke AS se bahar jaata) poori tarah aapke control mein hai. <b>Inbound</b> traffic (aapke AS mein aata) doosre ASes tay karte hain; aap sirf use prabhavit kar sakte ho.</p>

<h3>Chaar basic knobs</h3>
<table class="cmp"><tr><th>Knob</th><th>Control karta hai</th><th>Scope</th><th>Kab jeetta hai</th></tr>
<tr><td><b>Weight</b></td><td>Outbound</td><td>Sirf ek router</td><td>Zyada</td></tr>
<tr><td><b>Local preference</b></td><td>Outbound</td><td>Poora AS (iBGP ke through)</td><td>Zyada</td></tr>
<tr><td><b>AS-path prepend</b></td><td>Inbound</td><td>Doosre ASes ko lamba path dikhta hai</td><td>Unke liye chhota path preferred</td></tr>
<tr><td><b>MED</b></td><td>Inbound</td><td>Sirf directly connected padosi AS</td><td>Kam</td></tr>
</table>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Dual-homed customer traffic prabhavit karta hua">
<rect x="230" y="150" width="180" height="56" rx="8" fill="#bae6fd"/><text x="320" y="174" text-anchor="middle" class="svg-ink" font-size="13">CUST-EDGE AS 65010</text><text x="320" y="192" text-anchor="middle" class="svg-muted" font-size="12">192.168.50.0/24</text>
<rect x="40" y="30" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="125" y="52" text-anchor="middle" class="svg-ink" font-size="13">ISP-A AS 64500</text><text x="125" y="70" text-anchor="middle" class="svg-muted" font-size="12">100.64.10.1, primary</text>
<rect x="430" y="30" width="170" height="50" rx="8" fill="#fde68a"/><text x="515" y="52" text-anchor="middle" class="svg-ink" font-size="13">ISP-B AS 64510</text><text x="515" y="70" text-anchor="middle" class="svg-muted" font-size="12">100.64.20.1, backup</text>
<line x1="150" y1="80" x2="270" y2="150" stroke="#64748b" stroke-width="3"/><line x1="490" y1="80" x2="370" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<text x="150" y="125" text-anchor="middle" class="svg-accent" font-size="12">LP 200 in</text>
<text x="500" y="125" text-anchor="middle" class="svg-accent" font-size="12">prepend x3 out</text>
<text x="320" y="230" text-anchor="middle" class="svg-muted" font-size="12">Outbound: local preference. Inbound: backup ki taraf prepend.</text>
</svg><p class="cap">Do providers wale customer ka classic primary aur backup design.</p></div>

<h3>Weight: ek router ki private raay</h3>
<pre class="code">router bgp 65010
 neighbor 100.64.10.1 weight 200
<span class="c">! ISP-A ke har path ko sirf is router par weight 200 milta hai</span></pre>
<p>Simple aur powerful, par yeh safar nahi karta. Agar AS mein do edge routers hain, to har ek ko apni setting chahiye, aur woh asehmat ho sakte hain. Ise inbound route-map mein <code>set weight</code> se selectively bhi set kar sakte ho.</p>

<h3>Local preference: AS-wide exit choice</h3>
<pre class="code">route-map ISP-A-IN permit 10
 set local-preference 200
<span class="c">! koi match clause nahi: ISP-A ke har route par lagta hai</span>
!
router bgp 65010
 neighbor 100.64.10.1 route-map ISP-A-IN in</pre>
<p>Value AS ke har iBGP peer tak jaati hai, isliye saare internal routers ek hi exit par sehmat hote hain. <code>bgp default local-preference 150</code> saare routes ka default 100 ki jagah badal deta hai. Inbound policy badalne ke baad <code>clear ip bgp 100.64.10.1 soft in</code> chalao.</p>

<h3>AS-path prepend: path ko lamba dikhao</h3>
<pre class="code">route-map ISP-B-OUT permit 10
 set as-path prepend 65010 65010 65010
<span class="c">! hamesha apna ASN prepend karo</span>
!
router bgp 65010
 neighbor 100.64.20.1 route-map ISP-B-OUT out</pre>
<p>ISP-B aur uske peeche sabko ab 192.168.50.0/24 path <code>65010 65010 65010 65010</code> ke saath dikhta hai (teen prepends plus normal wala), jabki ISP-A ke through path sirf <code>65010</code> hai. Remote ASes step 5 par AS_PATH length compare karte hain aur ISP-A prefer karte hain. Prepending ek <b>suggestion</b> hai: jo AS apne customer routes par local preference set karta hai, woh aapke prepends ignore kar dega.</p>

<h3>MED: ek padosi ko hint</h3>
<pre class="code">route-map TO-ISP-A-LINK2 permit 10
 set metric 100
<span class="c">! same provider ke backup link par zyada MED</span>
!
router bgp 65010
 neighbor 100.64.11.1 route-map TO-ISP-A-LINK2 out</pre>
<p>MED tab kaam ka hai jab aapke <b>same provider ke do links</b> hon: provider MED sirf aapke AS ke paths ke beech compare karta hai aur kam wala prefer karta hai. Yeh us provider se aage nahi jaata, aur default mein alag padosi ASes ke beech compare nahi hota.</p>

<div class="eg"><p><b>Worked example.</b> Koi policy lagane se pehle, CUST-EDGE 203.0.113.0/24 ka outbound traffic ISP-A se bhejta hai (AS_PATH 1 vs 2). Company chahti hai ki ISP-A <b>har cheez</b> ke liye primary ho, un prefixes samet jahan ISP-B ka path chhota hai. 198.51.100.0/24 ke liye ISP-B <code>64510</code> (length 1) deta hai aur ISP-A <code>64500 64496</code> (length 2): bina policy ISP-B jeetta hai. ISP-A ke routes par <code>set local-preference 200</code> ke saath, step 2 (local preference 200 vs 100) AS_PATH compare hone se pehle hi faisla kar deta hai, aur ISP-A apne diye har prefix par jeetta hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Ek prefix ke liye <code>match</code> wala route-map likhna aur aakhri permit clause bhool jaana. Route-maps implicit deny par khatam hote hain, isliye us neighbor ka har doosra prefix chupchaap drop ho jaata hai. Baaki ko bina badle jaane dene ke liye bina match ka <code>route-map NAME permit 20</code> jodo.</p></div>

<div class="exam"><p><b>Exam trap.</b> Local preference aur weight <b>outbound</b> traffic prabhavit karte hain; AS-path prepend aur MED <b>inbound</b> traffic. Local preference route-map par <b>inbound</b> lagti hai (aapko milne wale routes par) bhale hi woh aapke bheje traffic ko control karti hai. Prepend <b>outbound</b> lagta hai.</p></div>

<div class="scn"><h4>Backup link aadha traffic dho raha tha</h4><p>Ek company ne backup provider ki taraf apna ASN teen baar prepend kiya, phir bhi lagbhag aadha inbound traffic backup link par aa raha tha. Looking glass ne dikhaya ki kai remote networks khud backup provider ke customers the. Backup provider apne customer routes ko zyada local preference deta tha, jo uske AS ke andar AS_PATH length ko harati hai. Fix tha backup provider ki documented community jo route ki local preference kam karti hai, <code>send-community</code> ke saath bheji gayi.</p><p><b>Seekh:</b> prepending sirf un ASes par asar karta hai jo apne decision mein AS_PATH tak pahunchte hain; doosre AS ki local preference hamesha use override karti hai.</p></div>

<div class="iv"><p class="q">"Aapke do ISPs hain. Ek ko inbound aur outbound dono ke liye primary kaise banaoge?"</p><p>Strong answer: outbound ke liye, inbound route-map se primary se aaye routes par local preference badhao (ya ek router par weight). Inbound ke liye, outbound route-map se backup ko advertisements par apna ASN prepend karo, aur agar backup provider support kare to ek community bhejo jo uski local preference kam kare. MED sirf same provider ke do links ke liye batao, policy lagane ke liye soft clears, aur route-maps ke end ka implicit deny bhi.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Outbound traffic: weight (ek router) aur local preference (poora AS), dono mein zyada jeetta hai.</li>
<li>Inbound traffic: kam preferred path ki taraf AS-path prepend; same padosi AS ke links ke beech MED.</li>
<li>Local preference inbound route-maps par set hoti hai; prepend aur MED outbound route-maps par.</li>
<li>Route-maps implicit deny par khatam hote hain; aakhri permit clause jodo.</li>
<li>Changes <code>clear ip bgp x soft in</code> ya <code>soft out</code> se lagao.</li>
</ul></div>
`}};export{e as default};