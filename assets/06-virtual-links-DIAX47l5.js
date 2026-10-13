var e={id:`virtual-links`,h:{en:`Virtual links: reconnecting an area to the backbone (lab: new plant)`,hi:`Virtual links: area ko backbone se dobara jodna (lab: naya plant)`},body:{en:`
<p>Picture a metro city where every suburb must connect to the central ring road. A new suburb gets built, but the builder connects it only to a neighbouring suburb, not to the ring road. Buses from the new suburb cannot reach the centre, because the rules say inter-suburb buses must pass through the ring road. The quick fix is a dedicated bus lane through the neighbouring suburb that <b>counts as ring road</b>. In OSPF that lane is a <b>virtual link</b>.</p>

<h3>Why an area must touch area 0</h3>
<p>OSPF multi-area design is a two-level hierarchy. Inter-area routes travel only <b>through area 0</b>: an ABR takes the summaries it learns from the backbone and injects them into its other areas, and it ignores type-3 LSAs that arrive in a non-backbone area. This rule is OSPF's loop prevention between areas. So if area 2 attaches only to area 1, nothing from area 0 ever reaches area 2, and area 0 never hears about area 2.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Virtual link across area 1">
<rect x="10" y="70" width="190" height="110" rx="10" fill="#bae6fd"/><text x="105" y="170" text-anchor="middle" class="svg-ink" font-size="12">Area 0</text>
<rect x="220" y="70" width="200" height="110" rx="10" fill="#bbf7d0"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Area 1 (transit)</text>
<rect x="440" y="70" width="190" height="110" rx="10" fill="#fde68a"/><text x="535" y="170" text-anchor="middle" class="svg-ink" font-size="12">Area 2</text>
<rect x="30" y="100" width="70" height="40" rx="8" fill="#ffffff" stroke="#64748b"/><text x="65" y="125" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="175" y="100" width="70" height="40" rx="8" fill="#ddd6fe"/><text x="210" y="125" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="395" y="100" width="70" height="40" rx="8" fill="#ddd6fe"/><text x="430" y="125" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="540" y="100" width="70" height="40" rx="8" fill="#ffffff" stroke="#64748b"/><text x="575" y="125" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<line x1="100" y1="120" x2="175" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="245" y1="120" x2="395" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="465" y1="120" x2="540" y2="120" stroke="#64748b" stroke-width="2"/>
<path d="M210 100 C 260 30, 380 30, 430 100" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">virtual link OSPF_VL0 (area 0)</text>
<text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">10.1.23.0/30</text>
</svg><p class="cap">The lab topology. R2 (2.2.2.2) and R3 (3.3.3.3) share area 1. The virtual link makes R3 a real area 0 router, so it can act as a full ABR for area 2.</p></div>

<h3>Lab walk-through: the new plant (area 2, R4)</h3>
<p>Symptoms before the fix: R4 has only its own networks plus, at most, prefixes from area 1; R1 has no route to 4.4.4.4 or 10.2.34.0/30. R3 is attached to two areas, but without a backbone connection it cannot pass area 0 routes into area 2. Configure the link on <b>both</b> ABRs, using the other end's <b>router ID</b> and the <b>transit area</b> number:</p>
<pre class="code"><span class="c">! R2 (ABR between area 0 and area 1)</span>
router ospf 1
 area 1 virtual-link 3.3.3.3
<span class="c">! R3 (ABR between area 1 and area 2)</span>
router ospf 1
 area 1 virtual-link 2.2.2.2</pre>
<pre class="out">R3#show ip ospf virtual-links
<span class="hl">Virtual Link OSPF_VL0 to router 2.2.2.2 is up</span>
  Run as demand circuit
  DoNotAge LSA allowed.
<span class="hl">  Transit area 1, via interface GigabitEthernet0/0</span>
 Topology-MTID    Cost    Disabled     Shutdown      Topology Name
        0           1         no          no            Base
  Transmit Delay is 1 sec, State POINT_TO_POINT,
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
    Hello due in 00:00:04
<span class="hl">    Adjacency State FULL (Hello suppressed)</span>

R2#show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">3.3.3.3           0   FULL/  -           -        10.1.23.2       OSPF_VL0</span>
1.1.1.1           1   FULL/BDR        00:00:35    10.0.12.1       GigabitEthernet0/0
3.3.3.3           1   FULL/DR         00:00:31    10.1.23.2       GigabitEthernet0/1

R3#show ip ospf | include border
<span class="hl"> It is an area border router</span>

R1#show ip route ospf | include 4.4.4.4
<span class="hl">O IA     4.4.4.4 [110/4] via 10.0.12.2, 00:00:22, GigabitEthernet0/0</span></pre>
<p>Notice two things. R3 appears twice in R2's neighbour table: once on the real area 1 interface and once on <code>OSPF_VL0</code>, the virtual interface that belongs to area 0. The virtual link neighbour has no dead time, because Hellos are suppressed (it runs as a demand circuit), and LSAs sent over it are marked DoNotAge. Finish with <code>ping 1.1.1.1</code> from R4.</p>

<div class="eg"><p><b>Worked example: the metric of 4.</b> R1 reaches 4.4.4.4/32 through R1 to R2 (cost 1), R2 to R3 (cost 1), R3 to R4 (cost 1) and R4's loopback (cost 1): 1 + 1 + 1 + 1 = 4. The virtual link's cost (1) is simply the intra-area cost through area 1 from R2 to R3, so it does not add anything extra.</p></div>

<h3>The rules of virtual links</h3>
<ul>
<li>Both ends must be ABRs that share the transit area; you name the <b>transit area</b> and the far end's <b>router ID</b>, never an IP address.</li>
<li>The transit area must be a <b>normal</b> area. It cannot be a stub, totally stubby, NSSA or area 0.</li>
<li>The virtual link is an <b>area 0 interface</b>. Anything configured for area 0, especially <code>area 0 authentication</code>, applies to it. Its key is set with <code>area 1 virtual-link 3.3.3.3 message-digest-key 1 md5 &lt;key&gt;</code> or <code>... authentication key-chain &lt;name&gt;</code>.</li>
<li>If a router ID changes, the far end still points to the old one and the link fails. Always set <code>router-id</code> explicitly on virtual-link endpoints.</li>
<li>Timers can be tuned per link, for example <code>area 1 virtual-link 3.3.3.3 hello-interval 5</code>, and must match on both ends.</li>
</ul>

<h3>When to use one, and the alternatives</h3>
<p>Use a virtual link for (1) an area that is not attached to area 0, as in the lab, or (2) a <b>partitioned backbone</b>, where area 0 has been split into two islands by a failure or bad design. Treat it as a temporary repair. Better long-term options are: redesign so the area touches area 0 (for example put the R2-R3 link into area 0), build a <b>GRE tunnel</b> placed in area 0 between the ABRs (works even across stub areas, but adds overhead and MTU concerns), or run separate OSPF processes joined by redistribution.</p>

<div class="warn"><p><b>Common mistakes.</b> Using the neighbour's interface address instead of its router ID. Configuring only one end. Choosing a stub or NSSA as the transit area: IOS will not bring the link up. Adding <code>area 0 authentication message-digest</code> later and forgetting the virtual link: it drops when the dead timer expires.</p></div>

<div class="exam"><p><b>Exam trap.</b> In <code>area 1 virtual-link 3.3.3.3</code>, "area 1" is the <b>transit</b> area, not area 0 and not the disconnected area. And a virtual link can never be built through a stub or NSSA area.</p></div>

<div class="scn"><h4>The virtual link that died after a reload</h4><p>A manufacturing company had used a virtual link for two years to reach a plant area. After a power cut, the plant's ABR rebooted, a new loopback that someone had added was now the highest address, and the router ID changed from 3.3.3.3 to 10.99.0.1. The head-office ABR still had <code>area 1 virtual-link 3.3.3.3</code>, so <code>show ip ospf virtual-links</code> showed the link down and the whole plant was isolated. Configuring <code>router-id 3.3.3.3</code> and clearing the OSPF process restored it; the team then scheduled a redesign to remove the virtual link.</p><p><b>Lesson:</b> hard-code router IDs on anything that is referenced by router ID.</p></div>

<div class="iv"><p class="q">"What is a virtual link, when do you need one and what are its limitations?"</p><p>Strong answer: a logical area 0 link between two ABRs across a normal transit area, used to connect an area that has no physical link to area 0 or to heal a partitioned backbone. It is configured on both ABRs with the transit area and the peer's router ID, it appears as OSPF_VL0, and it inherits area 0 authentication. It cannot cross stub or NSSA areas. Say it is a workaround and name alternatives: redesign, a GRE tunnel in area 0, or redistribution between processes.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inter-area routes pass only through area 0; an area without a backbone link is isolated.</li>
<li><code>area &lt;transit&gt; virtual-link &lt;peer RID&gt;</code> on both ABRs builds OSPF_VL0 in area 0.</li>
<li>The transit area must be normal; the link inherits area 0 authentication.</li>
<li>Verify with <code>show ip ospf virtual-links</code>, the OSPF_VL0 neighbour and O IA routes end to end.</li>
<li>Hard-code router IDs, and plan to replace the virtual link with a proper design.</li>
</ul></div>
`,hi:`
<p>Ek metro city socho jahan har suburb ko central ring road se judna zaroori hai. Ek naya suburb banta hai, lekin builder use sirf padosi suburb se jodta hai, ring road se nahi. Naye suburb ki buses centre tak nahi pahunch paati, kyunki rule kehta hai ki suburbs ke beech ki buses ring road se hi guzarengi. Jaldi ka fix hai padosi suburb ke through ek dedicated bus lane jo <b>ring road ki tarah gini jaaye</b>. OSPF mein woh lane <b>virtual link</b> hai.</p>

<h3>Har area ka area 0 ko chhoona kyun zaroori hai</h3>
<p>OSPF multi-area design do level ki hierarchy hai. Inter-area routes sirf <b>area 0 ke through</b> jaate hain: ABR backbone se seekhi summaries ko apne doosre areas mein inject karta hai, aur non-backbone area mein aaye type-3 LSAs ko ignore karta hai. Yeh rule areas ke beech OSPF ka loop prevention hai. Isliye agar area 2 sirf area 1 se juda hai, to area 0 se kuch bhi area 2 tak nahi pahunchta, aur area 0 ko area 2 ke baare mein kabhi pata nahi chalta.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Area 1 ke paar virtual link">
<rect x="10" y="70" width="190" height="110" rx="10" fill="#bae6fd"/><text x="105" y="170" text-anchor="middle" class="svg-ink" font-size="12">Area 0</text>
<rect x="220" y="70" width="200" height="110" rx="10" fill="#bbf7d0"/><text x="320" y="170" text-anchor="middle" class="svg-ink" font-size="12">Area 1 (transit)</text>
<rect x="440" y="70" width="190" height="110" rx="10" fill="#fde68a"/><text x="535" y="170" text-anchor="middle" class="svg-ink" font-size="12">Area 2</text>
<rect x="30" y="100" width="70" height="40" rx="8" fill="#ffffff" stroke="#64748b"/><text x="65" y="125" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="175" y="100" width="70" height="40" rx="8" fill="#ddd6fe"/><text x="210" y="125" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="395" y="100" width="70" height="40" rx="8" fill="#ddd6fe"/><text x="430" y="125" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<rect x="540" y="100" width="70" height="40" rx="8" fill="#ffffff" stroke="#64748b"/><text x="575" y="125" text-anchor="middle" class="svg-ink" font-size="13">R4</text>
<line x1="100" y1="120" x2="175" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="245" y1="120" x2="395" y2="120" stroke="#64748b" stroke-width="2"/>
<line x1="465" y1="120" x2="540" y2="120" stroke="#64748b" stroke-width="2"/>
<path d="M210 100 C 260 30, 380 30, 430 100" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="6 4"/>
<text x="320" y="40" text-anchor="middle" class="svg-accent" font-size="12">virtual link OSPF_VL0 (area 0)</text>
<text x="320" y="112" text-anchor="middle" class="svg-muted" font-size="12">10.1.23.0/30</text>
</svg><p class="cap">Lab topology. R2 (2.2.2.2) aur R3 (3.3.3.3) area 1 share karte hain. Virtual link R3 ko asli area 0 router bana deta hai, taaki woh area 2 ke liye poora ABR ban sake.</p></div>

<h3>Lab walk-through: naya plant (area 2, R4)</h3>
<p>Fix se pehle ke symptoms: R4 ke paas sirf apne networks aur zyada se zyada area 1 ke prefixes hain; R1 ke paas 4.4.4.4 ya 10.2.34.0/30 ka koi route nahi. R3 do areas se juda hai, lekin backbone connection ke bina woh area 0 ke routes area 2 mein nahi bhej sakta. Link <b>dono</b> ABRs par configure karo, doosre end ka <b>router ID</b> aur <b>transit area</b> number use karke:</p>
<pre class="code"><span class="c">! R2 (area 0 aur area 1 ke beech ABR)</span>
router ospf 1
 area 1 virtual-link 3.3.3.3
<span class="c">! R3 (area 1 aur area 2 ke beech ABR)</span>
router ospf 1
 area 1 virtual-link 2.2.2.2</pre>
<pre class="out">R3#show ip ospf virtual-links
<span class="hl">Virtual Link OSPF_VL0 to router 2.2.2.2 is up</span>
  Run as demand circuit
  DoNotAge LSA allowed.
<span class="hl">  Transit area 1, via interface GigabitEthernet0/0</span>
 Topology-MTID    Cost    Disabled     Shutdown      Topology Name
        0           1         no          no            Base
  Transmit Delay is 1 sec, State POINT_TO_POINT,
  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
    Hello due in 00:00:04
<span class="hl">    Adjacency State FULL (Hello suppressed)</span>

R2#show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">3.3.3.3           0   FULL/  -           -        10.1.23.2       OSPF_VL0</span>
1.1.1.1           1   FULL/BDR        00:00:35    10.0.12.1       GigabitEthernet0/0
3.3.3.3           1   FULL/DR         00:00:31    10.1.23.2       GigabitEthernet0/1

R3#show ip ospf | include border
<span class="hl"> It is an area border router</span>

R1#show ip route ospf | include 4.4.4.4
<span class="hl">O IA     4.4.4.4 [110/4] via 10.0.12.2, 00:00:22, GigabitEthernet0/0</span></pre>
<p>Do cheezein dekho. R3 R2 ki neighbour table mein do baar dikhta hai: ek baar asli area 1 interface par aur ek baar <code>OSPF_VL0</code> par, jo area 0 ka virtual interface hai. Virtual link neighbour ka koi dead time nahi hota, kyunki Hellos suppressed hain (yeh demand circuit ki tarah chalta hai), aur iske upar bheje LSAs DoNotAge mark hote hain. R4 se <code>ping 1.1.1.1</code> ke saath khatam karo.</p>

<div class="eg"><p><b>Worked example: 4 ka metric.</b> R1 4.4.4.4/32 tak R1 se R2 (cost 1), R2 se R3 (cost 1), R3 se R4 (cost 1) aur R4 ke loopback (cost 1) ke through pahunchta hai: 1 + 1 + 1 + 1 = 4. Virtual link ki cost (1) bas area 1 ke through R2 se R3 ki intra-area cost hai, isliye yeh kuch extra nahi jodti.</p></div>

<h3>Virtual links ke rules</h3>
<ul>
<li>Dono ends ABRs hone chahiye jo transit area share karte hain; aap <b>transit area</b> aur door wale end ka <b>router ID</b> likhte ho, kabhi IP address nahi.</li>
<li>Transit area <b>normal</b> hona chahiye. Woh stub, totally stubby, NSSA ya area 0 nahi ho sakta.</li>
<li>Virtual link ek <b>area 0 interface</b> hai. Area 0 ke liye jo bhi configure hai, khaas kar <code>area 0 authentication</code>, us par lagu hota hai. Uski key <code>area 1 virtual-link 3.3.3.3 message-digest-key 1 md5 &lt;key&gt;</code> ya <code>... authentication key-chain &lt;name&gt;</code> se set hoti hai.</li>
<li>Agar router ID badalta hai, to door wala end ab bhi purane ko point karta hai aur link fail ho jaata hai. Virtual-link endpoints par hamesha <code>router-id</code> explicitly set karo.</li>
<li>Timers har link par tune ho sakte hain, jaise <code>area 1 virtual-link 3.3.3.3 hello-interval 5</code>, aur dono ends par match hone chahiye.</li>
</ul>

<h3>Kab use karein, aur alternatives</h3>
<p>Virtual link (1) aise area ke liye use karo jo area 0 se juda nahi hai, jaise lab mein, ya (2) <b>partitioned backbone</b> ke liye, jahan failure ya galat design ne area 0 ko do islands mein tod diya ho. Ise temporary repair samjho. Long-term behtar options hain: aisa redesign ki area area 0 ko chhoye (jaise R2-R3 link ko area 0 mein daalna), ABRs ke beech area 0 mein ek <b>GRE tunnel</b> banana (stub areas ke paar bhi kaam karta hai, lekin overhead aur MTU concerns jodta hai), ya alag OSPF processes chalana jo redistribution se jude hon.</p>

<div class="warn"><p><b>Common galtiyan.</b> Neighbour ke router ID ki jagah uska interface address use karna. Sirf ek end configure karna. Transit area ke roop mein stub ya NSSA chunna: IOS link up nahi karega. Baad mein <code>area 0 authentication message-digest</code> jodna aur virtual link ko bhool jaana: dead timer khatam hone par woh drop ho jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <code>area 1 virtual-link 3.3.3.3</code> mein "area 1" <b>transit</b> area hai, na area 0 aur na disconnected area. Aur virtual link kabhi stub ya NSSA area ke through nahi ban sakta.</p></div>

<div class="scn"><h4>Reload ke baad mara hua virtual link</h4><p>Ek manufacturing company do saal se ek plant area tak pahunchne ke liye virtual link use kar rahi thi. Power cut ke baad plant ka ABR reboot hua, kisi ka joda hua naya loopback ab highest address tha, aur router ID 3.3.3.3 se 10.99.0.1 ho gaya. Head-office ABR par ab bhi <code>area 1 virtual-link 3.3.3.3</code> tha, isliye <code>show ip ospf virtual-links</code> ne link down dikhaya aur poora plant isolated ho gaya. <code>router-id 3.3.3.3</code> configure karke OSPF process clear karne se woh wapas aaya; phir team ne virtual link hatane ke liye redesign schedule kiya.</p><p><b>Lesson:</b> jo bhi cheez router ID se refer hoti hai, uske router IDs hard-code karo.</p></div>

<div class="iv"><p class="q">"Virtual link kya hai, kab chahiye aur iski limitations kya hain?"</p><p>Strong answer: normal transit area ke paar do ABRs ke beech ek logical area 0 link, jo aise area ko jodne ke liye use hota hai jiska area 0 se physical link nahi hai, ya partitioned backbone theek karne ke liye. Yeh dono ABRs par transit area aur peer ke router ID ke saath configure hota hai, OSPF_VL0 ke roop mein dikhta hai, aur area 0 authentication inherit karta hai. Yeh stub ya NSSA areas ke paar nahi ja sakta. Batao ki yeh workaround hai aur alternatives ke naam lo: redesign, area 0 mein GRE tunnel, ya processes ke beech redistribution.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inter-area routes sirf area 0 ke through jaate hain; backbone link ke bina area isolated hai.</li>
<li>Dono ABRs par <code>area &lt;transit&gt; virtual-link &lt;peer RID&gt;</code> area 0 mein OSPF_VL0 banata hai.</li>
<li>Transit area normal hona chahiye; link area 0 authentication inherit karta hai.</li>
<li><code>show ip ospf virtual-links</code>, OSPF_VL0 neighbour aur end-to-end O IA routes se verify karo.</li>
<li>Router IDs hard-code karo, aur virtual link ko proper design se replace karne ka plan rakho.</li>
</ul></div>
`}};export{e as default};