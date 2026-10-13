var e={id:`summaries-stub-nssa`,h:{en:`Summaries, stub areas and NSSA: keeping tables small`,hi:`Summaries, stub areas aur NSSA: tables chhote rakhna`},body:{en:`
<p>A branch router with 20 prefixes does not need to know 20,000 prefixes from the rest of the company. It needs a few summaries and a default route. OSPF gives you three tools to make that happen: <b>area-range summaries</b> on the ABR, <b>stub areas</b> that block external routes, and the <b>not-so-stubby area (NSSA)</b>, which blocks external routes from outside but still lets a local router inject its own. This chapter explains each tool and how to choose.</p>

<h3>Tool 1: inter-area summarisation with area-range</h3>
<p>An ABR sends one Summary LSA per prefix by default. With <code>area-range</code> it replaces all more-specific prefixes of an area with one summary, so the other areas see fewer LSAs and a calmer SPF. Addressing must be planned: if all of the Hubli area is 172.16.5.0/24 up to 172.16.5.255 and the links use 10.5.34.0/30, then the ABR can summarise those blocks.</p>
<pre class="code"><span class="c">! On the ABR R3: advertise one summary for the area, or suppress it</span>
set protocols ospf area 0.0.0.2 area-range 172.16.0.0/16
<span class="c">! restrict: do not advertise this range into other areas at all</span>
set protocols ospf area 0.0.0.1 area-range 10.5.0.0/16 restrict</pre>
<p>The simulator accepts both lines. Here is what <code>show | compare</code> prints for the second one, followed by the stub-type line we use next:</p>
<pre class="out">lab@R3-DHARWAD# show | compare
[edit protocols ospf area 0.0.0.1]
+   area-range 10.5.0.0/16 {
+       restrict;
+   }
[edit protocols ospf area 0.0.0.2]
+   nssa;</pre>
<div class="note"><p>The simulator accepts these configuration lines. The route-by-route effect of area-range, stub and NSSA is not modelled in the labs, so treat this section as configuration and theory, and test on real equipment before you rely on it.</p></div>

<h3>Tool 2: stub and totally stubby areas</h3>
<p>External routes (type 5 LSAs) are the biggest source of table growth. In a <b>stub area</b> the ABR does not flood type 5 LSAs, and routers inside get a default route instead. A <b>totally stubby area</b> also blocks type 3 summaries from other areas, so the routers keep only their own area plus a default route.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Area types and allowed LSAs">
<rect x="20" y="30" width="140" height="150" rx="10" fill="#bae6fd"/><text x="90" y="52" text-anchor="middle" class="svg-ink" font-size="13">Normal</text><text x="90" y="85" text-anchor="middle" class="svg-muted" font-size="12">1, 2, 3, 4, 5</text>
<rect x="175" y="30" width="140" height="150" rx="10" fill="#bbf7d0"/><text x="245" y="52" text-anchor="middle" class="svg-ink" font-size="13">Stub</text><text x="245" y="85" text-anchor="middle" class="svg-muted" font-size="12">1, 2, 3 + default</text>
<rect x="330" y="30" width="140" height="150" rx="10" fill="#ddd6fe"/><text x="400" y="52" text-anchor="middle" class="svg-ink" font-size="13">Totally stubby</text><text x="400" y="85" text-anchor="middle" class="svg-muted" font-size="12">1, 2 + default only</text>
<rect x="485" y="30" width="140" height="150" rx="10" fill="#fde68a"/><text x="555" y="52" text-anchor="middle" class="svg-ink" font-size="13">NSSA</text><text x="555" y="85" text-anchor="middle" class="svg-muted" font-size="12">1, 2, 3, 7 (no 5)</text>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">Numbers are the LSA types allowed inside the area.</text>
</svg><p class="cap">Fewer allowed LSA types means smaller databases inside the area.</p></div>
<pre class="code"><span class="c">! Stub area 0.0.0.2: on every router in the area</span>
set protocols ospf area 0.0.0.2 stub
<span class="c">! On the ABR: send a default route into the stub area</span>
set protocols ospf area 0.0.0.2 stub default-metric 10
<span class="c">! Totally stubby: ABR only, blocks type 3 as well</span>
set protocols ospf area 0.0.0.2 stub no-summaries</pre>
<p>The stub flag is carried in hello packets. If one router in the area is stub and another is not, their <b>E-bit options do not match and the adjacency fails</b>. On Junos the ABR needs <code>default-metric</code> to originate the default route into a stub area.</p>

<h3>Tool 3: NSSA</h3>
<p>What if a stub area contains a router that must bring in outside routes, for example a branch with a partner link? A normal stub forbids it, because the ASBR would create type 5 LSAs. In an <b>NSSA</b> the ASBR creates <b>type 7 LSAs</b> that flood only inside the NSSA. The NSSA ABR translates them to type 5 for the rest of the network.</p>
<pre class="code">set protocols ospf area 0.0.0.2 nssa
<span class="c">! ABR: send a default into the NSSA (not automatic)</span>
set protocols ospf area 0.0.0.2 nssa default-lsa default-metric 10
<span class="c">! Totally stubby NSSA</span>
set protocols ospf area 0.0.0.2 nssa no-summaries</pre>

<h3>Choosing</h3>
<table class="cmp"><tr><th>Need</th><th>Choose</th></tr>
<tr><td>Remote area, no outside routes, small routers</td><td>Totally stubby</td></tr>
<tr><td>Remote area, wants inter-area detail but not externals</td><td>Stub</td></tr>
<tr><td>Remote area with its own external source</td><td>NSSA</td></tr>
<tr><td>Core and transit areas</td><td>Normal</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A branch area has 40 internal prefixes, the head office has 3,000 prefixes and 500 external routes. As a normal area, each branch router stores about 3,540 LSA-derived routes. As a totally stubby area it stores 40 plus one default: a 98 percent reduction in table size, and flapping at head office never makes the branch recompute.</p></div>

<div class="warn"><p><b>Common mistake.</b> Making the transit area of a virtual link a stub area, or forgetting that every router in the area must have the same stub or NSSA setting.</p></div>
<div class="exam"><p><b>Exam trap.</b> Stub areas cannot contain an ASBR. If an ASBR must exist, you need an NSSA. And <code>no-summaries</code> is configured only on the ABR, though the stub keyword is on all routers in the area.</p></div>

<div class="scn"><h4>The branch that could not join</h4><p>After a config push one branch router would not form an adjacency with the ABR. Hellos were visible, the area ID matched, the subnet matched. The engineer compared the area configuration and found that the ABR had the new <code>stub</code> statement but the branch router had not been updated, so the hello options disagreed. Adding <code>stub</code> on the branch router brought the neighbour to Full.</p><p><b>Lesson:</b> an area type is part of the adjacency contract. Roll it out to all routers of the area.</p></div>

<div class="iv"><p class="q">"What is the difference between a stub area and an NSSA?"</p><p>A stub area blocks external routes (type 5) and cannot contain an ASBR. An NSSA also blocks type 5 from outside but allows an ASBR inside, which creates type 7 LSAs. The NSSA ABR translates type 7 to type 5 toward the backbone. Both can be totally stubby with <code>no-summaries</code> on the ABR.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>area-range summarises inter-area routes on the ABR; restrict suppresses a range.</li>
<li>Stub blocks type 5; totally stubby also blocks type 3; both receive a default route.</li>
<li>NSSA uses type 7 inside and the ABR translates to type 5.</li>
<li>All routers in an area must agree on stub or NSSA, or adjacency fails.</li>
<li>The ABR needs default-metric to originate a default into a stub or NSSA area.</li>
</ul></div>
`,hi:`
<p>20 prefixes wale branch router ko company ke baaki 20,000 prefixes jaanne ki zaroorat nahi. Use kuch summaries aur ek default route chahiye. OSPF is ke liye teen tools deta hai: ABR par <b>area-range summaries</b>, <b>stub areas</b> jo external routes block karte hain, aur <b>not-so-stubby area (NSSA)</b> jo bahar ke external routes block karta hai par local router ko apna route inject karne deta hai. Yeh chapter har tool aur chunne ka tareeka samjhata hai.</p>

<h3>Tool 1: area-range se inter-area summarisation</h3>
<p>ABR default mein har prefix ke liye ek Summary LSA bhejta hai. <code>area-range</code> se woh area ke saare more-specific prefixes ki jagah ek summary bhejta hai, isliye doosre areas kam LSAs dekhte hain aur SPF shaant rehta hai. Addressing plan honi chahiye: Hubli area poora 172.16.5.0/24 se 172.16.5.255 tak ho aur links 10.5.34.0/30 hon, to ABR un blocks ko summarise kar sakta hai.</p>
<pre class="code"><span class="c">! ABR R3 par: area ke liye ek summary advertise karo, ya suppress karo</span>
set protocols ospf area 0.0.0.2 area-range 172.16.0.0/16
<span class="c">! restrict: yeh range doosre areas mein bilkul advertise mat karo</span>
set protocols ospf area 0.0.0.1 area-range 10.5.0.0/16 restrict</pre>
<p>Simulator dono lines accept karta hai. Doosri line ke liye <code>show | compare</code> yeh print karta hai, saath mein agli line ka stub-type statement:</p>
<pre class="out">lab@R3-DHARWAD# show | compare
[edit protocols ospf area 0.0.0.1]
+   area-range 10.5.0.0/16 {
+       restrict;
+   }
[edit protocols ospf area 0.0.0.2]
+   nssa;</pre>
<div class="note"><p>Simulator yeh configuration lines accept karta hai. Labs mein area-range, stub aur NSSA ka route-by-route asar model nahi hai, isliye is section ko configuration aur theory samjho, aur bharosa karne se pehle real equipment par test karo.</p></div>

<h3>Tool 2: stub aur totally stubby areas</h3>
<p>External routes (type 5 LSAs) table badhne ka sabse bada source hain. <b>Stub area</b> mein ABR type 5 LSAs flood nahi karta, aur andar ke routers ko default route milta hai. <b>Totally stubby area</b> doosre areas ke type 3 summaries bhi block karta hai, isliye routers sirf apna area aur ek default route rakhte hain.</p>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Area types aur allowed LSAs">
<rect x="20" y="30" width="140" height="150" rx="10" fill="#bae6fd"/><text x="90" y="52" text-anchor="middle" class="svg-ink" font-size="13">Normal</text><text x="90" y="85" text-anchor="middle" class="svg-muted" font-size="12">1, 2, 3, 4, 5</text>
<rect x="175" y="30" width="140" height="150" rx="10" fill="#bbf7d0"/><text x="245" y="52" text-anchor="middle" class="svg-ink" font-size="13">Stub</text><text x="245" y="85" text-anchor="middle" class="svg-muted" font-size="12">1, 2, 3 + default</text>
<rect x="330" y="30" width="140" height="150" rx="10" fill="#ddd6fe"/><text x="400" y="52" text-anchor="middle" class="svg-ink" font-size="13">Totally stubby</text><text x="400" y="85" text-anchor="middle" class="svg-muted" font-size="12">1, 2 + sirf default</text>
<rect x="485" y="30" width="140" height="150" rx="10" fill="#fde68a"/><text x="555" y="52" text-anchor="middle" class="svg-ink" font-size="13">NSSA</text><text x="555" y="85" text-anchor="middle" class="svg-muted" font-size="12">1, 2, 3, 7 (5 nahi)</text>
<text x="320" y="205" text-anchor="middle" class="svg-accent" font-size="12">Numbers area ke andar allowed LSA types hain.</text>
</svg><p class="cap">Kam allowed LSA types matlab area ke andar chhote databases.</p></div>
<pre class="code"><span class="c">! Stub area 0.0.0.2: area ke har router par</span>
set protocols ospf area 0.0.0.2 stub
<span class="c">! ABR par: stub area mein default route bhejo</span>
set protocols ospf area 0.0.0.2 stub default-metric 10
<span class="c">! Totally stubby: sirf ABR, type 3 bhi block</span>
set protocols ospf area 0.0.0.2 stub no-summaries</pre>
<p>Stub flag hello packets mein jaata hai. Area ka ek router stub aur doosra nahi ho to unke <b>E-bit options match nahi karte aur adjacency fail hoti hai</b>. Junos par ABR ko stub area mein default route originate karne ke liye <code>default-metric</code> chahiye.</p>

<h3>Tool 3: NSSA</h3>
<p>Agar stub area ke andar aisa router ho jise bahar ke routes laane hon, jaise partner link wala branch? Normal stub ise mana karta hai, kyunki ASBR type 5 LSAs banata. <b>NSSA</b> mein ASBR <b>type 7 LSAs</b> banata hai jo sirf NSSA ke andar flood hote hain. NSSA ABR unhe baaki network ke liye type 5 mein translate karta hai.</p>
<pre class="code">set protocols ospf area 0.0.0.2 nssa
<span class="c">! ABR: NSSA mein default bhejo (apne aap nahi)</span>
set protocols ospf area 0.0.0.2 nssa default-lsa default-metric 10
<span class="c">! Totally stubby NSSA</span>
set protocols ospf area 0.0.0.2 nssa no-summaries</pre>

<h3>Chunna kaise hai</h3>
<table class="cmp"><tr><th>Zaroorat</th><th>Chuno</th></tr>
<tr><td>Remote area, bahar ke routes nahi, chhote routers</td><td>Totally stubby</td></tr>
<tr><td>Remote area, inter-area detail chahiye par externals nahi</td><td>Stub</td></tr>
<tr><td>Remote area jiska apna external source hai</td><td>NSSA</td></tr>
<tr><td>Core aur transit areas</td><td>Normal</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Branch area mein 40 internal prefixes hain, head office ke 3,000 prefixes aur 500 external routes. Normal area mein har branch router lagbhag 3,540 routes store karta hai. Totally stubby area mein 40 plus ek default: table size mein 98 percent kami, aur head office ki flapping branch ko recompute nahi karwati.</p></div>

<div class="warn"><p><b>Common mistake.</b> Virtual link ke transit area ko stub area banana, ya bhoolna ki area ke har router par same stub ya NSSA setting honi chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Stub areas mein ASBR nahi ho sakta. ASBR chahiye to NSSA chahiye. Aur <code>no-summaries</code> sirf ABR par configure hota hai, jabki stub keyword area ke har router par.</p></div>

<div class="scn"><h4>Branch jo join nahi ho paya</h4><p>Config push ke baad ek branch router ABR ke saath adjacency nahi bana raha tha. Hellos dikh rahe the, area ID match, subnet match. Engineer ne area configuration compare ki aur pata chala ki ABR par naya <code>stub</code> statement tha par branch router update nahi hua tha, isliye hello options disagree kar rahe the. Branch router par <code>stub</code> jodne se neighbour Full ho gaya.</p><p><b>Lesson:</b> area type adjacency ke contract ka hissa hai. Ise area ke saare routers par roll out karo.</p></div>

<div class="iv"><p class="q">"Stub area aur NSSA mein kya difference hai?"</p><p>Stub area external routes (type 5) block karta hai aur usmein ASBR nahi ho sakta. NSSA bhi bahar ka type 5 block karta hai par andar ASBR allow karta hai, jo type 7 LSAs banata hai. NSSA ABR type 7 ko backbone ki taraf type 5 mein translate karta hai. Dono ABR par <code>no-summaries</code> se totally stubby ban sakte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>area-range ABR par inter-area routes summarise karta hai; restrict range suppress karta hai.</li>
<li>Stub type 5 block karta hai; totally stubby type 3 bhi; dono ko default route milta hai.</li>
<li>NSSA andar type 7 use karta hai aur ABR type 5 mein translate karta hai.</li>
<li>Area ke saare routers stub ya NSSA par agree hone chahiye, warna adjacency fail.</li>
<li>Stub ya NSSA mein default originate karne ke liye ABR ko default-metric chahiye.</li>
</ul></div>
`}};export{e as default};