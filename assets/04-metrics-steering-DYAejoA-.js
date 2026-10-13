var e={id:`metrics-steering`,h:{en:`Metrics, ECMP and steering traffic in the core`,hi:`Metrics, ECMP aur core mein traffic steering`},body:{en:`
<p>In IS-IS the <b>interface metric is your steering wheel</b>. SPF adds metrics along a path and picks the lowest total. If two paths tie, the router installs both (ECMP). A provider designs metrics on purpose: to follow fibre distance or latency, to keep traffic off a weak link, or to push a backup path to be used only on failure.</p>

<h3>Analogy: toll roads</h3>
<p>Think of each link as a road with a toll. Drivers (packets) take the cheapest total toll route. If two routes cost the same, they split. To send traffic away from a road, you raise its toll; you do not close it, so it still works as a backup.</p>

<h3>Default behaviour</h3>
<p>On IOS XE the default IS-IS interface metric is 10 on every link regardless of speed, and Junos also shows 10 in the lab. So by default the shortest path is the one with the fewest hops, not the fastest links. Many providers set metrics by design instead, either by hand per link or with a rule such as "inverse of bandwidth". Junos offers a reference-bandwidth setting under IS-IS; IOS XE IS-IS does not scale automatically, so you set it per interface. These are design options, not outputs.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Raising a metric to move traffic">
<rect x="40" y="30" width="100" height="50" rx="10" fill="#bae6fd"/><text x="90" y="60" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="500" y="30" width="100" height="50" rx="10" fill="#fed7aa"/><text x="550" y="60" text-anchor="middle" class="svg-ink" font-size="14">JR1</text>
<rect x="40" y="150" width="100" height="50" rx="10" fill="#bae6fd"/><text x="90" y="180" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="500" y="150" width="100" height="50" rx="10" fill="#fed7aa"/><text x="550" y="180" text-anchor="middle" class="svg-ink" font-size="14">JR2</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="55" x2="500" y2="55"/><line x1="550" y1="80" x2="550" y2="150"/><line x1="500" y1="175" x2="140" y2="175"/><line x1="90" y1="150" x2="90" y2="80"/></g>
<text x="320" y="45" text-anchor="middle" class="svg-accent" font-size="12">metric 100 (steered away)</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">metric 10</text>
<text x="105" y="120" class="svg-muted" font-size="12">10</text><text x="560" y="120" class="svg-muted" font-size="12">10</text>
</svg><p class="cap">R1 to JR1 cost 10 directly. After setting 100 on that link, R1 prefers R1-R2-JR2-JR1 at 30.</p></div>

<h3>Real proof: the metric moves the path</h3>
<p>In the first lab, after both Cisco routers are wide, R1 reaches JR1's loopback directly:</p>
<pre class="out">R1# show ip route 10.2.255.11
Routing entry for 10.2.255.11/32
  Known via "isis", distance 115, <span class="hl">metric 10</span>
  Routing Descriptor Blocks:
  * 10.2.1.2, via GigabitEthernet0/0</pre>
<p>Now the lab task: raise the metric on Gi0/0.</p>
<pre class="code">interface GigabitEthernet0/0
 <span class="hl">isis metric 100 level-2</span></pre>
<pre class="out">R1# show ip route 10.2.255.11
Routing entry for 10.2.255.11/32
  Known via "isis", distance 115, <span class="hl">metric 30</span>
  Routing Descriptor Blocks:
  * 10.2.4.1, via GigabitEthernet0/1

R1# show isis topology
IS-IS TID 0 paths to level-2 routers
System Id            Metric     Next-Hop             Interface   SNPA
JR1                  30         R2                   Gi0/1       5254.0f04.5002
JR2                  20         R2                   Gi0/1       5254.0f04.5002
R1                   --
R2                   10         R2                   Gi0/1       5254.0f04.5002</pre>
<p>(Output shortened: the Tag null line is omitted.) Total 30 = three links of 10 through R2 and JR2. The direct link at 100 is still up in the neighbour list; it is simply more expensive, so it is a backup. Note that the metric is directional: the setting on R1's interface affects R1's outbound choice. JR1's view back to R1 depends on JR1's own metric.</p>

<h3>ECMP and metric symmetry</h3>
<p>Before the change, R1 to JR2 had two equal-cost paths, via JR1 and via R2:</p>
<pre class="out">R1# show isis topology
JR2                  20         JR1                  Gi0/0       5254.8183.2601
                                R2                   Gi0/1       5254.0f04.5002</pre>
<p>(Output shortened: other rows omitted.) Equal-cost paths share load by hash. Good design aims for the metrics in the two directions of a link to match, so the forward and return paths agree and troubleshooting stays simple. If you set 100 on R1 only, a ping from JR1 to R1 may still go directly while R1 to JR1 goes around. This asymmetry is legal but confusing.</p>

<div class="eg"><p><b>Worked example.</b> To keep a costly long-haul link as backup only, give it a metric larger than the sum of the alternative path. With a ring of links at 10, a metric of 100 on one link guarantees the other way round is preferred, because 30 is smaller than 100.</p></div>
<div class="warn"><p><b>Common mistake.</b> Setting a metric on only one end of a link and expecting symmetric traffic. Set both ends. Another mistake is forgetting <code>level-2</code>: on a router that runs both levels, an interface metric without a level keyword applies to both levels.</p></div>
<div class="exam"><p><b>Exam trap.</b> The lowest total metric wins and equal totals give ECMP. IS-IS metric is cost only, not bandwidth or delay. The link is not removed when its metric is raised.</p></div>

<div class="scn"><h4>The slow fibre that attracted traffic</h4><p>A provider's core carried voice over a long microwave link because all metrics were at the default 10, so the shortest hop count won. Setting the microwave link to a high metric moved voice to the fibre path, and the microwave link stayed as a backup.</p><p><b>Lesson:</b> default metrics ignore speed; design them.</p></div>

<div class="iv"><p class="q">"How do you steer traffic away from a link without taking it down?"</p><p>I raise the IS-IS metric on that link, on both ends, to a value larger than the alternative path's total. SPF then prefers the other path and keeps this one as backup. I verify with show isis topology and the route metric.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SPF picks the lowest total metric; equal totals form ECMP.</li>
<li>Default metric 10 on all links makes the shortest path the fewest hops.</li>
<li>Raise a metric to make a link a backup, and do it on both ends.</li>
<li>Lab proof: 10 becomes 30 via R2 after isis metric 100 level-2.</li>
<li>Wide metrics allow fine granularity above 63.</li>
</ul></div>
`,hi:`
<p>IS-IS mein <b>interface metric aapka steering wheel hai</b>. SPF path par metrics jodta hai aur sabse kam total chunta hai. Agar do paths barabar hon, router dono install karta hai (ECMP). Provider metrics jaan-boojhkar design karta hai: fibre distance ya latency follow karne ke liye, kamzor link se traffic door rakhne ke liye, ya backup path ko sirf failure par use karwane ke liye.</p>

<h3>Analogy: toll roads</h3>
<p>Har link ko toll wali sadak samjho. Drivers (packets) sabse sasta total toll route lete hain. Agar do routes ka kharcha barabar ho to woh baant jaate hain. Traffic ko kisi sadak se door bhejne ke liye uska toll badhao; band nahi karte, isliye woh backup ke taur par chalti rehti hai.</p>

<h3>Default behaviour</h3>
<p>IOS XE par default IS-IS interface metric har link par 10 hai, speed se qata nazar, aur lab mein Junos bhi 10 dikhata hai. Isliye default mein shortest path wahi hai jisme hops kam hon, tez links nahi. Kai providers metrics design se set karte hain, ya haath se per link, ya "bandwidth ka ulta" jaise rule se. Junos IS-IS ke andar reference-bandwidth setting deta hai; IOS XE IS-IS khud scale nahi karta, isliye aap per interface set karte ho. Yeh design options hain, outputs nahi.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Metric badhakar traffic hataana">
<rect x="40" y="30" width="100" height="50" rx="10" fill="#bae6fd"/><text x="90" y="60" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="500" y="30" width="100" height="50" rx="10" fill="#fed7aa"/><text x="550" y="60" text-anchor="middle" class="svg-ink" font-size="14">JR1</text>
<rect x="40" y="150" width="100" height="50" rx="10" fill="#bae6fd"/><text x="90" y="180" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="500" y="150" width="100" height="50" rx="10" fill="#fed7aa"/><text x="550" y="180" text-anchor="middle" class="svg-ink" font-size="14">JR2</text>
<g stroke="#64748b" stroke-width="2"><line x1="140" y1="55" x2="500" y2="55"/><line x1="550" y1="80" x2="550" y2="150"/><line x1="500" y1="175" x2="140" y2="175"/><line x1="90" y1="150" x2="90" y2="80"/></g>
<text x="320" y="45" text-anchor="middle" class="svg-accent" font-size="12">metric 100 (door kiya gaya)</text>
<text x="320" y="195" text-anchor="middle" class="svg-muted" font-size="12">metric 10</text>
<text x="105" y="120" class="svg-muted" font-size="12">10</text><text x="560" y="120" class="svg-muted" font-size="12">10</text>
</svg><p class="cap">R1 se JR1 seedha cost 10. Us link par 100 set karne ke baad R1 R1-R2-JR2-JR1 ko 30 par prefer karta hai.</p></div>

<h3>Real proof: metric path badalta hai</h3>
<p>Pehle lab mein, dono Cisco routers wide hone ke baad, R1 JR1 ke loopback tak seedha pahunchta hai:</p>
<pre class="out">R1# show ip route 10.2.255.11
Routing entry for 10.2.255.11/32
  Known via "isis", distance 115, <span class="hl">metric 10</span>
  Routing Descriptor Blocks:
  * 10.2.1.2, via GigabitEthernet0/0</pre>
<p>Ab lab task: Gi0/0 par metric badhao.</p>
<pre class="code">interface GigabitEthernet0/0
 <span class="hl">isis metric 100 level-2</span></pre>
<pre class="out">R1# show ip route 10.2.255.11
Routing entry for 10.2.255.11/32
  Known via "isis", distance 115, <span class="hl">metric 30</span>
  Routing Descriptor Blocks:
  * 10.2.4.1, via GigabitEthernet0/1

R1# show isis topology
IS-IS TID 0 paths to level-2 routers
System Id            Metric     Next-Hop             Interface   SNPA
JR1                  30         R2                   Gi0/1       5254.0f04.5002
JR2                  20         R2                   Gi0/1       5254.0f04.5002
R1                   --
R2                   10         R2                   Gi0/1       5254.0f04.5002</pre>
<p>(Output chhota kiya gaya: Tag null line hata di gayi.) Total 30 = R2 aur JR2 se hokar 10 ke teen links. 100 wala seedha link neighbour list mein abhi up hai; bas mehenga hai, isliye backup hai. Dhyan do ki metric directional hai: R1 ke interface par setting R1 ke outbound choice ko badalti hai. JR1 ka R1 ki taraf view JR1 ke apne metric par nirbhar hai.</p>

<h3>ECMP aur metric symmetry</h3>
<p>Badlaav se pehle R1 se JR2 tak do barabar-cost paths the, JR1 se aur R2 se:</p>
<pre class="out">R1# show isis topology
JR2                  20         JR1                  Gi0/0       5254.8183.2601
                                R2                   Gi0/1       5254.0f04.5002</pre>
<p>(Output chhota kiya gaya: baaki rows hata di gayi.) Barabar-cost paths hash se load baantte hain. Achhe design mein link ke dono directions ke metrics match karte hain, taaki forward aur return path ek jaise hon aur troubleshooting aasan rahe. Agar sirf R1 par 100 set karo to JR1 se R1 ka ping ab bhi seedha ja sakta hai jabki R1 se JR1 ghoom ke jaata hai. Yeh asymmetry legal hai par confusing.</p>

<div class="eg"><p><b>Worked example.</b> Mehenga long-haul link sirf backup rakhne ke liye uska metric alternative path ke jod se bada rakho. 10 ke links ki ring mein ek link par 100 pakka karta hai ki doosra raasta prefer ho, kyunki 30, 100 se chhota hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Link ke sirf ek end par metric set karke symmetric traffic ki ummeed. Dono ends set karo. Doosri galti <code>level-2</code> bhool jaana: jo router dono levels chalata hai uspar bina level keyword wala interface metric dono levels par lagta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sabse kam total metric jeetta hai aur barabar totals ECMP dete hain. IS-IS metric sirf cost hai, bandwidth ya delay nahi. Metric badhane par link hataya nahi jaata.</p></div>

<div class="scn"><h4>Dheema fibre jisne traffic kheencha</h4><p>Provider ke core mein voice ek lambe microwave link par chal rahi thi kyunki sab metrics default 10 par the, isliye kam hop count jeeta. Microwave link ko ooncha metric dene se voice fibre path par aa gayi aur microwave link backup bana raha.</p><p><b>Lesson:</b> default metrics speed ignore karte hain; unhe design karo.</p></div>

<div class="iv"><p class="q">"Link ko down kiye bina traffic usse door kaise karoge?"</p><p>Us link ka IS-IS metric dono ends par alternative path ke total se bada kar deta hoon. SPF doosra path prefer karta hai aur yeh backup rehta hai. show isis topology aur route metric se verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>SPF sabse kam total metric chunta hai; barabar totals ECMP banate hain.</li>
<li>Har link par default 10 ka matlab shortest path kam hops wala.</li>
<li>Link ko backup banane ke liye metric badhao, dono ends par.</li>
<li>Lab proof: isis metric 100 level-2 ke baad 10 se 30 via R2.</li>
<li>Wide metrics 63 se upar fine granularity dete hain.</li>
</ul></div>
`}};export{e as default};