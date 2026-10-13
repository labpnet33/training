var e={id:`bgp-best-path-selection`,h:{en:`How Junos picks the best path`,hi:`Junos best path kaise chunta hai`},body:{en:`
<p>Think of a judge in a sports final with a list of tie-breakers. If two teams have the same points, the judge looks at goal difference. If that is equal, the number of goals scored. The judge goes down the list and stops at the first difference. BGP's best path selection is a list of tie-breakers like that. A router may know ten paths to one prefix, but it installs only one as active, and you must be able to say which rule decided.</p>

<h3>The order, for Junos</h3>
<ol>
<li>The next hop must be <b>resolvable</b>, otherwise the path is hidden and cannot compete.</li>
<li>Lowest route <b>preference</b>. BGP is 170 by default, so this matters when another protocol or a policy changes the value.</li>
<li>Highest <b>local preference</b>.</li>
<li>Shortest <b>AS path</b>.</li>
<li>Lowest <b>origin</b> code: I, then E, then ?.</li>
<li>Lowest <b>MED</b>, compared only between paths from the same neighbouring AS (unless <code>path-selection always-compare-med</code> is set).</li>
<li><b>EBGP</b> path over IBGP path.</li>
<li>Lowest <b>IGP metric</b> to the next hop.</li>
<li>Lowest <b>router ID</b>, then shortest cluster list, then lowest peer address.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Best path decision list">
<rect x="20" y="15" width="250" height="26" rx="5" fill="#bae6fd" stroke="#64748b"/><text x="145" y="33" text-anchor="middle" class="svg-ink" font-size="12">1 Next hop resolvable</text>
<rect x="20" y="47" width="250" height="26" rx="5" fill="#bae6fd" stroke="#64748b"/><text x="145" y="65" text-anchor="middle" class="svg-ink" font-size="12">2 Lowest preference</text>
<rect x="20" y="79" width="250" height="26" rx="5" fill="#fed7aa" stroke="#64748b"/><text x="145" y="97" text-anchor="middle" class="svg-ink" font-size="12">3 Highest local preference</text>
<rect x="20" y="111" width="250" height="26" rx="5" fill="#fed7aa" stroke="#64748b"/><text x="145" y="129" text-anchor="middle" class="svg-ink" font-size="12">4 Shortest AS path</text>
<rect x="20" y="143" width="250" height="26" rx="5" fill="#ddd6fe" stroke="#64748b"/><text x="145" y="161" text-anchor="middle" class="svg-ink" font-size="12">5 Lowest origin</text>
<rect x="340" y="15" width="270" height="26" rx="5" fill="#ddd6fe" stroke="#64748b"/><text x="475" y="33" text-anchor="middle" class="svg-ink" font-size="12">6 Lowest MED (same neighbour AS)</text>
<rect x="340" y="47" width="270" height="26" rx="5" fill="#ddd6fe" stroke="#64748b"/><text x="475" y="65" text-anchor="middle" class="svg-ink" font-size="12">7 EBGP over IBGP</text>
<rect x="340" y="79" width="270" height="26" rx="5" fill="#bbf7d0" stroke="#64748b"/><text x="475" y="97" text-anchor="middle" class="svg-ink" font-size="12">8 Lowest IGP metric to next hop</text>
<rect x="340" y="111" width="270" height="26" rx="5" fill="#bbf7d0" stroke="#64748b"/><text x="475" y="129" text-anchor="middle" class="svg-ink" font-size="12">9 Lowest router ID</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Stop at the first rule that separates the paths</text>
</svg><p class="cap">The first difference decides; later rules are never reached.</p></div>
<p>A memory aid: <b>R</b>esolvable, <b>P</b>reference, <b>L</b>ocal pref, <b>A</b>S path, <b>O</b>rigin, <b>M</b>ED, <b>E</b>BGP, <b>I</b>GP metric, router <b>ID</b>.</p>

<h3>Seeing the reason on the router</h3>
<p>Junos writes the reason a path lost in the <b>Inactive reason</b> line of <code>show route detail</code>. In the third lab, R2 (AS 65030) is dual-homed: R1 to ISP-A (AS 64501) and R2 to ISP-B (AS 64502). Both ISPs announce 192.0.2.0/24. At the start, R2 has two paths:</p>
<pre class="out">lab@SRT-R2&gt; show route 192.0.2.0/24 detail
192.0.2.0/24 (2 entries, 1 announced)
        *BGP    Preference: 170/-101
                Source: 100.68.2.1
                Next hop: 100.68.2.1 via ge-0/0/0.0, selected
                State: &lt;Active Ext&gt;
                AS path: 64502 I
                Localpref: 100
         BGP    Preference: 170/-101
                Source: 10.40.255.1
                Protocol next hop: 10.40.255.1
                State: &lt;Int Ext&gt;
                Inactive reason: <span class="hl">Interior &gt; Exterior &gt; Exterior via Interior</span>
                AS path: 64501 I
                Localpref: 100</pre>
<p>Both paths have the same preference, the same local preference (100) and the same AS path length (1). The IBGP path from R1 loses because rule 7 prefers an EBGP path, and Junos names it with that long phrase. R2 therefore exits directly through ISP-B, even though management wants ISP-A.</p>
<p>Now R1 sets a higher local preference on routes from ISP-A (the next chapter shows the policy). R2 re-evaluates at rule 3:</p>
<pre class="out">lab@SRT-R2&gt; show route 192.0.2.0/24 detail
        *BGP    Preference: 170/<span class="hl">-201</span>
                Source: 10.40.255.1
                Next hop: 10.40.12.1 via ge-0/0/1.0, selected
                AS path: 64501 I
                Localpref: <span class="hl">200</span>
         BGP    Preference: 170/-101
                Source: 100.68.2.1
                Inactive reason: <span class="hl">Local Preference</span>
                AS path: 64502 I
                Localpref: 100</pre>
<p>The path through R1 now wins on local preference, although it is an IBGP path. Rule 3 is checked long before rule 7. The second number in "170/-201" reflects it: the route's tie-break value is derived from local preference.</p>

<h3>Notes on specific rules</h3>
<ul>
<li><b>AS path length</b> counts every AS number; a prepended path of "65030 65030 65030" has length 3.</li>
<li><b>MED</b> is checked only among paths from the same neighbouring AS by default. Two paths with MED 10 and 50 from different ASes are not compared on MED.</li>
<li><b>IGP metric</b> (Metric2 in the detail output) breaks ties between equally good IBGP paths: the nearest exit wins. This is called hot-potato routing.</li>
<li><b>Router ID</b> is the last resort. The lowest wins, which gives a stable result.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A router has three paths to a prefix. P1: local preference 100, AS path length 3. P2: local preference 200, AS path length 5. P3: local preference 200, AS path length 2 and IBGP. Rule 3 removes P1. P2 and P3 tie on local preference, so rule 4 (shorter AS path) picks P3 with length 2 even though it is IBGP; the EBGP rule is never reached.</p></div>

<div class="warn"><p><b>Common mistake.</b> Thinking the shortest AS path always wins. It is only the fourth rule. A higher local preference silently overrides a shorter AS path, which is the whole point of local preference.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember where the rules sit: local preference (3) before AS path (4); MED (6) before EBGP over IBGP (7); IGP metric (8) late. MED is compared only for the same neighbouring AS by default. The reason strings are printed in show route detail as Inactive reason.</p></div>

<div class="scn"><h4>The unexpected exit</h4><p>Traffic left through the slower ISP although the administrator expected the faster one. The two paths had the same local preference and AS path length. The router chose the EBGP path over the IBGP one. Setting a higher local preference on the preferred ISP routes changed the winner in one commit, and the inactive reason confirmed it.</p><p><b>Lesson:</b> read the Inactive reason first; it tells you which rule to override.</p></div>

<div class="iv"><p class="q">"Walk me through BGP best path selection on Junos."</p><p>The next hop must be resolvable, then lowest preference, highest local preference, shortest AS path, lowest origin, lowest MED among paths from the same neighbouring AS, EBGP over IBGP, lowest IGP metric to the next hop, and finally lowest router ID. I confirm it with show route detail, which prints an Inactive reason for each losing path.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The first deciding rule wins; later rules are not reached.</li>
<li>Local preference comes before AS path; EBGP over IBGP comes after MED.</li>
<li>Inactive reason in show route detail names the rule that lost.</li>
<li>MED is compared per neighbouring AS by default.</li>
</ul></div>
`,hi:`
<p>Khel ke final ke judge ko socho jiske paas tie-breakers ki list hai. Do teams ke points barabar hon to judge goal difference dekhta hai. Wo bhi barabar ho to kitne goal kiye. Judge list mein neeche jaata hai aur pehle farq par ruk jaata hai. BGP best path selection bhi aise tie-breakers ki list hai. Router ek prefix ke dus paths jaanta ho sakta hai, par sirf ek ko active install karta hai, aur aapko batana aana chahiye ki kaun sa rule decide kiya.</p>

<h3>Junos ke liye order</h3>
<ol>
<li>Next hop <b>resolvable</b> hona chahiye, warna path hidden hai aur compete nahi kar sakta.</li>
<li>Sabse kam route <b>preference</b>. BGP default 170 hai, isliye ye tab maayne rakhta hai jab koi doosra protocol ya policy value badle.</li>
<li>Sabse zyada <b>local preference</b>.</li>
<li>Sabse chhota <b>AS path</b>.</li>
<li>Sabse kam <b>origin</b> code: I, phir E, phir ?.</li>
<li>Sabse kam <b>MED</b>, sirf same padosi AS ke paths ke beech compare hota hai (jab tak <code>path-selection always-compare-med</code> set na ho).</li>
<li><b>EBGP</b> path IBGP path se behtar.</li>
<li>Next hop tak sabse kam <b>IGP metric</b>.</li>
<li>Sabse kam <b>router ID</b>, phir sabse chhoti cluster list, phir sabse kam peer address.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Best path decision list">
<rect x="20" y="15" width="250" height="26" rx="5" fill="#bae6fd" stroke="#64748b"/><text x="145" y="33" text-anchor="middle" class="svg-ink" font-size="12">1 Next hop resolvable</text>
<rect x="20" y="47" width="250" height="26" rx="5" fill="#bae6fd" stroke="#64748b"/><text x="145" y="65" text-anchor="middle" class="svg-ink" font-size="12">2 Sabse kam preference</text>
<rect x="20" y="79" width="250" height="26" rx="5" fill="#fed7aa" stroke="#64748b"/><text x="145" y="97" text-anchor="middle" class="svg-ink" font-size="12">3 Sabse zyada local preference</text>
<rect x="20" y="111" width="250" height="26" rx="5" fill="#fed7aa" stroke="#64748b"/><text x="145" y="129" text-anchor="middle" class="svg-ink" font-size="12">4 Sabse chhota AS path</text>
<rect x="20" y="143" width="250" height="26" rx="5" fill="#ddd6fe" stroke="#64748b"/><text x="145" y="161" text-anchor="middle" class="svg-ink" font-size="12">5 Sabse kam origin</text>
<rect x="340" y="15" width="270" height="26" rx="5" fill="#ddd6fe" stroke="#64748b"/><text x="475" y="33" text-anchor="middle" class="svg-ink" font-size="12">6 Sabse kam MED (same padosi AS)</text>
<rect x="340" y="47" width="270" height="26" rx="5" fill="#ddd6fe" stroke="#64748b"/><text x="475" y="65" text-anchor="middle" class="svg-ink" font-size="12">7 EBGP IBGP se pehle</text>
<rect x="340" y="79" width="270" height="26" rx="5" fill="#bbf7d0" stroke="#64748b"/><text x="475" y="97" text-anchor="middle" class="svg-ink" font-size="12">8 Next hop tak kam IGP metric</text>
<rect x="340" y="111" width="270" height="26" rx="5" fill="#bbf7d0" stroke="#64748b"/><text x="475" y="129" text-anchor="middle" class="svg-ink" font-size="12">9 Sabse kam router ID</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Jo pehla rule paths ko alag kare wahin ruk jao</text>
</svg><p class="cap">Pehla farq decide karta hai; baad ke rules tak baat nahi pahunchti.</p></div>
<p>Yaad rakhne ka tareeka: <b>R</b>esolvable, <b>P</b>reference, <b>L</b>ocal pref, <b>A</b>S path, <b>O</b>rigin, <b>M</b>ED, <b>E</b>BGP, <b>I</b>GP metric, router <b>ID</b>.</p>

<h3>Router par karan dekhna</h3>
<p>Junos path ke haarne ka karan <code>show route detail</code> ki <b>Inactive reason</b> line mein likhta hai. Teesre lab mein R2 (AS 65030) dual-homed hai: R1 ISP-A (AS 64501) se aur R2 ISP-B (AS 64502) se. Dono ISPs 192.0.2.0/24 announce karte hain. Shuru mein R2 ke paas do paths hain:</p>
<pre class="out">lab@SRT-R2&gt; show route 192.0.2.0/24 detail
192.0.2.0/24 (2 entries, 1 announced)
        *BGP    Preference: 170/-101
                Source: 100.68.2.1
                Next hop: 100.68.2.1 via ge-0/0/0.0, selected
                State: &lt;Active Ext&gt;
                AS path: 64502 I
                Localpref: 100
         BGP    Preference: 170/-101
                Source: 10.40.255.1
                Protocol next hop: 10.40.255.1
                State: &lt;Int Ext&gt;
                Inactive reason: <span class="hl">Interior &gt; Exterior &gt; Exterior via Interior</span>
                AS path: 64501 I
                Localpref: 100</pre>
<p>Dono paths ki preference, local preference (100) aur AS path length (1) barabar hain. R1 se aaya IBGP path rule 7 se haarta hai, jo EBGP path ko prefer karta hai, aur Junos use us lambe phrase se naam deta hai. Isliye R2 seedha ISP-B se nikalta hai, jabki management ISP-A chahta hai.</p>
<p>Ab R1 ISP-A ke routes par zyada local preference set karta hai (policy agle chapter mein). R2 rule 3 par dobara evaluate karta hai:</p>
<pre class="out">lab@SRT-R2&gt; show route 192.0.2.0/24 detail
        *BGP    Preference: 170/<span class="hl">-201</span>
                Source: 10.40.255.1
                Next hop: 10.40.12.1 via ge-0/0/1.0, selected
                AS path: 64501 I
                Localpref: <span class="hl">200</span>
         BGP    Preference: 170/-101
                Source: 100.68.2.1
                Inactive reason: <span class="hl">Local Preference</span>
                AS path: 64502 I
                Localpref: 100</pre>
<p>R1 wala path ab local preference par jeetta hai, bhale hi wo IBGP path hai. Rule 3 rule 7 se bahut pehle check hota hai. "170/-201" ka doosra number yahi dikhata hai: route ka tie-break value local preference se nikalta hai.</p>

<h3>Khaas rules par notes</h3>
<ul>
<li><b>AS path length</b> har AS number ginta hai; "65030 65030 65030" wale prepended path ki length 3 hai.</li>
<li><b>MED</b> default mein sirf same padosi AS ke paths ke beech check hota hai. Alag ASes se MED 10 aur 50 wale do paths MED par compare nahi hote.</li>
<li><b>IGP metric</b> (detail output mein Metric2) barabar achhe IBGP paths ka tie todta hai: nazdeeki exit jeetta hai. Ise hot-potato routing kehte hain.</li>
<li><b>Router ID</b> aakhri sahara hai. Sabse kam jeetta hai, jisse result stable rehta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Router ke paas ek prefix ke teen paths hain. P1: local preference 100, AS path length 3. P2: local preference 200, AS path length 5. P3: local preference 200, AS path length 2 aur IBGP. Rule 3 P1 ko hata deta hai. P2 aur P3 local preference par barabar hain, isliye rule 4 (chhota AS path) length 2 wale P3 ko chunta hai chahe wo IBGP ho; EBGP rule tak baat nahi pahunchti.</p></div>

<div class="warn"><p><b>Common mistake.</b> Sochna ki sabse chhota AS path hamesha jeetta hai. Wo sirf chautha rule hai. Zyada local preference chhote AS path ko chupchaap override kar deti hai, yahi local preference ka maqsad hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Rules ki jagah yaad rakho: local preference (3) AS path (4) se pehle; MED (6) EBGP over IBGP (7) se pehle; IGP metric (8) der se. MED default mein sirf same padosi AS ke liye compare hota hai. Reason strings show route detail mein Inactive reason ke roop mein print hoti hain.</p></div>

<div class="scn"><h4>Anjaana exit</h4><p>Traffic slow ISP se gaya jabki administrator tez wale ki ummeed kar raha tha. Dono paths ki local preference aur AS path length barabar thi. Router ne EBGP path ko IBGP par chuna. Preferred ISP ke routes par zyada local preference lagane se ek commit mein winner badal gaya, aur inactive reason ne confirm kiya.</p><p><b>Lesson:</b> pehle Inactive reason padho; wo batata hai ki kaun sa rule override karna hai.</p></div>

<div class="iv"><p class="q">"Junos par BGP best path selection samjhao."</p><p>Next hop resolvable hona chahiye, phir sabse kam preference, sabse zyada local preference, sabse chhota AS path, sabse kam origin, same padosi AS ke paths mein sabse kam MED, EBGP IBGP se pehle, next hop tak sabse kam IGP metric, aur aakhir mein sabse kam router ID. Main show route detail se confirm karta hoon, jo har haarne wale path ke liye Inactive reason print karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehla deciding rule jeetta hai; baad ke rules tak baat nahi jaati.</li>
<li>Local preference AS path se pehle; EBGP over IBGP MED ke baad.</li>
<li>show route detail ka Inactive reason bataata hai kaun sa rule haara.</li>
<li>MED default mein per padosi AS compare hota hai.</li>
</ul></div>
`}};export{e as default};