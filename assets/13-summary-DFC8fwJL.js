var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You started this module with the picture of a country organised into states, border offices and a national highway. You now know exactly how that picture maps onto OSPF: routers become neighbours through a strict handshake, links are described according to their network type, LSAs of six types build the database, areas contain detail, ABRs summarise and filter at the borders, and a clear preference order picks the path. This chapter is your revision sheet before the lab exam and before an interview.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module summary map">
<rect x="20" y="30" width="180" height="60" rx="10" fill="#bae6fd"/><text x="110" y="55" text-anchor="middle" class="svg-ink" font-size="13">Adjacency</text><text x="110" y="74" text-anchor="middle" class="svg-muted" font-size="12">Hello, DBD, MTU</text>
<rect x="230" y="30" width="180" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Network types</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">DR or not, timers</text>
<rect x="440" y="30" width="180" height="60" rx="10" fill="#ddd6fe"/><text x="530" y="55" text-anchor="middle" class="svg-ink" font-size="13">LSAs 1-5, 7</text><text x="530" y="74" text-anchor="middle" class="svg-muted" font-size="12">who, where</text>
<rect x="20" y="115" width="180" height="60" rx="10" fill="#fde68a"/><text x="110" y="140" text-anchor="middle" class="svg-ink" font-size="13">Areas and roles</text><text x="110" y="159" text-anchor="middle" class="svg-muted" font-size="12">area 0, ABR, ASBR</text>
<rect x="230" y="115" width="180" height="60" rx="10" fill="#fed7aa"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Summarise, filter</text><text x="320" y="159" text-anchor="middle" class="svg-muted" font-size="12">range, filter-list</text>
<rect x="440" y="115" width="180" height="60" rx="10" fill="#e2e8f0"/><text x="530" y="140" text-anchor="middle" class="svg-ink" font-size="13">Path selection</text><text x="530" y="159" text-anchor="middle" class="svg-muted" font-size="12">O &gt; IA &gt; E1 &gt; E2</text>
</svg><p class="cap">The six building blocks of multi-area OSPF, for OSPFv2 and OSPFv3 alike.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>I can list the five OSPF packet types and explain ExStart, Exchange, Loading and Full, including master/slave and the MTU check.</li>
<li>I can state what must match for a neighbourship and diagnose stuck states from <code>show ip ospf neighbor</code>.</li>
<li>I can name all network types with their DR behaviour and timers, and predict what happens with mismatched types.</li>
<li>I can convert an Ethernet link to point-to-point, tune Hello/Dead, and make a loopback advertise its real mask.</li>
<li>I can use <code>passive-interface</code> and <code>passive-interface default</code> correctly.</li>
<li>I can read <code>show ip ospf database</code> and explain every LSA type 1, 2, 3, 4, 5 and 7, with its originator and scope.</li>
<li>I can design and configure multiple normal areas around area 0 and verify the ABR role.</li>
<li>I can summarise with <code>area range</code> on an ABR and <code>summary-address</code> on an ASBR, and explain the Null0 discard route.</li>
<li>I can filter with <code>area filter-list prefix</code>, <code>distribute-list in</code> and prefix-lists, and explain their effect on the LSDB.</li>
<li>I can predict path selection (O &gt; O IA &gt; E1/N1 &gt; E2/N2) and tune cost and reference bandwidth.</li>
<li>I can configure OSPFv3 multi-area with address families and summarise IPv6 prefixes.</li>
<li>I can troubleshoot a split backbone and repair it with a virtual link.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ABR</dt><dd>Router with interfaces in area 0 and at least one other area; creates type 3 and 4 LSAs.</dd>
<dt>ASBR</dt><dd>Router that redistributes external routes into OSPF; creates type 5 or 7 LSAs.</dd>
<dt>DBD</dt><dd>Database Description packet carrying LSA headers during Exchange.</dd>
<dt>Master/slave</dt><dd>Roles in the DBD exchange; the higher router ID is master.</dd>
<dt>Type 3 LSA</dt><dd>Summary LSA describing a prefix from another area.</dd>
<dt>Type 4 LSA</dt><dd>ASBR summary LSA telling other areas how to reach an ASBR.</dd>
<dt>Discard route</dt><dd>Null0 route automatically installed for a summary to prevent loops.</dd>
<dt>Filter-list</dt><dd>ABR tool that blocks type 3 LSAs into or out of an area using a prefix-list.</dd>
<dt>Virtual link</dt><dd>Logical area 0 link through a normal transit area between two ABRs.</dd>
<dt>Forward metric</dt><dd>Internal cost to an ASBR; breaks ties between equal E2 routes.</dd>
</dl>

