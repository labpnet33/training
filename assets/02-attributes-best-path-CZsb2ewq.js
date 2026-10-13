var e={id:`attributes-best-path`,h:{en:`Path attributes and best-path selection in depth`,hi:`Path attributes aur best-path selection gehrai se`},body:{en:`
<p>When a BGP router hears about the same prefix from several neighbours, it must pick <b>one</b> active route. The choice is made by comparing <b>path attributes</b> in a fixed order. If you know that order and the attribute categories, you can predict which exit traffic uses, and you can change it with one policy line.</p>

<h3>Attribute categories</h3>
<table class="cmp"><tr><th>Category</th><th>Meaning</th><th>Examples</th></tr>
<tr><td>Well-known mandatory</td><td>Every implementation understands it; present in every UPDATE</td><td>ORIGIN, AS_PATH, NEXT_HOP</td></tr>
<tr><td>Well-known discretionary</td><td>Understood by all; may be absent</td><td>LOCAL_PREF, ATOMIC_AGGREGATE</td></tr>
<tr><td>Optional transitive</td><td>May be unknown; passed on if unknown</td><td>COMMUNITY, AGGREGATOR</td></tr>
<tr><td>Optional non-transitive</td><td>May be unknown; dropped if unknown</td><td>MED, ORIGINATOR_ID, CLUSTER_LIST</td></tr></table>
<p>LOCAL_PREF travels only inside an AS (IBGP). MED is sent to a neighbouring AS, and that AS does not pass it on to a third AS. Junos gives a BGP route a default <b>route preference of 170</b> and a default local preference of <b>100</b>.</p>

<h3>The Junos best-path order</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Best path steps">
<rect x="20" y="15" width="140" height="42" rx="8" fill="#bae6fd"/><text x="90" y="40" text-anchor="middle" class="svg-ink" font-size="12">0 Next hop resolves</text>
<rect x="180" y="15" width="140" height="42" rx="8" fill="#bbf7d0"/><text x="250" y="40" text-anchor="middle" class="svg-ink" font-size="12">1 Highest local-pref</text>
<rect x="340" y="15" width="140" height="42" rx="8" fill="#bbf7d0"/><text x="410" y="40" text-anchor="middle" class="svg-ink" font-size="12">2 Shortest AS path</text>
<rect x="500" y="15" width="120" height="42" rx="8" fill="#bbf7d0"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="12">3 Lowest origin</text>
<rect x="20" y="85" width="140" height="42" rx="8" fill="#ddd6fe"/><text x="90" y="110" text-anchor="middle" class="svg-ink" font-size="12">4 Lowest MED</text>
<rect x="180" y="85" width="140" height="42" rx="8" fill="#ddd6fe"/><text x="250" y="110" text-anchor="middle" class="svg-ink" font-size="12">5 EBGP over IBGP</text>
<rect x="340" y="85" width="140" height="42" rx="8" fill="#ddd6fe"/><text x="410" y="110" text-anchor="middle" class="svg-ink" font-size="12">6 Lowest IGP cost</text>
<rect x="500" y="85" width="120" height="42" rx="8" fill="#fde68a"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="12">7 Lowest router ID</text>
<rect x="180" y="155" width="140" height="42" rx="8" fill="#fde68a"/><text x="250" y="180" text-anchor="middle" class="svg-ink" font-size="12">8 Shortest cluster list</text>
<rect x="340" y="155" width="140" height="42" rx="8" fill="#fde68a"/><text x="410" y="180" text-anchor="middle" class="svg-ink" font-size="12">9 Lowest peer address</text>
<text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="12">first step that differs decides; later steps are never reached</text>
</svg><p class="cap">The first difference wins. Steps 7 to 9 are tie-breakers of last resort.</p></div>
<ol>
<li><b>Next hop must be reachable.</b> A route whose protocol next hop does not resolve in inet.0 is <i>hidden</i> and takes no part.</li>
<li><b>Highest local preference</b> (default 100).</li>
<li><b>Shortest AS path.</b> Each AS counts one, an AS set counts one, confederation segments are not counted.</li>
<li><b>Lowest origin code:</b> IGP (i) is better than EGP (e) is better than incomplete (?).</li>
<li><b>Lowest MED.</b> By default only paths from the same neighbouring AS are compared, and a missing MED counts as 0.</li>
<li><b>EBGP preferred over IBGP.</b></li>
<li><b>Lowest IGP metric</b> to the BGP next hop (the Metric2 value) - the "hot potato" rule.</li>
<li><b>Lowest router ID</b> (the originator ID is used when the route was reflected), then <b>shortest cluster list</b>, then <b>lowest peer address</b>.</li>
</ol>
<p>Two knobs change MED behaviour: <code>path-selection always-compare-med</code> compares MED between different neighbouring ASes, and <code>path-selection med-plus-igp</code> adds the IGP cost to the MED before comparing. Use them only when you understand the business reason, because they can cause path oscillation.</p>

<h3>Reading the attributes on a real route</h3>
<p>This is the customer route on R1 of the community lab after the policy set local preference 200:</p>
<pre class="out">lab@R1&gt; show route 10.60.1.0/24 detail
10.60.1.0/24 (1 entry, 1 announced)
        *BGP    Preference: 170/<span class="hl">-201</span>
                Next hop type: Router
                Source: 100.70.1.1
                Next hop: 100.70.1.1 via ge-0/0/0.0, selected
                State: &lt;Active Ext&gt;
                Local AS: 65200 Peer AS: 64512
                AS path: 64512 I
                Communities: 65200:100
                Accepted
                <span class="hl">Localpref: 200</span></pre>
<p>Preference 170 is the protocol preference. The number after the slash is derived from local preference: this lab shows -101 for local preference 100 and -201 for 200, so a more negative value is better. <code>State: &lt;Active Ext&gt;</code> says the route came from an external peer; internal routes show <code>Int</code> and a Metric2 line.</p>

<div class="eg"><p><b>Worked example.</b> Router X hears 203.0.113.0/24 from three paths. A: local preference 100, AS path length 3. B: local preference 100, AS path length 2. C: local preference 150, AS path length 5. Step 1 (local preference) already picks C, even though its AS path is longest. If you remove C, step 2 picks B. If A and B had equal AS-path length, the origin, MED, EBGP-versus-IBGP and IGP cost would be compared in turn.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using AS-path prepend to change how your own AS exits. Prepending influences how <i>other</i> ASes enter you (export). To change your own exit, set local preference on import. Another classic mistake is expecting MED to compare across two different ISPs.</p></div>
<div class="exam"><p><b>Exam trap.</b> MED is non-transitive and compared only between the same neighbouring AS by default. Local preference is not sent to EBGP peers. A route with an unresolvable next hop is not "worse", it is hidden.</p></div>

<div class="scn"><h4>Traffic took the expensive link</h4><p>A company with two ISPs found all traffic leaving through the costly one. Both ISPs sent the same prefixes with AS paths of equal length. The cheaper ISP's routes simply had no policy, so local preference 100 tied and the router fell to the lowest router ID, which happened to be the expensive neighbour. An import policy setting local preference 200 on the cheap ISP fixed it in one commit.</p><p><b>Lesson:</b> never leave the choice to the router-ID tie-breaker. Make the exit deliberate with local preference.</p></div>

<div class="iv"><p class="q">"List the BGP path-selection criteria in order on Junos."</p><p>Reachable next hop, highest local preference, shortest AS path, lowest origin, lowest MED, EBGP over IBGP, lowest IGP metric to the next hop, then router ID, cluster list length and peer address. Mention that MED is compared within one neighbouring AS unless always-compare-med is set, and that you would use local preference for outbound traffic engineering and prepend or MED for inbound.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Attributes are well-known mandatory, well-known discretionary, optional transitive or optional non-transitive.</li>
<li>Highest local preference is the first policy-controlled tie-breaker, then shortest AS path.</li>
<li>MED is compared only inside the same neighbouring AS unless always-compare-med is configured.</li>
<li>A route without a resolvable next hop is hidden and never enters path selection.</li>
<li>Use local preference for exit control and prepend or MED for entry control.</li>
</ul></div>
`,hi:`
<p>Jab BGP router ek hi prefix ke baare mein kai neighbours se sunta hai, use <b>ek</b> active route chunna padta hai. Yeh choice <b>path attributes</b> ko ek fixed order mein compare karke hota hai. Agar aap yeh order aur attribute categories jaante ho, to aap predict kar sakte ho ki traffic kaunsa exit use karega, aur policy ki ek line se use badal sakte ho.</p>

<h3>Attribute categories</h3>
<table class="cmp"><tr><th>Category</th><th>Matlab</th><th>Examples</th></tr>
<tr><td>Well-known mandatory</td><td>Har implementation samajhta hai; har UPDATE mein hota hai</td><td>ORIGIN, AS_PATH, NEXT_HOP</td></tr>
<tr><td>Well-known discretionary</td><td>Sab samajhte hain; absent ho sakta hai</td><td>LOCAL_PREF, ATOMIC_AGGREGATE</td></tr>
<tr><td>Optional transitive</td><td>Unknown ho sakta hai; unknown ho to bhi aage pass hota hai</td><td>COMMUNITY, AGGREGATOR</td></tr>
<tr><td>Optional non-transitive</td><td>Unknown ho sakta hai; unknown ho to drop ho jaata hai</td><td>MED, ORIGINATOR_ID, CLUSTER_LIST</td></tr></table>
<p>LOCAL_PREF sirf AS ke andar (IBGP) travel karta hai. MED padosi AS ko bheja jaata hai, aur woh AS use teesre AS ko aage nahi bhejta. Junos BGP route ko default <b>route preference 170</b> aur default local preference <b>100</b> deta hai.</p>

<h3>Junos best-path order</h3>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Best path ke steps">
<rect x="20" y="15" width="140" height="42" rx="8" fill="#bae6fd"/><text x="90" y="40" text-anchor="middle" class="svg-ink" font-size="12">0 Next hop resolve ho</text>
<rect x="180" y="15" width="140" height="42" rx="8" fill="#bbf7d0"/><text x="250" y="40" text-anchor="middle" class="svg-ink" font-size="12">1 Highest local-pref</text>
<rect x="340" y="15" width="140" height="42" rx="8" fill="#bbf7d0"/><text x="410" y="40" text-anchor="middle" class="svg-ink" font-size="12">2 Shortest AS path</text>
<rect x="500" y="15" width="120" height="42" rx="8" fill="#bbf7d0"/><text x="560" y="40" text-anchor="middle" class="svg-ink" font-size="12">3 Lowest origin</text>
<rect x="20" y="85" width="140" height="42" rx="8" fill="#ddd6fe"/><text x="90" y="110" text-anchor="middle" class="svg-ink" font-size="12">4 Lowest MED</text>
<rect x="180" y="85" width="140" height="42" rx="8" fill="#ddd6fe"/><text x="250" y="110" text-anchor="middle" class="svg-ink" font-size="12">5 EBGP over IBGP</text>
<rect x="340" y="85" width="140" height="42" rx="8" fill="#ddd6fe"/><text x="410" y="110" text-anchor="middle" class="svg-ink" font-size="12">6 Lowest IGP cost</text>
<rect x="500" y="85" width="120" height="42" rx="8" fill="#fde68a"/><text x="560" y="110" text-anchor="middle" class="svg-ink" font-size="12">7 Lowest router ID</text>
<rect x="180" y="155" width="140" height="42" rx="8" fill="#fde68a"/><text x="250" y="180" text-anchor="middle" class="svg-ink" font-size="12">8 Shortest cluster list</text>
<rect x="340" y="155" width="140" height="42" rx="8" fill="#fde68a"/><text x="410" y="180" text-anchor="middle" class="svg-ink" font-size="12">9 Lowest peer address</text>
<text x="320" y="222" text-anchor="middle" class="svg-muted" font-size="12">pehla alag step decide karta hai; baaki steps tak baat nahi pahunchti</text>
</svg><p class="cap">Pehla difference jeetta hai. Steps 7 se 9 aakhri tie-breakers hain.</p></div>
<ol>
<li><b>Next hop reachable hona chahiye.</b> Jis route ka protocol next hop inet.0 mein resolve nahi hota woh <i>hidden</i> hai aur hissa nahi leta.</li>
<li><b>Highest local preference</b> (default 100).</li>
<li><b>Shortest AS path.</b> Har AS ek gina jaata hai, AS set ek, confederation segments nahi gine jaate.</li>
<li><b>Lowest origin code:</b> IGP (i), EGP (e) se behtar hai, jo incomplete (?) se behtar hai.</li>
<li><b>Lowest MED.</b> Default mein sirf same neighbouring AS ke paths compare hote hain, aur missing MED 0 maana jaata hai.</li>
<li><b>IBGP par EBGP ko prefer karo.</b></li>
<li>BGP next hop tak <b>lowest IGP metric</b> (Metric2 value) - "hot potato" rule.</li>
<li><b>Lowest router ID</b> (reflected route ho to originator ID), phir <b>shortest cluster list</b>, phir <b>lowest peer address</b>.</li>
</ol>
<p>MED ka behaviour do knobs badalte hain: <code>path-selection always-compare-med</code> alag neighbouring ASes ke beech MED compare karta hai, aur <code>path-selection med-plus-igp</code> compare karne se pehle MED mein IGP cost jodta hai. Inhe sirf tab use karo jab business reason samajhte ho, kyunki yeh path oscillation kar sakte hain.</p>

<h3>Real route par attributes padhna</h3>
<p>Community lab ke R1 par customer route, jab policy ne local preference 200 set kiya:</p>
<pre class="out">lab@R1&gt; show route 10.60.1.0/24 detail
10.60.1.0/24 (1 entry, 1 announced)
        *BGP    Preference: 170/<span class="hl">-201</span>
                Next hop type: Router
                Source: 100.70.1.1
                Next hop: 100.70.1.1 via ge-0/0/0.0, selected
                State: &lt;Active Ext&gt;
                Local AS: 65200 Peer AS: 64512
                AS path: 64512 I
                Communities: 65200:100
                Accepted
                <span class="hl">Localpref: 200</span></pre>
<p>Preference 170 protocol preference hai. Slash ke baad wala number local preference se nikalta hai: is lab mein local preference 100 par -101 aur 200 par -201 dikhta hai, yaani zyada negative behtar hai. <code>State: &lt;Active Ext&gt;</code> batata hai ki route external peer se aaya; internal routes par <code>Int</code> aur Metric2 line dikhti hai.</p>

<div class="eg"><p><b>Worked example.</b> Router X ko 203.0.113.0/24 teen paths se mila. A: local preference 100, AS path length 3. B: local preference 100, AS path length 2. C: local preference 150, AS path length 5. Step 1 (local preference) hi C chun leta hai, chahe uska AS path sabse lamba ho. C hata do to step 2 B chunta hai. Agar A aur B ki AS-path length barabar hoti, to origin, MED, EBGP-versus-IBGP aur IGP cost ek-ek karke compare hote.</p></div>

<div class="warn"><p><b>Common mistake.</b> Apna exit badalne ke liye AS-path prepend use karna. Prepend <i>doosre</i> ASes ke aapke andar aane ko influence karta hai (export). Apna exit badalne ke liye import par local preference set karo. Ek aur classic galti: do alag ISPs ke beech MED compare hone ki umeed.</p></div>
<div class="exam"><p><b>Exam trap.</b> MED non-transitive hai aur default mein sirf same neighbouring AS ke beech compare hota hai. Local preference EBGP peers ko nahi bheja jaata. Unresolvable next hop wala route "worse" nahi, hidden hota hai.</p></div>

<div class="scn"><h4>Traffic mehnge link se gaya</h4><p>Do ISPs wali ek company ne dekha ki saara traffic mehnge ISP se ja raha hai. Dono ISPs ne same prefixes barabar AS-path length ke saath bheje. Sasta ISP ke routes par koi policy nahi thi, isliye local preference 100 tie hua aur router lowest router ID par gaya, jo mehnge neighbour ka tha. Sasta ISP par local preference 200 set karne wali import policy ne ek commit mein fix kar diya.</p><p><b>Lesson:</b> choice kabhi router-ID tie-breaker par mat chhodo. Local preference se exit jaanboojhkar chuno.</p></div>

<div class="iv"><p class="q">"Junos par BGP path-selection criteria order mein batao."</p><p>Reachable next hop, highest local preference, shortest AS path, lowest origin, lowest MED, IBGP par EBGP, next hop tak lowest IGP metric, phir router ID, cluster list length aur peer address. Batao ki MED ek neighbouring AS ke andar compare hota hai jab tak always-compare-med na ho, aur outbound traffic engineering ke liye local preference, inbound ke liye prepend ya MED use karoge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Attributes well-known mandatory, well-known discretionary, optional transitive ya optional non-transitive hote hain.</li>
<li>Highest local preference pehla policy-controlled tie-breaker hai, phir shortest AS path.</li>
<li>MED sirf same neighbouring AS ke andar compare hota hai jab tak always-compare-med configured na ho.</li>
<li>Resolvable next hop ke bina route hidden hai aur path selection mein nahi aata.</li>
<li>Exit control ke liye local preference, entry control ke liye prepend ya MED.</li>
</ul></div>
`}};export{e as default};