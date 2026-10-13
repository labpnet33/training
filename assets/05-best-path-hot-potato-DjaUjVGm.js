var e=(e,t,n,r)=>`<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Hot potato routing"><rect x="20" y="85" width="100" height="44" rx="8" fill="#fde68a"/><text x="70" y="112" text-anchor="middle" class="svg-ink" font-size="13">Customer</text><rect x="270" y="85" width="100" height="44" rx="8" fill="#bae6fd"/><text x="320" y="112" text-anchor="middle" class="svg-ink" font-size="13">R1 (ingress)</text><rect x="480" y="20" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="47" text-anchor="middle" class="svg-ink" font-size="13">Exit A</text><rect x="480" y="150" width="110" height="44" rx="8" fill="#bbf7d0"/><text x="535" y="177" text-anchor="middle" class="svg-ink" font-size="13">Exit B</text><line x1="120" y1="107" x2="270" y2="107" stroke="#64748b" stroke-width="2"/><line x1="370" y1="95" x2="480" y2="45" stroke="#64748b" stroke-width="2"/><line x1="370" y1="119" x2="480" y2="170" stroke="#64748b" stroke-width="2"/><text x="440" y="62" class="svg-accent" font-size="12">`+t+`</text><text x="440" y="150" class="svg-muted" font-size="12">`+n+`</text><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">`+r+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`best-path-hot-potato`,h:{en:`BGP best-path selection and hot-potato routing`,hi:`BGP best-path selection aur hot-potato routing`},body:{en:`
<p>When a router hears the same prefix from several neighbours, it must choose one best path. BGP does not use a single metric. It walks an ordered list of tie-breakers and stops at the first difference. For an SP engineer the list matters because it tells you which knob to turn to move traffic: weight for one router, LOCAL_PREF for the whole AS, MED for a neighbouring AS, and the IGP metric for the natural "closest exit" choice.</p>

<h3>The Cisco IOS XE decision order</h3>
<ol>
<li>Path must be <b>valid</b>: the next hop must be reachable (this is why a route without <code>&gt;</code> is not best).</li>
<li>Highest <b>weight</b> (Cisco-only, local to the router, not advertised).</li>
<li>Highest <b>LOCAL_PREF</b> (default 100, shared across the AS).</li>
<li><b>Locally originated</b> paths (network, redistribute, aggregate) over learned ones.</li>
<li>Shortest <b>AS_PATH</b>.</li>
<li>Lowest <b>ORIGIN</b> code: IGP (i) before EGP (e) before incomplete (?).</li>
<li>Lowest <b>MED</b>, compared only between paths from the same neighbouring AS (unless <code>bgp always-compare-med</code>).</li>
<li><b>eBGP</b> path over an iBGP path.</li>
<li>Lowest <b>IGP metric to the next hop</b>.</li>
<li>If still tied: oldest eBGP path, lowest router ID (the ORIGINATOR_ID for reflected routes), shortest CLUSTER_LIST, lowest neighbour address.</li>
</ol>
<p>A memory hook used in classes: <b>W</b>e <b>L</b>ove <b>O</b>ranges <b>A</b>s <b>O</b>ften <b>M</b>ore <b>N</b>ice (Weight, LOCAL_PREF, Originate, AS_PATH, Origin, MED, Neighbour type, then IGP metric). Learn the order and also learn <i>why</i> each step exists.</p>

@@D@@

<h3>Hot-potato routing: step 9 in practice</h3>
<p>Inside one AS the IGP metric to the next hop decides between otherwise equal exits. Each router uses <i>its own</i> IGP distance, so different routers can pick different exits for the same prefix. This is <b>hot-potato routing</b>: hand the packet to the neighbour AS as soon as possible. The SP carries the traffic the shortest distance, which is cheap. It is also the reason an RR can give a client a path that the client would not itself have chosen.</p>
<p>You can see the effect in the lab, where the same BGP route has a different "metric" on different routers. On the RR (one hop from PE1) the metric is 10, on PE2 (two hops) it is 20:</p>
<pre class="out">RR# show ip bgp 172.16.1.0
  65101
    10.20.255.1 (metric <span class="hl">10</span>) from 10.20.255.1 (10.20.255.1)
      Origin IGP, metric 0, localpref 100, weight 0, valid, internal, best

PE2# show ip bgp 172.16.1.0
  65101
    10.20.255.1 (metric <span class="hl">20</span>) from 10.20.255.2 (10.20.255.2)
      Origin IGP, metric 0, localpref 100, weight 0, valid, internal, best
      Originator: 10.20.255.1, Cluster list: 10.20.255.2</pre>
<p>The "(metric N)" in <code>show ip bgp</code> is the IS-IS cost to the next hop. The second "metric 0" on the Origin line is the MED. Do not confuse them. Also note that on the RR the line says <i>from 10.20.255.1</i> (the client), and on PE2 it says <i>from 10.20.255.2</i> (the reflector) with the originator preserved.</p>

<div class="eg"><p><b>Worked example.</b> Prefix 203.0.113.0/24 is learned at two edge routers, PE-X and PE-Y, both with LOCAL_PREF 100, AS_PATH length 2, origin IGP, MED 0. Core router R sees IS-IS cost 30 to PE-X and 50 to PE-Y, both iBGP. Steps 2 to 8 tie. Step 9 picks PE-X (30 less than 50). If the operator sets LOCAL_PREF 200 on PE-Y routes, step 3 overrides everything below it and R uses PE-Y even though it is farther.</p></div>

<h3>Which knob for which job</h3>
<table class="cmp"><tr><th>Goal</th><th>Knob</th><th>Scope</th></tr>
<tr><td>Prefer one exit for all routers in my AS</td><td>LOCAL_PREF</td><td>AS-wide, sent over iBGP</td></tr>
<tr><td>Prefer a path only on this router</td><td>weight</td><td>local, never advertised</td></tr>
<tr><td>Ask the neighbour AS to enter at a chosen link</td><td>MED (or AS_PATH prepend)</td><td>to a neighbour AS</td></tr>
<tr><td>Closest exit by default</td><td>IGP metric</td><td>per router</td></tr></table>

<h3>Multipath and a few extras (reference configuration)</h3>
<pre class="code"><span class="c">! Reference configuration, not captured from the simulator</span>
router bgp 65000
 bgp bestpath med missing-as-worst
 bgp deterministic-med
 maximum-paths ibgp 2</pre>
<p>With <code>maximum-paths ibgp 2</code> two iBGP paths that tie through step 9 (equal IGP metric and equal attributes up to there) are both installed. <code>bgp deterministic-med</code> makes MED comparison independent of the order paths arrived, which prevents route oscillation. The next hop of each path must still be reachable.</p>

<div class="warn"><p><b>Common mistakes.</b> Reading the "metric" next to the next hop as MED. Setting weight and expecting other routers to follow (it is local). Forgetting that LOCAL_PREF is not sent to eBGP neighbours.</p></div>
<div class="exam"><p><b>Exam trap.</b> The order is weight, LOCAL_PREF, locally originated, AS_PATH, origin, MED, eBGP over iBGP, IGP metric. A frequent distractor puts MED before AS_PATH. Also: MED is compared only between the same neighbouring AS by default.</p></div>

<div class="scn"><h4>Why Mumbai traffic left from Chennai</h4><p>Traffic to a partner network entered in Mumbai but left the carrier in Chennai, doubling the latency. Both PEs had equal LOCAL_PREF and AS_PATH, but the Chennai path had been given LOCAL_PREF 200 by an old policy. Removing the policy let step 9 (IGP metric) choose Mumbai again.</p><p><b>Lesson:</b> when a path looks wrong, walk the decision list from the top; the first difference is the reason.</p></div>

<div class="iv"><p class="q">"Walk me through BGP best-path selection and where the IGP fits in."</p><p>Reachable next hop, weight, LOCAL_PREF, locally originated, shortest AS_PATH, lowest origin, lowest MED, eBGP over iBGP, then lowest IGP metric to the next hop, followed by oldest path, lowest router ID, shortest cluster list and lowest neighbour address. The IGP metric gives hot-potato routing: the closest exit from each router's point of view.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Best path is an ordered tie-break, not one metric.</li>
<li>LOCAL_PREF steers the whole AS; weight is local; MED asks a neighbour AS.</li>
<li>IGP metric to the next hop gives hot-potato routing.</li>
<li>"(metric N)" in <code>show ip bgp</code> is the IGP cost to the next hop.</li>
<li>maximum-paths ibgp installs ties; deterministic-med avoids oscillation.</li>
</ul></div>
`.replace(`@@D@@`,e(`From R1 both exits are equal until step 9, where the IGP metric decides.`,`Exit A: IGP cost 30`,`Exit B: IGP cost 50`,`Same LOCAL_PREF, AS_PATH, MED: R1 chooses Exit A (lower IGP cost)`)),hi:`
<p>Jab router ek hi prefix kai neighbours se sunta hai, use ek best path chunna padta hai. BGP ek akela metric use nahi karta. Woh tie-breakers ki ordered list chalata hai aur pehle farak par ruk jaata hai. SP engineer ke liye list isliye zaroori hai ki woh batati hai traffic hilane ke liye kaunsa knob ghumana hai: ek router ke liye weight, poore AS ke liye LOCAL_PREF, neighbouring AS ke liye MED, aur natural "closest exit" ke liye IGP metric.</p>

<h3>Cisco IOS XE decision order</h3>
<ol>
<li>Path <b>valid</b> ho: next hop reachable ho (isliye <code>&gt;</code> ke bina route best nahi hota).</li>
<li>Sabse zyada <b>weight</b> (sirf Cisco, router ke liye local, advertise nahi hota).</li>
<li>Sabse zyada <b>LOCAL_PREF</b> (default 100, poore AS mein shared).</li>
<li><b>Locally originated</b> paths (network, redistribute, aggregate) learned paths se pehle.</li>
<li>Sabse chhota <b>AS_PATH</b>.</li>
<li>Sabse kam <b>ORIGIN</b> code: IGP (i), phir EGP (e), phir incomplete (?).</li>
<li>Sabse kam <b>MED</b>, sirf same neighbouring AS ke paths ke beech compare (jab tak <code>bgp always-compare-med</code> na ho).</li>
<li><b>eBGP</b> path iBGP path se behtar.</li>
<li>Next hop tak sabse kam <b>IGP metric</b>.</li>
<li>Phir bhi tie ho to: sabse purana eBGP path, sabse kam router ID (reflected routes ke liye ORIGINATOR_ID), sabse chhoti CLUSTER_LIST, sabse kam neighbour address.</li>
</ol>
<p>Classes mein use hone wala memory hook: <b>W</b>e <b>L</b>ove <b>O</b>ranges <b>A</b>s <b>O</b>ften <b>M</b>ore <b>N</b>ice (Weight, LOCAL_PREF, Originate, AS_PATH, Origin, MED, Neighbour type, phir IGP metric). Order seekho aur yeh bhi seekho ki har step <i>kyun</i> hai.</p>

@@D@@

<h3>Hot-potato routing: step 9 practice mein</h3>
<p>Ek AS ke andar bhi barabar exits ke beech IGP metric to next hop decide karta hai. Har router <i>apni</i> IGP distance use karta hai, isliye alag routers ek hi prefix ke liye alag exits chun sakte hain. Isse <b>hot-potato routing</b> kehte hain: packet ko jitni jaldi ho sake neighbour AS ko de do. SP traffic ko sabse chhoti distance tak le jaata hai, jo sasta hai. Isi wajah se RR client ko aisa path de sakta hai jo client khud nahi chunta.</p>
<p>Lab mein asar dekh sakte ho, jahan wahi BGP route alag routers par alag "metric" dikhata hai. RR par (PE1 se ek hop) metric 10 hai, PE2 par (do hops) 20:</p>
<pre class="out">RR# show ip bgp 172.16.1.0
  65101
    10.20.255.1 (metric <span class="hl">10</span>) from 10.20.255.1 (10.20.255.1)
      Origin IGP, metric 0, localpref 100, weight 0, valid, internal, best

PE2# show ip bgp 172.16.1.0
  65101
    10.20.255.1 (metric <span class="hl">20</span>) from 10.20.255.2 (10.20.255.2)
      Origin IGP, metric 0, localpref 100, weight 0, valid, internal, best
      Originator: 10.20.255.1, Cluster list: 10.20.255.2</pre>
<p><code>show ip bgp</code> mein "(metric N)" next hop tak IS-IS cost hai. Origin line ka doosra "metric 0" MED hai. In dono ko confuse mat karo. Yeh bhi dekho ki RR par line kehti hai <i>from 10.20.255.1</i> (client), aur PE2 par <i>from 10.20.255.2</i> (reflector) originator preserve ke saath.</p>

<div class="eg"><p><b>Worked example.</b> Prefix 203.0.113.0/24 do edge routers, PE-X aur PE-Y, par seekha gaya, dono ka LOCAL_PREF 100, AS_PATH length 2, origin IGP, MED 0. Core router R ko PE-X tak IS-IS cost 30 aur PE-Y tak 50 dikhti hai, dono iBGP. Steps 2 se 8 tie hote hain. Step 9 PE-X chunta hai (30, 50 se kam). Agar operator PE-Y ke routes par LOCAL_PREF 200 set kare to step 3 neeche ke sab par bhaari padta hai aur R PE-Y use karta hai bhale hi woh door ho.</p></div>

<h3>Kaunsa knob kis kaam ke liye</h3>
<table class="cmp"><tr><th>Goal</th><th>Knob</th><th>Scope</th></tr>
<tr><td>Mere AS ke saare routers ek exit prefer karein</td><td>LOCAL_PREF</td><td>AS-wide, iBGP par bheja jaata hai</td></tr>
<tr><td>Sirf is router par ek path prefer karo</td><td>weight</td><td>local, kabhi advertise nahi hota</td></tr>
<tr><td>Neighbour AS se kaho ki chune hue link par enter kare</td><td>MED (ya AS_PATH prepend)</td><td>neighbour AS ko</td></tr>
<tr><td>Default mein closest exit</td><td>IGP metric</td><td>per router</td></tr></table>

<h3>Multipath aur kuch extras (reference configuration)</h3>
<pre class="code"><span class="c">! Reference configuration, simulator se capture nahi kiya</span>
router bgp 65000
 bgp bestpath med missing-as-worst
 bgp deterministic-med
 maximum-paths ibgp 2</pre>
<p><code>maximum-paths ibgp 2</code> ke saath do iBGP paths jo step 9 tak tie hon (equal IGP metric aur wahan tak equal attributes) dono install hote hain. <code>bgp deterministic-med</code> MED comparison ko paths ke aane ke order se independent banata hai, jisse route oscillation rukta hai. Har path ka next hop phir bhi reachable hona chahiye.</p>

<div class="warn"><p><b>Common mistakes.</b> Next hop ke saath likhe "metric" ko MED padhna. Weight set karke ummeed karna ki doosre routers follow karein (yeh local hai). Bhoolna ki LOCAL_PREF eBGP neighbours ko nahi bheja jaata.</p></div>
<div class="exam"><p><b>Exam trap.</b> Order hai weight, LOCAL_PREF, locally originated, AS_PATH, origin, MED, eBGP over iBGP, IGP metric. Aam distractor MED ko AS_PATH se pehle rakhta hai. Aur: MED default mein sirf same neighbouring AS ke beech compare hota hai.</p></div>

<div class="scn"><h4>Mumbai ka traffic Chennai se kyun nikla</h4><p>Partner network ka traffic Mumbai mein enter hua par carrier se Chennai mein nikla, jisse latency double ho gayi. Dono PEs ka LOCAL_PREF aur AS_PATH barabar tha, par Chennai path ko ek purani policy ne LOCAL_PREF 200 de diya tha. Policy hatane se step 9 (IGP metric) ne phir Mumbai chuna.</p><p><b>Lesson:</b> jab path galat lage, decision list ko upar se chalo; pehla farak hi wajah hai.</p></div>

<div class="iv"><p class="q">"BGP best-path selection samjhao aur batao IGP kahan fit hota hai."</p><p>Reachable next hop, weight, LOCAL_PREF, locally originated, sabse chhota AS_PATH, sabse kam origin, sabse kam MED, eBGP over iBGP, phir next hop tak sabse kam IGP metric, uske baad sabse purana path, sabse kam router ID, sabse chhoti cluster list aur sabse kam neighbour address. IGP metric hot-potato routing deta hai: har router ke nazariye se sabse paas wala exit.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Best path ordered tie-break hai, ek metric nahi.</li>
<li>LOCAL_PREF poore AS ko steer karta hai; weight local hai; MED neighbour AS se kehta hai.</li>
<li>Next hop tak IGP metric hot-potato routing deta hai.</li>
<li><code>show ip bgp</code> mein "(metric N)" next hop tak IGP cost hai.</li>
<li>maximum-paths ibgp ties install karta hai; deterministic-med oscillation rokta hai.</li>
</ul></div>
`.replace(`@@D@@`,e(`R1 se dono exits step 9 tak barabar hain, jahan IGP metric decide karta hai.`,`Exit A: IGP cost 30`,`Exit B: IGP cost 50`,`LOCAL_PREF, AS_PATH, MED same: R1 Exit A chunta hai (kam IGP cost)`))}};export{t as default};