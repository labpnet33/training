var e={id:`troubleshooting`,h:{en:`A troubleshooting workflow for OSPF on Junos`,hi:`Junos par OSPF ke liye troubleshooting workflow`},body:{en:`
<p>A doctor does not start with surgery. She asks where it hurts, takes the temperature, and works from simple causes to rare ones. OSPF troubleshooting is the same. Almost every ticket is one of four things: the <b>neighbour</b> is not formed, the neighbour is formed but the <b>database</b> is wrong, the database is right but the <b>route</b> is not installed, or the route is installed but <b>traffic</b> still fails. Work down this ladder and stop at the first broken rung.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OSPF troubleshooting ladder">
<rect x="20" y="15" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="35" y="39" class="svg-ink" font-size="13">1. Interface: up/up, right address, listed under the area? (show ospf interface)</text>
<rect x="20" y="62" width="600" height="38" rx="8" fill="#fde68a"/><text x="35" y="86" class="svg-ink" font-size="13">2. Neighbour: state Full (or 2Way on DROthers)? (show ospf neighbor extensive)</text>
<rect x="20" y="109" width="600" height="38" rx="8" fill="#fed7aa"/><text x="35" y="133" class="svg-ink" font-size="13">3. Database: the LSA exists and is current? (show ospf database)</text>
<rect x="20" y="156" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="35" y="180" class="svg-ink" font-size="13">4. Route: installed, not hidden by a better protocol? (show route)</text>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">Then ping and traceroute; check filters and the return path</text>
</svg><p class="cap">Stop at the first rung that fails.</p></div>

<h3>Symptom to cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Command</th></tr>
<tr><td>Interface not listed in OSPF</td><td>missing from <code>protocols ospf</code>, or no <code>family inet</code>, or disabled</td><td><code>show ospf interface</code></td></tr>
<tr><td>No neighbour</td><td>area, timers, subnet, authentication, stub flag mismatch; filter dropping protocol 89</td><td><code>show ospf statistics</code></td></tr>
<tr><td>Stuck in ExStart/Exchange</td><td>MTU mismatch, duplicate router ID</td><td><code>show ospf neighbor extensive</code></td></tr>
<tr><td>Neighbour flaps</td><td>unstable link, timers, duplicate router ID</td><td><code>show ospf log</code>, <code>show log messages</code></td></tr>
<tr><td>Wrong DR</td><td>priority, not pre-emptive</td><td><code>show ospf interface</code></td></tr>
<tr><td>Prefix missing</td><td>not advertised, area type blocks it, summarised or restricted</td><td><code>show ospf database</code></td></tr>
<tr><td>No default in a stub area</td><td>missing <code>default-metric</code></td><td><code>show ospf overview</code></td></tr></table>

<h3>Walking through the Kochi ticket</h3>
<p>The ticket: "The shared LAN election is wrong, and the link to Kollam never reaches Full, so PC1 cannot reach the Kollam server." Start at rung 2 on R1 and R2.</p>
<pre class="out">lab@R1-KOCHI&gt; show ospf interface
ge-0/0/0.0          DRother 0.0.0.0         <span class="hl">10.255.2.3</span>      10.255.2.2         2
lab@R2-KOCHI&gt; show ospf neighbor
10.2.0.3         ge-0/0/0.0             Full            10.255.2.3       255    36
10.2.24.2        ge-0/0/1.0             <span class="hl">ExStart</span>         10.255.2.4       128    31</pre>
<p>Fact one: the DR is 10.255.2.3 (R3) and its priority is 255; the design wants R1. Fact two: R2-R4 sits in ExStart. Because it passed 2Way, hello parameters are fine, so look at the DbD exchange. The extensive view names the problem:</p>
<pre class="out">lab@R2-KOCHI&gt; show ospf neighbor extensive
10.2.24.2        ge-0/0/1.0             ExStart         10.255.2.4       128    31
  Neighbor MTU 9178, local MTU 1500, Hello 10, Dead 40  &lt;- MTU mismatch
lab@R4-KOLLAM&gt; show interfaces ge-0/0/0 | match mtu
  Link-level type: Ethernet, MTU: 9192, ...</pre>
<p>R4 is the odd one out, since company standard is the default MTU. Fix both faults:</p>
<pre class="code"><span class="c">! R1</span>
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 priority 200
<span class="c">! R3</span>
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 priority 0
<span class="c">! R4</span>
delete interfaces ge-0/0/0 mtu
<span class="c">! R1, R2, R3 (operational mode)</span>
clear ospf neighbor</pre>
<pre class="out">lab@R1-KOCHI&gt; show ospf interface
ge-0/0/0.0          <span class="hl">DR</span>      0.0.0.0         10.255.2.1      10.255.2.2         2
lab@R2-KOCHI&gt; show ospf neighbor
10.2.0.1         ge-0/0/0.0             Full            10.255.2.1       200    32
10.2.0.3         ge-0/0/0.0             Full            10.255.2.3         0    36
10.2.24.2        ge-0/0/1.0             <span class="hl">Full</span>            10.255.2.4       128    31</pre>
<p>Finish at rung 4 and beyond: the route to 10.2.4.0/24 is in R1's table and PC1 pings 10.2.4.10. Give the adjacencies about a minute after the clear, because the DR election waits for a wait timer (equal to the dead interval) on a new interface.</p>

<h3>Useful toolbox beyond show commands</h3>
<ul>
<li><code>show ospf log</code>: when SPF ran and how long; too many runs means instability.</li>
<li><code>show ospf overview</code>: router ID, area types, ABR and ASBR flags, SPF counters.</li>
<li><code>show log messages | match OSPF</code> and <code>show log messages | match RPD_OSPF</code>: neighbour up/down events.</li>
<li><code>set protocols ospf traceoptions file ospf-trace flag error</code>: targeted trace of a specific issue; remove it afterwards.</li>
<li><code>show route 10.2.4.0/24 detail</code>: next hop, preference, area and metric.</li>
<li><code>ping</code> with <code>source</code> and <code>traceroute</code>: test from the real source address to catch return-path problems.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "The prefix 172.20.0.0/22 is missing on R4 after the ABR change." Rung 2 is healthy. At rung 3, <code>show ospf database netsummary</code> has no LSA for 172.20.0.0. The ABR configuration shows <code>area-range 172.20.0.0/22 restrict</code>, which hides the range on purpose. Delete the <code>restrict</code> keyword and the LSA appears.</p></div>

<div class="warn"><p><b>Common mistake.</b> Jumping to the routing table when the neighbour is not Full, or restarting OSPF (<code>restart routing</code>) as a first reaction, which resets every adjacency on the box. Collect facts first; clear only the neighbours you must.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions give you output and ask for the cause. A neighbour that never appears points to the hello mismatch list; one stuck in ExStart points to MTU. A route in the database but not in the table points to preference or next-hop problems. Learn to read the extensive output.</p></div>

<div class="scn"><h4>The Friday night flap</h4><p>A branch link flapped every few minutes. <code>show ospf neighbor extensive</code> showed adjacency state changes growing quickly. The log showed the link going down for two seconds at a time. Nothing was wrong with OSPF itself: the optics were failing. The team swapped the SFP and OSPF recovered. A BFD session would have detected the problem faster, but the real fix was physical.</p><p><b>Lesson:</b> check layer 1 and 2 before blaming the routing protocol.</p></div>

<div class="iv"><p class="q">"Walk me through how you troubleshoot an OSPF neighbour that is not coming up."</p><p>Interface first: up/up, address, same subnet, listed under the right area. Then <code>show ospf neighbor</code> and <code>show ospf statistics</code> for receive errors. Compare area ID, hello/dead, authentication, stub flag and router ID on both ends. If it reaches ExStart, compare MTU. Finally check for a firewall filter blocking protocol 89 or multicast 224.0.0.5, and look at the logs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use a ladder: interface, neighbour, database, route, traffic.</li>
<li><code>show ospf neighbor extensive</code> and <code>show ospf statistics</code> name most adjacency faults.</li>
<li>After a priority change, <code>clear ospf neighbor</code> and wait for the election.</li>
<li>Compare databases with <code>show ospf database summary</code>; check area-range restrict and area types.</li>
<li>Always verify end to end with ping from the real source.</li>
</ul></div>
`,hi:`
<p>Doctor sidhe surgery se shuru nahi karti. Wo poochti hai kahan dard hai, temperature leti hai, aur aasaan wajahon se rare wajahon ki taraf badhti hai. OSPF troubleshooting bhi aisi hi hai. Lagbhag har ticket chaar cheezon mein se ek hota hai: <b>neighbour</b> nahi bana, neighbour bana par <b>database</b> galat hai, database sahi hai par <b>route</b> install nahi hua, ya route install hai par <b>traffic</b> phir bhi fail hota hai. Is seedhi par neeche jaao aur pehle toote hue paayedaan par ruk jaao.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="OSPF troubleshooting seedhi">
<rect x="20" y="15" width="600" height="38" rx="8" fill="#e2e8f0"/><text x="35" y="39" class="svg-ink" font-size="13">1. Interface: up/up, sahi address, area ke neeche listed? (show ospf interface)</text>
<rect x="20" y="62" width="600" height="38" rx="8" fill="#fde68a"/><text x="35" y="86" class="svg-ink" font-size="13">2. Neighbour: state Full (DROthers par 2Way)? (show ospf neighbor extensive)</text>
<rect x="20" y="109" width="600" height="38" rx="8" fill="#fed7aa"/><text x="35" y="133" class="svg-ink" font-size="13">3. Database: LSA maujood aur current hai? (show ospf database)</text>
<rect x="20" y="156" width="600" height="38" rx="8" fill="#bbf7d0"/><text x="35" y="180" class="svg-ink" font-size="13">4. Route: installed, behtar protocol se chhupa nahi? (show route)</text>
<text x="320" y="218" text-anchor="middle" class="svg-muted" font-size="12">Phir ping aur traceroute; filters aur return path check karo</text>
</svg><p class="cap">Pehle fail hone wale rung par ruko.</p></div>

<h3>Symptom se cause table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Mumkin cause</th><th>Command</th></tr>
<tr><td>Interface OSPF mein listed nahi</td><td><code>protocols ospf</code> mein nahi, ya <code>family inet</code> nahi, ya disabled</td><td><code>show ospf interface</code></td></tr>
<tr><td>Koi neighbour nahi</td><td>area, timers, subnet, authentication, stub flag mismatch; protocol 89 drop karta filter</td><td><code>show ospf statistics</code></td></tr>
<tr><td>ExStart/Exchange mein atka</td><td>MTU mismatch, duplicate router ID</td><td><code>show ospf neighbor extensive</code></td></tr>
<tr><td>Neighbour flap karta hai</td><td>unstable link, timers, duplicate router ID</td><td><code>show ospf log</code>, <code>show log messages</code></td></tr>
<tr><td>Galat DR</td><td>priority, pre-emptive nahi</td><td><code>show ospf interface</code></td></tr>
<tr><td>Prefix missing</td><td>advertise nahi hua, area type block karta hai, summarised ya restricted</td><td><code>show ospf database</code></td></tr>
<tr><td>Stub area mein default nahi</td><td><code>default-metric</code> missing</td><td><code>show ospf overview</code></td></tr></table>

<h3>Kochi ticket ko step-by-step dekhna</h3>
<p>Ticket: "Shared LAN ka election galat hai, aur Kollam ka link kabhi Full nahi hota, isliye PC1 Kollam server tak nahi pahunchta." R1 aur R2 par rung 2 se shuru karo.</p>
<pre class="out">lab@R1-KOCHI&gt; show ospf interface
ge-0/0/0.0          DRother 0.0.0.0         <span class="hl">10.255.2.3</span>      10.255.2.2         2
lab@R2-KOCHI&gt; show ospf neighbor
10.2.0.3         ge-0/0/0.0             Full            10.255.2.3       255    36
10.2.24.2        ge-0/0/1.0             <span class="hl">ExStart</span>         10.255.2.4       128    31</pre>
<p>Pehla fact: DR 10.255.2.3 (R3) hai aur uski priority 255; design R1 chahta hai. Doosra fact: R2-R4 ExStart mein hai. Kyunki wo 2Way paar kar chuka hai, hello parameters theek hain, isliye DbD exchange dekho. Extensive view samasya ka naam batata hai:</p>
<pre class="out">lab@R2-KOCHI&gt; show ospf neighbor extensive
10.2.24.2        ge-0/0/1.0             ExStart         10.255.2.4       128    31
  Neighbor MTU 9178, local MTU 1500, Hello 10, Dead 40  &lt;- MTU mismatch
lab@R4-KOLLAM&gt; show interfaces ge-0/0/0 | match mtu
  Link-level type: Ethernet, MTU: 9192, ...</pre>
<p>R4 alag nikla, kyunki company standard default MTU hai. Dono faults theek karo:</p>
<pre class="code"><span class="c">! R1</span>
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 priority 200
<span class="c">! R3</span>
set protocols ospf area 0.0.0.0 interface ge-0/0/0.0 priority 0
<span class="c">! R4</span>
delete interfaces ge-0/0/0 mtu
<span class="c">! R1, R2, R3 (operational mode)</span>
clear ospf neighbor</pre>
<pre class="out">lab@R1-KOCHI&gt; show ospf interface
ge-0/0/0.0          <span class="hl">DR</span>      0.0.0.0         10.255.2.1      10.255.2.2         2
lab@R2-KOCHI&gt; show ospf neighbor
10.2.0.1         ge-0/0/0.0             Full            10.255.2.1       200    32
10.2.0.3         ge-0/0/0.0             Full            10.255.2.3         0    36
10.2.24.2        ge-0/0/1.0             <span class="hl">Full</span>            10.255.2.4       128    31</pre>
<p>Rung 4 aur aage khatam karo: 10.2.4.0/24 ka route R1 ki table mein hai aur PC1 10.2.4.10 ko ping karta hai. clear ke baad adjacencies ko lagbhag ek minute do, kyunki naye interface par DR election wait timer (dead interval ke barabar) ka intezaar karta hai.</p>

<h3>Show commands ke alawa toolbox</h3>
<ul>
<li><code>show ospf log</code>: SPF kab chala aur kitni der laga; bahut baar chalna instability batata hai.</li>
<li><code>show ospf overview</code>: router ID, area types, ABR aur ASBR flags, SPF counters.</li>
<li><code>show log messages | match OSPF</code> aur <code>show log messages | match RPD_OSPF</code>: neighbour up/down events.</li>
<li><code>set protocols ospf traceoptions file ospf-trace flag error</code>: kisi khaas issue ka targeted trace; baad mein hata do.</li>
<li><code>show route 10.2.4.0/24 detail</code>: next hop, preference, area aur metric.</li>
<li><code>ping</code> ke saath <code>source</code> aur <code>traceroute</code>: asli source address se test karo taaki return-path problems pakdi jaayein.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ticket: "ABR change ke baad R4 par prefix 172.20.0.0/22 missing hai." Rung 2 healthy hai. Rung 3 par <code>show ospf database netsummary</code> mein 172.20.0.0 ka koi LSA nahi hai. ABR configuration mein <code>area-range 172.20.0.0/22 restrict</code> hai, jo range ko jaan-boojhkar chhupata hai. <code>restrict</code> keyword hata do aur LSA aa jaata hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Neighbour Full na ho tab routing table par kud jaana, ya pehli reaction mein OSPF restart karna (<code>restart routing</code>), jo box ki har adjacency reset kar deta hai. Pehle facts jama karo; sirf wahi neighbours clear karo jinhe zaroorat hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal output dete hain aur cause poochte hain. Jo neighbour kabhi dikhta hi nahi wo hello mismatch list ki taraf ishara karta hai; ExStart mein atka MTU ki taraf. Database mein route par table mein nahi, to preference ya next-hop problem. Extensive output padhna seekho.</p></div>

<div class="scn"><h4>Friday raat ka flap</h4><p>Ek branch link har kuch minute mein flap kar raha tha. <code>show ospf neighbor extensive</code> mein adjacency state changes tezi se badh rahe the. Log mein link do-do second ke liye down dikha. OSPF mein khud kuch galat nahi tha: optics fail ho rahe the. Team ne SFP badla aur OSPF theek ho gaya. BFD session problem jaldi pakadta, par asli fix physical thi.</p><p><b>Lesson:</b> routing protocol ko blame karne se pehle layer 1 aur 2 check karo.</p></div>

<div class="iv"><p class="q">"Mujhe batao ki jo OSPF neighbour up nahi ho raha use kaise troubleshoot karte ho."</p><p>Pehle interface: up/up, address, same subnet, sahi area ke neeche listed. Phir <code>show ospf neighbor</code> aur receive errors ke liye <code>show ospf statistics</code>. Dono ends par area ID, hello/dead, authentication, stub flag aur router ID compare karo. ExStart tak pahunche to MTU compare karo. Aakhir mein protocol 89 ya multicast 224.0.0.5 block karta firewall filter dekho aur logs padho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Seedhi use karo: interface, neighbour, database, route, traffic.</li>
<li><code>show ospf neighbor extensive</code> aur <code>show ospf statistics</code> zyaadatar adjacency faults ka naam batate hain.</li>
<li>Priority change ke baad <code>clear ospf neighbor</code> karo aur election ka intezaar karo.</li>
<li>Databases <code>show ospf database summary</code> se compare karo; area-range restrict aur area types dekho.</li>
<li>Hamesha asli source se ping karke end to end verify karo.</li>
</ul></div>
`}};export{e as default};