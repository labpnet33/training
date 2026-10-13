var e={id:`dr-bdr`,h:{en:`DR and BDR election on broadcast networks`,hi:`Broadcast networks par DR aur BDR election`},fig:`dr`,body:{en:`
<p>Picture a housing society with 40 flats. If every resident personally told every other resident each piece of news, there would be 780 conversations for every announcement. Instead the society elects a <b>secretary</b> and a <b>joint secretary</b>. Residents tell the secretary; the secretary informs everyone; the joint secretary listens to everything so that she can take over if the secretary is away. OSPF does the same on shared Ethernet segments with the <b>Designated Router (DR)</b> and <b>Backup Designated Router (BDR)</b>.</p>

<h3>The problem the DR solves</h3>
<p>On a multi-access segment such as a switched VLAN, full adjacencies between every pair of routers would need n(n-1)/2 of them: 10 for 5 routers, 45 for 10. Every LSA would be flooded over all of them. With a DR and BDR, every other router, called a <b>DROTHER</b>, forms a FULL adjacency <b>only with the DR and BDR</b>, and stays at 2-Way with the other DROTHERs.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Adjacencies with and without a DR">
<rect x="10" y="10" width="300" height="210" rx="10" fill="#fed7aa"/><text x="160" y="34" text-anchor="middle" class="svg-ink" font-size="13">Without DR: 6 adjacencies (4 routers)</text>
<circle cx="80" cy="80" r="18" fill="#e2e8f0"/><circle cx="240" cy="80" r="18" fill="#e2e8f0"/><circle cx="80" cy="180" r="18" fill="#e2e8f0"/><circle cx="240" cy="180" r="18" fill="#e2e8f0"/>
<line x1="98" y1="80" x2="222" y2="80" stroke="#64748b" stroke-width="2"/><line x1="98" y1="180" x2="222" y2="180" stroke="#64748b" stroke-width="2"/><line x1="80" y1="98" x2="80" y2="162" stroke="#64748b" stroke-width="2"/><line x1="240" y1="98" x2="240" y2="162" stroke="#64748b" stroke-width="2"/><line x1="93" y1="93" x2="227" y2="167" stroke="#64748b" stroke-width="2"/><line x1="227" y1="93" x2="93" y2="167" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="10" width="300" height="210" rx="10" fill="#bbf7d0"/><text x="480" y="34" text-anchor="middle" class="svg-ink" font-size="13">With DR and BDR: 5 FULL adjacencies</text>
<circle cx="400" cy="80" r="18" fill="#bae6fd"/><text x="400" y="85" text-anchor="middle" class="svg-ink" font-size="11">DR</text>
<circle cx="560" cy="80" r="18" fill="#ddd6fe"/><text x="560" y="85" text-anchor="middle" class="svg-ink" font-size="11">BDR</text>
<circle cx="400" cy="180" r="18" fill="#e2e8f0"/><circle cx="560" cy="180" r="18" fill="#e2e8f0"/>
<line x1="418" y1="80" x2="542" y2="80" stroke="#64748b" stroke-width="2"/><line x1="400" y1="98" x2="400" y2="162" stroke="#64748b" stroke-width="2"/><line x1="560" y1="98" x2="560" y2="162" stroke="#64748b" stroke-width="2"/><line x1="413" y1="93" x2="547" y2="167" stroke="#64748b" stroke-width="2"/><line x1="547" y1="93" x2="413" y2="167" stroke="#64748b" stroke-width="2"/>
<line x1="418" y1="180" x2="542" y2="180" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="480" y="208" text-anchor="middle" class="svg-muted" font-size="11">DROTHER to DROTHER stays 2-Way (dashed)</text>
</svg><p class="cap">The savings grow fast: with 10 routers, 45 adjacencies become 17.</p></div>

<h3>How the election works</h3>
<ol>
<li>The election runs per <b>segment</b> (per interface), not per router. A router can be DR on one VLAN and DROTHER on another.</li>
<li>It takes place in the 2-Way state, after the <b>wait timer</b> (40 s) on a newly active interface.</li>
<li>Highest interface <b>priority</b> wins. Range 0 to 255, default 1. Set with <code>ip ospf priority</code>.</li>
<li>On a tie, the highest <b>router ID</b> wins.</li>
<li>Priority <b>0</b> means the router can never be DR or BDR.</li>
<li>The election is <b>not preemptive</b>. Once a DR exists, a better router joining later does not take over. If the DR fails, the BDR is promoted to DR and a new BDR is elected.</li>
</ol>

<h3>How flooding works on the segment</h3>
<p>A DROTHER that has a new LSA sends its LSU to <b>224.0.0.6</b>, which only the DR and BDR listen to. The DR then floods it to <b>224.0.0.5</b> so that every OSPF router on the segment receives it. The BDR hears the original update too, so it is always ready to take over. The DR also creates the <b>network LSA</b> (type 2) for the segment, which you meet in the next chapter.</p>

<h3>Lab 3: forcing R1 as DR and R2 as BDR</h3>
<pre class="code"><span class="c">! R1: most preferred</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf priority 255
<span class="c">! R2: second choice</span>
R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip ospf priority 100
<span class="c">! R3 and R4: never DR or BDR</span>
R3(config)# interface GigabitEthernet0/0
R3(config-if)# ip ospf priority 0
<span class="c">! The election is not preemptive: restart OSPF on the routers close together</span>
R1# clear ip ospf process
Reset ALL OSPF processes? [no]: yes</pre>

<pre class="out">R3# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1         255   FULL/DR         00:00:35    10.10.0.1       GigabitEthernet0/0</span>
2.2.2.2         100   FULL/BDR        00:00:31    10.10.0.2       GigabitEthernet0/0
<span class="hl">4.4.4.4           0   2WAY/DROTHER    00:00:38    10.10.0.4       GigabitEthernet0/0</span>

R3# show ip ospf interface GigabitEthernet0/0 | include State|Designated
<span class="hl">  Transmit Delay is 1 sec, State DROTHER, Priority 0</span>
  Designated Router (ID) 1.1.1.1, Interface address 10.10.0.1
  Backup Designated router (ID) 2.2.2.2, Interface address 10.10.0.2</pre>
<p>R3 is FULL with the DR and BDR and 2-Way with R4, exactly what the lab's third task checks.</p>

<div class="eg"><p><b>Worked example.</b> Before you change anything in Lab 3, all four routers have priority 1 and their automatic RIDs are 10.14.0.1 (R1), 172.16.2.1 (R2), 172.16.3.1 (R3) and 192.168.4.1 (R4). If they start together, R4 becomes DR (highest RID) and R3 becomes BDR. After your changes and a restart, R1 wins on priority 255 and R2 on 100. If R1 later reloads, R2 is promoted to DR at once, and when R1 returns it becomes BDR, not DR, because the election does not preempt. The figure below the chapter shows the same rule with RIDs: R4 with the highest RID but priority 0 stays out.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Setting priorities and expecting an instant change (nothing happens until the current DR and BDR go away). Setting priority 0 on <b>every</b> router of a segment: no DR is elected, all neighbours sit at 2WAY/DROTHER and no routes are exchanged. Clearing OSPF on production routers in business hours just to move the DR.</p></div>

<div class="exam"><p><b>Exam traps.</b> Priority first, then RID. Default priority 1; 0 means never. Non-preemptive. The DR role belongs to an interface on a segment. DROTHERs send updates to 224.0.0.6; the DR floods to 224.0.0.5. In <code>show ip ospf neighbor</code> the role shown (<code>FULL/DR</code>) is the <b>neighbour's</b> role.</p></div>

<div class="scn"><h4>The new core router that would not take over</h4><p>A college added a powerful new router to its core VLAN with <code>ip ospf priority 255</code>, expecting it to become DR and relieve an ageing router. A week later it was still DROTHER. A junior engineer ran <code>clear ip ospf process</code> on every core router at 11 a.m. to "fix" it, and the whole campus lost routing for about a minute while adjacencies rebuilt. The senior engineer explained that the election is non-preemptive by design and scheduled the change for the Sunday window, clearing the old DR first so the new router won cleanly.</p><p><b>Lesson:</b> the DR election is sticky on purpose. Move the DR only in a maintenance window, and plan the order.</p></div>

<div class="iv"><p class="q">"Why does OSPF elect a DR, and how is it elected?"</p><p>Strong answer: on multi-access segments a DR and BDR reduce adjacencies from n(n-1)/2 to about 2n and centralise flooding: DROTHERs send updates to 224.0.0.6 and the DR floods to 224.0.0.5. The election is per segment, highest interface priority then highest RID, priority 0 excluded, and it is non-preemptive; if the DR fails the BDR takes over. Add that point-to-point links need no DR at all, which leads nicely into network types.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A DR and BDR are elected on broadcast (multi-access) segments to reduce adjacencies and flooding.</li>
<li>Highest priority wins (0 to 255, default 1), then highest RID; priority 0 never becomes DR or BDR.</li>
<li>The election is per segment and non-preemptive; the BDR takes over when the DR fails.</li>
<li>DROTHERs are FULL only with the DR and BDR, and 2WAY with each other.</li>
<li>DROTHERs send to 224.0.0.6; the DR floods to 224.0.0.5.</li>
</ul></div>
`,hi:`
<p>40 flats wali housing society socho. Agar har resident har khabar har dusre resident ko khud bataye, to har announcement ke liye 780 baatcheet hongi. Isliye society ek <b>secretary</b> aur ek <b>joint secretary</b> chunti hai. Residents secretary ko batate hain; secretary sabko inform karti hai; joint secretary sab kuch sunti rehti hai taaki secretary na ho to kaam sambhal sake. OSPF shared Ethernet segments par yahi <b>Designated Router (DR)</b> aur <b>Backup Designated Router (BDR)</b> ke saath karta hai.</p>

<h3>DR kaunsi problem solve karta hai</h3>
<p>Switched VLAN jaise multi-access segment par har pair ke beech full adjacency ke liye n(n-1)/2 adjacencies chahiye: 5 routers ke liye 10, 10 ke liye 45. Har LSA un sab par flood hota. DR aur BDR ke saath baaki har router, jise <b>DROTHER</b> kehte hain, <b>sirf DR aur BDR ke saath</b> FULL adjacency banata hai, aur baaki DROTHERs ke saath 2-Way par rehta hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="DR ke saath aur bina adjacencies">
<rect x="10" y="10" width="300" height="210" rx="10" fill="#fed7aa"/><text x="160" y="34" text-anchor="middle" class="svg-ink" font-size="13">DR ke bina: 6 adjacencies (4 routers)</text>
<circle cx="80" cy="80" r="18" fill="#e2e8f0"/><circle cx="240" cy="80" r="18" fill="#e2e8f0"/><circle cx="80" cy="180" r="18" fill="#e2e8f0"/><circle cx="240" cy="180" r="18" fill="#e2e8f0"/>
<line x1="98" y1="80" x2="222" y2="80" stroke="#64748b" stroke-width="2"/><line x1="98" y1="180" x2="222" y2="180" stroke="#64748b" stroke-width="2"/><line x1="80" y1="98" x2="80" y2="162" stroke="#64748b" stroke-width="2"/><line x1="240" y1="98" x2="240" y2="162" stroke="#64748b" stroke-width="2"/><line x1="93" y1="93" x2="227" y2="167" stroke="#64748b" stroke-width="2"/><line x1="227" y1="93" x2="93" y2="167" stroke="#64748b" stroke-width="2"/>
<rect x="330" y="10" width="300" height="210" rx="10" fill="#bbf7d0"/><text x="480" y="34" text-anchor="middle" class="svg-ink" font-size="13">DR aur BDR ke saath: 5 FULL adjacencies</text>
<circle cx="400" cy="80" r="18" fill="#bae6fd"/><text x="400" y="85" text-anchor="middle" class="svg-ink" font-size="11">DR</text>
<circle cx="560" cy="80" r="18" fill="#ddd6fe"/><text x="560" y="85" text-anchor="middle" class="svg-ink" font-size="11">BDR</text>
<circle cx="400" cy="180" r="18" fill="#e2e8f0"/><circle cx="560" cy="180" r="18" fill="#e2e8f0"/>
<line x1="418" y1="80" x2="542" y2="80" stroke="#64748b" stroke-width="2"/><line x1="400" y1="98" x2="400" y2="162" stroke="#64748b" stroke-width="2"/><line x1="560" y1="98" x2="560" y2="162" stroke="#64748b" stroke-width="2"/><line x1="413" y1="93" x2="547" y2="167" stroke="#64748b" stroke-width="2"/><line x1="547" y1="93" x2="413" y2="167" stroke="#64748b" stroke-width="2"/>
<line x1="418" y1="180" x2="542" y2="180" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="480" y="208" text-anchor="middle" class="svg-muted" font-size="11">DROTHER se DROTHER 2-Way par (dashed)</text>
</svg><p class="cap">Bachat tezi se badhti hai: 10 routers par 45 adjacencies 17 ban jaati hain.</p></div>

<h3>Election kaise hota hai</h3>
<ol>
<li>Election har <b>segment</b> (har interface) par hota hai, har router par nahi. Ek router ek VLAN par DR aur dusre par DROTHER ho sakta hai.</li>
<li>Yeh 2-Way state mein hota hai, naye active interface par <b>wait timer</b> (40 s) ke baad.</li>
<li>Sabse zyada interface <b>priority</b> jeetti hai. Range 0 se 255, default 1. <code>ip ospf priority</code> se set hoti hai.</li>
<li>Tie hone par sabse bada <b>router ID</b> jeetta hai.</li>
<li>Priority <b>0</b> ka matlab router kabhi DR ya BDR nahi ban sakta.</li>
<li>Election <b>preemptive nahi</b> hai. Ek baar DR ban gaya, to baad mein aaya better router use nahi hatata. DR fail ho to BDR promote hokar DR banta hai aur naya BDR elect hota hai.</li>
</ol>

<h3>Segment par flooding kaise hoti hai</h3>
<p>Jis DROTHER ke paas naya LSA hai, woh apna LSU <b>224.0.0.6</b> par bhejta hai, jise sirf DR aur BDR sunte hain. Phir DR use <b>224.0.0.5</b> par flood karta hai taaki segment ka har OSPF router use receive kare. BDR bhi original update sunta hai, isliye woh hamesha takeover ke liye ready rehta hai. DR segment ke liye <b>network LSA</b> (type 2) bhi banata hai, jo aap agle chapter mein dekhoge.</p>

<h3>Lab 3: R1 ko DR aur R2 ko BDR banana</h3>
<pre class="code"><span class="c">! R1: sabse preferred</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf priority 255
<span class="c">! R2: dusri choice</span>
R2(config)# interface GigabitEthernet0/0
R2(config-if)# ip ospf priority 100
<span class="c">! R3 aur R4: kabhi DR ya BDR nahi</span>
R3(config)# interface GigabitEthernet0/0
R3(config-if)# ip ospf priority 0
<span class="c">! Election preemptive nahi hai: routers par OSPF paas-paas time mein restart karo</span>
R1# clear ip ospf process
Reset ALL OSPF processes? [no]: yes</pre>

<pre class="out">R3# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1         255   FULL/DR         00:00:35    10.10.0.1       GigabitEthernet0/0</span>
2.2.2.2         100   FULL/BDR        00:00:31    10.10.0.2       GigabitEthernet0/0
<span class="hl">4.4.4.4           0   2WAY/DROTHER    00:00:38    10.10.0.4       GigabitEthernet0/0</span>

R3# show ip ospf interface GigabitEthernet0/0 | include State|Designated
<span class="hl">  Transmit Delay is 1 sec, State DROTHER, Priority 0</span>
  Designated Router (ID) 1.1.1.1, Interface address 10.10.0.1
  Backup Designated router (ID) 2.2.2.2, Interface address 10.10.0.2</pre>
<p>R3 DR aur BDR ke saath FULL hai aur R4 ke saath 2-Way, bilkul wahi jo lab ka teesra task check karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Lab 3 mein kuch badalne se pehle chaaron routers ki priority 1 hai aur unke automatic RIDs 10.14.0.1 (R1), 172.16.2.1 (R2), 172.16.3.1 (R3) aur 192.168.4.1 (R4) hain. Agar sab saath start hon, to R4 DR banta hai (sabse bada RID) aur R3 BDR. Aapke changes aur restart ke baad R1 priority 255 se jeetta hai aur R2 100 se. Agar baad mein R1 reload ho, to R2 turant DR promote ho jaata hai, aur R1 wapas aane par BDR banta hai, DR nahi, kyunki election preempt nahi karta. Chapter ke neeche wala figure yahi rule RIDs ke saath dikhata hai: sabse bade RID wala R4, priority 0 ki wajah se bahar rehta hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Priorities set karke turant change ki ummeed karna (current DR aur BDR ke jaane tak kuch nahi hota). Segment ke <b>har</b> router par priority 0 set karna: koi DR elect nahi hota, saare neighbours 2WAY/DROTHER par baithe rehte hain aur koi route exchange nahi hota. Sirf DR shift karne ke liye business hours mein production routers par OSPF clear karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> Pehle priority, phir RID. Default priority 1; 0 matlab kabhi nahi. Non-preemptive. DR role segment par ek interface ka hota hai. DROTHERs updates 224.0.0.6 par bhejte hain; DR 224.0.0.5 par flood karta hai. <code>show ip ospf neighbor</code> mein dikhne wala role (<code>FULL/DR</code>) <b>neighbour ka</b> role hai.</p></div>

<div class="scn"><h4>Naya core router jo takeover nahi kar raha tha</h4><p>Ek college ne apne core VLAN mein <code>ip ospf priority 255</code> ke saath ek powerful naya router joda, is ummeed mein ki woh DR banega aur purane router ka bojh kam karega. Ek hafte baad bhi woh DROTHER tha. Ek junior engineer ne ise "theek" karne ke liye subah 11 baje har core router par <code>clear ip ospf process</code> chala diya, aur adjacencies dobara banne tak poore campus ki routing lagbhag ek minute gayab rahi. Senior engineer ne samjhaya ki election design se hi non-preemptive hai aur change Sunday window mein schedule kiya, pehle purana DR clear karke taaki naya router saaf jeete.</p><p><b>Seekh:</b> DR election jaan-boojh kar sticky hai. DR sirf maintenance window mein shift karo, aur order plan karo.</p></div>

<div class="iv"><p class="q">"OSPF DR kyun elect karta hai, aur woh kaise elect hota hai?"</p><p>Strong answer: multi-access segments par DR aur BDR adjacencies ko n(n-1)/2 se lagbhag 2n tak kam karte hain aur flooding centralise karte hain: DROTHERs updates 224.0.0.6 par bhejte hain aur DR 224.0.0.5 par flood karta hai. Election har segment par hota hai, pehle sabse zyada interface priority phir sabse bada RID, priority 0 bahar, aur yeh non-preemptive hai; DR fail ho to BDR sambhalta hai. Yeh bhi jodo ki point-to-point links ko DR ki zaroorat hi nahi, jo network types ki taraf achha bridge hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Broadcast (multi-access) segments par adjacencies aur flooding kam karne ke liye DR aur BDR elect hote hain.</li>
<li>Sabse zyada priority jeetti hai (0 se 255, default 1), phir sabse bada RID; priority 0 kabhi DR ya BDR nahi banta.</li>
<li>Election per segment aur non-preemptive hai; DR fail hone par BDR sambhalta hai.</li>
<li>DROTHERs sirf DR aur BDR ke saath FULL hote hain, aur aapas mein 2WAY.</li>
<li>DROTHERs 224.0.0.6 par bhejte hain; DR 224.0.0.5 par flood karta hai.</li>
</ul></div>
`}};export{e as default};