<h3>Most-tested facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Transport</td><td>IP protocol 89; 224.0.0.5 all routers, 224.0.0.6 DR/BDR; FF02::5/6 in OSPFv3</td></tr>
<tr><td>Master</td><td>Higher router ID wins ExStart</td></tr>
<tr><td>MTU mismatch</td><td>Stuck in ExStart/Exchange</td></tr>
<tr><td>Timers</td><td>Broadcast and P2P 10/40; NBMA and P2MP 30/120</td></tr>
<tr><td>DR election</td><td>Broadcast and NBMA only; priority then RID; non-preemptive</td></tr>
<tr><td>Loopback</td><td>/32 unless <code>ip ospf network point-to-point</code></td></tr>
<tr><td>Type 1, 2</td><td>Never leave their area</td></tr>
<tr><td>Type 4</td><td>Created by the ABR, not the ASBR</td></tr>
<tr><td>Type 7</td><td>Only inside an NSSA; translated to type 5 by the ABR</td></tr>
<tr><td>Summarisation</td><td>Only on ABR (<code>area range</code>) and ASBR (<code>summary-address</code>)</td></tr>
<tr><td>Filtering</td><td>filter-list = type 3 on ABR; distribute-list in = local RIB only</td></tr>
<tr><td>Preference</td><td>O &gt; O IA &gt; E1/N1 &gt; E2/N2; AD 110 for all</td></tr>
<tr><td>Redistribution default</td><td>E2, metric 20</td></tr>
<tr><td>Reference bandwidth</td><td>100 Mbps default; change on every router</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Adjacency and interfaces</span>
ip ospf 1 area 10
ip ospf network point-to-point
ip ospf hello-interval 5
ip ospf cost 50
ip ospf mtu-ignore
<span class="c">! Process</span>
router ospf 1
 router-id 2.2.2.2
 passive-interface default
 no passive-interface GigabitEthernet0/0
 auto-cost reference-bandwidth 100000
 area 10 range 172.16.0.0 255.255.252.0
 area 10 filter-list prefix NO-LAB out
 distribute-list prefix NO-LAB in
 summary-address 10.50.0.0 255.255.254.0
 area 10 virtual-link 4.4.4.4
<span class="c">! OSPFv3</span>
router ospfv3 1
 address-family ipv6 unicast
  area 10 range 2001:DB8:10::/62
interface GigabitEthernet0/0
 ospfv3 1 ipv6 area 10</pre>
<pre class="out">show ip ospf neighbor
show ip ospf interface brief
show ip ospf
show ip ospf border-routers
show ip ospf database [router | network | summary | asbr-summary | external]
show ip ospf virtual-links
show ip route ospf
show ospfv3 neighbor
show ipv6 route ospf</pre>

<div class="eg"><p><b>Worked example: a 30-second exam drill.</b> Question: "CORE shows O IA 172.16.0.0/22 [110/3] via 10.0.23.1. Which router created the LSA, what type is it, and where was the summary configured?" Answer: ABR1 (the only ABR toward area 10) created a type 3 summary LSA into area 0, from <code>area 10 range 172.16.0.0 255.255.252.0</code> configured on ABR1. Cost 3 = CORE to ABR1 (1) + summary metric (2).</p></div>

<div class="warn"><p><b>Common mistake.</b> Revising only commands. The exam and interviews test cause and effect: what a mismatch does, which LSA a router creates, why a route is O IA rather than O. Always practise explaining the output, not just typing the command.</p></div>

<div class="exam"><p><b>Exam trap.</b> Expect distractors that swap roles: "the ASBR creates type 4", "distribute-list in removes the LSA", "area range works on the ASBR", "point-to-multipoint elects a DR". Each of these is false.</p></div>

<div class="scn"><h4>The interview that turned on one output</h4><p>A candidate for a network engineer role was shown <code>show ip ospf database</code> from an ABR and asked why one prefix appeared under two areas with two different advertising routers. Instead of guessing, the candidate explained that each ABR re-originates type 3 LSAs into each area, named the router IDs, calculated the costs, and pointed out which ABR would be preferred. That five-minute explanation, built on the concepts in this module, got the offer.</p><p><b>Lesson:</b> reading the LSDB fluently is the skill that separates CCNP-level engineers.</p></div>

