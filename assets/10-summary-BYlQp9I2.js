var e={id:`summary`,h:{en:`Summary, exam traps and a one-page cheat sheet`,hi:`Summary, exam traps aur ek page ki cheat sheet`},body:{en:`
<p>Before an exam, a pilot does not reread the whole manual. She runs through a checklist: the few items that, if forgotten, bring the plane down. This chapter is that checklist for multi-area OSPF. Read it the evening before an interview or exam, and come back to the earlier chapters only for the points that feel weak.</p>

<h3>The whole module in nine sentences</h3>
<ol>
<li>One big area means one LSDB, one flooding domain and one SPF on every router, and it stops scaling.</li>
<li>OSPF solves it with a two-level hierarchy: ordinary areas around the backbone, area 0.</li>
<li>An ABR has interfaces in area 0 and another area, keeps one LSDB per area, and an ASBR injects external routes.</li>
<li>Every area must touch area 0, and area 0 must be contiguous.</li>
<li>Types 1 and 2 stay inside an area; ABRs create type 3 (prefixes) and type 4 (ASBR location); the ASBR creates type 5 (externals).</li>
<li>Routes appear as O, O IA, O E1 and O E2, preferred in that order, all with AD 110.</li>
<li>Inter-area cost is the cost to the ABR plus the ABR's advertised cost; E2 keeps the external metric, E1 adds internal cost.</li>
<li><code>area N range</code> on the ABR summarises routes of area N into one type 3 LSA, hiding detail and flaps.</li>
<li><code>default-information originate</code> on the edge router sends a type 5 default, only if it has one (unless <code>always</code>).</li>
</ol>

<h3>One-page cheat sheet: concepts</h3>
<div class="tbl"><table>
<tr><th>Item</th><th>Remember</th></tr>
<tr><td>Area 0</td><td>Backbone, also 0.0.0.0; every area attaches; must be contiguous</td></tr>
<tr><td>Internal router</td><td>All interfaces in one area</td></tr>
<tr><td>ABR</td><td>Interfaces in area 0 and another area; <code>It is an area border router</code></td></tr>
<tr><td>ASBR</td><td>Injects external routes; <code>It is an autonomous system boundary router</code></td></tr>
<tr><td>LSA 1 / 2</td><td>Router / network; stay in area</td></tr>
<tr><td>LSA 3</td><td>Summary; ABR; prefix and cost; Advertising Router is the ABR</td></tr>
<tr><td>LSA 4</td><td>ASBR summary; ABR; tells an area where the ASBR is</td></tr>
<tr><td>LSA 5</td><td>External; ASBR; floods whole domain unchanged</td></tr>
<tr><td>O / O IA</td><td>Intra-area / inter-area (from a type 3)</td></tr>
<tr><td>O E1 / O E2</td><td>External; E1 adds internal cost, E2 does not; E2 is the default</td></tr>
<tr><td>Preference</td><td>O, then O IA, then E1, then E2 (all AD 110)</td></tr>
<tr><td>Inter-area cost</td><td>Cost to ABR + cost advertised in the type 3</td></tr>
</table></div>

<h3>One-page cheat sheet: commands</h3>
<pre class="code"><span class="c">! place interfaces in areas</span>
router ospf 1
 router-id 2.2.2.2
 network 10.0.12.0 0.0.0.3 area 1
 passive-interface default
 no passive-interface GigabitEthernet0/0
interface GigabitEthernet0/1
 ip ospf 1 area 0

<span class="c">! summarise area 1 routes at the ABR</span>
router ospf 1
 area 1 range 172.16.0.0 255.255.252.0
 area 1 range 172.16.0.0 255.255.252.0 cost 50

<span class="c">! default route from the edge router</span>
ip route 0.0.0.0 0.0.0.0 203.0.113.2
router ospf 1
 default-information originate
 default-information originate always
 default-information originate metric 20 metric-type 1</pre>
<div class="tbl"><table>
<tr><th>Verify</th><th>Command</th><th>Look for</th></tr>
<tr><td>Neighbours</td><td><code>show ip ospf neighbor</code></td><td>FULL, one per area on an ABR</td></tr>
<tr><td>Areas of links</td><td><code>show ip ospf interface brief</code></td><td>Area column matches on both ends</td></tr>
<tr><td>Role</td><td><code>show ip ospf</code></td><td>ABR or ASBR line, per-area blocks, area ranges</td></tr>
<tr><td>Database</td><td><code>show ip ospf database [summary | asbr-summary | external | router | network]</code></td><td>Types 3, 4, 5 present and from the right router</td></tr>
<tr><td>Border routers</td><td><code>show ip ospf border-routers</code></td><td>ABRs and ASBRs listed (i intra, I inter)</td></tr>
<tr><td>Routes</td><td><code>show ip route ospf</code></td><td>O IA, O*E2 and next hops</td></tr>
</table></div>

<h3>Exam traps, in one place</h3>
<ul>
<li>'ABR connects two areas': only if one of them is area 0.</li>
<li>'O IA is cheaper than O E2, so it wins': the type decides, not the number.</li>
<li>'Area N range, N is the destination area': no, N is the area that owns the routes.</li>
<li>'Network LSAs cross the ABR': no, types 1 and 2 never leave their area.</li>
<li>'E2 metric grows with distance': no; that is E1.</li>
<li>'default-information originate always creates a default for free': plain form needs an existing default.</li>
<li>'The process ID must match': no, the area ID must match.</li>
<li>'A virtual link or an NSSA is on the CCNA': no; both belong to CCNP ENARSI.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Read this table line by line, as an exam would give it: <code>O IA 172.16.0.0/22 [110/3] via 10.0.23.1</code>, <code>O 2.2.2.2/32 [110/2] via 10.0.23.1</code>, <code>O*E2 0.0.0.0/0 [110/1] via 10.0.12.2</code>. First line: a prefix from another area, learned from a type 3 LSA, probably a summary (the /22 length is a hint), cost 3 in total. Second: a router in the same area (plain O), two links away. Third: a default route from an external type 5 LSA, with a fixed E2 metric of 1, next hop 10.0.12.2, which is the ABR or an internal router on the way to the ASBR. Now answer: 'what type of router is the device that printed this table?' It has O IA and O*E2, so it is not in area 0 with the ASBR, but we cannot tell more. Trap: do not guess roles from a routing table alone, use <code>show ip ospf</code>.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Learning the commands but not the picture. Draw the areas, ABRs and ASBR first and the commands almost write themselves. Another is spending exam time on stub and NSSA details: for the CCNA you need only to know they exist to reduce LSDB size, and that they are covered in CCNP ENARSI. And guessing instead of tracing: on a simulation question, follow the route hop by hop.</p></div>

<div class="exam"><p><b>Exam traps.</b> Read the question for the router role (ABR, ASBR, internal) before the commands. Look at which area each interface sits in. Check whether the default route is conditional. Compare route types before metrics. Remember that the CCNA scope for OSPF is OSPFv2 single area for configuration and that multi-area ideas (ABR, LSA 3, O IA) appear mostly as concepts and show-output reading.</p></div>

<div class="scn"><h4>The interview that turned on one word</h4><p>A candidate was asked to describe how an OSPF default route reaches a branch in another area. Most candidates said 'the ASBR floods it'. This one said: 'the ASBR originates a type 5, the ABR passes it into the branch's area untouched, and also creates a type 4 so the branch routers can find the ASBR. The route shows as O*E2 with the ASBR's metric.' Three extra sentences, and the interviewer moved straight to the senior questions.</p><p><b>Lesson:</b> naming the LSA types and who creates them is the clearest sign that you understand the mechanism and have not just memorised commands.</p></div>

<div class="iv"><p class="q">'Summarise multi-area OSPF in one minute.'</p><p>Strong answer: single-area OSPF does not scale because every router shares one LSDB and runs SPF on every change. Multi-area builds a two-level hierarchy around area 0. ABRs keep a database per area and turn routes into type 3 summaries; ASBRs bring in external routes as type 5 with type 4 helping other areas find them. Routes show as O, O IA, E1, E2 in that preference order. I summarise at the ABR with area range to hide flaps, send a default with default-information originate, and troubleshoot by checking areas on both ends, the ABR's backbone link, the ranges, and the border routers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Know the picture: ordinary areas, area 0, ABR, ASBR, and which LSA types cross which boundary.</li>
<li>Know the order of route types: O, O IA, E1, E2, and how inter-area and external costs are built.</li>
<li>Know the three configurations: areas on interfaces, area range at the ABR, default-information originate at the edge.</li>
<li>Know the troubleshooting path: neighbours, areas, ABR backbone link, ranges, then the default route and the ASBR.</li>
<li>Stub, totally stubby, NSSA and virtual links are CCNP ENARSI topics.</li>
</ul></div>
`,hi:`
<p>Exam se pehle pilot poora manual dobara nahi padhta. Woh ek checklist se guzarta hai: woh chhoti si cheezein jo bhool jaao to plane gir sakta hai. Yeh chapter multi-area OSPF ke liye wahi checklist hai. Interview ya exam se ek shaam pehle ise padho, aur purane chapters mein sirf un points ke liye jao jo kamzor lagein.</p>

<h3>Poora module nau sentences mein</h3>
<ol>
<li>Ek bada area matlab har router par ek LSDB, ek flooding domain aur ek SPF, aur woh scale karna band kar deta hai.</li>
<li>OSPF ise two-level hierarchy se solve karta hai: backbone area 0 ke ird-gird ordinary areas.</li>
<li>ABR ke interfaces area 0 aur dusre area mein hote hain, har area ka ek LSDB rakhta hai, aur ASBR external routes inject karta hai.</li>
<li>Har area area 0 ko chhoo-na chahiye, aur area 0 contiguous hona chahiye.</li>
<li>Types 1 aur 2 area ke andar rehte hain; ABRs type 3 (prefixes) aur type 4 (ASBR ki location) banate hain; ASBR type 5 (externals) banata hai.</li>
<li>Routes O, O IA, O E1 aur O E2 ke roop mein dikhte hain, isi order mein preferred, sab ka AD 110.</li>
<li>Inter-area cost = ABR tak cost plus ABR ki advertised cost; E2 external metric rakhta hai, E1 internal cost jodta hai.</li>
<li>ABR par <code>area N range</code> area N ke routes ko ek type 3 LSA mein summarise karta hai, detail aur flaps chhupa deta hai.</li>
<li>Edge router par <code>default-information originate</code> type 5 default bhejta hai, sirf tab jab uske paas ho (jab tak <code>always</code> na ho).</li>
</ol>

<h3>Ek page ki cheat sheet: concepts</h3>
<div class="tbl"><table>
<tr><th>Item</th><th>Yaad rakho</th></tr>
<tr><td>Area 0</td><td>Backbone, 0.0.0.0 bhi; har area judta hai; contiguous hona chahiye</td></tr>
<tr><td>Internal router</td><td>Saare interfaces ek area mein</td></tr>
<tr><td>ABR</td><td>Area 0 aur dusre area mein interfaces; <code>It is an area border router</code></td></tr>
<tr><td>ASBR</td><td>External routes inject karta hai; <code>It is an autonomous system boundary router</code></td></tr>
<tr><td>LSA 1 / 2</td><td>Router / network; area mein rehte hain</td></tr>
<tr><td>LSA 3</td><td>Summary; ABR; prefix aur cost; Advertising Router ABR hai</td></tr>
<tr><td>LSA 4</td><td>ASBR summary; ABR; area ko batata hai ASBR kahan hai</td></tr>
<tr><td>LSA 5</td><td>External; ASBR; poora domain bina badle flood</td></tr>
<tr><td>O / O IA</td><td>Intra-area / inter-area (type 3 se)</td></tr>
<tr><td>O E1 / O E2</td><td>External; E1 internal cost jodta hai, E2 nahi; E2 default hai</td></tr>
<tr><td>Preference</td><td>O, phir O IA, phir E1, phir E2 (sab AD 110)</td></tr>
<tr><td>Inter-area cost</td><td>ABR tak cost + type 3 mein advertised cost</td></tr>
</table></div>

<h3>Ek page ki cheat sheet: commands</h3>
<pre class="code"><span class="c">! interfaces ko areas mein daalo</span>
router ospf 1
 router-id 2.2.2.2
 network 10.0.12.0 0.0.0.3 area 1
 passive-interface default
 no passive-interface GigabitEthernet0/0
interface GigabitEthernet0/1
 ip ospf 1 area 0

<span class="c">! ABR par area 1 ke routes summarise karo</span>
router ospf 1
 area 1 range 172.16.0.0 255.255.252.0
 area 1 range 172.16.0.0 255.255.252.0 cost 50

<span class="c">! edge router se default route</span>
ip route 0.0.0.0 0.0.0.0 203.0.113.2
router ospf 1
 default-information originate
 default-information originate always
 default-information originate metric 20 metric-type 1</pre>
<div class="tbl"><table>
<tr><th>Verify</th><th>Command</th><th>Kya dekhna hai</th></tr>
<tr><td>Neighbours</td><td><code>show ip ospf neighbor</code></td><td>FULL, ABR par har area mein ek</td></tr>
<tr><td>Links ke areas</td><td><code>show ip ospf interface brief</code></td><td>Dono ends par Area column match</td></tr>
<tr><td>Role</td><td><code>show ip ospf</code></td><td>ABR ya ASBR line, per-area blocks, area ranges</td></tr>
<tr><td>Database</td><td><code>show ip ospf database [summary | asbr-summary | external | router | network]</code></td><td>Types 3, 4, 5 maujood aur sahi router se</td></tr>
<tr><td>Border routers</td><td><code>show ip ospf border-routers</code></td><td>ABRs aur ASBRs listed (i intra, I inter)</td></tr>
<tr><td>Routes</td><td><code>show ip route ospf</code></td><td>O IA, O*E2 aur next hops</td></tr>
</table></div>

<h3>Exam traps, ek jagah</h3>
<ul>
<li>'ABR do areas ko jodta hai': tabhi jab unme se ek area 0 ho.</li>
<li>'O IA, O E2 se sasta hai, isliye jeetega': type faisla karta hai, number nahi.</li>
<li>'Area N range mein N destination area hai': nahi, N woh area hai jo routes ka maalik hai.</li>
<li>'Network LSAs ABR paar karte hain': nahi, types 1 aur 2 apna area kabhi nahi chhodte.</li>
<li>'E2 metric door jaane par badhta hai': nahi; woh E1 hai.</li>
<li>'default-information originate always bina default ke bhi default bana deta hai': plain form ko pehle se default chahiye.</li>
<li>'Process ID match hona chahiye': nahi, area ID match karna zaroori hai.</li>
<li>'Virtual link ya NSSA CCNA mein hai': nahi; dono CCNP ENARSI ke hain.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Is table ko line by line padho, jaise exam deta hai: <code>O IA 172.16.0.0/22 [110/3] via 10.0.23.1</code>, <code>O 2.2.2.2/32 [110/2] via 10.0.23.1</code>, <code>O*E2 0.0.0.0/0 [110/1] via 10.0.12.2</code>. Pehli line: dusre area ka prefix, type 3 LSA se seekha, shayad summary (/22 length ishara hai), total cost 3. Doosri: same area ka router (plain O), do links door. Teesri: external type 5 LSA se default route, fixed E2 metric 1, next hop 10.0.12.2, jo ABR hai ya ASBR ke raaste ka internal router. Ab jawab do: 'jis device ne yeh table print ki, woh kis tarah ka router hai?' Ismein O IA aur O*E2 hain, isliye woh ASBR ke saath area 0 mein nahi hai, lekin isse zyada nahi bata sakte. Trap: sirf routing table se roles guess mat karo, <code>show ip ospf</code> use karo.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Commands seekhna lekin picture nahi. Pehle areas, ABRs aur ASBR ka drawing banao, commands lagbhag khud likh jaate hain. Ek aur: exam ka waqt stub aur NSSA ki details par lagana: CCNA ke liye bas itna pata hona kaafi hai ki woh LSDB size ghatane ke liye hain, aur CCNP ENARSI mein aate hain. Aur andaaza lagane ki jagah trace karna: simulation question mein route ko hop by hop follow karo.</p></div>

<div class="exam"><p><b>Exam traps.</b> Commands se pehle question mein router role (ABR, ASBR, internal) padho. Dekho har interface kis area mein hai. Check karo default route conditional hai ya nahi. Metrics se pehle route types compare karo. Yaad rakho ki OSPF ka CCNA scope configuration ke liye OSPFv2 single area hai, aur multi-area ideas (ABR, LSA 3, O IA) zyadatar concepts aur show-output padhne ke roop mein aate hain.</p></div>

<div class="scn"><h4>Woh interview jo ek shabd par palta</h4><p>Ek candidate se poocha gaya ki OSPF default route doosre area ke branch tak kaise pahunchta hai. Zyadatar candidates ne kaha 'ASBR use flood karta hai'. Is candidate ne kaha: 'ASBR type 5 originate karta hai, ABR use branch ke area mein bina chhede pass karta hai, aur type 4 bhi banata hai taaki branch ke routers ASBR dhundh sakein. Route O*E2 ke roop mein ASBR ke metric ke saath dikhta hai.' Teen extra sentences, aur interviewer seedha senior questions par chala gaya.</p><p><b>Seekh:</b> LSA types aur unhe banane wale ka naam lena sabse saaf sanket hai ki aap mechanism samajhte ho, sirf commands ratte nahi.</p></div>

<div class="iv"><p class="q">'Multi-area OSPF ko ek minute mein summarise karo.'</p><p>Strong answer: single-area OSPF scale nahi karta kyunki har router ek LSDB share karta hai aur har change par SPF chalata hai. Multi-area area 0 ke ird-gird two-level hierarchy banata hai. ABRs har area ka database rakhte hain aur routes ko type 3 summaries mein badalte hain; ASBRs external routes ko type 5 ke roop mein laate hain aur type 4 dusre areas ko unhe dhundhne mein madad karta hai. Routes O, O IA, E1, E2 ke roop mein isi preference order mein dikhte hain. Main flaps chhupane ke liye ABR par area range se summarise karta hoon, default-information originate se default bhejta hoon, aur troubleshoot karte time dono ends ke areas, ABR ka backbone link, ranges aur border routers check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Picture jaano: ordinary areas, area 0, ABR, ASBR, aur kaun sa LSA type kaun si boundary paar karta hai.</li>
<li>Route types ka order jaano: O, O IA, E1, E2, aur inter-area aur external costs kaise bante hain.</li>
<li>Teen configurations jaano: interfaces par areas, ABR par area range, edge par default-information originate.</li>
<li>Troubleshooting path jaano: neighbours, areas, ABR ka backbone link, ranges, phir default route aur ASBR.</li>
<li>Stub, totally stubby, NSSA aur virtual links CCNP ENARSI ke topics hain.</li>
</ul></div>
`}};export{e as default};