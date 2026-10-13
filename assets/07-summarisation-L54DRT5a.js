var e={id:`summarisation`,h:{en:`Summarisation at the ABR: area range`,hi:`ABR par summarisation: area range`},body:{en:`
<p>A courier company does not tell the head office about every lane in a city. It says 'we deliver to all of Pune'. If one lane is closed for roadwork, head office hears nothing, because the promise still holds for the city. Route summarisation does the same job. One ABR advertises a single prefix that stands for many, and the rest of the network stops hearing about the small changes behind it.</p>

<h3>Why summarise</h3>
<ul>
<li><b>Fewer LSAs and routes.</b> Instead of one type 3 LSA per prefix, the backbone gets one for the whole block. Smaller LSDBs and smaller routing tables everywhere outside the area.</li>
<li><b>Stability.</b> If one LAN in area 1 flaps, the type 3 for that /24 would appear and disappear in every other area. With a summary, the /22 stays up as long as any component is up, so the flap is invisible beyond the ABR.</li>
</ul>
<p>Summarisation between OSPF areas happens only on an <b>ABR</b>. (Summarising external routes at an ASBR uses <code>summary-address</code>, which is a topic for a later course.)</p>

<h3>The command</h3>
<pre class="code">R2(config)# router ospf 1
R2(config-router)# area 1 range 172.16.0.0 255.255.252.0</pre>
<p>Read it as: 'for the routes that originate in <b>area 1</b>, advertise this range into the other areas'. The area number is the area the specific routes live in, not the area you are sending the summary to. A /22 mask here covers 172.16.0.0 to 172.16.3.255, so R1's three LANs 172.16.1.0/24, 172.16.2.0/24 and 172.16.3.0/24 are included (and the unused 172.16.0.0/24).</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Three area 1 prefixes become one 172.16.0.0/22 summary at the ABR">
<rect x="20" y="30" width="170" height="130" rx="10" fill="#ddd6fe" opacity="0.6" stroke="#64748b"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Area 1 (R1)</text>
<text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="12">172.16.1.0/24</text><text x="105" y="102" text-anchor="middle" class="svg-ink" font-size="12">172.16.2.0/24</text><text x="105" y="124" text-anchor="middle" class="svg-ink" font-size="12">172.16.3.0/24</text>
<rect x="250" y="70" width="110" height="60" rx="10" fill="#fff" stroke="#64748b" stroke-width="2"/><text x="305" y="96" text-anchor="middle" class="svg-ink" font-size="13">ABR R2</text><text x="305" y="114" text-anchor="middle" class="svg-accent" font-size="11">area 1 range</text>
<rect x="430" y="30" width="190" height="130" rx="10" fill="#bae6fd" opacity="0.6" stroke="#64748b"/><text x="525" y="50" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text>
<text x="525" y="95" text-anchor="middle" class="svg-ink" font-size="14">172.16.0.0/22</text><text x="525" y="116" text-anchor="middle" class="svg-muted" font-size="11">one type 3 LSA</text>
<line x1="190" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="100" x2="430" y2="100" stroke="#64748b" stroke-width="3"/>
</svg><p class="cap">Three type 3 LSAs become one. The detail is still in area 1, but it no longer leaks.</p></div>

<h3>Before and after</h3>
<p>On R3 in area 0 the three /24s were separate routes (chapter 4). After the command and a few seconds, R3 sees one:</p>
<pre class="out">R3# show ip route ospf
Gateway of last resort is 203.0.113.2 to network 0.0.0.0

      1.0.0.0/32 is subnetted, 1 subnets
O IA     1.1.1.1 [110/3] via 10.0.23.1, 00:01:10, GigabitEthernet0/0
      2.0.0.0/32 is subnetted, 1 subnets
O        2.2.2.2 [110/2] via 10.0.23.1, 00:01:10, GigabitEthernet0/0
      10.0.0.0/30 is subnetted, 1 subnets
O IA     10.0.12.0 [110/2] via 10.0.23.1, 00:01:10, GigabitEthernet0/0
      172.16.0.0/22 is subnetted, 1 subnets
<span class="hl">O IA     172.16.0.0 [110/3] via 10.0.23.1, 00:00:10, GigabitEthernet0/0</span></pre>
<p>Three O IA lines became one /22 line. The same change in the database, seen on R3:</p>
<pre class="out">R3# show ip ospf database
...
		Summary Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
1.1.1.1         2.2.2.2         70          0x80000001 0x0047AD
10.0.12.0       2.2.2.2         70          0x80000001 0x001981
<span class="hl">172.16.0.0      2.2.2.2         10          0x80000001 0x007092</span></pre>
<p>Notice that 1.1.1.1/32 and 10.0.12.0/30 are still there: they are not inside 172.16.0.0/22, so the range does not touch them. On the ABR itself, the range shows up in <code>show ip ospf</code>:</p>
<pre class="out">R2# show ip ospf | include Area 1|ranges|172.16
        Area ranges are
    Area 1
        Area ranges are
<span class="hl">           172.16.0.0/22 Active(3) Advertise</span></pre>
<p>'Active' means at least one component route exists in area 1. 'Advertise' means the summary is sent (the other choice, <code>not-advertise</code>, hides the range entirely).</p>

<h3>How the summary cost is set</h3>
<p>By default the summary takes the <b>highest cost among its components</b>, so the summary never looks cheaper than the worst component. You can override this with <code>area 1 range 172.16.0.0 255.255.252.0 cost 50</code>; R3 then reports <code>[110/51]</code> to that prefix (50 plus the 1 it takes to reach R2). It is the tool for steering traffic towards one ABR when two ABRs advertise the same range.</p>

<h3>What a summary hides and the risks</h3>
<dl class="terms">
<dt>It hides detail</dt><dd>Other areas can no longer see which of the /24s is up. If 172.16.3.0/24 fails but the other two are alive, the /22 stays and traffic for 172.16.3.x still enters area 1, then dies at R2 or R1. Failure becomes slower to detect, but also quieter.</dd>
<dt>It adds a discard route</dt><dd>IOS puts a route to Null0 for the summary on the ABR, so that traffic for a missing component cannot loop back out through the default route. If you ever see that Null0 route, it is the range doing its job.</dd>
<dt>It can cause sub-optimal paths</dt><dd>If two ABRs both advertise the /22 with the same cost, other routers pick by their own costs and may choose the farther exit for some /24s.</dd>
<dt>It needs a clean address plan</dt><dd>A range only works when the area's prefixes sit inside one aligned block. Prefixes that are scattered cannot be summarised without including addresses that belong somewhere else.</dd>
</dl>

<h3>The discontiguous area pitfall</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Two areas both holding subnets of 172.16.0.0/16, so the range on one ABR attracts the other area's traffic">
<rect x="20" y="30" width="190" height="110" rx="10" fill="#ddd6fe" opacity="0.6" stroke="#64748b"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 1</text><text x="115" y="82" text-anchor="middle" class="svg-ink" font-size="12">172.16.1.0/24</text><text x="115" y="104" text-anchor="middle" class="svg-ink" font-size="12">172.16.3.0/24</text>
<rect x="430" y="30" width="190" height="110" rx="10" fill="#fde68a" opacity="0.6" stroke="#64748b"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 2</text><text x="525" y="82" text-anchor="middle" class="svg-ink" font-size="12">172.16.2.0/24</text><text x="525" y="104" text-anchor="middle" class="svg-ink" font-size="12">172.16.4.0/24</text>
<rect x="250" y="55" width="140" height="60" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text><text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="11">area 1 range 172.16.0.0/16</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Area 1's /16 also covers area 2's subnets</text>
</svg><p class="cap">The /16 range pulls traffic for 172.16.2.0/24 towards area 1, even though the subnet lives in area 2.</p></div>
<p>Longest match saves you in most cases: the more specific /24 advertised by area 2's ABR beats the /16 from area 1's ABR, so traffic usually still reaches the right place. The trouble comes when the specific route disappears (a flap in area 2) and the traffic falls back to the /16, ending in area 1's Null0 discard. The rule: <b>design addressing so that each area owns one contiguous block</b>, and range only that block. A discontiguous area, whose subnets are spread among other areas' ranges, makes summarisation unsafe.</p>

<div class="eg"><p><b>Worked example.</b> Area 1 has 12 branch LANs from 172.16.16.0/24 to 172.16.27.0/24. Is one range possible? 172.16.16.0/20 covers 172.16.16.0 to 172.16.31.255. That includes 12 used and 4 free /24s: acceptable, provided no other area owns 172.16.28.0 to 172.16.31.0. Configure <code>area 1 range 172.16.16.0 255.255.240.0</code>. Twelve type 3 LSAs become one, and a flap on any single LAN is invisible outside area 1. If instead area 2 already uses 172.16.30.0/24, the /20 would swallow it and you must use two smaller ranges: 172.16.16.0/21 and 172.16.24.0/22.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Writing the wrong area number in the range command (it then covers nothing; see chapter 9). Choosing a block bigger than the area's prefixes, so it includes addresses of another area. Forgetting that failures behind a range are now hidden. Putting the range on a router that is not an ABR: it has no effect.</p></div>

<div class="exam"><p><b>Exam traps.</b> Inter-area summarisation is done on the ABR with <code>area N range</code>, where N is the area that owns the specific routes. The summary is a type 3 LSA. By default the cost is the highest component cost. External summarisation uses a different command on the ASBR. Summarisation is a CCNP topic in depth, but the idea (fewer routes, hidden flaps) is fair game on the CCNA.</p></div>

<div class="scn"><h4>The flapping shop that nobody heard about</h4><p>A regional bank had one area per state. A shop in a rural branch lost power every afternoon, and its /24 appeared and vanished in the backbone every day. Head-office routers were rerunning calculations for a branch they had never heard of. A single <code>area 7 range 10.7.0.0 255.255.0.0</code> on the state ABR removed the daily noise: the head office saw one stable /16, and only the state's routers knew about the afternoon blackout.</p><p><b>Lesson:</b> summaries are as much about stability as about table size.</p></div>

<div class="iv"><p class="q">'What is the benefit and the risk of summarising at an ABR?'</p><p>Strong answer: the benefit is smaller LSDBs and routing tables outside the area, and flaps inside the area do not reach the backbone. The risks are hidden failures (the summary stays up while a specific prefix is down), possible sub-optimal routing with several ABRs, and wrong summaries when the addressing is not contiguous. So I design the plan first: one aligned block per area.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>area N range ADDRESS MASK</code> on an ABR replaces many type 3 LSAs with one; N is the area that owns the prefixes.</li>
<li>Summaries hide flaps and shrink tables, but also hide specific failures.</li>
<li>The default summary cost is the highest component cost; <code>cost</code> overrides it.</li>
<li>Give each area one contiguous address block, or the summary will cover subnets that belong elsewhere.</li>
</ul></div>
`,hi:`
<p>Ek courier company head office ko shehar ki har gali ke baare mein nahi batati. Woh kehti hai 'hum poore Pune mein deliver karte hain'. Agar ek gali roadwork ki wajah se band ho, to head office ko kuch pata nahi chalta, kyunki shehar ke liye waada abhi bhi sahi hai. Route summarisation yahi kaam karta hai. Ek ABR ek prefix advertise karta hai jo kai prefixes ki jagah hai, aur baaki network uske peeche ke chhote changes ke baare mein sunna band kar deta hai.</p>

<h3>Summarise kyun karte hain</h3>
<ul>
<li><b>Kam LSAs aur routes.</b> Har prefix ke liye ek type 3 LSA ki jagah backbone ko poore block ke liye ek milta hai. Area ke bahar har jagah chhote LSDB aur chhoti routing tables.</li>
<li><b>Stability.</b> Agar area 1 ka ek LAN flap kare, to us /24 ka type 3 har dusre area mein aata aur jaata. Summary ke saath /22 tab tak up rehta hai jab tak koi bhi component up hai, isliye flap ABR ke aage dikhta hi nahi.</li>
</ul>
<p>OSPF areas ke beech summarisation sirf <b>ABR</b> par hota hai. (ASBR par external routes summarise karne ke liye <code>summary-address</code> hota hai, jo aage ke course ka topic hai.)</p>

<h3>Command</h3>
<pre class="code">R2(config)# router ospf 1
R2(config-router)# area 1 range 172.16.0.0 255.255.252.0</pre>
<p>Isse aise padho: '<b>area 1</b> se nikalne wale routes ke liye yeh range baaki areas mein advertise karo'. Area number woh area hai jismein specific routes rehte hain, woh nahi jahan summary bhej rahe ho. Yahan /22 mask 172.16.0.0 se 172.16.3.255 tak cover karta hai, isliye R1 ke teeno LANs 172.16.1.0/24, 172.16.2.0/24 aur 172.16.3.0/24 (aur unused 172.16.0.0/24) shaamil hain.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Area 1 ke teen prefixes ABR par ek 172.16.0.0/22 summary ban jaate hain">
<rect x="20" y="30" width="170" height="130" rx="10" fill="#ddd6fe" opacity="0.6" stroke="#64748b"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Area 1 (R1)</text>
<text x="105" y="80" text-anchor="middle" class="svg-ink" font-size="12">172.16.1.0/24</text><text x="105" y="102" text-anchor="middle" class="svg-ink" font-size="12">172.16.2.0/24</text><text x="105" y="124" text-anchor="middle" class="svg-ink" font-size="12">172.16.3.0/24</text>
<rect x="250" y="70" width="110" height="60" rx="10" fill="#fff" stroke="#64748b" stroke-width="2"/><text x="305" y="96" text-anchor="middle" class="svg-ink" font-size="13">ABR R2</text><text x="305" y="114" text-anchor="middle" class="svg-accent" font-size="11">area 1 range</text>
<rect x="430" y="30" width="190" height="130" rx="10" fill="#bae6fd" opacity="0.6" stroke="#64748b"/><text x="525" y="50" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text>
<text x="525" y="95" text-anchor="middle" class="svg-ink" font-size="14">172.16.0.0/22</text><text x="525" y="116" text-anchor="middle" class="svg-muted" font-size="11">ek type 3 LSA</text>
<line x1="190" y1="100" x2="250" y2="100" stroke="#64748b" stroke-width="2"/><line x1="360" y1="100" x2="430" y2="100" stroke="#64748b" stroke-width="3"/>
</svg><p class="cap">Teen type 3 LSAs ek ban gaye. Detail abhi bhi area 1 mein hai, lekin ab leak nahi hoti.</p></div>

<h3>Pehle aur baad</h3>
<p>Area 0 ke R3 par teeno /24 alag routes the (chapter 4). Command aur kuch seconds ke baad R3 ko ek dikhta hai:</p>
<pre class="out">R3# show ip route ospf
Gateway of last resort is 203.0.113.2 to network 0.0.0.0

      1.0.0.0/32 is subnetted, 1 subnets
O IA     1.1.1.1 [110/3] via 10.0.23.1, 00:01:10, GigabitEthernet0/0
      2.0.0.0/32 is subnetted, 1 subnets
O        2.2.2.2 [110/2] via 10.0.23.1, 00:01:10, GigabitEthernet0/0
      10.0.0.0/30 is subnetted, 1 subnets
O IA     10.0.12.0 [110/2] via 10.0.23.1, 00:01:10, GigabitEthernet0/0
      172.16.0.0/22 is subnetted, 1 subnets
<span class="hl">O IA     172.16.0.0 [110/3] via 10.0.23.1, 00:00:10, GigabitEthernet0/0</span></pre>
<p>Teen O IA lines ek /22 line ban gayi. Database mein wahi change, R3 par:</p>
<pre class="out">R3# show ip ospf database
...
		Summary Net Link States (Area 0)

Link ID         ADV Router      Age         Seq#       Checksum
1.1.1.1         2.2.2.2         70          0x80000001 0x0047AD
10.0.12.0       2.2.2.2         70          0x80000001 0x001981
<span class="hl">172.16.0.0      2.2.2.2         10          0x80000001 0x007092</span></pre>
<p>Dhyan do ki 1.1.1.1/32 aur 10.0.12.0/30 abhi bhi hain: woh 172.16.0.0/22 ke andar nahi hain, isliye range unhe nahi chhoota. ABR par khud range <code>show ip ospf</code> mein dikhti hai:</p>
<pre class="out">R2# show ip ospf | include Area 1|ranges|172.16
        Area ranges are
    Area 1
        Area ranges are
<span class="hl">           172.16.0.0/22 Active(3) Advertise</span></pre>
<p>'Active' matlab area 1 mein kam se kam ek component route maujood hai. 'Advertise' matlab summary bheji ja rahi hai (doosra option <code>not-advertise</code> range ko poori tarah chhupa deta hai).</p>

<h3>Summary ki cost kaise set hoti hai</h3>
<p>Default mein summary apne components mein se <b>sabse zyada cost</b> leti hai, taaki summary kabhi sabse kharab component se sasti na dikhe. Aap ise <code>area 1 range 172.16.0.0 255.255.252.0 cost 50</code> se override kar sakte ho; R3 tab us prefix ke liye <code>[110/51]</code> report karta hai (50 plus R2 tak 1). Jab do ABRs same range advertise karein, to traffic ko ek ABR ki taraf mod-ne ka yahi tool hai.</p>

<h3>Summary kya chhupati hai aur risks</h3>
<dl class="terms">
<dt>Detail chhupati hai</dt><dd>Dusre areas ab nahi dekh sakte ki kaun sa /24 up hai. Agar 172.16.3.0/24 fail ho par baaki do zinda hon, to /22 bani rehti hai, aur 172.16.3.x ka traffic area 1 mein ghusta hai, phir R2 ya R1 par dam tod deta hai. Failure pakadna dheema ho jaata hai, lekin shor bhi kam.</dd>
<dt>Discard route jodti hai</dt><dd>IOS ABR par summary ke liye Null0 ka route daal deta hai, taaki kisi missing component ka traffic default route se wapas loop na kare. Agar kabhi woh Null0 route dikhe, to range apna kaam kar rahi hai.</dd>
<dt>Sub-optimal paths de sakti hai</dt><dd>Agar do ABRs dono /22 same cost se advertise karein, to baaki routers apni costs se chunte hain aur kuch /24s ke liye door wala exit chun sakte hain.</dd>
<dt>Saaf address plan chahiye</dt><dd>Range tabhi chalti hai jab area ke prefixes ek aligned block ke andar hon. Bikhre prefixes ko summarise nahi kar sakte bina aise addresses jode jo kahin aur ke hain.</dd>
</dl>

<h3>Discontiguous area ka pitfall</h3>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Do areas dono 172.16.0.0/16 ke subnets rakhte hain, isliye ek ABR ki range dusre area ka traffic kheenchti hai">
<rect x="20" y="30" width="190" height="110" rx="10" fill="#ddd6fe" opacity="0.6" stroke="#64748b"/><text x="115" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 1</text><text x="115" y="82" text-anchor="middle" class="svg-ink" font-size="12">172.16.1.0/24</text><text x="115" y="104" text-anchor="middle" class="svg-ink" font-size="12">172.16.3.0/24</text>
<rect x="430" y="30" width="190" height="110" rx="10" fill="#fde68a" opacity="0.6" stroke="#64748b"/><text x="525" y="52" text-anchor="middle" class="svg-ink" font-size="13">Area 2</text><text x="525" y="82" text-anchor="middle" class="svg-ink" font-size="12">172.16.2.0/24</text><text x="525" y="104" text-anchor="middle" class="svg-ink" font-size="12">172.16.4.0/24</text>
<rect x="250" y="55" width="140" height="60" rx="10" fill="#bae6fd" stroke="#64748b"/><text x="320" y="82" text-anchor="middle" class="svg-ink" font-size="13">Area 0</text><text x="320" y="100" text-anchor="middle" class="svg-accent" font-size="11">area 1 range 172.16.0.0/16</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Area 1 ka /16 area 2 ke subnets bhi cover karta hai</text>
</svg><p class="cap">/16 range 172.16.2.0/24 ka traffic area 1 ki taraf kheenchti hai, jabki subnet area 2 mein hai.</p></div>
<p>Zyadatar cases mein longest match bachata hai: area 2 ke ABR ka specific /24, area 1 ke ABR ke /16 par bhaari padta hai, isliye traffic aam taur par sahi jagah pahunchta hai. Dikkat tab aati hai jab specific route gayab ho jaaye (area 2 mein flap) aur traffic /16 par gir jaaye, jo area 1 ke Null0 discard mein khatam hota hai. Rule: <b>addressing aise design karo ki har area ke paas ek contiguous block ho</b>, aur sirf usi block ki range lagao. Discontiguous area, jiske subnets dusre areas ki ranges ke beech bikhre hon, summarisation ko unsafe bana deta hai.</p>

<div class="eg"><p><b>Worked example.</b> Area 1 mein 172.16.16.0/24 se 172.16.27.0/24 tak 12 branch LANs hain. Ek range possible hai? 172.16.16.0/20 172.16.16.0 se 172.16.31.255 tak cover karta hai. Isme 12 used aur 4 free /24 hain: theek hai, bashart 172.16.28.0 se 172.16.31.0 ka koi aur area maalik na ho. Configure karo <code>area 1 range 172.16.16.0 255.255.240.0</code>. Baarah type 3 LSAs ek ho gaye, aur kisi bhi akele LAN ka flap area 1 ke bahar nahi dikhta. Agar area 2 pehle se 172.16.30.0/24 use karta hai, to /20 use nigal jaata, aur aapko do chhoti ranges chahiye: 172.16.16.0/21 aur 172.16.24.0/22.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Range command mein galat area number likhna (tab range kuch cover nahi karti; chapter 9 dekho). Area ke prefixes se bada block chunna, jisme dusre area ke addresses aa jaate hain. Bhoolna ki range ke peeche ki failures ab chhup gayi hain. Range ko aise router par lagana jo ABR nahi hai: koi asar nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Inter-area summarisation ABR par <code>area N range</code> se hoti hai, jahan N woh area hai jo specific routes ka maalik hai. Summary type 3 LSA hai. Default cost sabse zyada component cost hai. External summarisation ASBR par alag command se hoti hai. Summarisation gehrai mein CCNP topic hai, lekin idea (kam routes, chhupe flaps) CCNA mein bhi poocha ja sakta hai.</p></div>

<div class="scn"><h4>Woh flapping dukaan jiske baare mein kisi ne suna hi nahi</h4><p>Ek regional bank ka har state ke liye ek area tha. Ek rural branch ki dukaan ki bijli roz dopahar ko jaati thi, aur uska /24 roz backbone mein aata aur jaata tha. Head-office ke routers ek aisi branch ke liye calculations dobara chala rahe the jiske baare mein unhone kabhi suna hi nahi tha. State ABR par ek <code>area 7 range 10.7.0.0 255.255.0.0</code> ne roz ka shor hata diya: head office ko ek stable /16 dikha, aur dopahar ke blackout ke baare mein sirf state ke routers jaante the.</p><p><b>Seekh:</b> summaries utni hi stability ke liye hain jitni table size ke liye.</p></div>

<div class="iv"><p class="q">'ABR par summarise karne ka fayda aur risk kya hai?'</p><p>Strong answer: fayda yeh ki area ke bahar chhote LSDB aur routing tables, aur area ke andar ke flaps backbone tak nahi pahunchte. Risks: chhupi failures (summary up rehti hai jabki specific prefix down hai), kai ABRs ke saath sub-optimal routing ki sambhavna, aur addressing contiguous na ho to galat summaries. Isliye main pehle plan banata hoon: har area ke liye ek aligned block.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>ABR par <code>area N range ADDRESS MASK</code> kai type 3 LSAs ko ek se badal deta hai; N woh area hai jo prefixes ka maalik hai.</li>
<li>Summaries flaps chhupati hain aur tables chhoti karti hain, lekin specific failures bhi chhupa deti hain.</li>
<li>Default summary cost sabse zyada component cost hai; <code>cost</code> ise override karta hai.</li>
<li>Har area ko ek contiguous address block do, warna summary un subnets ko bhi cover karegi jo kahin aur ke hain.</li>
</ul></div>
`}};export{e as default};