<div class="iv"><p class="q">"Explain multi-area OSPF to me in two minutes."</p><p>Strong answer: routers form adjacencies with Hello, DBD, LSR, LSU and LSAck; each area has its own LSDB built from type 1 and 2 LSAs; ABRs connect every area to area 0 and advertise prefixes between areas as type 3 LSAs; ASBRs inject externals as type 5 (or 7 in an NSSA) and ABRs create type 4 to reach them; summarisation happens with area range and summary-address; filtering with filter-lists and distribute-lists; and path choice is O, then O IA, then E1, then E2. Close with why: smaller databases, contained SPF runs and summarisation for stability.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Adjacency: Hello parameters must match; DBD checks MTU; higher RID is master.</li>
<li>Network type decides DR, timers and LSA representation; use point-to-point on two-router Ethernet links.</li>
<li>Type 1/2 inside areas, type 3/4 from ABRs, type 5/7 from ASBRs.</li>
<li>All areas attach to a contiguous area 0; summarise and filter only at ABRs and ASBRs.</li>
<li>O &gt; O IA &gt; E1/N1 &gt; E2/N2; OSPFv3 follows the same rules with new LSA names.</li>
</ul></div>
`,hi:`
<p>Aapne yeh module ek desh ki picture se shuru kiya tha jo states, border offices aur national highway mein organised hai. Ab aap exactly jaante ho ki woh picture OSPF par kaise map hoti hai: routers ek strict handshake se neighbours bante hain, links apne network type ke hisaab se describe hote hain, chhe types ke LSAs database banate hain, areas detail ko rokte hain, ABRs borders par summarise aur filter karte hain, aur ek saaf preference order path chunta hai. Yeh chapter lab exam aur interview se pehle aapki revision sheet hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Module summary map">
<rect x="20" y="30" width="180" height="60" rx="10" fill="#bae6fd"/><text x="110" y="55" text-anchor="middle" class="svg-ink" font-size="13">Adjacency</text><text x="110" y="74" text-anchor="middle" class="svg-muted" font-size="12">Hello, DBD, MTU</text>
<rect x="230" y="30" width="180" height="60" rx="10" fill="#bbf7d0"/><text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="13">Network types</text><text x="320" y="74" text-anchor="middle" class="svg-muted" font-size="12">DR ya nahi, timers</text>
<rect x="440" y="30" width="180" height="60" rx="10" fill="#ddd6fe"/><text x="530" y="55" text-anchor="middle" class="svg-ink" font-size="13">LSAs 1-5, 7</text><text x="530" y="74" text-anchor="middle" class="svg-muted" font-size="12">kaun, kahan</text>
<rect x="20" y="115" width="180" height="60" rx="10" fill="#fde68a"/><text x="110" y="140" text-anchor="middle" class="svg-ink" font-size="13">Areas aur roles</text><text x="110" y="159" text-anchor="middle" class="svg-muted" font-size="12">area 0, ABR, ASBR</text>
<rect x="230" y="115" width="180" height="60" rx="10" fill="#fed7aa"/><text x="320" y="140" text-anchor="middle" class="svg-ink" font-size="13">Summarise, filter</text><text x="320" y="159" text-anchor="middle" class="svg-muted" font-size="12">range, filter-list</text>
<rect x="440" y="115" width="180" height="60" rx="10" fill="#e2e8f0"/><text x="530" y="140" text-anchor="middle" class="svg-ink" font-size="13">Path selection</text><text x="530" y="159" text-anchor="middle" class="svg-muted" font-size="12">O &gt; IA &gt; E1 &gt; E2</text>
</svg><p class="cap">Multi-area OSPF ke chhe building blocks, OSPFv2 aur OSPFv3 dono ke liye.</p></div>

