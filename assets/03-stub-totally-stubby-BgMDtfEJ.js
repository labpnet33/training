var e={id:`stub-areas`,h:{en:`Stub and totally stubby areas (labs: Indore and Kochi)`,hi:`Stub aur totally stubby areas (labs: Indore aur Kochi)`},body:{en:`
<p>Imagine a village at the end of a single road. The villagers do not need a map of every city in the country. They need one sign at the village exit: "All other destinations: this way." A <b>stub area</b> gives a branch exactly that sign. A <b>totally stubby area</b> goes one step further and removes even the list of nearby towns.</p>

<h3>Stub area: how it works</h3>
<ol>
<li>Every router in the area is configured with <code>area 51 stub</code>. This clears the <b>E-bit</b> (external routing capability) in the options field of its Hello packets.</li>
<li>Routers only become neighbours if the E-bit matches. That is why the stub flag must be set on <b>every</b> router in the area, including the ABR.</li>
<li>The ABR stops flooding type-5 and type-4 LSAs into the area.</li>
<li>The ABR originates a <b>type-3 default route</b> (0.0.0.0/0) into the area, with cost 1 unless you change it with <code>area 51 default-cost</code>. The branch sees it as <code>O*IA</code>.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Stub area before and after">
<rect x="10" y="20" width="300" height="170" rx="10" fill="#e2e8f0"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="13">BR before: normal area 51</text>
<text x="30" y="72" class="svg-ink" font-size="12">O IA 2.2.2.2, 3.3.3.3, 10.0.23.0/30</text>
<text x="30" y="98" class="svg-ink" font-size="12">O E2 203.0.113.0/24</text>
<text x="30" y="124" class="svg-ink" font-size="12">O*E2 0.0.0.0/0 [110/1]</text>
<text x="30" y="160" class="svg-muted" font-size="12">type-4 and type-5 LSAs present</text>
<rect x="330" y="20" width="300" height="170" rx="10" fill="#bbf7d0"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="13">BR after: stub area 51</text>
<text x="350" y="72" class="svg-ink" font-size="12">O IA 2.2.2.2, 3.3.3.3, 10.0.23.0/30</text>
<text x="350" y="98" class="svg-accent" font-size="12">O*IA 0.0.0.0/0 [110/51]</text>
<text x="350" y="124" class="svg-ink" font-size="12">no O E2 routes</text>
<text x="350" y="160" class="svg-muted" font-size="12">default-cost 50 + link cost 1</text>
</svg><p class="cap">The stub lab in one picture: external detail replaced by one type-3 default.</p></div>

<h3>Lab walk-through: Indore branch, area 51</h3>
<pre class="code"><span class="c">! BR and ABR (every router in area 51)</span>
router ospf 1
 area 51 stub
<span class="c">! ABR only: make the injected default less attractive</span>
router ospf 1
 area 51 default-cost 50</pre>
<p>As soon as you configure the ABR, the adjacency with BR drops, because their Hellos now disagree on the E-bit. It returns when BR is configured too. In production, plan this as a short maintenance window.</p>
<pre class="out">BR#show ip route ospf
Gateway of last resort is 10.51.12.2 to network 0.0.0.0

<span class="hl">O*IA  0.0.0.0/0 [110/51] via 10.51.12.2, 00:00:41, GigabitEthernet0/0</span>
      2.0.0.0/32 is subnetted, 1 subnets
O IA     2.2.2.2 [110/2] via 10.51.12.2, 00:00:41, GigabitEthernet0/0
      3.0.0.0/32 is subnetted, 1 subnets
O IA     3.3.3.3 [110/3] via 10.51.12.2, 00:00:41, GigabitEthernet0/0
      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
O IA     10.0.23.0/30 [110/2] via 10.51.12.2, 00:00:41, GigabitEthernet0/0

ABR#show ip ospf | section Area 51
    Area 51
        Number of interfaces in this area is 1
<span class="hl">        It is a stub area</span>
<span class="hl">        Generates stub default route with cost 50</span>
        Area has no authentication</pre>
<p>203.0.113.0/24 is gone, yet <code>ping 203.0.113.1</code> from BR still works: the default carries the packet to the ABR, and the ABR has the full external route.</p>

<div class="eg"><p><b>Worked example: the metric of 51.</b> The ABR advertises the default with cost 50. BR adds the cost of its own outgoing interface, GigabitEthernet0/0, which is 1 (reference bandwidth 100 Mbps divided by 1000 Mbps, rounded up to 1). 50 + 1 = 51. With the default cost of 1 you would see [110/2].</p></div>

<h3>Totally stubby: removing type-3 as well</h3>
<p>In area 52 (Kochi) the stub area already works, but BR still holds every inter-area route. Add <code>no-summary</code> on the <b>ABR only</b>. The ABR is the only router that creates type-3 LSAs, so it is the only place the keyword has any effect. BR keeps plain <code>area 52 stub</code>.</p>
<pre class="code"><span class="c">! ABR only</span>
router ospf 1
 area 52 stub no-summary</pre>
<pre class="out">BR#show ip route ospf
Gateway of last resort is 10.52.12.2 to network 0.0.0.0

<span class="hl">O*IA  0.0.0.0/0 [110/2] via 10.52.12.2, 00:00:12, GigabitEthernet0/0</span>

BR#show ip ospf database summary

            OSPF Router with ID (1.1.1.1) (Process ID 1)

                Summary Net Link States (Area 52)

  LS age: 15
  Options: (No TOS-capability, DC, Upward)
  LS Type: Summary Links(Network)
<span class="hl">  Link State ID: 0.0.0.0 (summary Network Number)</span>
  Advertising Router: 2.2.2.2
  LS Seq Number: 80000001
  Checksum: 0x93C5
  Length: 28
  Network Mask: /0
        MTID: 0         Metric: 1

ABR#show ip ospf | include stub
<span class="hl">        It is a stub area, no summary LSA in this area</span></pre>
<p>Now prove the other direction. Totally stubby only controls what goes <b>into</b> area 52. CORE still learns 192.168.52.0/24 and 1.1.1.1/32 as <code>O IA</code>, and <code>ping 3.3.3.3</code> from BR succeeds through the default.</p>

<h3>Two ABRs and the default cost</h3>
<p>If a stub area has two ABRs, both inject a default and the internal routers choose the lower total cost. Use <code>default-cost</code> to make one ABR primary: for example 10 on the primary and 100 on the backup. In a totally stubby area this is all the branch can see, so traffic to a specific remote prefix may take a longer path than necessary. That is the trade-off: smaller tables, less path information.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Configuring stub on the ABR only: the neighbour never forms. (2) Putting <code>no-summary</code> on the internal router and expecting a change: it does nothing there. (3) Adding <code>redistribute</code> on a router in a stub area: type-5 LSAs cannot exist in a stub area, so nothing is advertised. Use an NSSA for that. (4) Trying to make area 0 a stub: IOS rejects it.</p></div>

<div class="exam"><p><b>Exam trap.</b> The default in a stub or totally stubby area is a <b>type-3</b> LSA, so the route code is <code>O*IA</code>, not <code>O*E2</code>. Also, <code>area X default-cost</code> changes only the cost the ABR advertises; the internal router still adds its own interface costs.</p></div>

<div class="scn"><h4>The new ABR that nobody would talk to</h4><p>An engineer replaced a failed ABR and pasted the old config, but the new template had <code>area 51 stub</code> missing. BR's neighbour table stayed empty and the branch lost everything except its LAN. <code>debug ip ospf hello</code> showed "Hello from 1.1.1.1 with mismatched Stub/Transit area option bit". Adding <code>area 51 stub</code> to the new ABR brought the adjacency to FULL within seconds.</p><p><b>Lesson:</b> the area type is part of the neighbour contract, exactly like the area ID, subnet and timers.</p></div>

<div class="iv"><p class="q">"What is the difference between a stub and a totally stubby area, and where do you configure each?"</p><p>Strong answer: stub blocks type-4 and type-5 LSAs and the ABR injects a type-3 default. Totally stubby also blocks type-3 LSAs except that default, so internal routers see only intra-area routes plus <code>O*IA 0.0.0.0/0</code>. <code>area X stub</code> goes on every router in the area; <code>no-summary</code> goes only on the ABR because only the ABR creates type-3 LSAs. Mention <code>default-cost</code> for steering between two ABRs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>area X stub</code> on every router in the area; a mismatched E-bit prevents adjacency.</li>
<li>Stub: no type-4 or type-5; the ABR injects an <code>O*IA</code> default with cost 1 by default.</li>
<li>Totally stubby: <code>area X stub no-summary</code> on the ABR only; one type-3 default remains.</li>
<li><code>area X default-cost N</code> sets the advertised default cost; the receiver adds its link cost.</li>
<li>The core still sees the branch networks: area types filter only inbound LSAs.</li>
</ul></div>
`,hi:`
<p>Ek aise gaon ki kalpana karo jo ek hi sadak ke end par hai. Gaon walon ko desh ke har shehar ka map nahi chahiye. Unhe gaon ke exit par bas ek board chahiye: "Baaki sab jagah: is taraf." <b>Stub area</b> branch ko bilkul yahi board deta hai. <b>Totally stubby area</b> ek kadam aage jaata hai aur aas-paas ke towns ki list bhi hata deta hai.</p>

<h3>Stub area: yeh kaise kaam karta hai</h3>
<ol>
<li>Area ke har router par <code>area 51 stub</code> configure hota hai. Isse uske Hello packets ke options field mein <b>E-bit</b> (external routing capability) clear ho jaata hai.</li>
<li>Routers tabhi neighbours bante hain jab E-bit match kare. Isiliye stub flag area ke <b>har</b> router par set hona chahiye, ABR samet.</li>
<li>ABR area mein type-5 aur type-4 LSAs flood karna band kar deta hai.</li>
<li>ABR area mein ek <b>type-3 default route</b> (0.0.0.0/0) originate karta hai, cost 1 ke saath jab tak aap <code>area 51 default-cost</code> se na badlo. Branch ise <code>O*IA</code> ke roop mein dekhta hai.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Stub area pehle aur baad mein">
<rect x="10" y="20" width="300" height="170" rx="10" fill="#e2e8f0"/><text x="160" y="42" text-anchor="middle" class="svg-ink" font-size="13">BR pehle: normal area 51</text>
<text x="30" y="72" class="svg-ink" font-size="12">O IA 2.2.2.2, 3.3.3.3, 10.0.23.0/30</text>
<text x="30" y="98" class="svg-ink" font-size="12">O E2 203.0.113.0/24</text>
<text x="30" y="124" class="svg-ink" font-size="12">O*E2 0.0.0.0/0 [110/1]</text>
<text x="30" y="160" class="svg-muted" font-size="12">type-4 aur type-5 LSAs maujood</text>
<rect x="330" y="20" width="300" height="170" rx="10" fill="#bbf7d0"/><text x="480" y="42" text-anchor="middle" class="svg-ink" font-size="13">BR baad mein: stub area 51</text>
<text x="350" y="72" class="svg-ink" font-size="12">O IA 2.2.2.2, 3.3.3.3, 10.0.23.0/30</text>
<text x="350" y="98" class="svg-accent" font-size="12">O*IA 0.0.0.0/0 [110/51]</text>
<text x="350" y="124" class="svg-ink" font-size="12">koi O E2 route nahi</text>
<text x="350" y="160" class="svg-muted" font-size="12">default-cost 50 + link cost 1</text>
</svg><p class="cap">Stub lab ek picture mein: external detail ki jagah ek type-3 default.</p></div>

<h3>Lab walk-through: Indore branch, area 51</h3>
<pre class="code"><span class="c">! BR aur ABR (area 51 ka har router)</span>
router ospf 1
 area 51 stub
<span class="c">! Sirf ABR: inject hone wale default ko kam attractive banao</span>
router ospf 1
 area 51 default-cost 50</pre>
<p>Jaise hi aap ABR configure karte ho, BR ke saath adjacency drop hoti hai, kyunki ab unke Hellos E-bit par agree nahi karte. BR configure hote hi woh wapas aati hai. Production mein ise ek chhote maintenance window ki tarah plan karo.</p>
<pre class="out">BR#show ip route ospf
Gateway of last resort is 10.51.12.2 to network 0.0.0.0

<span class="hl">O*IA  0.0.0.0/0 [110/51] via 10.51.12.2, 00:00:41, GigabitEthernet0/0</span>
      2.0.0.0/32 is subnetted, 1 subnets
O IA     2.2.2.2 [110/2] via 10.51.12.2, 00:00:41, GigabitEthernet0/0
      3.0.0.0/32 is subnetted, 1 subnets
O IA     3.3.3.3 [110/3] via 10.51.12.2, 00:00:41, GigabitEthernet0/0
      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
O IA     10.0.23.0/30 [110/2] via 10.51.12.2, 00:00:41, GigabitEthernet0/0

ABR#show ip ospf | section Area 51
    Area 51
        Number of interfaces in this area is 1
<span class="hl">        It is a stub area</span>
<span class="hl">        Generates stub default route with cost 50</span>
        Area has no authentication</pre>
<p>203.0.113.0/24 chala gaya, phir bhi BR se <code>ping 203.0.113.1</code> chalta hai: default packet ko ABR tak le jaata hai, aur ABR ke paas poora external route hai.</p>

<div class="eg"><p><b>Worked example: 51 ka metric.</b> ABR default ko cost 50 ke saath advertise karta hai. BR apne outgoing interface GigabitEthernet0/0 ki cost jodta hai, jo 1 hai (reference bandwidth 100 Mbps ko 1000 Mbps se divide kiya, round up karke 1). 50 + 1 = 51. Default cost 1 ke saath aapko [110/2] dikhta.</p></div>

<h3>Totally stubby: type-3 bhi hatana</h3>
<p>Area 52 (Kochi) mein stub area pehle se chal raha hai, lekin BR ke paas ab bhi har inter-area route hai. <b>Sirf ABR</b> par <code>no-summary</code> jodo. Type-3 LSAs sirf ABR banata hai, isliye keyword ka asar sirf wahin hota hai. BR par simple <code>area 52 stub</code> hi rehta hai.</p>
<pre class="code"><span class="c">! Sirf ABR</span>
router ospf 1
 area 52 stub no-summary</pre>
<pre class="out">BR#show ip route ospf
Gateway of last resort is 10.52.12.2 to network 0.0.0.0

<span class="hl">O*IA  0.0.0.0/0 [110/2] via 10.52.12.2, 00:00:12, GigabitEthernet0/0</span>

BR#show ip ospf database summary

            OSPF Router with ID (1.1.1.1) (Process ID 1)

                Summary Net Link States (Area 52)

  LS age: 15
  Options: (No TOS-capability, DC, Upward)
  LS Type: Summary Links(Network)
<span class="hl">  Link State ID: 0.0.0.0 (summary Network Number)</span>
  Advertising Router: 2.2.2.2
  LS Seq Number: 80000001
  Checksum: 0x93C5
  Length: 28
  Network Mask: /0
        MTID: 0         Metric: 1

ABR#show ip ospf | include stub
<span class="hl">        It is a stub area, no summary LSA in this area</span></pre>
<p>Ab doosri direction prove karo. Totally stubby sirf yeh control karta hai ki area 52 ke <b>andar</b> kya jaaye. CORE ab bhi 192.168.52.0/24 aur 1.1.1.1/32 ko <code>O IA</code> ke roop mein seekhta hai, aur BR se <code>ping 3.3.3.3</code> default ke through successful hota hai.</p>

<h3>Do ABRs aur default cost</h3>
<p>Agar stub area mein do ABRs hain, to dono default inject karte hain aur internal routers kam total cost wala chunte hain. Ek ABR ko primary banane ke liye <code>default-cost</code> use karo: jaise primary par 10 aur backup par 100. Totally stubby area mein branch ko sirf yahi dikhta hai, isliye kisi specific remote prefix ka traffic zaroorat se lamba path le sakta hai. Yahi trade-off hai: chhoti tables, kam path information.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Stub sirf ABR par configure karna: neighbour kabhi nahi banta. (2) Internal router par <code>no-summary</code> lagana aur change expect karna: wahan iska koi asar nahi. (3) Stub area ke router par <code>redistribute</code> jodna: stub area mein type-5 LSAs ho hi nahi sakte, isliye kuch advertise nahi hota. Iske liye NSSA use karo. (4) Area 0 ko stub banane ki koshish: IOS reject karta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stub ya totally stubby area mein default ek <b>type-3</b> LSA hai, isliye route code <code>O*IA</code> hai, <code>O*E2</code> nahi. Aur <code>area X default-cost</code> sirf woh cost badalta hai jo ABR advertise karta hai; internal router ab bhi apne interface costs jodta hai.</p></div>

<div class="scn"><h4>Naya ABR jisse koi baat nahi karta tha</h4><p>Ek engineer ne fail hue ABR ko replace kiya aur purana config paste kiya, lekin naye template mein <code>area 51 stub</code> missing tha. BR ki neighbour table khaali rahi aur branch ne apne LAN ke alawa sab kuch kho diya. <code>debug ip ospf hello</code> ne dikhaya "Hello from 1.1.1.1 with mismatched Stub/Transit area option bit". Naye ABR par <code>area 51 stub</code> jodte hi adjacency kuch seconds mein FULL ho gayi.</p><p><b>Lesson:</b> area type neighbour contract ka hissa hai, bilkul area ID, subnet aur timers ki tarah.</p></div>

<div class="iv"><p class="q">"Stub aur totally stubby area mein kya farak hai, aur har ek kahan configure karte ho?"</p><p>Strong answer: stub type-4 aur type-5 LSAs rokta hai aur ABR ek type-3 default inject karta hai. Totally stubby us default ko chhod kar type-3 LSAs bhi rokta hai, isliye internal routers ko sirf intra-area routes aur <code>O*IA 0.0.0.0/0</code> dikhta hai. <code>area X stub</code> area ke har router par jaata hai; <code>no-summary</code> sirf ABR par, kyunki type-3 LSAs sirf ABR banata hai. Do ABRs ke beech steering ke liye <code>default-cost</code> bhi mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>area X stub</code> area ke har router par; E-bit mismatch adjacency ko rokta hai.</li>
<li>Stub: koi type-4 ya type-5 nahi; ABR default roop se cost 1 ke saath <code>O*IA</code> default inject karta hai.</li>
<li>Totally stubby: sirf ABR par <code>area X stub no-summary</code>; ek type-3 default bachta hai.</li>
<li><code>area X default-cost N</code> advertise hone wala default cost set karta hai; receiver apni link cost jodta hai.</li>
<li>Core ko branch networks ab bhi dikhte hain: area types sirf andar aane wale LSAs filter karte hain.</li>
</ul></div>
`}};export{e as default};