var e={id:`multipoint-problems`,h:{en:`Multi-point redistribution problems: suboptimal paths and loops`,hi:`Multi-point redistribution problems: suboptimal paths aur loops`},body:{en:`
<p>Two villages are joined by two bridges. A story leaves village A over the north bridge, is told in village B, and walks back over the south bridge. Now village A hears its own story, but told by strangers from B, and some people believe the stranger's version more than the original. That is <b>route feedback</b>. With two or more redistribution points it is not a rare accident; it is the default behaviour unless you stop it. This chapter dissects every failure it causes, using the module topology.</p>

<h3>Problem 1: suboptimal routing caused by AD</h3>
<p>Follow the Delhi partner network 192.168.50.0/24, an EIGRP external route (E1 redistributes it from Loopback1).</p>
<ol>
<li>Both boundary routers learn it as <b>D EX, AD 170</b> from E1.</li>
<li>BR2 redistributes it into OSPF first. O1 floods a type-5 LSA; BR1 receives it as <b>O E2, AD 110</b>.</li>
<li>BR1 compares AD: 110 beats 170. BR1 installs the OSPF copy and routes 192.168.50.0/24 via O1, BR2 and E1: three hops instead of one.</li>
<li>Because BR1's RIB entry is now OSPF, <code>redistribute eigrp 100</code> on BR1 no longer exports it. Only BR2 advertises it into OSPF; the redundancy you built exists only on paper.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Suboptimal path from BR1">
<rect x="40" y="105" width="110" height="46" rx="8" fill="#bae6fd"/><text x="95" y="133" text-anchor="middle" class="svg-ink" font-size="14">E1</text>
<rect x="265" y="30" width="110" height="46" rx="8" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="14">BR1</text>
<rect x="265" y="180" width="110" height="46" rx="8" fill="#fde68a"/><text x="320" y="208" text-anchor="middle" class="svg-ink" font-size="14">BR2</text>
<rect x="490" y="105" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="545" y="133" text-anchor="middle" class="svg-ink" font-size="14">O1</text>
<line x1="150" y1="118" x2="265" y2="60" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="150" y1="140" x2="265" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="375" y1="60" x2="490" y2="118" stroke="#64748b" stroke-width="2"/>
<line x1="375" y1="200" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="190" y="75" text-anchor="end" class="svg-muted" font-size="12">best path, unused</text>
<text x="450" y="75" class="svg-accent" font-size="12">1</text><text x="450" y="185" class="svg-accent" font-size="12">2</text><text x="200" y="190" class="svg-accent" font-size="12">3</text>
<text x="320" y="252" text-anchor="middle" class="svg-muted" font-size="12">BR1 to 192.168.50.0/24: O E2 (AD 110) beats D EX (AD 170)</text>
</svg><p class="cap">BR1 trusts the OSPF copy of an EIGRP external route and sends traffic around the ring; hops 1, 2, 3 match the lab 2 traceroute.</p></div>

<pre class="out">BR1#traceroute 192.168.50.1
Type escape sequence to abort.
Tracing the route to 192.168.50.1
VRF info: (vrf in name/id, vrf out name/id)
<span class="hl">  1 10.2.1.1 1 msec 1 msec 1 msec</span>
  2 10.2.2.2 1 msec 2 msec 1 msec
  3 10.1.2.1 2 msec *  2 msec</pre>
<p>Hop 1 is O1 (10.2.1.1): the first answer in lab 2. Note that EIGRP <b>internal</b> routes such as 172.16.10.0/24 do not suffer, because AD 90 beats 110. The problem hits routes that are external in their home protocol: EIGRP externals, and in other designs RIP routes (120) versus OSPF or anything versus eBGP (20).</p>

<h3>Problem 2: route feedback and a persistent loop</h3>
<p>BR1 holds 192.168.50.0/24 as OSPF, and it redistributes OSPF into EIGRP. Without tags, it injects Delhi's own network back into Delhi. Now imagine Loopback1 on E1 goes down.</p>
<ol>
<li>E1 loses the connected route. EIGRP still has the feedback path via BR1 (chapter 9, step 3), so E1 installs D EX 192.168.50.0/24 via BR1.</li>
<li>E1 advertises it to BR2 (split horizon only stops it towards BR1). BR2 keeps its D EX route and keeps redistributing it into OSPF.</li>
<li>O1 keeps the LSA and forwards to BR2; BR1 keeps its O E2 route via O1 and keeps feeding EIGRP.</li>
<li>Result: a network that no longer exists stays in both domains, and packets for it circle E1, BR1, O1, BR2, E1 until the TTL expires.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Redistribution feedback loop">
<rect x="40" y="100" width="110" height="46" rx="8" fill="#bae6fd"/><text x="95" y="128" text-anchor="middle" class="svg-ink" font-size="14">E1</text>
<rect x="265" y="25" width="110" height="46" rx="8" fill="#fde68a"/><text x="320" y="53" text-anchor="middle" class="svg-ink" font-size="14">BR1</text>
<rect x="265" y="175" width="110" height="46" rx="8" fill="#fde68a"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="14">BR2</text>
<rect x="490" y="100" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="545" y="128" text-anchor="middle" class="svg-ink" font-size="14">O1</text>
<line x1="150" y1="112" x2="265" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="375" y1="55" x2="490" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="135" x2="375" y2="195" stroke="#64748b" stroke-width="2"/>
<line x1="265" y1="195" x2="150" y2="135" stroke="#64748b" stroke-width="2"/>
<text x="200" y="70" text-anchor="end" class="svg-accent" font-size="12">packets</text>
<text x="450" y="70" class="svg-accent" font-size="12">packets</text>
<text x="450" y="190" class="svg-accent" font-size="12">packets</text>
<text x="200" y="190" text-anchor="end" class="svg-accent" font-size="12">packets</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Lo1 is down, route lives on</text>
</svg><p class="cap">Without tags, a withdrawn network keeps circulating between the two domains and traffic loops until TTL expiry.</p></div>

<h3>Problem 3: lost metrics and misleading seeds</h3>
<p>A seed metric replaces the route's real cost. In lab 1 the feedback copy of 192.168.50.0/24 arrived at E1 with metric 51,456, better than the genuine connected route's 128,256. Any router that compares only EIGRP metrics could prefer a path through the other domain. Seed metrics should be <b>worse</b> than real internal paths; a common rule is to use a seed that looks like a slow link.</p>

<h3>Problem 4: oscillation</h3>
<p>Because a boundary router stops redistributing a prefix as soon as it installs the other protocol's copy, the two boundary routers can take turns: BR1 withdraws its type-5 LSA, BR2's copy wins everywhere, then a change on BR2 flips the preference again. <code>debug ip routing</code> shows the same prefix being added and deleted every few seconds. Stable AD and tag policy removes the cause.</p>

<div class="eg"><p><b>Worked example: which prefixes are at risk?</b> In the module topology, list each prefix with its AD at the boundary routers. 172.16.10.0/24: D (90) versus O E2 copy (110), safe. 192.168.50.0/24: D EX (170) versus O E2 copy (110), <b>at risk</b>. 10.200.10.0/24: O (110) versus D EX copy (170), safe. 10.200.1.0/24: O (110), safe. Only prefixes whose original AD is worse than the copy's AD in the other protocol can be pulled the wrong way. That quick table predicts the lab 2 ticket before you run a single command.</p></div>

<h3>The toolbox</h3>
<table class="cmp"><tr><th>Problem</th><th>Primary fix</th><th>Also useful</th></tr>
<tr><td>Feedback of routes into their origin</td><td>Tag on exit, deny tag on entry (chapter 11)</td><td>Prefix lists that deny the domain's own ranges</td></tr>
<tr><td>AD-based suboptimal routing</td><td><code>distance ospf external 171</code> or per-source distance</td><td>distribute-list by tag inbound on boundary routers</td></tr>
<tr><td>Misleading seed metrics</td><td>Seeds worse than internal paths</td><td>Filtering, E1 metric type for consistent OSPF costs</td></tr>
<tr><td>Oscillation</td><td>Consistent AD and tags on all boundary routers</td><td>Summarise at the boundary to reduce churn</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Fixing only the symptom router. The lab 2 ticket names BR1, but the policy (distance and tags) must be identical on BR1 and BR2. Otherwise the problem flips to BR2 the next time the redistribution race goes the other way, for example after a reload.</p></div>

<div class="exam"><p><b>Exam trap.</b> Tags stop feedback (re-redistribution) but <b>not</b> AD-based suboptimal routing: in lab 2 the tags are already in place and BR1 still takes the long path. The two problems need two different fixes.</p></div>

<div class="scn"><h4>The ghost subnet</h4><p>A manufacturing plant decommissioned the 10.44.0.0/24 camera network, but the NOC still saw it in both RIP and OSPF a week later, and a ping to 10.44.0.1 produced "TTL expired in transit" from alternating routers. The two plant boundary routers ran mutual RIP and OSPF redistribution without tags. The route was feeding itself between the protocols. Adding tag-based deny route maps on both boundary routers made the ghost vanish within one update interval.</p><p><b>Lesson:</b> a route that outlives its network, plus TTL-expired errors between boundary routers, means redistribution feedback.</p></div>

<div class="iv"><p class="q">"Describe the problems that appear with mutual redistribution at two points and how you would prevent them."</p><p>Strong answer: first, route feedback, where a route leaves a domain at one boundary and re-enters at the other, which can keep dead routes alive and form loops; prevent it with tags set on exit and denied on entry, or prefix lists. Second, suboptimal routing, where a boundary router prefers the other protocol's copy because of AD, for example O E2 110 over D EX 170; fix it with <code>distance ospf external 171</code> or per-source distance. Mention lost metrics, oscillation, and applying the same policy on every boundary router.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>With two or more mutual redistribution points, route feedback happens by default.</li>
<li>Routes that are external in their home protocol (D EX 170) lose to the other protocol's copy (O E2 110): suboptimal routing.</li>
<li>A boundary router that installs the other copy stops redistributing the original, weakening redundancy.</li>
<li>Feedback can keep withdrawn networks alive and loop traffic; tags fix feedback, AD fixes the path choice.</li>
<li>Build a quick AD table per prefix to predict which routes are at risk.</li>
</ul></div>
`,hi:`
<p>Do gaon do pulon se jude hain. Ek kahani gaon A se north pul ke raaste nikalti hai, gaon B mein sunayi jaati hai, aur south pul se wapas aa jaati hai. Ab gaon A apni hi kahani sunta hai, lekin B ke ajnabiyon ke muh se, aur kuch log original se zyada ajnabi ke version par bharosa karte hain. Yahi <b>route feedback</b> hai. Do ya zyada redistribution points ke saath yeh koi rare accident nahi; jab tak aap ise roko nahi, yahi default behaviour hai. Yeh chapter module topology use karke iski wajah se hone wala har failure kholta hai.</p>

<h3>Problem 1: AD ki wajah se suboptimal routing</h3>
<p>Delhi partner network 192.168.50.0/24 ko follow karo, jo EIGRP external route hai (E1 ise Loopback1 se redistribute karta hai).</p>
<ol>
<li>Dono boundary routers ise E1 se <b>D EX, AD 170</b> ki tarah seekhte hain.</li>
<li>BR2 ise pehle OSPF mein redistribute karta hai. O1 type-5 LSA flood karta hai; BR1 ise <b>O E2, AD 110</b> ki tarah receive karta hai.</li>
<li>BR1 AD compare karta hai: 110, 170 ko harata hai. BR1 OSPF copy install karta hai aur 192.168.50.0/24 ko O1, BR2 aur E1 ke through route karta hai: ek ki jagah teen hops.</li>
<li>Kyunki BR1 ki RIB entry ab OSPF hai, BR1 par <code>redistribute eigrp 100</code> ise ab export nahi karta. Sirf BR2 ise OSPF mein advertise karta hai; aapki banayi redundancy sirf kaagaz par hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="Suboptimal path from BR1">
<rect x="40" y="105" width="110" height="46" rx="8" fill="#bae6fd"/><text x="95" y="133" text-anchor="middle" class="svg-ink" font-size="14">E1</text>
<rect x="265" y="30" width="110" height="46" rx="8" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="14">BR1</text>
<rect x="265" y="180" width="110" height="46" rx="8" fill="#fde68a"/><text x="320" y="208" text-anchor="middle" class="svg-ink" font-size="14">BR2</text>
<rect x="490" y="105" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="545" y="133" text-anchor="middle" class="svg-ink" font-size="14">O1</text>
<line x1="150" y1="118" x2="265" y2="60" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/>
<line x1="150" y1="140" x2="265" y2="200" stroke="#64748b" stroke-width="2"/>
<line x1="375" y1="60" x2="490" y2="118" stroke="#64748b" stroke-width="2"/>
<line x1="375" y1="200" x2="490" y2="140" stroke="#64748b" stroke-width="2"/>
<text x="190" y="75" text-anchor="end" class="svg-muted" font-size="12">best path, use nahi</text>
<text x="450" y="75" class="svg-accent" font-size="12">1</text><text x="450" y="185" class="svg-accent" font-size="12">2</text><text x="200" y="190" class="svg-accent" font-size="12">3</text>
<text x="320" y="252" text-anchor="middle" class="svg-muted" font-size="12">BR1 se 192.168.50.0/24: O E2 (AD 110) D EX (AD 170) ko harata hai</text>
</svg><p class="cap">BR1 EIGRP external route ki OSPF copy par bharosa karta hai aur traffic ring ke chaaron taraf bhejta hai; hops 1, 2, 3 lab 2 ke traceroute se match karte hain.</p></div>

<pre class="out">BR1#traceroute 192.168.50.1
Type escape sequence to abort.
Tracing the route to 192.168.50.1
VRF info: (vrf in name/id, vrf out name/id)
<span class="hl">  1 10.2.1.1 1 msec 1 msec 1 msec</span>
  2 10.2.2.2 1 msec 2 msec 1 msec
  3 10.1.2.1 2 msec *  2 msec</pre>
<p>Hop 1 O1 (10.2.1.1) hai: lab 2 ka pehla jawab. Dhyaan do ki 172.16.10.0/24 jaise EIGRP <b>internal</b> routes par asar nahi padta, kyunki AD 90, 110 ko harata hai. Problem un routes par aati hai jo apne ghar ke protocol mein external hain: EIGRP externals, aur doosre designs mein OSPF ke against RIP routes (120) ya eBGP (20) ke against kuch bhi.</p>

<h3>Problem 2: route feedback aur ek tikau loop</h3>
<p>BR1 192.168.50.0/24 ko OSPF ki tarah rakhta hai, aur woh OSPF ko EIGRP mein redistribute karta hai. Tags ke bina woh Delhi ka apna network wapas Delhi mein daal deta hai. Ab socho E1 par Loopback1 down ho jaata hai.</p>
<ol>
<li>E1 connected route kho deta hai. EIGRP ke paas BR1 ke through feedback path ab bhi hai (chapter 9, step 3), isliye E1 BR1 ke through D EX 192.168.50.0/24 install kar leta hai.</li>
<li>E1 ise BR2 ko advertise karta hai (split horizon sirf BR1 ki taraf rokta hai). BR2 apna D EX route rakhta hai aur use OSPF mein redistribute karta rehta hai.</li>
<li>O1 LSA rakhta hai aur BR2 ki taraf forward karta hai; BR1 O1 ke through apna O E2 route rakhta hai aur EIGRP ko feed karta rehta hai.</li>
<li>Result: jo network ab exist hi nahi karta woh dono domains mein bana rehta hai, aur uske packets E1, BR1, O1, BR2, E1 ka chakkar lagate rehte hain jab tak TTL khatam na ho.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Redistribution feedback loop">
<rect x="40" y="100" width="110" height="46" rx="8" fill="#bae6fd"/><text x="95" y="128" text-anchor="middle" class="svg-ink" font-size="14">E1</text>
<rect x="265" y="25" width="110" height="46" rx="8" fill="#fde68a"/><text x="320" y="53" text-anchor="middle" class="svg-ink" font-size="14">BR1</text>
<rect x="265" y="175" width="110" height="46" rx="8" fill="#fde68a"/><text x="320" y="203" text-anchor="middle" class="svg-ink" font-size="14">BR2</text>
<rect x="490" y="100" width="110" height="46" rx="8" fill="#bbf7d0"/><text x="545" y="128" text-anchor="middle" class="svg-ink" font-size="14">O1</text>
<line x1="150" y1="112" x2="265" y2="55" stroke="#64748b" stroke-width="2"/>
<line x1="375" y1="55" x2="490" y2="112" stroke="#64748b" stroke-width="2"/>
<line x1="490" y1="135" x2="375" y2="195" stroke="#64748b" stroke-width="2"/>
<line x1="265" y1="195" x2="150" y2="135" stroke="#64748b" stroke-width="2"/>
<text x="200" y="70" text-anchor="end" class="svg-accent" font-size="12">packets</text>
<text x="450" y="70" class="svg-accent" font-size="12">packets</text>
<text x="450" y="190" class="svg-accent" font-size="12">packets</text>
<text x="200" y="190" text-anchor="end" class="svg-accent" font-size="12">packets</text>
<text x="320" y="130" text-anchor="middle" class="svg-muted" font-size="12">Lo1 down hai, route zinda hai</text>
</svg><p class="cap">Tags ke bina withdraw hua network do domains ke beech ghoomta rehta hai aur traffic TTL expiry tak loop karta hai.</p></div>

<h3>Problem 3: khoye metrics aur gumraah karne wale seeds</h3>
<p>Seed metric route ki asli cost ko replace kar deta hai. Lab 1 mein 192.168.50.0/24 ki feedback copy E1 par 51,456 metric ke saath aayi, jo asli connected route ke 128,256 se behtar hai. Jo router sirf EIGRP metrics compare karta hai woh doosre domain ke through wala path prefer kar sakta hai. Seed metrics asli internal paths se <b>kharab</b> hone chahiye; aam rule hai aisa seed use karo jo slow link jaisa dikhe.</p>

<h3>Problem 4: oscillation</h3>
<p>Kyunki boundary router jaise hi doosre protocol ki copy install karta hai, woh prefix redistribute karna band kar deta hai, do boundary routers baari baari kar sakte hain: BR1 apna type-5 LSA withdraw karta hai, BR2 ki copy har jagah jeet jaati hai, phir BR2 par ek change preference ko phir palat deta hai. <code>debug ip routing</code> same prefix ko har kuch seconds mein add aur delete hota dikhata hai. Stable AD aur tag policy wajah hi hata deti hai.</p>

<div class="eg"><p><b>Worked example: kaunse prefixes risk mein hain?</b> Module topology mein har prefix ko boundary routers par uske AD ke saath list karo. 172.16.10.0/24: D (90) vs O E2 copy (110), safe. 192.168.50.0/24: D EX (170) vs O E2 copy (110), <b>risk mein</b>. 10.200.10.0/24: O (110) vs D EX copy (170), safe. 10.200.1.0/24: O (110), safe. Sirf woh prefixes galat taraf kheenche ja sakte hain jinka original AD doosre protocol mein copy ke AD se kharab hai. Yeh chhoti table ek bhi command chalaye bina lab 2 ka ticket predict kar deti hai.</p></div>

<h3>Toolbox</h3>
<table class="cmp"><tr><th>Problem</th><th>Primary fix</th><th>Yeh bhi kaam ka</th></tr>
<tr><td>Routes ka apne origin mein feedback</td><td>Exit par tag, entry par tag deny (chapter 11)</td><td>Prefix lists jo domain ki apni ranges deny karein</td></tr>
<tr><td>AD-based suboptimal routing</td><td><code>distance ospf external 171</code> ya per-source distance</td><td>Boundary routers par inbound tag wali distribute-list</td></tr>
<tr><td>Gumraah karne wale seed metrics</td><td>Internal paths se kharab seeds</td><td>Filtering, consistent OSPF costs ke liye E1 metric type</td></tr>
<tr><td>Oscillation</td><td>Saare boundary routers par consistent AD aur tags</td><td>Churn kam karne ke liye boundary par summarise karo</td></tr></table>

<div class="warn"><p><b>Common galti.</b> Sirf symptom wala router theek karna. Lab 2 ka ticket BR1 ka naam leta hai, lekin policy (distance aur tags) BR1 aur BR2 par identical honi chahiye. Warna agli baar jab redistribution race doosri taraf jaaye, jaise reload ke baad, problem BR2 par palat jaati hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Tags feedback (re-redistribution) rokte hain lekin AD-based suboptimal routing <b>nahi</b>: lab 2 mein tags pehle se lage hain aur BR1 phir bhi lamba path leta hai. Do problems ko do alag fixes chahiye.</p></div>

<div class="scn"><h4>Bhootiya subnet</h4><p>Ek manufacturing plant ne 10.44.0.0/24 camera network decommission kiya, lekin NOC ko ek hafte baad bhi woh RIP aur OSPF dono mein dikh raha tha, aur 10.44.0.1 ka ping baari baari routers se "TTL expired in transit" de raha tha. Plant ke do boundary routers bina tags ke mutual RIP aur OSPF redistribution chala rahe the. Route protocols ke beech khud ko feed kar raha tha. Dono boundary routers par tag-based deny route maps jodne se bhoot ek update interval mein gayab ho gaya.</p><p><b>Seekh:</b> jo route apne network se zyada jiye, plus boundary routers ke beech TTL-expired errors, matlab redistribution feedback.</p></div>

<div class="iv"><p class="q">"Do points par mutual redistribution se kaunsi problems aati hain aur aap unhe kaise rokoge?"</p><p>Strong answer: pehli, route feedback, jisme route ek boundary par domain se nikal kar doosre par wapas ghusta hai, jo mare hue routes ko zinda rakh sakta hai aur loops bana sakta hai; ise exit par set aur entry par deny kiye tags, ya prefix lists se roko. Doosri, suboptimal routing, jisme boundary router AD ki wajah se doosre protocol ki copy prefer karta hai, jaise D EX 170 par O E2 110; ise <code>distance ospf external 171</code> ya per-source distance se theek karo. Khoye metrics, oscillation, aur har boundary router par same policy lagane ka zikr karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Do ya zyada mutual redistribution points ke saath route feedback default mein hota hai.</li>
<li>Jo routes apne ghar ke protocol mein external hain (D EX 170) woh doosre protocol ki copy (O E2 110) se haarte hain: suboptimal routing.</li>
<li>Jo boundary router doosri copy install karta hai woh original redistribute karna band kar deta hai, jisse redundancy kamzor hoti hai.</li>
<li>Feedback withdraw hue networks ko zinda rakh sakta hai aur traffic loop kar sakta hai; tags feedback theek karte hain, AD path choice.</li>
<li>Kaunse routes risk mein hain yeh predict karne ke liye har prefix ki chhoti AD table banao.</li>
</ul></div>
`}};export{e as default};