<h3>Can-do checklist</h3>
<ul>
<li>Main paanch OSPF packet types list kar sakta hoon aur ExStart, Exchange, Loading aur Full samjha sakta hoon, master/slave aur MTU check samet.</li>
<li>Main bata sakta hoon ki neighbourship ke liye kya match hona chahiye aur <code>show ip ospf neighbor</code> se atke states diagnose kar sakta hoon.</li>
<li>Main saare network types unke DR behaviour aur timers ke saath bata sakta hoon, aur mismatched types par kya hoga predict kar sakta hoon.</li>
<li>Main Ethernet link ko point-to-point bana sakta hoon, Hello/Dead tune kar sakta hoon, aur loopback se asli mask advertise karwa sakta hoon.</li>
<li>Main <code>passive-interface</code> aur <code>passive-interface default</code> sahi use kar sakta hoon.</li>
<li>Main <code>show ip ospf database</code> padh sakta hoon aur har LSA type 1, 2, 3, 4, 5 aur 7 ko uske originator aur scope ke saath samjha sakta hoon.</li>
<li>Main area 0 ke around multiple normal areas design aur configure kar sakta hoon aur ABR role verify kar sakta hoon.</li>
<li>Main ABR par <code>area range</code> aur ASBR par <code>summary-address</code> se summarise kar sakta hoon, aur Null0 discard route samjha sakta hoon.</li>
<li>Main <code>area filter-list prefix</code>, <code>distribute-list in</code> aur prefix-lists se filter kar sakta hoon, aur LSDB par unka asar samjha sakta hoon.</li>
<li>Main path selection (O &gt; O IA &gt; E1/N1 &gt; E2/N2) predict kar sakta hoon aur cost aur reference bandwidth tune kar sakta hoon.</li>
<li>Main address families ke saath OSPFv3 multi-area configure kar sakta hoon aur IPv6 prefixes summarise kar sakta hoon.</li>
<li>Main split backbone troubleshoot kar sakta hoon aur virtual link se repair kar sakta hoon.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>ABR</dt><dd>Area 0 aur kam se kam ek doosre area mein interfaces wala router; type 3 aur 4 LSAs banata hai.</dd>
<dt>ASBR</dt><dd>External routes ko OSPF mein redistribute karne wala router; type 5 ya 7 LSAs banata hai.</dd>
<dt>DBD</dt><dd>Database Description packet jo Exchange ke dauraan LSA headers le jaata hai.</dd>
<dt>Master/slave</dt><dd>DBD exchange ke roles; bada router ID master hai.</dd>
<dt>Type 3 LSA</dt><dd>Summary LSA jo doosre area ka prefix describe karta hai.</dd>
<dt>Type 4 LSA</dt><dd>ASBR summary LSA jo doosre areas ko batata hai ki ASBR tak kaise pahunchein.</dd>
<dt>Discard route</dt><dd>Summary ke liye apne aap install hua Null0 route jo loops rokta hai.</dd>
<dt>Filter-list</dt><dd>ABR tool jo prefix-list se area mein ya area se bahar type 3 LSAs block karta hai.</dd>
<dt>Virtual link</dt><dd>Do ABRs ke beech normal transit area ke through logical area 0 link.</dd>
<dt>Forward metric</dt><dd>ASBR tak internal cost; barabar E2 routes ke beech tie todta hai.</dd>
</dl>

<h3>Sabse zyada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Topic</th><th>Fact</th></tr>
<tr><td>Transport</td><td>IP protocol 89; 224.0.0.5 saare routers, 224.0.0.6 DR/BDR; OSPFv3 mein FF02::5/6</td></tr>
<tr><td>Master</td><td>Bada router ID ExStart jeetta hai</td></tr>
<tr><td>MTU mismatch</td><td>ExStart/Exchange mein atka</td></tr>
<tr><td>Timers</td><td>Broadcast aur P2P 10/40; NBMA aur P2MP 30/120</td></tr>
<tr><td>DR election</td><td>Sirf broadcast aur NBMA; pehle priority phir RID; non-preemptive</td></tr>
<tr><td>Loopback</td><td>/32 jab tak <code>ip ospf network point-to-point</code> na ho</td></tr>
<tr><td>Type 1, 2</td><td>Kabhi apna area nahi chhodte</td></tr>
<tr><td>Type 4</td><td>ABR banata hai, ASBR nahi</td></tr>
<tr><td>Type 7</td><td>Sirf NSSA ke andar; ABR ise type 5 mein translate karta hai</td></tr>
<tr><td>Summarisation</td><td>Sirf ABR (<code>area range</code>) aur ASBR (<code>summary-address</code>) par</td></tr>
<tr><td>Filtering</td><td>filter-list = ABR par type 3; distribute-list in = sirf local RIB</td></tr>
<tr><td>Preference</td><td>O &gt; O IA &gt; E1/N1 &gt; E2/N2; sabka AD 110</td></tr>
<tr><td>Redistribution default</td><td>E2, metric 20</td></tr>
<tr><td>Reference bandwidth</td><td>Default 100 Mbps; har router par badlo</td></tr></table>

