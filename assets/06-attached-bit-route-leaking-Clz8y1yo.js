var e={id:`attached-bit-route-leaking`,h:{en:`Leaving an area: the attached bit, default routes and route leaking`,hi:`Area se bahar jaana: attached bit, default routes aur route leaking`},body:{en:`
<p>A level-1 router knows only its own area. When it needs a destination in another area, it has no route. In the district analogy, the local map says nothing about other districts, so the officer sends the resident "to the ring road". IS-IS builds that signpost automatically with the <b>attached (ATT) bit</b>. And if the signpost is too crude, you can <b>leak</b> specific routes from the ring road down into the district.</p>

<h3>Step 1: what flows up and what flows down</h3>
<ul>
<li><b>Level 1 to level 2 (up): automatic.</b> A level-1-2 router puts all the prefixes of its level-1 area into its level-2 LSP. So backbone routers know every area's prefixes. You saw this: R3 learned R1's loopback 1.1.1.1 as <code>i L2</code>.</li>
<li><b>Level 2 to level 1 (down): nothing by default.</b> Level-1 routers do not receive level-2 routes. This keeps level-1 databases small.</li>
</ul>
<h3>Step 2: the attached bit gives a default route</h3>
<p>A level-1-2 router that can reach another area through level 2 sets the <b>ATT bit</b> in its <i>level-1</i> LSP. Every level-1 router that sees an LSP with ATT = 1 installs a <b>default route (0.0.0.0/0)</b> toward the nearest such router, by lowest metric. R2's LSP in the lab shows it:</p>
<pre class="out">R2# show isis database
IS-IS Level-1 Link State Database:
LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime/Rcvd      ATT/P/OL
R1.00-00              0x00000004   0x0AD2        1172/1200              0/0/0
R2.00-00            * 0x00000009   0x2F1C        1177/*                 <span class="hl">1</span>/0/0</pre>
<p>And on R1 the result, taken before any leaking was configured:</p>
<pre class="out">R1# show ip route isis
Gateway of last resort is 10.1.12.2 to network 0.0.0.0

i*L1     0.0.0.0/0 [115/10] via 10.1.12.2, 00:00:05, GigabitEthernet0/0
      2.0.0.0/32 is subnetted, 1 subnets
i L1     2.2.2.2 [115/10] via 10.1.12.2, 00:00:05, GigabitEthernet0/0
      10.0.0.0/24 is subnetted, 1 subnets
i L1     10.1.23.0 [115/20] via 10.1.12.2, 00:00:05, GigabitEthernet0/0</pre>
<p>The route has code <code>i*L1</code>: IS-IS, candidate default, level 1. R1 pings R4's loopback 4.4.4.4 without having a specific route, because the packet follows the default route to R2, and R2 knows the way. The first ping character in the lab is a dot (the ARP/first packet), then four successes: normal.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Attached bit and default route">
<rect x="10" y="30" width="270" height="140" rx="14" fill="#e2e8f0"/><text x="145" y="52" text-anchor="middle" class="svg-muted" font-size="12">Area 49.0001 (level 1)</text>
<rect x="30" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="70" y="115" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="180" y="85" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="220" y="108" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="220" y="125" text-anchor="middle" class="svg-accent" font-size="11">ATT = 1</text>
<line x1="110" y1="110" x2="180" y2="110" stroke="#64748b" stroke-width="2"/>
<path d="M60 85 Q145 45 190 85" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="125" y="60" text-anchor="middle" class="svg-accent" font-size="11">0.0.0.0/0</text>
<rect x="340" y="85" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="380" y="115" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="540" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="580" y="115" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<line x1="260" y1="110" x2="340" y2="110" stroke="#64748b" stroke-width="2"/><line x1="420" y1="110" x2="540" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="300" y="102" text-anchor="middle" class="svg-accent" font-size="11">L2</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">R1 follows the default to the nearest attached router</text>
</svg><p class="cap">The attached bit in R2's level-1 LSP turns into a default route on R1.</p></div>

<h3>Step 3: leak specific routes down</h3>
<p>A default route is cheap but crude. If an area has two exits, level-1 routers choose the nearest by <i>metric to the exit</i>, not by the best path to the destination: <b>sub-optimal routing</b>. Fix it by leaking selected level-2 prefixes into level 1 on the level-1-2 router. In the lab, R2 leaks only R4's loopback with a prefix list and route-map:</p>
<pre class="code"><span class="c">! Reference configuration from the lab solution (R2)</span>
ip prefix-list LEAK seq 5 permit 4.4.4.4/32
route-map L2-TO-L1 permit 10
 match ip address prefix-list LEAK
router isis
 redistribute isis ip level-2 into level-1 route-map L2-TO-L1</pre>
<pre class="out">R1# show ip route isis
i*L1     0.0.0.0/0 [115/10] via 10.1.12.2, 00:00:28, GigabitEthernet0/0
      4.0.0.0/32 is subnetted, 1 subnets
i <span class="hl">ia</span>     4.4.4.4 [115/30] via 10.1.12.2, 00:00:23, GigabitEthernet0/0</pre>
<p>R1 now holds a specific route to 4.4.4.4 with code <code>i ia</code> (IS-IS inter-area), metric 30 (10 + 10 + 10). 3.3.3.3 is not leaked, so it does not appear: only what the prefix list permits goes down. In the database, R2's level-1 LSP now carries the leaked prefix with the <b>up/down bit</b> set.</p>
<p>The <b>up/down bit</b> is a loop guard. A prefix leaked from level 2 into level 1 is marked "down". If a level-1-2 router sees a prefix with this mark in a level-1 LSP, it will not advertise it back up into level 2. Without it, leaked routes could ping-pong between levels.</p>

<h3>Step 4: summarise to keep tables small</h3>
<p>The other tool is <b>summarisation</b>: an area border router advertises one summary instead of many prefixes. On IOS it is configured under <code>router isis</code> as <code>summary-address &lt;prefix&gt; &lt;mask&gt; level-2</code> (reference command; not part of the lab). The summary exists as long as at least one more-specific route exists inside it.</p>

<div class="eg"><p><b>Worked example.</b> An area has two exits, R2 (to the east) and R9 (to the west). With only the default route a level-1 access router picks the closer exit, even for destinations that are far cheaper through the other exit. The engineer leaks the prefixes of the eastern and western regions from R2 and R9 respectively. Each access router now has specific routes and picks the exit that is truly best for each prefix.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Leaking everything with no filter: level-1 routers then carry the whole backbone table and the benefit of areas is lost. (2) Expecting level-1-only routers to learn anything without ATT: if no level-1-2 router has ATT = 1, no default route appears, and inter-area traffic fails. (3) Forgetting that a router in level 2 only never sets ATT because it has no level-1 LSP.</p></div>
<div class="exam"><p><b>Exam trap.</b> The ATT bit is set only in <b>level-1</b> LSPs and only by a level-1-2 router that has a level-2 adjacency to another area. L1-only routers install the default route; L2 routers do not look at ATT at all. Leaking goes from level 2 to level 1 with the up/down bit; level 1 to level 2 is automatic.</p></div>

<div class="scn"><h4>Half the traffic took the long way</h4><p>An area with two border routers used only default routes. Access routers sent all traffic to whichever border router was nearest, and half of it then had to cross the backbone again to reach a destination close to the other border router. The engineer leaked the 20 busiest prefixes into level 1 on both border routers with a prefix list. Latency for those destinations dropped and the extra backbone load disappeared.</p><p><b>Lesson:</b> default routes are simple and sub-optimal; leak the prefixes that matter.</p></div>

<div class="iv"><p class="q">"How does a level-1 router reach a destination in another area?"</p><p>A level-1-2 router with a level-2 path to other areas sets the ATT bit in its level-1 LSP. Level-1 routers then install a default route to the nearest ATT router. If that is not good enough, level-2 prefixes can be leaked into level 1 with a policy, using the up/down bit to prevent loops, and the border router can summarise level-1 prefixes towards level 2.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Level 1 to level 2 flows automatically; level 2 to level 1 does not.</li>
<li>The ATT bit in a level-1 LSP makes level-1 routers install a default route (i*L1).</li>
<li>Route leaking (redistribute isis ip level-2 into level-1) gives specific routes, shown as i ia.</li>
<li>The up/down bit stops leaked routes from re-entering level 2.</li>
<li>Filter leaking and use summaries to keep level-1 tables small.</li>
</ul></div>
`,hi:`
<p>Level-1 router sirf apna area jaanta hai. Doosre area ki destination chahiye to uske paas route nahi hota. District analogy mein local map doosre districts ke baare mein kuch nahi kehta, isliye officer resident ko "ring road par bhejta hai". IS-IS woh signpost <b>attached (ATT) bit</b> se automatically banata hai. Aur signpost bahut mota ho to aap ring road se district mein specific routes <b>leak</b> kar sakte ho.</p>

<h3>Step 1: kya upar jaata hai aur kya neeche</h3>
<ul>
<li><b>Level 1 se level 2 (upar): automatic.</b> Level-1-2 router apne level-1 area ke saare prefixes apne level-2 LSP mein daal deta hai. Isliye backbone routers har area ke prefixes jaante hain. Aapne dekha: R3 ne R1 ka loopback 1.1.1.1 <code>i L2</code> ki tarah seekha.</li>
<li><b>Level 2 se level 1 (neeche): default mein kuch nahi.</b> Level-1 routers ko level-2 routes nahi milte. Isse level-1 databases chhote rehte hain.</li>
</ul>
<h3>Step 2: attached bit default route deta hai</h3>
<p>Level-1-2 router jo level 2 ke through doosre area tak pahunch sakta hai, apne <i>level-1</i> LSP mein <b>ATT bit</b> set karta hai. Har level-1 router jo ATT = 1 wala LSP dekhta hai, sabse paas ke aise router ki taraf, sabse kam metric se, <b>default route (0.0.0.0/0)</b> install karta hai. Lab mein R2 ka LSP yeh dikhata hai:</p>
<pre class="out">R2# show isis database
IS-IS Level-1 Link State Database:
LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime/Rcvd      ATT/P/OL
R1.00-00              0x00000004   0x0AD2        1172/1200              0/0/0
R2.00-00            * 0x00000009   0x2F1C        1177/*                 <span class="hl">1</span>/0/0</pre>
<p>Aur R1 par result, kisi leaking ke configure hone se pehle liya hua:</p>
<pre class="out">R1# show ip route isis
Gateway of last resort is 10.1.12.2 to network 0.0.0.0

i*L1     0.0.0.0/0 [115/10] via 10.1.12.2, 00:00:05, GigabitEthernet0/0
      2.0.0.0/32 is subnetted, 1 subnets
i L1     2.2.2.2 [115/10] via 10.1.12.2, 00:00:05, GigabitEthernet0/0
      10.0.0.0/24 is subnetted, 1 subnets
i L1     10.1.23.0 [115/20] via 10.1.12.2, 00:00:05, GigabitEthernet0/0</pre>
<p>Route ka code <code>i*L1</code> hai: IS-IS, candidate default, level 1. R1 R4 ke loopback 4.4.4.4 ko specific route ke bina ping karta hai, kyunki packet default route se R2 ko jaata hai, aur R2 raasta jaanta hai. Lab mein ping ka pehla character dot hota hai (ARP/first packet), phir chaar success: normal.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Attached bit aur default route">
<rect x="10" y="30" width="270" height="140" rx="14" fill="#e2e8f0"/><text x="145" y="52" text-anchor="middle" class="svg-muted" font-size="12">Area 49.0001 (level 1)</text>
<rect x="30" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="70" y="115" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="180" y="85" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="220" y="108" text-anchor="middle" class="svg-ink" font-size="13">R2</text><text x="220" y="125" text-anchor="middle" class="svg-accent" font-size="11">ATT = 1</text>
<line x1="110" y1="110" x2="180" y2="110" stroke="#64748b" stroke-width="2"/>
<path d="M60 85 Q145 45 190 85" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="125" y="60" text-anchor="middle" class="svg-accent" font-size="11">0.0.0.0/0</text>
<rect x="340" y="85" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="380" y="115" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="540" y="85" width="80" height="50" rx="8" fill="#bae6fd"/><text x="580" y="115" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<line x1="260" y1="110" x2="340" y2="110" stroke="#64748b" stroke-width="2"/><line x1="420" y1="110" x2="540" y2="110" stroke="#64748b" stroke-width="2"/>
<text x="300" y="102" text-anchor="middle" class="svg-accent" font-size="11">L2</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">R1 default ko sabse paas ke attached router tak follow karta hai</text>
</svg><p class="cap">R2 ke level-1 LSP ka attached bit R1 par default route ban jaata hai.</p></div>

<h3>Step 3: specific routes neeche leak karo</h3>
<p>Default route sasta hai par mota. Agar area ke do exits hon to level-1 routers <i>exit tak ke metric</i> se sabse paas wala chunte hain, destination tak ke best path se nahi: <b>sub-optimal routing</b>. Ise theek karne ke liye level-1-2 router par chune hue level-2 prefixes ko level 1 mein leak karo. Lab mein R2 prefix list aur route-map se sirf R4 ka loopback leak karta hai:</p>
<pre class="code"><span class="c">! Lab solution se reference configuration (R2)</span>
ip prefix-list LEAK seq 5 permit 4.4.4.4/32
route-map L2-TO-L1 permit 10
 match ip address prefix-list LEAK
router isis
 redistribute isis ip level-2 into level-1 route-map L2-TO-L1</pre>
<pre class="out">R1# show ip route isis
i*L1     0.0.0.0/0 [115/10] via 10.1.12.2, 00:00:28, GigabitEthernet0/0
      4.0.0.0/32 is subnetted, 1 subnets
i <span class="hl">ia</span>     4.4.4.4 [115/30] via 10.1.12.2, 00:00:23, GigabitEthernet0/0</pre>
<p>R1 ke paas ab 4.4.4.4 ka specific route hai code <code>i ia</code> (IS-IS inter-area) ke saath, metric 30 (10 + 10 + 10). 3.3.3.3 leak nahi hua, isliye dikhta nahi: sirf wahi neeche jaata hai jo prefix list permit karti hai. Database mein R2 ka level-1 LSP ab leak kiya prefix <b>up/down bit</b> set ke saath le jaata hai.</p>
<p><b>Up/down bit</b> loop guard hai. Level 2 se level 1 mein leak hua prefix "down" mark hota hai. Agar level-1-2 router level-1 LSP mein is mark wala prefix dekhe, to woh use wapas level 2 mein advertise nahi karega. Iske bina leak kiye routes levels ke beech ping-pong kar sakte the.</p>

<h3>Step 4: tables chhoti rakhne ke liye summarise karo</h3>
<p>Doosra tool <b>summarisation</b> hai: area border router bahut saare prefixes ki jagah ek summary advertise karta hai. IOS par ise <code>router isis</code> ke neeche <code>summary-address &lt;prefix&gt; &lt;mask&gt; level-2</code> se configure karte hain (reference command; lab ka hissa nahi). Summary tab tak rehti hai jab tak uske andar kam se kam ek more-specific route hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek area ke do exits hain, R2 (east) aur R9 (west). Sirf default route ke saath level-1 access router paas wala exit chunta hai, un destinations ke liye bhi jo doosre exit se kaafi sasti hain. Engineer R2 aur R9 se respectively eastern aur western regions ke prefixes leak karta hai. Ab har access router ke paas specific routes hain aur woh har prefix ke liye sach mein best exit chunta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Bina filter ke sab kuch leak karna: level-1 routers phir poori backbone table rakhte hain aur areas ka fayda khatam. (2) ATT ke bina level-1-only routers se kuch seekhne ki umeed: agar kisi level-1-2 router ka ATT = 1 nahi hai, to default route nahi aata aur inter-area traffic fail hota hai. (3) Yeh bhoolna ki level-2-only router kabhi ATT set nahi karta kyunki uska level-1 LSP hi nahi hota.</p></div>
<div class="exam"><p><b>Exam trap.</b> ATT bit sirf <b>level-1</b> LSPs mein set hota hai aur sirf aise level-1-2 router se jiski kisi doosre area ke saath level-2 adjacency ho. L1-only routers default route install karte hain; L2 routers ATT dekhte hi nahi. Leaking level 2 se level 1 up/down bit ke saath jaati hai; level 1 se level 2 automatic hai.</p></div>

<div class="scn"><h4>Aadha traffic lamba raasta le gaya</h4><p>Do border routers wale area ne sirf default routes use kiye. Access routers saara traffic jo bhi border router paas tha usi ko bhejte the, aur uska aadha hissa doosre border router ke paas ki destination tak pahunchne ke liye backbone dobara cross karta tha. Engineer ne dono border routers par prefix list se 20 sabse busy prefixes level 1 mein leak kiye. Un destinations ki latency gir gayi aur extra backbone load gayab ho gaya.</p><p><b>Lesson:</b> default routes simple aur sub-optimal hote hain; jo prefixes matter karte hain unhe leak karo.</p></div>

<div class="iv"><p class="q">"Level-1 router doosre area ki destination tak kaise pahunchta hai?"</p><p>Level-1-2 router jiske paas doosre areas tak level-2 path hai woh apne level-1 LSP mein ATT bit set karta hai. Level-1 routers phir sabse paas ke ATT router ki taraf default route install karte hain. Itna kaafi na ho to level-2 prefixes ko policy se level 1 mein leak kiya ja sakta hai, loops rokne ke liye up/down bit ke saath, aur border router level-1 prefixes ko level 2 ki taraf summarise kar sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Level 1 se level 2 automatic hai; level 2 se level 1 nahi.</li>
<li>Level-1 LSP ka ATT bit level-1 routers ko default route (i*L1) install karwata hai.</li>
<li>Route leaking (redistribute isis ip level-2 into level-1) specific routes deta hai, i ia ki tarah dikhte hain.</li>
<li>Up/down bit leak kiye routes ko level 2 mein wapas jaane se rokta hai.</li>
<li>Leaking ko filter karo aur level-1 tables chhoti rakhne ke liye summaries use karo.</li>
</ul></div>
`}};export{e as default};