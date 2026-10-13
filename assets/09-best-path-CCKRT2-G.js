var e={id:`best-path`,h:{en:`The BGP best-path selection algorithm`,hi:`BGP best-path selection algorithm`},body:{en:`
<p>A cricket selection committee choosing between two openers goes through criteria in a fixed order: fitness first, then current form, then average, then strike rate. The moment one criterion separates the players, the decision is made and the lower criteria are never looked at. BGP best-path selection works exactly like that: an ordered list of tie-breakers, compared <b>two paths at a time</b>, stopping at the first difference.</p>

<h3>Before the algorithm: is the path even usable?</h3>
<p>A path is only a candidate if its <b>next hop is reachable</b> in the routing table (the <code>*</code> valid flag), it is not denied by policy, and it has no loop in its AS_PATH. Only one best path is chosen per prefix; only that path is installed in the RIB (subject to AD) and advertised to peers.</p>

<h3>The ordered steps (Cisco IOS)</h3>
<table class="cmp"><tr><th>#</th><th>Criterion</th><th>Prefer</th><th>Notes</th></tr>
<tr><td>1</td><td><b>Weight</b></td><td>Highest</td><td>Cisco-only, local to the router; 32768 for local routes, 0 for learned</td></tr>
<tr><td>2</td><td><b>LOCAL_PREF</b></td><td>Highest</td><td>Default 100; shared across the AS</td></tr>
<tr><td>3</td><td><b>Locally originated</b></td><td>Local</td><td>Network, redistribute or aggregate on this router beats learned paths</td></tr>
<tr><td>4</td><td>AIGP</td><td>Lowest</td><td>Only if the rarely used AIGP attribute is present</td></tr>
<tr><td>5</td><td><b>AS_PATH length</b></td><td>Shortest</td><td>An AS_SET counts as 1; confederation segments are not counted</td></tr>
<tr><td>6</td><td><b>ORIGIN</b></td><td>Lowest</td><td>IGP (i) &lt; EGP (e) &lt; incomplete (?)</td></tr>
<tr><td>7</td><td><b>MED</b></td><td>Lowest</td><td>Only compared if both paths come from the <b>same neighbouring AS</b>, unless <code>bgp always-compare-med</code></td></tr>
<tr><td>8</td><td><b>eBGP over iBGP</b></td><td>eBGP</td><td>External paths beat internal ones</td></tr>
<tr><td>9</td><td><b>IGP metric to next hop</b></td><td>Lowest</td><td>"Hot potato": leave the AS at the closest exit</td></tr>
<tr><td>10</td><td>Multipath check</td><td>-</td><td>If <code>maximum-paths</code> allows, equal paths are installed together; best is still chosen</td></tr>
<tr><td>11</td><td><b>Oldest eBGP path</b></td><td>Oldest</td><td>Stability: avoids flapping between equal paths</td></tr>
<tr><td>12</td><td><b>Lowest router ID</b></td><td>Lowest</td><td>Of the advertising peer (originator ID for reflected routes)</td></tr>
<tr><td>13</td><td>Shortest cluster list</td><td>Shortest</td><td>Route reflector environments</td></tr>
<tr><td>14</td><td>Lowest neighbor address</td><td>Lowest</td><td>Final tie-breaker</td></tr>
</table>

<h3>A memory aid</h3>
<p>The classic mnemonic is <b>"N WLLA OMNI"</b>: <b>N</b>ext hop reachable, <b>W</b>eight, <b>L</b>ocal preference, <b>L</b>ocally originated, <b>A</b>S_PATH (AIGP sits here too), <b>O</b>rigin, <b>M</b>ED, <b>N</b>eighbor type (eBGP over iBGP), <b>I</b>GP metric. Then finish with "old, RID, cluster, address": oldest path, lowest router ID, shortest cluster list, lowest neighbor IP. One more rule of thumb: <b>higher is better only for weight and local preference; for everything else lower or shorter wins.</b></p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Best path decision ladder">
<rect x="5" y="20" width="62" height="44" rx="6" fill="#fde68a"/><text x="36" y="47" text-anchor="middle" class="svg-ink" font-size="12">NH</text>
<rect x="75" y="20" width="62" height="44" rx="6" fill="#bbf7d0"/><text x="106" y="47" text-anchor="middle" class="svg-ink" font-size="12">W</text>
<rect x="145" y="20" width="62" height="44" rx="6" fill="#bbf7d0"/><text x="176" y="47" text-anchor="middle" class="svg-ink" font-size="12">LP</text>
<rect x="215" y="20" width="62" height="44" rx="6" fill="#bae6fd"/><text x="246" y="47" text-anchor="middle" class="svg-ink" font-size="12">Local</text>
<rect x="285" y="20" width="62" height="44" rx="6" fill="#bae6fd"/><text x="316" y="47" text-anchor="middle" class="svg-ink" font-size="12">AS</text>
<rect x="355" y="20" width="62" height="44" rx="6" fill="#bae6fd"/><text x="386" y="47" text-anchor="middle" class="svg-ink" font-size="12">Origin</text>
<rect x="425" y="20" width="62" height="44" rx="6" fill="#bae6fd"/><text x="456" y="47" text-anchor="middle" class="svg-ink" font-size="12">MED</text>
<rect x="495" y="20" width="62" height="44" rx="6" fill="#bae6fd"/><text x="526" y="47" text-anchor="middle" class="svg-ink" font-size="12">eBGP</text>
<rect x="565" y="20" width="70" height="44" rx="6" fill="#bae6fd"/><text x="600" y="47" text-anchor="middle" class="svg-ink" font-size="12">IGP</text>
<text x="140" y="90" text-anchor="middle" class="svg-accent" font-size="12">higher wins</text><line x1="75" y1="72" x2="207" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="425" y="90" text-anchor="middle" class="svg-accent" font-size="12">lower, shorter, or preferred type wins</text><line x1="215" y1="72" x2="635" y2="72" stroke="#64748b" stroke-width="2"/>
<rect x="160" y="115" width="320" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">then oldest, lowest RID, cluster list, neighbor IP</text>
</svg><p class="cap">N WLLA OMNI, left to right. The first step that differs decides.</p></div>

<h3>Worked examples</h3>
<div class="eg"><p><b>Example 1: AS_PATH decides.</b> CUST-EDGE has two paths to 203.0.113.0/24: via 100.64.10.1 with path <code>64500</code>, and via the second provider 100.64.20.1 with path <code>64510 64500</code>. Weight 0 and 0, local preference 100 and 100, neither local, AS_PATH length 1 against 2. <b>Step 5</b> picks 100.64.10.1. Steps 6 onward are never checked.</p></div>
<div class="eg"><p><b>Example 2: weight overrides everything.</b> The network team wants all traffic to use the second provider. They configure <code>neighbor 100.64.20.1 weight 200</code>. Now weight is 200 against 0 at <b>step 1</b>, so the longer path via 64510 wins, even though its AS_PATH is longer. Weight affects only CUST-EDGE itself.</p></div>
<div class="eg"><p><b>Example 3: origin decides.</b> Two paths to 198.51.100.0/24, both with AS_PATH length 1 (<code>64500</code> and <code>64510</code>), equal weight and local preference. The first ends in <code>i</code>, the second in <code>?</code> because the second provider redistributes it. <b>Step 6</b>: IGP beats incomplete, so the first path wins.</p></div>
<div class="eg"><p><b>Example 4: MED only within one AS.</b> Two links to the <b>same</b> provider AS 64500 deliver 198.51.100.0/24 with MED 50 and MED 10. All earlier steps tie, so <b>step 7</b> picks MED 10. If the two paths came from AS 64500 and AS 64510 instead, MED would be skipped; both are eBGP, IGP metric to directly connected next hops is 0 for both, so the <b>oldest</b> path wins, and if they came up at the same moment the lower router ID decides.</p></div>

<h3>Verifying which step decided</h3>
<pre class="out">CUST-EDGE# show ip bgp 203.0.113.0
BGP routing table entry for 203.0.113.0/24, version 9
<span class="hl">Paths: (2 available, best #1, table default)</span>
  Refresh Epoch 1
  64510 64500
    100.64.20.1 from 100.64.20.1 (64.51.0.1)
<span class="hl">      Origin IGP, localpref 100, weight 200, valid, external, best</span>
  Refresh Epoch 1
  64500
    100.64.10.1 from 100.64.10.1 (64.50.0.1)
      Origin IGP, metric 0, localpref 100, valid, external</pre>
<p>Compare the attribute lines of the paths from top to bottom of the algorithm. The first attribute that differs, here weight 200, is the reason.</p>

<div class="warn"><p><b>Common mistake.</b> Expecting BGP to load-balance equal paths by default. It installs <b>one</b> best path unless you configure <code>maximum-paths</code>, and eBGP multipath also requires the paths to match in weight, local preference, AS_PATH, origin, MED and IGP metric.</p></div>

<div class="exam"><p><b>Exam trap.</b> Weight comes <b>before</b> local preference, and both prefer <b>higher</b>. AS_PATH comes <b>before</b> origin, and origin <b>before</b> MED. Many questions list the steps in a subtly wrong order; the correct first five are weight, local preference, locally originated, AIGP, AS_PATH.</p></div>

<div class="scn"><h4>Traffic took the expensive link</h4><p>A company with two ISPs expected outbound traffic to use the cheaper ISP-A because its paths were one AS shorter. Monitoring showed most traffic on ISP-B. <code>show ip bgp</code> revealed weight 100 on every path from ISP-B: a <code>neighbor ... weight 100</code> left over from a migration test. Weight is step 1, so AS_PATH never got a say. Removing it and running <code>clear ip bgp ... soft in</code> moved the traffic.</p><p><b>Lesson:</b> when a choice looks wrong, walk the steps from the top; a forgotten high-priority knob usually explains it.</p></div>

<div class="iv"><p class="q">"Walk me through BGP best-path selection."</p><p>Strong answer: first the next hop must be reachable. Then highest weight, highest local preference, locally originated, (AIGP), shortest AS_PATH, lowest origin (i &lt; e &lt; ?), lowest MED (same neighbouring AS by default), eBGP over iBGP, lowest IGP metric to the next hop, then oldest eBGP path, lowest router ID, shortest cluster list, lowest neighbor address. Mention the mnemonic and that weight is local while local preference is AS-wide.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Valid next hop first, then: weight, local pref, locally originated, AIGP, AS_PATH, origin, MED, eBGP over iBGP, IGP metric.</li>
<li>Tie-breakers: oldest eBGP path, lowest router ID, shortest cluster list, lowest neighbor address.</li>
<li>Higher wins only for weight and local preference; lower or shorter wins for the rest.</li>
<li>MED is compared only between paths from the same neighbouring AS by default.</li>
<li>Only one best path is installed unless <code>maximum-paths</code> is configured.</li>
</ul></div>
`,hi:`
<p>Do openers mein se chunne wali cricket selection committee criteria ko fixed order mein dekhti hai: pehle fitness, phir current form, phir average, phir strike rate. Jaise hi koi criterion players ko alag kar deta hai, faisla ho jaata hai aur neeche ke criteria kabhi dekhe hi nahi jaate. BGP best-path selection bilkul aise hi kaam karta hai: tie-breakers ki ordered list, <b>ek baar mein do paths</b> compare karte hue, pehle fark par ruk kar.</p>

<h3>Algorithm se pehle: kya path use bhi ho sakta hai?</h3>
<p>Path tabhi candidate hai jab uska <b>next hop</b> routing table mein <b>reachable</b> ho (<code>*</code> valid flag), policy ne use deny na kiya ho, aur uske AS_PATH mein loop na ho. Har prefix ka sirf ek best path chuna jaata hai; sirf wahi RIB mein install hota hai (AD ke hisaab se) aur peers ko advertise hota hai.</p>

<h3>Ordered steps (Cisco IOS)</h3>
<table class="cmp"><tr><th>#</th><th>Criterion</th><th>Prefer</th><th>Notes</th></tr>
<tr><td>1</td><td><b>Weight</b></td><td>Highest</td><td>Cisco-only, router ke liye local; local routes ke liye 32768, seekhe hue ke liye 0</td></tr>
<tr><td>2</td><td><b>LOCAL_PREF</b></td><td>Highest</td><td>Default 100; poore AS mein share</td></tr>
<tr><td>3</td><td><b>Locally originated</b></td><td>Local</td><td>Is router par network, redistribute ya aggregate seekhe paths ko harata hai</td></tr>
<tr><td>4</td><td>AIGP</td><td>Lowest</td><td>Sirf tab jab kam use hone wala AIGP attribute present ho</td></tr>
<tr><td>5</td><td><b>AS_PATH length</b></td><td>Shortest</td><td>AS_SET 1 gina jaata hai; confederation segments nahi gine jaate</td></tr>
<tr><td>6</td><td><b>ORIGIN</b></td><td>Lowest</td><td>IGP (i) &lt; EGP (e) &lt; incomplete (?)</td></tr>
<tr><td>7</td><td><b>MED</b></td><td>Lowest</td><td>Sirf tab compare jab dono paths <b>same padosi AS</b> se aayein, jab tak <code>bgp always-compare-med</code> na ho</td></tr>
<tr><td>8</td><td><b>eBGP over iBGP</b></td><td>eBGP</td><td>External paths internal ko harate hain</td></tr>
<tr><td>9</td><td><b>Next hop tak IGP metric</b></td><td>Lowest</td><td>"Hot potato": sabse paas wale exit se AS chhodo</td></tr>
<tr><td>10</td><td>Multipath check</td><td>-</td><td>Agar <code>maximum-paths</code> allow kare, barabar paths saath install hote hain; best phir bhi chuna jaata hai</td></tr>
<tr><td>11</td><td><b>Sabse purana eBGP path</b></td><td>Oldest</td><td>Stability: barabar paths ke beech flapping se bachata hai</td></tr>
<tr><td>12</td><td><b>Lowest router ID</b></td><td>Lowest</td><td>Advertise karne wale peer ka (reflected routes ke liye originator ID)</td></tr>
<tr><td>13</td><td>Shortest cluster list</td><td>Shortest</td><td>Route reflector environments</td></tr>
<tr><td>14</td><td>Lowest neighbor address</td><td>Lowest</td><td>Aakhri tie-breaker</td></tr>
</table>

<h3>Yaad rakhne ka tareeka</h3>
<p>Classic mnemonic hai <b>"N WLLA OMNI"</b>: <b>N</b>ext hop reachable, <b>W</b>eight, <b>L</b>ocal preference, <b>L</b>ocally originated, <b>A</b>S_PATH (AIGP bhi yahin baithta hai), <b>O</b>rigin, <b>M</b>ED, <b>N</b>eighbor type (eBGP over iBGP), <b>I</b>GP metric. Phir "old, RID, cluster, address" se khatam karo: sabse purana path, lowest router ID, shortest cluster list, lowest neighbor IP. Ek aur rule of thumb: <b>zyada behtar sirf weight aur local preference ke liye hai; baaki sab mein kam ya chhota jeetta hai.</b></p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Best path decision ladder">
<rect x="5" y="20" width="62" height="44" rx="6" fill="#fde68a"/><text x="36" y="47" text-anchor="middle" class="svg-ink" font-size="12">NH</text>
<rect x="75" y="20" width="62" height="44" rx="6" fill="#bbf7d0"/><text x="106" y="47" text-anchor="middle" class="svg-ink" font-size="12">W</text>
<rect x="145" y="20" width="62" height="44" rx="6" fill="#bbf7d0"/><text x="176" y="47" text-anchor="middle" class="svg-ink" font-size="12">LP</text>
<rect x="215" y="20" width="62" height="44" rx="6" fill="#bae6fd"/><text x="246" y="47" text-anchor="middle" class="svg-ink" font-size="12">Local</text>
<rect x="285" y="20" width="62" height="44" rx="6" fill="#bae6fd"/><text x="316" y="47" text-anchor="middle" class="svg-ink" font-size="12">AS</text>
<rect x="355" y="20" width="62" height="44" rx="6" fill="#bae6fd"/><text x="386" y="47" text-anchor="middle" class="svg-ink" font-size="12">Origin</text>
<rect x="425" y="20" width="62" height="44" rx="6" fill="#bae6fd"/><text x="456" y="47" text-anchor="middle" class="svg-ink" font-size="12">MED</text>
<rect x="495" y="20" width="62" height="44" rx="6" fill="#bae6fd"/><text x="526" y="47" text-anchor="middle" class="svg-ink" font-size="12">eBGP</text>
<rect x="565" y="20" width="70" height="44" rx="6" fill="#bae6fd"/><text x="600" y="47" text-anchor="middle" class="svg-ink" font-size="12">IGP</text>
<text x="140" y="90" text-anchor="middle" class="svg-accent" font-size="12">zyada jeetta</text><line x1="75" y1="72" x2="207" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="425" y="90" text-anchor="middle" class="svg-accent" font-size="12">kam, chhota ya preferred type jeetta</text><line x1="215" y1="72" x2="635" y2="72" stroke="#64748b" stroke-width="2"/>
<rect x="160" y="115" width="320" height="40" rx="8" fill="#e2e8f0"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="12">phir oldest, lowest RID, cluster list, neighbor IP</text>
</svg><p class="cap">N WLLA OMNI, left se right. Pehla alag step faisla karta hai.</p></div>

<h3>Worked examples</h3>
<div class="eg"><p><b>Example 1: AS_PATH faisla karta hai.</b> CUST-EDGE ke paas 203.0.113.0/24 ke do paths hain: 100.64.10.1 via path <code>64500</code>, aur doosre provider 100.64.20.1 via path <code>64510 64500</code>. Weight 0 aur 0, local preference 100 aur 100, koi local nahi, AS_PATH length 1 vs 2. <b>Step 5</b> 100.64.10.1 chunta hai. Step 6 se aage kabhi check nahi hota.</p></div>
<div class="eg"><p><b>Example 2: weight sab kuch override karta hai.</b> Network team chahti hai ki saara traffic doosra provider use kare. Woh <code>neighbor 100.64.20.1 weight 200</code> configure karte hain. Ab <b>step 1</b> par weight 200 vs 0 hai, isliye 64510 wala lamba path jeetta hai, bhale hi uska AS_PATH lamba ho. Weight sirf CUST-EDGE par asar karta hai.</p></div>
<div class="eg"><p><b>Example 3: origin faisla karta hai.</b> 198.51.100.0/24 ke do paths, dono AS_PATH length 1 (<code>64500</code> aur <code>64510</code>), barabar weight aur local preference. Pehla <code>i</code> par khatam hota hai, doosra <code>?</code> par kyunki doosra provider ise redistribute karta hai. <b>Step 6</b>: IGP incomplete ko harata hai, isliye pehla path jeetta hai.</p></div>
<div class="eg"><p><b>Example 4: MED sirf ek AS ke andar.</b> <b>Same</b> provider AS 64500 ke do links 198.51.100.0/24 ko MED 50 aur MED 10 ke saath dete hain. Pehle ke saare steps tie hain, isliye <b>step 7</b> MED 10 chunta hai. Agar do paths AS 64500 aur AS 64510 se aate, to MED skip hota; dono eBGP hain, directly connected next hops tak IGP metric dono ka 0 hai, isliye <b>sabse purana</b> path jeetta hai, aur agar dono ek hi pal mein aaye to kam router ID faisla karta hai.</p></div>

<h3>Kis step ne faisla kiya, verify karna</h3>
<pre class="out">CUST-EDGE# show ip bgp 203.0.113.0
BGP routing table entry for 203.0.113.0/24, version 9
<span class="hl">Paths: (2 available, best #1, table default)</span>
  Refresh Epoch 1
  64510 64500
    100.64.20.1 from 100.64.20.1 (64.51.0.1)
<span class="hl">      Origin IGP, localpref 100, weight 200, valid, external, best</span>
  Refresh Epoch 1
  64500
    100.64.10.1 from 100.64.10.1 (64.50.0.1)
      Origin IGP, metric 0, localpref 100, valid, external</pre>
<p>Paths ki attribute lines ko algorithm ke upar se neeche tak compare karo. Pehla alag attribute, yahan weight 200, wajah hai.</p>

<div class="warn"><p><b>Common galti.</b> Yeh expect karna ki BGP default mein barabar paths par load-balance karega. Yeh <b>ek</b> best path install karta hai jab tak aap <code>maximum-paths</code> configure na karo, aur eBGP multipath ke liye paths ka weight, local preference, AS_PATH, origin, MED aur IGP metric match hona bhi zaroori hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Weight local preference se <b>pehle</b> aata hai, aur dono <b>zyada</b> prefer karte hain. AS_PATH origin se <b>pehle</b>, aur origin MED se <b>pehle</b>. Kai questions steps ko thode galat order mein dete hain; sahi pehle paanch hain weight, local preference, locally originated, AIGP, AS_PATH.</p></div>

<div class="scn"><h4>Traffic ne mehenga link liya</h4><p>Do ISPs wali ek company expect kar rahi thi ki outbound traffic sasta ISP-A use karega kyunki uske paths ek AS chhote the. Monitoring ne dikhaya ki zyada tar traffic ISP-B par tha. <code>show ip bgp</code> ne ISP-B ke har path par weight 100 dikhaya: migration test se bacha hua <code>neighbor ... weight 100</code>. Weight step 1 hai, isliye AS_PATH ko kabhi mauka hi nahi mila. Use hata kar <code>clear ip bgp ... soft in</code> chalane se traffic shift ho gaya.</p><p><b>Seekh:</b> jab choice galat lage, steps ko upar se walk karo; bhoola hua high-priority knob aam taur par wajah hota hai.</p></div>

<div class="iv"><p class="q">"BGP best-path selection samjhao."</p><p>Strong answer: pehle next hop reachable hona chahiye. Phir highest weight, highest local preference, locally originated, (AIGP), shortest AS_PATH, lowest origin (i &lt; e &lt; ?), lowest MED (default mein same padosi AS), eBGP over iBGP, next hop tak lowest IGP metric, phir sabse purana eBGP path, lowest router ID, shortest cluster list, lowest neighbor address. Mnemonic batao aur yeh ki weight local hai jabki local preference poore AS mein hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle valid next hop, phir: weight, local pref, locally originated, AIGP, AS_PATH, origin, MED, eBGP over iBGP, IGP metric.</li>
<li>Tie-breakers: sabse purana eBGP path, lowest router ID, shortest cluster list, lowest neighbor address.</li>
<li>Zyada sirf weight aur local preference mein jeetta hai; baaki mein kam ya chhota.</li>
<li>MED default mein sirf same padosi AS ke paths ke beech compare hota hai.</li>
<li><code>maximum-paths</code> configure kiye bina sirf ek best path install hota hai.</li>
</ul></div>
`}};export{e as default};