<h3>Command cheat-sheet</h3>
<pre class="code"><span class="c">! Adjacency aur interfaces</span>
ip ospf 1 area 10
ip ospf network point-to-point
ip ospf hello-interval 5
ip ospf cost 50
ip ospf mtu-ignore
<span class="c">! Process</span>
router ospf 1
 router-id 2.2.2.2
 passive-interface default
 no passive-interface GigabitEthernet0/0
 auto-cost reference-bandwidth 100000
 area 10 range 172.16.0.0 255.255.252.0
 area 10 filter-list prefix NO-LAB out
 distribute-list prefix NO-LAB in
 summary-address 10.50.0.0 255.255.254.0
 area 10 virtual-link 4.4.4.4
<span class="c">! OSPFv3</span>
router ospfv3 1
 address-family ipv6 unicast
  area 10 range 2001:DB8:10::/62
interface GigabitEthernet0/0
 ospfv3 1 ipv6 area 10</pre>
<pre class="out">show ip ospf neighbor
show ip ospf interface brief
show ip ospf
show ip ospf border-routers
show ip ospf database [router | network | summary | asbr-summary | external]
show ip ospf virtual-links
show ip route ospf
show ospfv3 neighbor
show ipv6 route ospf</pre>

<div class="eg"><p><b>Worked example: 30 second ka exam drill.</b> Sawaal: "CORE O IA 172.16.0.0/22 [110/3] via 10.0.23.1 dikhata hai. LSA kis router ne banaya, kaunsa type hai, aur summary kahan configure hua?" Jawab: ABR1 (area 10 ki taraf akela ABR) ne area 0 mein type 3 summary LSA banaya, ABR1 par configured <code>area 10 range 172.16.0.0 255.255.252.0</code> se. Cost 3 = CORE se ABR1 (1) + summary metric (2).</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf commands revise karna. Exam aur interviews cause aur effect test karte hain: mismatch kya karta hai, router kaunsa LSA banata hai, route O ki jagah O IA kyun hai. Hamesha output samjhane ki practice karo, sirf command type karne ki nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> Aise distractors expect karo jo roles ulat dete hain: "ASBR type 4 banata hai", "distribute-list in LSA hata deta hai", "area range ASBR par kaam karta hai", "point-to-multipoint DR elect karta hai". Inmein se har ek galat hai.</p></div>

<div class="scn"><h4>Interview jo ek output par palat gaya</h4><p>Network engineer role ke ek candidate ko ABR ka <code>show ip ospf database</code> dikhaya gaya aur poocha gaya ki ek prefix do areas mein do alag advertising routers ke saath kyun dikh raha hai. Guess karne ki jagah candidate ne samjhaya ki har ABR har area mein type 3 LSAs dobara originate karta hai, router IDs ke naam liye, costs calculate kiye, aur bataya ki kaunsa ABR prefer hoga. Is module ke concepts par bani us paanch minute ki explanation ne offer dilwa diya.</p><p><b>Seekh:</b> LSDB fluently padhna woh skill hai jo CCNP-level engineers ko alag karti hai.</p></div>

<div class="iv"><p class="q">"Mujhe do minute mein multi-area OSPF samjhao."</p><p>Strong answer: routers Hello, DBD, LSR, LSU aur LSAck se adjacencies banate hain; har area ka type 1 aur 2 LSAs se bana apna LSDB hota hai; ABRs har area ko area 0 se jodte hain aur areas ke beech prefixes type 3 LSAs ke roop mein advertise karte hain; ASBRs externals ko type 5 (ya NSSA mein 7) ke roop mein inject karte hain aur ABRs untak pahunchne ke liye type 4 banate hain; summarisation area range aur summary-address se hota hai; filtering filter-lists aur distribute-lists se; aur path choice pehle O, phir O IA, phir E1, phir E2. Kyun se khatam karo: chhote databases, seemit SPF runs aur stability ke liye summarisation.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Adjacency: Hello parameters match hone chahiye; DBD MTU check karta hai; bada RID master hai.</li>
<li>Network type DR, timers aur LSA representation tay karta hai; do-router Ethernet links par point-to-point use karo.</li>
<li>Type 1/2 areas ke andar, type 3/4 ABRs se, type 5/7 ASBRs se.</li>
<li>Saare areas contiguous area 0 se judte hain; sirf ABRs aur ASBRs par summarise aur filter karo.</li>
<li>O &gt; O IA &gt; E1/N1 &gt; E2/N2; OSPFv3 naye LSA names ke saath same rules follow karta hai.</li>
</ul></div>
`}};export{e as default};