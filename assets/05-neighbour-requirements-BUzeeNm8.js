var e={id:`neighbours`,h:{en:`Hello packets and the neighbour requirements`,hi:`Hello packets aur neighbour banne ki shartein`},body:{en:`
<p>Two people can only hold a meeting if they are in the same room, at the same time, speaking the same language, and both have the password for the meeting link. If any one of those is wrong, they never actually meet, even though both are "online". OSPF neighbours are the same. Two routers can be cabled together, with both interfaces up/up and pings working, and still never become OSPF neighbours because one value in their Hello packets disagrees.</p>

<h3>What a Hello packet carries</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Fields in an OSPF Hello packet">
<rect x="20" y="10" width="600" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">OSPF Hello (type 1), sent to 224.0.0.5 every 10 s on Ethernet</text>
<rect x="20" y="50" width="195" height="34" rx="6" fill="#bae6fd"/><text x="117" y="72" text-anchor="middle" class="svg-ink" font-size="12">Router ID (must differ)</text>
<rect x="222" y="50" width="195" height="34" rx="6" fill="#fed7aa"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="12">Area ID (must match)</text>
<rect x="425" y="50" width="195" height="34" rx="6" fill="#fed7aa"/><text x="522" y="72" text-anchor="middle" class="svg-ink" font-size="12">Network mask (match)</text>
<rect x="20" y="92" width="195" height="34" rx="6" fill="#fed7aa"/><text x="117" y="114" text-anchor="middle" class="svg-ink" font-size="12">Hello interval (match)</text>
<rect x="222" y="92" width="195" height="34" rx="6" fill="#fed7aa"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="12">Dead interval (match)</text>
<rect x="425" y="92" width="195" height="34" rx="6" fill="#fed7aa"/><text x="522" y="114" text-anchor="middle" class="svg-ink" font-size="12">Authentication (match)</text>
<rect x="20" y="134" width="195" height="34" rx="6" fill="#fed7aa"/><text x="117" y="156" text-anchor="middle" class="svg-ink" font-size="12">Stub area flag (match)</text>
<rect x="222" y="134" width="195" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="12">Priority (DR election)</text>
<rect x="425" y="134" width="195" height="34" rx="6" fill="#bbf7d0"/><text x="522" y="156" text-anchor="middle" class="svg-ink" font-size="12">Current DR and BDR</text>
<rect x="20" y="176" width="600" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="198" text-anchor="middle" class="svg-ink" font-size="12">Neighbour list: RIDs of routers already heard on this link</text>
<text x="320" y="236" text-anchor="middle" class="svg-muted" font-size="12">Orange = must match. MTU is not in the Hello; it is checked later in the DBD.</text>
</svg><p class="cap">The orange fields are compared on every Hello. One mismatch and the Hello is ignored.</p></div>

<h3>The neighbour checklist</h3>
<table class="cmp"><tr><th>Requirement</th><th>What happens if it is wrong</th></tr>
<tr><td>Same <b>subnet</b> (and same <b>mask</b> on broadcast links)</td><td>Hellos ignored, no neighbour</td></tr>
<tr><td>Same <b>area ID</b></td><td>No neighbour; IOS logs an <code>%OSPF-4-ERRRCV</code> mismatched area message</td></tr>
<tr><td>Same <b>Hello and dead intervals</b></td><td>No neighbour, no log by default; an existing neighbour drops when the dead timer expires</td></tr>
<tr><td>Same <b>authentication</b> type and key</td><td>No neighbour; an <code>%OSPF-4-ERRRCV</code> authentication message is logged</td></tr>
<tr><td>Same <b>stub area flag</b></td><td>No neighbour (a CCNP topic, but it is checked)</td></tr>
<tr><td><b>Unique router IDs</b></td><td><code>%OSPF-4-DUP_RTRID_NBR</code>, no adjacency</td></tr>
<tr><td>Same <b>IP MTU</b></td><td>Neighbour appears but sticks in <b>EXSTART/EXCHANGE</b>, never FULL</td></tr>
<tr><td>Interface <b>not passive</b>, not filtered by an ACL</td><td>No Hellos sent or received, no neighbour, no error</td></tr>
</table>
<p>Just as important is what does <b>not</b> need to match: the <b>process ID</b> (the 1 in <code>router ospf 1</code>) is local to the router and never sent in any packet, and interface <b>priority</b> and <b>cost</b> can differ freely.</p>

<h3>Hello and dead timers</h3>
<p>On broadcast and point-to-point networks the Hello interval is <b>10 seconds</b> and the dead interval is <b>40 seconds</b> (four Hellos). If no valid Hello arrives for the dead interval, the neighbour is declared down. When you change the Hello interval on an interface, IOS automatically sets the dead interval to four times the new value, unless you configured the dead interval explicitly.</p>
<pre class="code"><span class="c">! Tune both ends identically, or not at all</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf hello-interval 5
<span class="c">! dead becomes 20 automatically</span>
R1(config-if)# ip ospf dead-interval 20</pre>

<pre class="out">R1# show ip ospf interface GigabitEthernet0/0 | include Timer
<span class="hl">  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5</span>
R2# show ip ospf interface GigabitEthernet0/0 | include Timer
<span class="hl">  Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5</span></pre>

<div class="eg"><p><b>Worked example.</b> This is exactly the first fault in ticket NK-4521. R2's Gi0/0 was tuned to Hello 5 and dead 20, while R1 still uses 10 and 40. From the moment the change is saved, each router ignores the other's Hellos. The adjacency survives until R1's 40-second dead timer runs out, then it drops with "Dead timer expired". Nothing is logged about timers themselves, so you must compare the Timer line on both ends. Removing <code>ip ospf hello-interval 5</code> from R2 restores 10/40 and the neighbour returns.</p></div>

<h3>Authentication at CCNA depth</h3>
<p>OSPF can authenticate Hellos so that a rogue device cannot join. MD5 per interface looks like this, and both ends need the same key ID and key:</p>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf authentication message-digest
R1(config-if)# ip ospf message-digest-key 1 md5 NK-Lab-Key1</pre>

<div class="warn"><p><b>Common mistakes.</b> Believing the process ID must match (it never does). Changing timers on one end only. Typing the correct subnet but the wrong mask on one side, for example /30 against /29: both addresses may still be in each other's range, yet the masks differ and the Hellos are rejected on a broadcast link.</p></div>

<div class="exam"><p><b>Exam trap.</b> Learn which mismatch produces which symptom. <b>MTU</b> mismatch is the only common one where the neighbour appears and gets stuck in <b>EXSTART/EXCHANGE</b>. Area, subnet, timers, authentication and duplicate RID prevent the relationship earlier, so the neighbour is missing or never reaches 2-Way.</p></div>

<div class="scn"><h4>Half an authentication change</h4><p>A security project required OSPF MD5 authentication on all WAN links of a manufacturing company. The engineer configured the head office side of a link, got pulled into a meeting, and did not configure the branch side. For 40 seconds nothing happened; then the branch disappeared. The head office router logged an <code>%OSPF-4-ERRRCV</code> message about an authentication mismatch from the branch address. Configuring the same key ID and key on the branch brought the neighbour back to FULL. The team now applies authentication changes to both ends in a single scripted step.</p><p><b>Lesson:</b> every Hello parameter is a two-ended change. Plan it, apply it to both sides together, and verify.</p></div>

<div class="iv"><p class="q">"Two directly connected routers are not forming an OSPF adjacency. What do you check?"</p><p>Strong answer: first Layer 1 to 3 (interfaces up/up, ping across the link). Then the Hello parameters with <code>show ip ospf interface</code> on both ends: area, subnet and mask, Hello and dead timers, authentication, and whether the interface is passive. Then router IDs for duplicates, ACLs blocking protocol 89, and if the neighbour is stuck in EXSTART/EXCHANGE, the MTU. Say that the process ID does not need to match; interviewers often test that.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hellos carry the parameters that must match: area, subnet/mask, Hello and dead timers, authentication, stub flag.</li>
<li>Router IDs must be unique; MTU must match for the adjacency to reach FULL.</li>
<li>The OSPF process ID, cost and priority do not need to match.</li>
<li>Defaults: Hello 10 s, dead 40 s; changing Hello changes dead to 4x automatically.</li>
<li>Passive interfaces and ACLs silently prevent neighbours.</li>
</ul></div>
`,hi:`
<p>Do log meeting tabhi kar sakte hain jab woh same room mein hon, same time par, same bhasha bolein, aur dono ke paas meeting link ka password ho. Inmein se ek bhi galat ho to woh asal mein milte hi nahi, chahe dono "online" dikh rahe hon. OSPF neighbours bhi aise hi hain. Do routers cable se jude ho sakte hain, dono interfaces up/up aur ping chal raha ho, phir bhi woh kabhi OSPF neighbours nahi bante kyunki unke Hello packets ki ek value agree nahi karti.</p>

<h3>Hello packet mein kya hota hai</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="OSPF Hello packet ke fields">
<rect x="20" y="10" width="600" height="30" rx="6" fill="#e2e8f0"/><text x="320" y="30" text-anchor="middle" class="svg-ink" font-size="13">OSPF Hello (type 1), Ethernet par har 10 s mein 224.0.0.5 ko</text>
<rect x="20" y="50" width="195" height="34" rx="6" fill="#bae6fd"/><text x="117" y="72" text-anchor="middle" class="svg-ink" font-size="12">Router ID (alag hona chahiye)</text>
<rect x="222" y="50" width="195" height="34" rx="6" fill="#fed7aa"/><text x="320" y="72" text-anchor="middle" class="svg-ink" font-size="12">Area ID (match zaroori)</text>
<rect x="425" y="50" width="195" height="34" rx="6" fill="#fed7aa"/><text x="522" y="72" text-anchor="middle" class="svg-ink" font-size="12">Network mask (match)</text>
<rect x="20" y="92" width="195" height="34" rx="6" fill="#fed7aa"/><text x="117" y="114" text-anchor="middle" class="svg-ink" font-size="12">Hello interval (match)</text>
<rect x="222" y="92" width="195" height="34" rx="6" fill="#fed7aa"/><text x="320" y="114" text-anchor="middle" class="svg-ink" font-size="12">Dead interval (match)</text>
<rect x="425" y="92" width="195" height="34" rx="6" fill="#fed7aa"/><text x="522" y="114" text-anchor="middle" class="svg-ink" font-size="12">Authentication (match)</text>
<rect x="20" y="134" width="195" height="34" rx="6" fill="#fed7aa"/><text x="117" y="156" text-anchor="middle" class="svg-ink" font-size="12">Stub area flag (match)</text>
<rect x="222" y="134" width="195" height="34" rx="6" fill="#bbf7d0"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="12">Priority (DR election)</text>
<rect x="425" y="134" width="195" height="34" rx="6" fill="#bbf7d0"/><text x="522" y="156" text-anchor="middle" class="svg-ink" font-size="12">Current DR aur BDR</text>
<rect x="20" y="176" width="600" height="34" rx="6" fill="#ddd6fe"/><text x="320" y="198" text-anchor="middle" class="svg-ink" font-size="12">Neighbour list: is link par pehle se sune gaye routers ke RIDs</text>
<text x="320" y="236" text-anchor="middle" class="svg-muted" font-size="12">Orange = match zaroori. MTU Hello mein nahi hota; woh baad mein DBD mein check hota hai.</text>
</svg><p class="cap">Orange fields har Hello par compare hote hain. Ek mismatch aur Hello ignore ho jaata hai.</p></div>

<h3>Neighbour checklist</h3>
<table class="cmp"><tr><th>Shart</th><th>Galat ho to kya hota hai</th></tr>
<tr><td>Same <b>subnet</b> (aur broadcast links par same <b>mask</b>)</td><td>Hellos ignore, koi neighbour nahi</td></tr>
<tr><td>Same <b>area ID</b></td><td>Koi neighbour nahi; IOS <code>%OSPF-4-ERRRCV</code> mismatched area message log karta hai</td></tr>
<tr><td>Same <b>Hello aur dead intervals</b></td><td>Koi neighbour nahi, default mein koi log nahi; existing neighbour dead timer khatam hone par gir jaata hai</td></tr>
<tr><td>Same <b>authentication</b> type aur key</td><td>Koi neighbour nahi; <code>%OSPF-4-ERRRCV</code> authentication message log hota hai</td></tr>
<tr><td>Same <b>stub area flag</b></td><td>Koi neighbour nahi (CCNP topic, lekin check hota hai)</td></tr>
<tr><td><b>Unique router IDs</b></td><td><code>%OSPF-4-DUP_RTRID_NBR</code>, koi adjacency nahi</td></tr>
<tr><td>Same <b>IP MTU</b></td><td>Neighbour dikhta hai lekin <b>EXSTART/EXCHANGE</b> mein atak jaata hai, kabhi FULL nahi</td></tr>
<tr><td>Interface <b>passive nahi</b>, ACL se filtered nahi</td><td>Hellos na jaate hain na aate hain, koi neighbour nahi, koi error nahi</td></tr>
</table>
<p>Utna hi important yeh hai ki kya match hona <b>zaroori nahi</b>: <b>process ID</b> (<code>router ospf 1</code> wala 1) router ke liye local hai aur kisi packet mein nahi jaata, aur interface <b>priority</b> aur <b>cost</b> freely alag ho sakte hain.</p>

<h3>Hello aur dead timers</h3>
<p>Broadcast aur point-to-point networks par Hello interval <b>10 second</b> aur dead interval <b>40 second</b> (chaar Hellos) hota hai. Agar dead interval tak koi valid Hello nahi aata, neighbour down declare ho jaata hai. Jab aap interface par Hello interval badalte ho, IOS apne aap dead interval ko naye value ka chaar guna kar deta hai, jab tak aapne dead interval explicitly configure na kiya ho.</p>
<pre class="code"><span class="c">! Dono ends identical tune karo, ya bilkul mat karo</span>
R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf hello-interval 5
<span class="c">! dead apne aap 20 ho jaata hai</span>
R1(config-if)# ip ospf dead-interval 20</pre>

<pre class="out">R1# show ip ospf interface GigabitEthernet0/0 | include Timer
<span class="hl">  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5</span>
R2# show ip ospf interface GigabitEthernet0/0 | include Timer
<span class="hl">  Timer intervals configured, Hello 5, Dead 20, Wait 20, Retransmit 5</span></pre>

<div class="eg"><p><b>Worked example.</b> Ticket NK-4521 ki pehli galti bilkul yahi hai. R2 ka Gi0/0 Hello 5 aur dead 20 par tune kiya gaya, jabki R1 abhi bhi 10 aur 40 use karta hai. Change save hote hi dono routers ek dusre ke Hellos ignore karne lagte hain. Adjacency tab tak bachi rehti hai jab tak R1 ka 40 second ka dead timer khatam na ho, phir "Dead timer expired" ke saath gir jaati hai. Timers ke baare mein khud koi log nahi aata, isliye aapko dono ends par Timer line compare karni padti hai. R2 se <code>ip ospf hello-interval 5</code> hatane par 10/40 wapas aata hai aur neighbour laut aata hai.</p></div>

<h3>CCNA level par authentication</h3>
<p>OSPF Hellos ko authenticate kar sakta hai taaki koi rogue device join na kar sake. Per interface MD5 aisa dikhta hai, aur dono ends par same key ID aur key chahiye:</p>
<pre class="code">R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip ospf authentication message-digest
R1(config-if)# ip ospf message-digest-key 1 md5 NK-Lab-Key1</pre>

<div class="warn"><p><b>Common galtiyan.</b> Yeh maanna ki process ID match hona chahiye (kabhi nahi hota). Timers sirf ek end par badalna. Sahi subnet lekin ek side galat mask type karna, jaise /30 ke saamne /29: dono addresses ek dusre ki range mein ho sakte hain, phir bhi masks alag hain aur broadcast link par Hellos reject hote hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> Seekho kaunsa mismatch kaunsa symptom deta hai. <b>MTU</b> mismatch hi woh common case hai jahan neighbour dikhta hai aur <b>EXSTART/EXCHANGE</b> mein atak jaata hai. Area, subnet, timers, authentication aur duplicate RID relationship ko pehle hi rok dete hain, isliye neighbour missing hota hai ya kabhi 2-Way tak nahi pahunchta.</p></div>

<div class="scn"><h4>Aadha authentication change</h4><p>Ek security project mein manufacturing company ke saare WAN links par OSPF MD5 authentication chahiye tha. Engineer ne ek link ki head office side configure ki, meeting mein chala gaya, aur branch side configure nahi ki. 40 second tak kuch nahi hua; phir branch gayab ho gayi. Head office router ne branch address se authentication mismatch ke baare mein <code>%OSPF-4-ERRRCV</code> message log kiya. Branch par same key ID aur key configure karne se neighbour wapas FULL ho gaya. Team ab authentication changes dono ends par ek hi scripted step mein lagati hai.</p><p><b>Seekh:</b> har Hello parameter do-taraf ka change hai. Plan karo, dono sides par saath lagao, aur verify karo.</p></div>

<div class="iv"><p class="q">"Do directly connected routers OSPF adjacency nahi bana rahe. Aap kya check karoge?"</p><p>Strong answer: pehle Layer 1 se 3 (interfaces up/up, link ke paar ping). Phir dono ends par <code>show ip ospf interface</code> se Hello parameters: area, subnet aur mask, Hello aur dead timers, authentication, aur interface passive hai ya nahi. Phir duplicates ke liye router IDs, protocol 89 block karne wale ACLs, aur agar neighbour EXSTART/EXCHANGE mein atka hai to MTU. Yeh bolo ki process ID match hona zaroori nahi; interviewers aksar yeh test karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hellos woh parameters le jaate hain jo match hone chahiye: area, subnet/mask, Hello aur dead timers, authentication, stub flag.</li>
<li>Router IDs unique hone chahiye; adjacency FULL tak pahunchne ke liye MTU match hona chahiye.</li>
<li>OSPF process ID, cost aur priority ka match hona zaroori nahi.</li>
<li>Defaults: Hello 10 s, dead 40 s; Hello badalne par dead apne aap 4x ho jaata hai.</li>
<li>Passive interfaces aur ACLs chupchaap neighbours rok dete hain.</li>
</ul></div>
`}};export{e as default};