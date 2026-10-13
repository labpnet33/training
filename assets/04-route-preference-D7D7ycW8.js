var e={id:`route-preference`,h:{en:`Route preference and the active route`,hi:`Route preference aur active route`},body:{en:`
<p>Longest match picks the prefix. But what if two sources both offer the <b>same prefix</b>, say OSPF and a static route to 172.16.60.0/24? Junos needs a rule to pick one. That rule is <b>route preference</b>, the idea other vendors call administrative distance.</p>

<h3>Analogy: two advisers, one trust score</h3>
<p>Imagine two advisers give you directions to the same address. You trust one more than the other, so you follow the more trusted one and keep the other's directions in your pocket as a backup. The trust score is the preference. The lower the number, the more you trust it.</p>

<h3>The rule</h3>
<p>For routes to the same prefix, the <b>lowest preference value wins</b> and becomes the <b>active route</b>. The others stay in the routing table as inactive routes, ready to take over automatically if the active one disappears.</p>
<table class="cmp"><tr><th>Source</th><th>Default preference</th></tr>
<tr><td>Direct and Local</td><td>0</td></tr>
<tr><td>Static</td><td>5</td></tr>
<tr><td>OSPF internal</td><td>10</td></tr>
<tr><td>IS-IS Level 1 / Level 2 internal</td><td>15 / 18</td></tr>
<tr><td>RIP</td><td>100</td></tr>
<tr><td>Aggregate</td><td>130</td></tr>
<tr><td>OSPF external</td><td>150</td></tr>
<tr><td>BGP (internal and external)</td><td>170</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Preference scale">
<line x1="30" y1="70" x2="610" y2="70" stroke="#64748b" stroke-width="3"/>
<circle cx="40" cy="70" r="9" fill="#bbf7d0" stroke="#64748b"/><text x="40" y="50" text-anchor="middle" class="svg-ink" font-size="11">Direct 0</text>
<circle cx="90" cy="70" r="9" fill="#bae6fd" stroke="#64748b"/><text x="90" y="105" text-anchor="middle" class="svg-ink" font-size="11">Static 5</text>
<circle cx="140" cy="70" r="9" fill="#ddd6fe" stroke="#64748b"/><text x="140" y="50" text-anchor="middle" class="svg-ink" font-size="11">OSPF 10</text>
<circle cx="285" cy="70" r="9" fill="#fde68a" stroke="#64748b"/><text x="285" y="50" text-anchor="middle" class="svg-ink" font-size="11">RIP 100</text>
<circle cx="420" cy="70" r="9" fill="#fed7aa" stroke="#64748b"/><text x="420" y="50" text-anchor="middle" class="svg-ink" font-size="11">OSPF ext 150</text>
<circle cx="500" cy="70" r="9" fill="#e2e8f0" stroke="#64748b"/><text x="500" y="105" text-anchor="middle" class="svg-ink" font-size="11">BGP 170</text>
<text x="30" y="140" class="svg-accent" font-size="12">lower number = more trusted = wins</text>
<text x="610" y="140" text-anchor="end" class="svg-muted" font-size="12">higher number = backup</text>
</svg><p class="cap">Preference scale. Direct beats static, static beats OSPF, and so on, but only for the same prefix.</p></div>

<h3>Reading show route</h3>
<pre class="out">lab@R1-KOCHI&gt; show route 172.16.60.0/24

inet.0: 9 destinations, 10 routes (9 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.60.0/24     <span class="hl">*[Static/5]</span> 02:14:37
                    &gt;  to 10.3.13.2 via ge-0/0/1.0
                    <span class="hl">[OSPF/10]</span> 02:10:11, metric 3
                    &gt;  to 10.3.12.2 via ge-0/0/0.0
</pre>
<ul>
<li><code>*</code> (and <code>+</code>) marks the <b>active</b> route, the one copied into the forwarding table.</li>
<li><code>[Static/5]</code> is <code>[protocol/preference]</code>: where it came from and its preference.</li>
<li><code>&gt;</code> marks the next hop that is really used.</li>
<li>Time is how long the route has existed. <code>metric 3</code> is the protocol's own cost.</li>
<li>The header counts "10 routes (9 active)": one route is inactive. Here it is the OSPF route.</li>
</ul>
<p>To ask why a route lost, add <code>detail</code>: Junos prints an <code>Inactive reason: Route Preference</code> line under the loser.</p>

<h3>Preference first, metric second</h3>
<p>The order is: longest prefix, then lowest preference, then (only among routes of the same protocol) lowest metric. A static route with preference 5 beats an OSPF route with a tiny metric, because metrics are compared only inside one protocol; two protocols have incomparable metric scales.</p>

<h3>Changing preference on purpose</h3>
<p>This is the Kochi lab. A forgotten static route over a slow radio link (preference 5) beats OSPF (10) on the fast path. You want OSPF to carry traffic and the static to wait as a backup. Give the static a preference above OSPF, here 200:</p>
<pre class="code">lab@R1-KOCHI# set routing-options static route 172.16.60.0/24 preference 200
lab@R1-KOCHI# commit and-quit
lab@R1-KOCHI&gt; show route 172.16.60.0/24
172.16.60.0/24     *[OSPF/10] 00:00:09, metric 3
                    &gt;  to 10.3.12.2 via ge-0/0/0.0
                    [Static/200] 02:15:02
                    &gt;  to 10.3.13.2 via ge-0/0/1.0</pre>
<p>Do not delete the static; keep it as a floating backup. You can also change the default for all static routes with <code>set routing-options static defaults preference 7</code>, or change the preference of a whole protocol, for example <code>set protocols ospf preference 20</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Comparing metrics across protocols. An OSPF metric of 1 does not make OSPF beat a static route. Preference decides first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos "preference" is not Cisco's "metric". Lower wins, static is 5 (not 1), OSPF internal 10, OSPF external 150, BGP 170. If asked which route is installed in the forwarding table, choose the lowest preference for the same prefix.</p></div>

<div class="scn"><h4>The "backup" that was the main path</h4><p>Users in Kochi complained about the analytics server being slow. Everything looked healthy: OSPF was up, the fast path was clear. show route 172.16.60.0/24 on R1 showed *[Static/5] pointing at a slow radio link and the OSPF route as an inactive backup. The static route had been added last month "just in case". Raising its preference to 200 made OSPF active the same minute, and the complaints stopped.</p><p><b>Lesson:</b> a "backup" static route with default preference is not a backup; it is the winner.</p></div>

<div class="iv"><p class="q">"Both OSPF and a static route offer the same prefix. Which is used, and how do you reverse it?"</p><p>Static (preference 5) beats OSPF internal (10) because lower preference wins, regardless of metric. To make OSPF primary and static a floating backup, set the static preference higher than 10, for example 200. Mention show route detail to confirm the inactive reason.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: longest prefix, then lowest preference, then metric inside one protocol.</li>
<li>Defaults: Direct/Local 0, Static 5, OSPF internal 10, RIP 100, OSPF external 150, BGP 170.</li>
<li>* marks the active route; [Protocol/preference] shows the source and value.</li>
<li>Inactive routes are automatic backups; show route detail explains why they lost.</li>
<li>Raise a static route preference above the dynamic protocol to make it a floating backup.</li>
</ul></div>
`,hi:`
<p>Longest match prefix chunta hai. Lekin agar do sources <b>same prefix</b> dein, jaise 172.16.60.0/24 ke liye OSPF aur ek static route? Junos ko ek rule chahiye. Woh rule <b>route preference</b> hai, jise doosre vendors administrative distance kehte hain.</p>

<h3>Analogy: do advisers, ek trust score</h3>
<p>Socho do advisers aapko same address ka raasta batate hain. Aap ek par zyada bharosa karte ho, to zyada bharose wale ka raasta follow karte ho aur doosre ka raasta backup ke roop mein jeb mein rakhte ho. Trust score preference hai. Number jitna kam, bharosa utna zyada.</p>

<h3>Rule</h3>
<p>Same prefix ke routes mein <b>sabse kam preference value jeetti hai</b> aur <b>active route</b> banti hai. Baaki routing table mein inactive routes ke roop mein rehte hain, active wala gayab ho to apne aap le lene ke liye taiyaar.</p>
<table class="cmp"><tr><th>Source</th><th>Default preference</th></tr>
<tr><td>Direct aur Local</td><td>0</td></tr>
<tr><td>Static</td><td>5</td></tr>
<tr><td>OSPF internal</td><td>10</td></tr>
<tr><td>IS-IS Level 1 / Level 2 internal</td><td>15 / 18</td></tr>
<tr><td>RIP</td><td>100</td></tr>
<tr><td>Aggregate</td><td>130</td></tr>
<tr><td>OSPF external</td><td>150</td></tr>
<tr><td>BGP (internal aur external)</td><td>170</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Preference scale">
<line x1="30" y1="70" x2="610" y2="70" stroke="#64748b" stroke-width="3"/>
<circle cx="40" cy="70" r="9" fill="#bbf7d0" stroke="#64748b"/><text x="40" y="50" text-anchor="middle" class="svg-ink" font-size="11">Direct 0</text>
<circle cx="90" cy="70" r="9" fill="#bae6fd" stroke="#64748b"/><text x="90" y="105" text-anchor="middle" class="svg-ink" font-size="11">Static 5</text>
<circle cx="140" cy="70" r="9" fill="#ddd6fe" stroke="#64748b"/><text x="140" y="50" text-anchor="middle" class="svg-ink" font-size="11">OSPF 10</text>
<circle cx="285" cy="70" r="9" fill="#fde68a" stroke="#64748b"/><text x="285" y="50" text-anchor="middle" class="svg-ink" font-size="11">RIP 100</text>
<circle cx="420" cy="70" r="9" fill="#fed7aa" stroke="#64748b"/><text x="420" y="50" text-anchor="middle" class="svg-ink" font-size="11">OSPF ext 150</text>
<circle cx="500" cy="70" r="9" fill="#e2e8f0" stroke="#64748b"/><text x="500" y="105" text-anchor="middle" class="svg-ink" font-size="11">BGP 170</text>
<text x="30" y="140" class="svg-accent" font-size="12">kam number = zyada bharosa = jeetta hai</text>
<text x="610" y="140" text-anchor="end" class="svg-muted" font-size="12">zyada number = backup</text>
</svg><p class="cap">Preference scale. Direct static ko haraata hai, static OSPF ko, aur aage bhi, lekin sirf same prefix ke liye.</p></div>

<h3>show route padhna</h3>
<pre class="out">lab@R1-KOCHI&gt; show route 172.16.60.0/24

inet.0: 9 destinations, 10 routes (9 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.60.0/24     <span class="hl">*[Static/5]</span> 02:14:37
                    &gt;  to 10.3.13.2 via ge-0/0/1.0
                    <span class="hl">[OSPF/10]</span> 02:10:11, metric 3
                    &gt;  to 10.3.12.2 via ge-0/0/0.0
</pre>
<ul>
<li><code>*</code> (aur <code>+</code>) <b>active</b> route mark karta hai, jo forwarding table mein copy hota hai.</li>
<li><code>[Static/5]</code> matlab <code>[protocol/preference]</code>: kahan se aaya aur uski preference.</li>
<li><code>&gt;</code> us next hop ko mark karta hai jo sach mein use hota hai.</li>
<li>Time batata hai route kitni der se hai. <code>metric 3</code> protocol ka apna cost hai.</li>
<li>Header "10 routes (9 active)" gintaa hai: ek route inactive hai. Yahan woh OSPF route hai.</li>
</ul>
<p>Route kyun haara yeh poochne ke liye <code>detail</code> lagao: Junos haarne wale ke neeche <code>Inactive reason: Route Preference</code> line print karta hai.</p>

<h3>Pehle preference, phir metric</h3>
<p>Order yeh hai: longest prefix, phir lowest preference, phir (sirf ek hi protocol ke routes mein) lowest metric. Preference 5 wala static route chhote metric wale OSPF route ko haraata hai, kyunki metrics sirf ek protocol ke andar compare hote hain; do protocols ke metric scales compare nahi ho sakte.</p>

<h3>Jaan boojh kar preference badalna</h3>
<p>Yeh Kochi lab hai. Slow radio link par bhoola hua static route (preference 5) tez path ke OSPF (10) ko haraata hai. Aap chahte ho OSPF traffic le jaaye aur static backup bane. Static ko OSPF se upar ki preference do, yahan 200:</p>
<pre class="code">lab@R1-KOCHI# set routing-options static route 172.16.60.0/24 preference 200
lab@R1-KOCHI# commit and-quit
lab@R1-KOCHI&gt; show route 172.16.60.0/24
172.16.60.0/24     *[OSPF/10] 00:00:09, metric 3
                    &gt;  to 10.3.12.2 via ge-0/0/0.0
                    [Static/200] 02:15:02
                    &gt;  to 10.3.13.2 via ge-0/0/1.0</pre>
<p>Static ko delete mat karo; floating backup ke roop mein rakho. Saare static routes ka default <code>set routing-options static defaults preference 7</code> se badal sakte ho, ya poore protocol ki preference, jaise <code>set protocols ospf preference 20</code>.</p>

<div class="warn"><p><b>Common mistake.</b> Alag protocols ke metrics compare karna. OSPF ka metric 1 hone se OSPF static ko nahi haraata. Pehle preference faisla karti hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos "preference" Cisco ka "metric" nahi hai. Kam jeetta hai, static 5 hai (1 nahi), OSPF internal 10, OSPF external 150, BGP 170. Forwarding table mein kaunsa route install hota hai poochein to same prefix ke liye lowest preference chuno.</p></div>

<div class="scn"><h4>Jo "backup" asal mein main path tha</h4><p>Kochi ke users ne analytics server slow hone ki shikayat ki. Sab theek dikh raha tha: OSPF up tha, tez path saaf tha. R1 par show route 172.16.60.0/24 ne *[Static/5] dikhaya jo slow radio link ki taraf tha aur OSPF route inactive backup tha. Static route pichle mahine "bas aise hi" daala gaya tha. Uski preference 200 karne se usi minute OSPF active ho gaya aur shikayatein band ho gayi.</p><p><b>Lesson:</b> default preference wala "backup" static route backup nahi hota; woh winner hota hai.</p></div>

<div class="iv"><p class="q">"OSPF aur static route dono same prefix dete hain. Kaunsa use hota hai, aur ise ulta kaise karoge?"</p><p>Static (preference 5) OSPF internal (10) ko haraata hai kyunki kam preference jeetti hai, metric se matlab nahi. OSPF ko primary aur static ko floating backup banane ke liye static ki preference 10 se zyada karo, jaise 200. Batao ki inactive reason confirm karne ke liye show route detail use karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: longest prefix, phir lowest preference, phir ek protocol ke andar metric.</li>
<li>Defaults: Direct/Local 0, Static 5, OSPF internal 10, RIP 100, OSPF external 150, BGP 170.</li>
<li>* active route mark karta hai; [Protocol/preference] source aur value dikhata hai.</li>
<li>Inactive routes automatic backup hain; show route detail batata hai kyun haare.</li>
<li>Static ko floating backup banane ke liye uski preference dynamic protocol se upar rakho.</li>
</ul></div>
`}};export{e as default};