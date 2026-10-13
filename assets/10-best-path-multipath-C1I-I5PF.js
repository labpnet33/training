var e={id:`best-path`,h:{en:`Best-path selection step by step, and BGP multipath`,hi:`Best-path selection step by step, aur BGP multipath`},body:{en:`
<p>A cricket selector choosing between two openers does not add up a score for each player. He compares them on the most important criterion first; if one is clearly better, the decision is made. Only on a tie does he move to the next criterion. BGP best-path selection works exactly like that: an ordered list of tie-breakers, stopping at the <b>first difference</b>. ENCOR introduced the list; ENARSI expects you to apply it to real outputs, several steps deep.</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="The BGP best-path ladder">
<rect x="20" y="10" width="600" height="24" rx="6" fill="#e2e8f0"/><text x="320" y="27" text-anchor="middle" class="svg-ink" font-size="12">0. Next hop reachable, path valid (not inaccessible, not filtered)</text>
<rect x="20" y="38" width="600" height="24" rx="6" fill="#bae6fd"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="12">1. Highest weight (this router only)</text>
<rect x="20" y="66" width="600" height="24" rx="6" fill="#bae6fd"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="12">2. Highest local preference (whole AS)</text>
<rect x="20" y="94" width="600" height="24" rx="6" fill="#bae6fd"/><text x="320" y="111" text-anchor="middle" class="svg-ink" font-size="12">3. Locally originated (network, redistribute, aggregate)</text>
<rect x="20" y="122" width="600" height="24" rx="6" fill="#ddd6fe"/><text x="320" y="139" text-anchor="middle" class="svg-ink" font-size="12">4. Shortest AS_PATH</text>
<rect x="20" y="150" width="600" height="24" rx="6" fill="#ddd6fe"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="12">5. Lowest origin: i &lt; e &lt; ?</text>
<rect x="20" y="178" width="600" height="24" rx="6" fill="#ddd6fe"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">6. Lowest MED (same neighbor AS)</text>
<rect x="20" y="206" width="600" height="24" rx="6" fill="#fde68a"/><text x="320" y="223" text-anchor="middle" class="svg-ink" font-size="12">7. eBGP over iBGP</text>
<rect x="20" y="234" width="600" height="24" rx="6" fill="#fde68a"/><text x="320" y="251" text-anchor="middle" class="svg-ink" font-size="12">8. Lowest IGP metric to next hop (multipath decided here)</text>
<rect x="20" y="262" width="600" height="24" rx="6" fill="#bbf7d0"/><text x="320" y="279" text-anchor="middle" class="svg-ink" font-size="12">9. Oldest eBGP path, then lowest router ID (or ORIGINATOR_ID)</text>
<rect x="20" y="290" width="600" height="24" rx="6" fill="#bbf7d0"/><text x="320" y="307" text-anchor="middle" class="svg-ink" font-size="12">10. Shortest CLUSTER_LIST, then lowest neighbor address</text>
</svg><p class="cap">Walk down the ladder and stop at the first rung where the paths differ.</p></div>

<p>Memory aid: <b>"We Love Oranges AS Oranges Mean Pure Refreshment"</b>: Weight, Local preference, Originated, AS path, Origin, MED, Paths (eBGP over iBGP), Router ID. Remember the direction: weight and local preference <b>highest</b> wins; AS path, origin, MED and IGP metric <b>lowest</b> wins.</p>

<h3>Worked example 1: INC-5530, two paths on CORE</h3>
<p>After the NOC ticket is fixed, CORE (AS 65000) has two iBGP paths to the partner network 10.80.0.0/16: one from EDGE1 (router ID 10.255.1.1) and one from EDGE2 (10.255.1.2). Both next hops are loopbacks reached through static routes.</p>
<table class="cmp"><tr><th>Step</th><th>Via EDGE1</th><th>Via EDGE2</th><th>Result</th></tr>
<tr><td>0 next hop</td><td>10.255.1.1 reachable</td><td>10.255.1.2 reachable</td><td>both valid</td></tr>
<tr><td>1 weight</td><td>0</td><td>0</td><td>tie</td></tr>
<tr><td>2 local pref</td><td>100</td><td>100</td><td>tie</td></tr>
<tr><td>3 local origin</td><td>no</td><td>no</td><td>tie</td></tr>
<tr><td>4 AS path</td><td>64800 (1)</td><td>64800 (1)</td><td>tie</td></tr>
<tr><td>5 origin</td><td>i</td><td>i</td><td>tie</td></tr>
<tr><td>6 MED</td><td>0</td><td>0</td><td>tie</td></tr>
<tr><td>7 eBGP/iBGP</td><td>iBGP</td><td>iBGP</td><td>tie</td></tr>
<tr><td>8 IGP metric</td><td>0 (static)</td><td>0 (static)</td><td>tie</td></tr>
<tr><td>9 router ID</td><td><b>10.255.1.1</b></td><td>10.255.1.2</td><td><b>EDGE1 wins</b></td></tr>
</table>
<p>The oldest-path rule applies only to eBGP paths, so for two iBGP paths the decision falls through to the lowest router ID.</p>

<h3>Worked example 2: E1 before and after local preference</h3>
<p>Before the lab policy, E1 has 198.51.100.0/24 from Lumen-X (eBGP, path <code>64601 64602</code>) and from E2 (iBGP, path <code>64602</code>). Weight 0 and 0, local preference 100 and 100, neither local, then AS path length 2 versus 1: <b>E2's iBGP path wins at step 4</b>, before "eBGP over iBGP" is ever reached. After <code>set local-preference 200</code> on routes from Lumen-X, the decision moves up to step 2 and Lumen-X wins. This is why local preference is so powerful: it is checked before AS path length.</p>

<h3>Worked example 3: origin and MED</h3>
<p>R1 has two eBGP paths to 203.0.113.0/24, both path length 2. Path A: <code>64601 64700</code>, origin <code>?</code> (redistributed somewhere), MED 0. Path B: <code>64602 64700</code>, origin <code>i</code>, MED 50. Step 5 already decides: <b>origin i beats ?</b>, so B wins despite its higher MED. Even if origins were equal, MED would not be compared, because the paths come from different neighbor ASes (64601 and 64602) unless <code>bgp always-compare-med</code> is configured. Next would be eBGP versus eBGP (tie) and IGP metric (0 for both), and then the <b>oldest</b> eBGP path wins, which keeps routes stable.</p>

<h3>Reading the reason in the output</h3>
<pre class="out">CORE# show ip bgp 10.80.0.0
BGP routing table entry for 10.80.0.0/16, version 9
<span class="hl">Paths: (2 available, best #2, table default)</span>
  Not advertised to any peer
  Refresh Epoch 1
  64800
    10.255.1.2 from 10.255.1.2 (10.255.1.2)
      Origin IGP, metric 0, localpref 100, valid, internal
  Refresh Epoch 1
  64800
    10.255.1.1 from 10.255.1.1 (10.255.1.1)
<span class="hl">      Origin IGP, metric 0, localpref 100, valid, internal, best</span></pre>
<p>IOS does not print why a path won. You compare the attributes yourself, top to bottom, exactly as in the tables above; here every attribute line is identical, so the lower router ID in brackets decides.</p>

<h3>BGP multipath</h3>
<p>By default BGP installs <b>one</b> best path in the routing table. <code>maximum-paths</code> lets it install several equal paths for load sharing:</p>
<pre class="code">router bgp 65000
 maximum-paths 2          <span class="c">! up to 2 eBGP paths</span>
 maximum-paths ibgp 2     <span class="c">! up to 2 iBGP paths</span></pre>
<p>Paths qualify only if they tie on every step down to the IGP metric: same weight, local preference, AS-path length <b>and content</b>, origin, MED, the same type (all eBGP or all iBGP), equal IGP metric to the next hop, and different next hops. For eBGP paths from different neighbor ASes, <code>bgp bestpath as-path multipath-relax</code> relaxes the "same AS path content" rule to "same length". BGP still picks and advertises <b>one</b> best path; multipath only affects the local routing table.</p>
<pre class="out">CORE# show ip bgp | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
<span class="hl"> *mi 10.80.0.0/16     10.255.1.2               0    100      0 64800 i
 *&gt;i                  10.255.1.1               0    100      0 64800 i</span>
CORE# show ip route 10.80.0.0 | include from
  * 10.255.1.1, from 10.255.1.1, 00:01:10 ago
    10.255.1.2, from 10.255.1.2, 00:01:10 ago</pre>
<p>The <code>m</code> marks a multipath entry installed alongside the best (<code>&gt;</code>) path.</p>

<div class="warn"><p><b>Common mistakes.</b> Assuming "eBGP over iBGP" beats a shorter AS path; it is step 7, far below AS path. Comparing MED between different providers. Enabling <code>maximum-paths</code> and expecting eBGP and iBGP paths to be mixed (on IOS that needs <code>maximum-paths eibgp</code>, available only in a VRF address family). Forgetting that the paths must have different next hops.</p></div>

<div class="exam"><p><b>Exam traps.</b> Know the order and the direction of each step. Weight is before local preference. Locally originated beats any learned path at equal weight and local preference. Oldest path applies only to eBGP. For reflected routes, ORIGINATOR_ID replaces router ID and a shorter CLUSTER_LIST wins. Multipath does not change what is advertised.</p></div>

<div class="scn"><h4>Half the partner bandwidth sitting idle</h4><p>After INC-5530 was closed, the finance team complained that payment batches were slow. CORE sent all traffic to 10.80.0.0/16 through EDGE1, because EDGE1 had the lower router ID; EDGE2's link was idle. Both paths tied down to the IGP metric (static routes, metric 0), so <code>maximum-paths ibgp 2</code> on CORE installed both and traffic shared the two partner links.</p><p><b>Lesson:</b> when two paths tie until the router ID, multipath is often the intended design.</p></div>

<div class="iv"><p class="q">"Two iBGP paths have identical attributes. Which one wins and how can you use both?"</p><p>Walk the list aloud: weight, local preference, locally originated, AS path, origin, MED, eBGP over iBGP, IGP metric to next hop all tie, oldest path does not apply to iBGP, so the lowest router ID (or ORIGINATOR_ID for reflected routes) wins, then shortest cluster list and lowest neighbor address. To use both, configure <code>maximum-paths ibgp 2</code>, and state the equality requirements.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP stops at the first difference; the order matters more than the values.</li>
<li>Highest weight and local preference; lowest AS path, origin, MED and IGP metric.</li>
<li>Oldest path is an eBGP-only tie-breaker; iBGP ties fall to router ID.</li>
<li><code>maximum-paths</code> and <code>maximum-paths ibgp</code> install equal paths; <code>*m</code> marks them.</li>
<li>Multipath paths must tie down to the IGP metric and have different next hops.</li>
</ul></div>
`,hi:`
<p>Do openers mein se chunne wala cricket selector har player ka total score nahi jodta. Woh sabse important criterion par pehle compare karta hai; agar ek saaf behtar hai, to faisla ho gaya. Sirf tie hone par woh agle criterion par jaata hai. BGP best-path selection bilkul aisa hi hai: tie-breakers ki ordered list, <b>pehle farak</b> par ruk jaana. ENCOR ne list introduce ki; ENARSI expect karta hai ki aap ise real outputs par, kai steps gehrai tak lagao.</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="BGP best-path ladder">
<rect x="20" y="10" width="600" height="24" rx="6" fill="#e2e8f0"/><text x="320" y="27" text-anchor="middle" class="svg-ink" font-size="12">0. Next hop reachable, path valid (inaccessible nahi, filtered nahi)</text>
<rect x="20" y="38" width="600" height="24" rx="6" fill="#bae6fd"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="12">1. Sabse zyada weight (sirf yeh router)</text>
<rect x="20" y="66" width="600" height="24" rx="6" fill="#bae6fd"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="12">2. Sabse zyada local preference (poora AS)</text>
<rect x="20" y="94" width="600" height="24" rx="6" fill="#bae6fd"/><text x="320" y="111" text-anchor="middle" class="svg-ink" font-size="12">3. Locally originated (network, redistribute, aggregate)</text>
<rect x="20" y="122" width="600" height="24" rx="6" fill="#ddd6fe"/><text x="320" y="139" text-anchor="middle" class="svg-ink" font-size="12">4. Sabse chhota AS_PATH</text>
<rect x="20" y="150" width="600" height="24" rx="6" fill="#ddd6fe"/><text x="320" y="167" text-anchor="middle" class="svg-ink" font-size="12">5. Sabse kam origin: i &lt; e &lt; ?</text>
<rect x="20" y="178" width="600" height="24" rx="6" fill="#ddd6fe"/><text x="320" y="195" text-anchor="middle" class="svg-ink" font-size="12">6. Sabse kam MED (same neighbor AS)</text>
<rect x="20" y="206" width="600" height="24" rx="6" fill="#fde68a"/><text x="320" y="223" text-anchor="middle" class="svg-ink" font-size="12">7. eBGP iBGP se behtar</text>
<rect x="20" y="234" width="600" height="24" rx="6" fill="#fde68a"/><text x="320" y="251" text-anchor="middle" class="svg-ink" font-size="12">8. Next hop tak sabse kam IGP metric (multipath yahan decide)</text>
<rect x="20" y="262" width="600" height="24" rx="6" fill="#bbf7d0"/><text x="320" y="279" text-anchor="middle" class="svg-ink" font-size="12">9. Sabse purana eBGP path, phir sabse kam router ID (ya ORIGINATOR_ID)</text>
<rect x="20" y="290" width="600" height="24" rx="6" fill="#bbf7d0"/><text x="320" y="307" text-anchor="middle" class="svg-ink" font-size="12">10. Sabse chhoti CLUSTER_LIST, phir sabse kam neighbor address</text>
</svg><p class="cap">Seedhi par neeche chalo aur us pehle step par ruko jahan paths alag hon.</p></div>

<p>Yaad rakhne ka tareeka: <b>"We Love Oranges AS Oranges Mean Pure Refreshment"</b>: Weight, Local preference, Originated, AS path, Origin, MED, Paths (eBGP over iBGP), Router ID. Direction yaad rakho: weight aur local preference mein <b>sabse zyada</b> jeetta hai; AS path, origin, MED aur IGP metric mein <b>sabse kam</b> jeetta hai.</p>

<h3>Worked example 1: INC-5530, CORE par do paths</h3>
<p>NOC ticket fix hone ke baad CORE (AS 65000) ke paas partner network 10.80.0.0/16 ke do iBGP paths hain: ek EDGE1 (router ID 10.255.1.1) se aur ek EDGE2 (10.255.1.2) se. Dono next hops static routes se reach hone wale loopbacks hain.</p>
<table class="cmp"><tr><th>Step</th><th>EDGE1 se</th><th>EDGE2 se</th><th>Result</th></tr>
<tr><td>0 next hop</td><td>10.255.1.1 reachable</td><td>10.255.1.2 reachable</td><td>dono valid</td></tr>
<tr><td>1 weight</td><td>0</td><td>0</td><td>tie</td></tr>
<tr><td>2 local pref</td><td>100</td><td>100</td><td>tie</td></tr>
<tr><td>3 local origin</td><td>nahi</td><td>nahi</td><td>tie</td></tr>
<tr><td>4 AS path</td><td>64800 (1)</td><td>64800 (1)</td><td>tie</td></tr>
<tr><td>5 origin</td><td>i</td><td>i</td><td>tie</td></tr>
<tr><td>6 MED</td><td>0</td><td>0</td><td>tie</td></tr>
<tr><td>7 eBGP/iBGP</td><td>iBGP</td><td>iBGP</td><td>tie</td></tr>
<tr><td>8 IGP metric</td><td>0 (static)</td><td>0 (static)</td><td>tie</td></tr>
<tr><td>9 router ID</td><td><b>10.255.1.1</b></td><td>10.255.1.2</td><td><b>EDGE1 jeeta</b></td></tr>
</table>
<p>Oldest-path rule sirf eBGP paths par lagta hai, isliye do iBGP paths ke liye faisla sabse kam router ID tak girta hai.</p>

<h3>Worked example 2: local preference se pehle aur baad E1</h3>
<p>Lab policy se pehle E1 ke paas 198.51.100.0/24 Lumen-X se (eBGP, path <code>64601 64602</code>) aur E2 se (iBGP, path <code>64602</code>) hai. Weight 0 aur 0, local preference 100 aur 100, koi local nahi, phir AS path length 2 versus 1: <b>E2 ka iBGP path step 4 par jeet jaata hai</b>, "eBGP over iBGP" tak pahunchne se pehle hi. Lumen-X se aaye routes par <code>set local-preference 200</code> ke baad faisla step 2 par aa jaata hai aur Lumen-X jeetta hai. Isiliye local preference itna powerful hai: woh AS path length se pehle check hota hai.</p>

<h3>Worked example 3: origin aur MED</h3>
<p>R1 ke paas 203.0.113.0/24 ke do eBGP paths hain, dono path length 2. Path A: <code>64601 64700</code>, origin <code>?</code> (kahin redistribute hua), MED 0. Path B: <code>64602 64700</code>, origin <code>i</code>, MED 50. Step 5 hi faisla kar deta hai: <b>origin i, ? ko harata hai</b>, isliye B zyada MED ke bawajood jeetta hai. Agar origins barabar hote tab bhi MED compare nahi hota, kyunki paths alag neighbor ASes (64601 aur 64602) se aate hain, jab tak <code>bgp always-compare-med</code> configured na ho. Uske baad eBGP versus eBGP (tie) aur IGP metric (dono ka 0) aata, aur phir <b>sabse purana</b> eBGP path jeetta, jo routes ko stable rakhta hai.</p>

<h3>Output mein wajah padhna</h3>
<pre class="out">CORE# show ip bgp 10.80.0.0
BGP routing table entry for 10.80.0.0/16, version 9
<span class="hl">Paths: (2 available, best #2, table default)</span>
  Not advertised to any peer
  Refresh Epoch 1
  64800
    10.255.1.2 from 10.255.1.2 (10.255.1.2)
      Origin IGP, metric 0, localpref 100, valid, internal
  Refresh Epoch 1
  64800
    10.255.1.1 from 10.255.1.1 (10.255.1.1)
<span class="hl">      Origin IGP, metric 0, localpref 100, valid, internal, best</span></pre>
<p>IOS yeh print nahi karta ki path kyun jeeta. Aap attributes khud upar se neeche compare karte ho, bilkul upar ki tables ki tarah; yahan har attribute line same hai, isliye brackets mein diya kam router ID faisla karta hai.</p>

<h3>BGP multipath</h3>
<p>Default mein BGP routing table mein <b>ek</b> best path install karta hai. <code>maximum-paths</code> use load sharing ke liye kai barabar paths install karne deta hai:</p>
<pre class="code">router bgp 65000
 maximum-paths 2          <span class="c">! 2 tak eBGP paths</span>
 maximum-paths ibgp 2     <span class="c">! 2 tak iBGP paths</span></pre>
<p>Paths tabhi qualify karte hain jab woh IGP metric tak har step par tie hon: same weight, local preference, AS-path length <b>aur content</b>, origin, MED, same type (sab eBGP ya sab iBGP), next hop tak barabar IGP metric, aur alag next hops. Alag neighbor ASes se aaye eBGP paths ke liye <code>bgp bestpath as-path multipath-relax</code> "same AS path content" rule ko "same length" tak dheela kar deta hai. BGP phir bhi <b>ek</b> best path chunta aur advertise karta hai; multipath sirf local routing table ko affect karta hai.</p>
<pre class="out">CORE# show ip bgp | begin Network
     Network          Next Hop            Metric LocPrf Weight Path
<span class="hl"> *mi 10.80.0.0/16     10.255.1.2               0    100      0 64800 i
 *&gt;i                  10.255.1.1               0    100      0 64800 i</span>
CORE# show ip route 10.80.0.0 | include from
  * 10.255.1.1, from 10.255.1.1, 00:01:10 ago
    10.255.1.2, from 10.255.1.2, 00:01:10 ago</pre>
<p><code>m</code> us multipath entry ko mark karta hai jo best (<code>&gt;</code>) path ke saath install hui.</p>

<div class="warn"><p><b>Common galtiyan.</b> Yeh maanna ki "eBGP over iBGP" chhote AS path ko harata hai; woh step 7 hai, AS path se kaafi neeche. Alag providers ke beech MED compare karna. <code>maximum-paths</code> enable karke eBGP aur iBGP paths mix hone ki umeed (IOS par iske liye <code>maximum-paths eibgp</code> chahiye, jo sirf VRF address family mein milta hai). Yeh bhoolna ki paths ke next hops alag hone chahiye.</p></div>

<div class="exam"><p><b>Exam traps.</b> Order aur har step ki direction yaad rakho. Weight local preference se pehle hai. Barabar weight aur local preference par locally originated kisi bhi learned path ko harata hai. Oldest path sirf eBGP par lagta hai. Reflected routes ke liye ORIGINATOR_ID router ID ki jagah leta hai aur chhoti CLUSTER_LIST jeetti hai. Multipath advertise hone wali cheez nahi badalta.</p></div>

<div class="scn"><h4>Partner bandwidth ka aadha hissa bekaar pada tha</h4><p>INC-5530 close hone ke baad finance team ne shikayat ki ki payment batches slow hain. CORE 10.80.0.0/16 ka saara traffic EDGE1 se bhej raha tha, kyunki EDGE1 ka router ID kam tha; EDGE2 ka link khaali tha. Dono paths IGP metric tak tie the (static routes, metric 0), isliye CORE par <code>maximum-paths ibgp 2</code> ne dono install kiye aur traffic dono partner links par bant gaya.</p><p><b>Seekh:</b> jab do paths router ID tak tie hon, to aksar multipath hi intended design hota hai.</p></div>

<div class="iv"><p class="q">"Do iBGP paths ke attributes bilkul same hain. Kaun jeetega aur dono ko kaise use karoge?"</p><p>List bol kar chalo: weight, local preference, locally originated, AS path, origin, MED, eBGP over iBGP, next hop tak IGP metric sab tie, oldest path iBGP par lagta nahi, isliye sabse kam router ID (reflected routes ke liye ORIGINATOR_ID) jeetta hai, phir sabse chhoti cluster list aur sabse kam neighbor address. Dono use karne ke liye <code>maximum-paths ibgp 2</code> configure karo, aur equality requirements batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>BGP pehle farak par rukta hai; values se zyada order matter karta hai.</li>
<li>Sabse zyada weight aur local preference; sabse kam AS path, origin, MED aur IGP metric.</li>
<li>Oldest path sirf eBGP ka tie-breaker hai; iBGP ties router ID par girte hain.</li>
<li><code>maximum-paths</code> aur <code>maximum-paths ibgp</code> barabar paths install karte hain; <code>*m</code> unhe mark karta hai.</li>
<li>Multipath paths IGP metric tak tie hone chahiye aur unke next hops alag hone chahiye.</li>
</ul></div>
`}};export{e as default};