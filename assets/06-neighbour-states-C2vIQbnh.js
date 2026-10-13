var e={id:`states`,h:{en:`Neighbour states: from Down to Full`,hi:`Neighbour states: Down se Full tak`},fig:`states`,body:{en:`
<p>Think of two new colleagues who must share project files. First one notices the other exists. Then both know each other's name. Then they agree who will lead the handover, swap the index pages of their folders, ask for the pages they are missing, and finally hold identical folders. OSPF neighbours go through the same steps, and each step has a name. When an adjacency breaks, the state it is stuck in tells you almost exactly what is wrong. The diagram at the end of this chapter shows the whole sequence.</p>

<h3>The states one by one</h3>
<dl class="terms">
<dt>Down</dt><dd>No valid Hello has been received from this neighbour within the dead interval. This is the starting point and the state after a failure.</dd>
<dt>Attempt</dt><dd>Used only on NBMA networks with manually configured neighbours. You will not see it on Ethernet.</dd>
<dt>Init</dt><dd>A Hello has arrived from the neighbour, but my own RID is not yet in its neighbour list. Communication is one-way so far.</dd>
<dt>2-Way</dt><dd>Each router sees its own RID in the other's Hello. Two-way communication is proven. On broadcast networks the <b>DR/BDR election</b> happens here, and two DROTHERs deliberately stop at this state.</dd>
<dt>ExStart</dt><dd>The two routers decide who is <b>master</b> (higher RID) and who is slave for the database exchange, and agree on the starting DBD sequence number.</dd>
<dt>Exchange</dt><dd>They send DBD packets listing the headers of every LSA they hold. The MTU in the DBD is checked here.</dd>
<dt>Loading</dt><dd>Each router sends LSRs for LSAs it lacks or has older copies of, and receives them in LSUs.</dd>
<dt>Full</dt><dd>The databases are identical. The adjacency is complete and SPF can use this link.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Where a stuck state points">
<rect x="10" y="20" width="145" height="60" rx="8" fill="#fed7aa"/><text x="82" y="45" text-anchor="middle" class="svg-ink" font-size="13">Missing / Init</text><text x="82" y="66" text-anchor="middle" class="svg-muted" font-size="11">Hello mismatch, ACL</text>
<rect x="165" y="20" width="145" height="60" rx="8" fill="#bbf7d0"/><text x="237" y="45" text-anchor="middle" class="svg-ink" font-size="13">2-Way</text><text x="237" y="66" text-anchor="middle" class="svg-muted" font-size="11">normal for DROTHERs</text>
<rect x="320" y="20" width="145" height="60" rx="8" fill="#fde68a"/><text x="392" y="45" text-anchor="middle" class="svg-ink" font-size="13">ExStart / Exchange</text><text x="392" y="66" text-anchor="middle" class="svg-muted" font-size="11">MTU mismatch</text>
<rect x="475" y="20" width="155" height="60" rx="8" fill="#bae6fd"/><text x="552" y="45" text-anchor="middle" class="svg-ink" font-size="13">Full then Down</text><text x="552" y="66" text-anchor="middle" class="svg-muted" font-size="11">timers, flapping link</text>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">The state where the adjacency stops is your first clue</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">show ip ospf neighbor shows it in the State column</text>
</svg><p class="cap">Map each stuck state to its usual cause before you touch any configuration.</p></div>

<h3>What a healthy table looks like</h3>
<p>In Lab 1, after enabling OSPF on the chain, R2 has one neighbour on each side. The links are Ethernet, so each /30 still elects a DR. With equal priorities the higher RID wins (if both ends start within the wait time), so R2 is DR towards R1, and R3 is DR towards R2:</p>
<pre class="out">R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">3.3.3.3           1   FULL/DR         00:00:36    10.0.23.2       GigabitEthernet0/1</span>
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:33    10.0.12.1       GigabitEthernet0/0</span></pre>
<p>Read each column: the neighbour's <b>RID</b>, its interface <b>priority</b>, the <b>state/role</b> of the neighbour (not of this router), the <b>dead time</b> counting down from 40 and resetting at each Hello, the neighbour's <b>interface address</b>, and <b>my</b> interface towards it. The syslog records each adjacency as it completes:</p>
<pre class="out">%OSPF-5-ADJCHG: Process 1, Nbr 3.3.3.3 on GigabitEthernet0/1 from LOADING to FULL, Loading Done</pre>

<div class="eg"><p><b>Worked example: why the first adjacency takes about 40 seconds.</b> When R2's Gi0/1 comes up, it enters a <b>waiting</b> period equal to the dead interval (40 s) before running the DR election, so that it does not grab the DR role before hearing existing routers. The adjacency to R3 therefore sits at 2-Way for up to 40 seconds, then ExStart, Exchange, Loading and Full follow within a second or two. The lab hint says the same thing: wait up to 40 seconds on Ethernet. On a point-to-point network type there is no election and no wait, so Full arrives in a few seconds.</p></div>

<h3>Reading stuck states</h3>
<table class="cmp"><tr><th>Stuck in</th><th>Most likely cause</th><th>Check</th></tr>
<tr><td>Not listed at all</td><td>Hello parameter mismatch, passive interface, ACL, wrong subnet</td><td><code>show ip ospf interface</code> on both ends</td></tr>
<tr><td>INIT</td><td>Hellos only arrive one way: an inbound filter on the other router, or a unidirectional link</td><td>ACLs, <code>show interfaces</code> errors</td></tr>
<tr><td>2WAY/DROTHER</td><td>Normal between two DROTHERs; a problem only if nobody on the segment is DR (all priority 0)</td><td>Neighbour table on the DR</td></tr>
<tr><td>EXSTART or EXCHANGE</td><td>MTU mismatch</td><td><code>show interfaces | include MTU</code> on both ends</td></tr>
<tr><td>FULL, then DOWN repeatedly</td><td>Timer mismatch after a change, or a flapping physical link</td><td>Timer line, interface counters, syslog</td></tr>
</table>

<div class="warn"><p><b>Common mistake.</b> Opening a ticket because a neighbour shows <code>2WAY/DROTHER</code>. On a shared Ethernet segment with four routers, each DROTHER is FULL only with the DR and BDR and deliberately stays at 2-Way with the other DROTHERs. That is correct design, not a fault.</p></div>

<div class="exam"><p><b>Exam traps.</b> The DR/BDR election happens in the <b>2-Way</b> state. Master/slave is decided in <b>ExStart</b>, by higher RID. LSDB synchronisation covers ExStart, Exchange and Loading. <b>Full</b> means synchronised, and it is the only state in which the link is used for SPF. An MTU mismatch shows as EXSTART/EXCHANGE.</p></div>

<div class="scn"><h4>The VPN link that never went Full</h4><p>A company replaced a leased line with a GRE tunnel over the internet between two offices. OSPF was enabled on the tunnel, but <code>show ip ospf neighbor</code> showed the far router cycling between <code>EXSTART</code> and <code>DOWN</code> every few minutes. The engineer compared <code>show interfaces Tunnel0 | include MTU</code> on both ends: one side had been set to IP MTU 1400, the other still used the default. The larger DBD packets were rejected by the side with the smaller MTU. Setting <code>ip mtu 1400</code> on both tunnel ends brought the adjacency to FULL immediately.</p><p><b>Lesson:</b> EXSTART or EXCHANGE means "compare the MTU". Fix the mismatch; use <code>ip ospf mtu-ignore</code> only when you cannot.</p></div>

<div class="iv"><p class="q">"Explain the OSPF neighbour states, and where would you look first if an adjacency is stuck?"</p><p>Strong answer: Down, Init (Hello received but my RID not in it), 2-Way (bidirectional, DR/BDR election on broadcast), ExStart (master/slave by higher RID), Exchange (DBDs), Loading (LSR/LSU), Full (databases identical). Then map stuck states to causes: missing or Init points to Hello parameters or filtering, 2-Way between DROTHERs is normal, ExStart/Exchange is almost always MTU, and repeated Full-to-Down is timers or a flapping link. That mapping is what separates a strong candidate.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States: Down, Init, 2-Way, ExStart, Exchange, Loading, Full (Attempt only on NBMA).</li>
<li>2-Way proves bidirectional Hellos; DR/BDR election happens here; DROTHER pairs stay at 2-Way on purpose.</li>
<li>ExStart picks master and slave by higher RID; Exchange swaps DBDs; Loading fetches missing LSAs.</li>
<li>Stuck in EXSTART/EXCHANGE means MTU mismatch.</li>
<li>On Ethernet the first adjacency can take about 40 seconds because of the DR wait timer.</li>
</ul></div>
`,hi:`
<p>Do naye colleagues socho jinhe project files share karni hain. Pehle ek ko pata chalta hai ki dusra hai. Phir dono ek dusre ka naam jaan lete hain. Phir tay karte hain ki handover kaun lead karega, apne folders ke index pages exchange karte hain, jo pages missing hain woh maangte hain, aur aakhir mein dono ke folders identical ho jaate hain. OSPF neighbours bhi yahi steps follow karte hain, aur har step ka ek naam hai. Jab adjacency tootti hai, jis state mein woh atki hai woh lagbhag exactly bata deti hai ki kya galat hai. Is chapter ke end mein diagram poora sequence dikhata hai.</p>

<h3>States ek ek karke</h3>
<dl class="terms">
<dt>Down</dt><dd>Dead interval ke andar is neighbour se koi valid Hello nahi mila. Yeh starting point hai aur failure ke baad ki state bhi.</dd>
<dt>Attempt</dt><dd>Sirf NBMA networks par manually configured neighbours ke saath use hoti hai. Ethernet par aap ise nahi dekhoge.</dd>
<dt>Init</dt><dd>Neighbour se Hello aaya hai, lekin uski neighbour list mein abhi mera RID nahi hai. Abhi tak communication one-way hai.</dd>
<dt>2-Way</dt><dd>Har router dusre ke Hello mein apna RID dekhta hai. Two-way communication prove ho gaya. Broadcast networks par <b>DR/BDR election</b> yahin hota hai, aur do DROTHERs jaan-boojh kar isi state par rukte hain.</dd>
<dt>ExStart</dt><dd>Dono routers tay karte hain ki database exchange mein <b>master</b> (bada RID) kaun hai aur slave kaun, aur starting DBD sequence number par agree karte hain.</dd>
<dt>Exchange</dt><dd>Woh DBD packets bhejte hain jinmein unke har LSA ke headers hote hain. DBD mein MTU yahin check hota hai.</dd>
<dt>Loading</dt><dd>Har router un LSAs ke liye LSR bhejta hai jo uske paas nahi hain ya purane hain, aur unhe LSUs mein receive karta hai.</dd>
<dt>Full</dt><dd>Databases identical hain. Adjacency complete hai aur SPF is link ko use kar sakta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Atki hui state kis taraf ishara karti hai">
<rect x="10" y="20" width="145" height="60" rx="8" fill="#fed7aa"/><text x="82" y="45" text-anchor="middle" class="svg-ink" font-size="13">Missing / Init</text><text x="82" y="66" text-anchor="middle" class="svg-muted" font-size="11">Hello mismatch, ACL</text>
<rect x="165" y="20" width="145" height="60" rx="8" fill="#bbf7d0"/><text x="237" y="45" text-anchor="middle" class="svg-ink" font-size="13">2-Way</text><text x="237" y="66" text-anchor="middle" class="svg-muted" font-size="11">DROTHERs ke liye normal</text>
<rect x="320" y="20" width="145" height="60" rx="8" fill="#fde68a"/><text x="392" y="45" text-anchor="middle" class="svg-ink" font-size="13">ExStart / Exchange</text><text x="392" y="66" text-anchor="middle" class="svg-muted" font-size="11">MTU mismatch</text>
<rect x="475" y="20" width="155" height="60" rx="8" fill="#bae6fd"/><text x="552" y="45" text-anchor="middle" class="svg-ink" font-size="13">Full phir Down</text><text x="552" y="66" text-anchor="middle" class="svg-muted" font-size="11">timers, flapping link</text>
<text x="320" y="120" text-anchor="middle" class="svg-ink" font-size="13">Adjacency jahan rukti hai, wahi aapka pehla clue hai</text>
<text x="320" y="145" text-anchor="middle" class="svg-muted" font-size="12">show ip ospf neighbor ise State column mein dikhata hai</text>
</svg><p class="cap">Koi bhi configuration chhoone se pehle har atki state ko uske usual cause se map karo.</p></div>

<h3>Healthy table kaisi dikhti hai</h3>
<p>Lab 1 mein chain par OSPF enable karne ke baad R2 ke har side ek neighbour hota hai. Links Ethernet hain, isliye har /30 par bhi DR elect hota hai. Barabar priorities par bada RID jeetta hai (agar dono ends wait time ke andar start hon), isliye R1 ki taraf R2 DR hai, aur R2 ki taraf R3 DR hai:</p>
<pre class="out">R2# show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">3.3.3.3           1   FULL/DR         00:00:36    10.0.23.2       GigabitEthernet0/1</span>
<span class="hl">1.1.1.1           1   FULL/BDR        00:00:33    10.0.12.1       GigabitEthernet0/0</span></pre>
<p>Har column padho: neighbour ka <b>RID</b>, uski interface <b>priority</b>, neighbour ki <b>state/role</b> (is router ki nahi), <b>dead time</b> jo 40 se ulta ginta hai aur har Hello par reset hota hai, neighbour ka <b>interface address</b>, aur uski taraf <b>mera</b> interface. Har adjacency complete hone par syslog use record karta hai:</p>
<pre class="out">%OSPF-5-ADJCHG: Process 1, Nbr 3.3.3.3 on GigabitEthernet0/1 from LOADING to FULL, Loading Done</pre>

<div class="eg"><p><b>Worked example: pehli adjacency lagbhag 40 second kyun leti hai.</b> Jab R2 ka Gi0/1 up hota hai, woh DR election chalane se pehle dead interval (40 s) jitne <b>waiting</b> period mein jaata hai, taaki existing routers ko sune bina DR role na le le. Isliye R3 ke saath adjacency 40 second tak 2-Way par baithi reh sakti hai, phir ExStart, Exchange, Loading aur Full ek-do second mein ho jaate hain. Lab hint bhi yahi kehta hai: Ethernet par 40 second tak wait karo. Point-to-point network type par koi election aur koi wait nahi hota, isliye Full kuch second mein aa jaata hai.</p></div>

<h3>Atki hui states padhna</h3>
<table class="cmp"><tr><th>Kahan atka</th><th>Sabse likely cause</th><th>Check</th></tr>
<tr><td>List mein hi nahi</td><td>Hello parameter mismatch, passive interface, ACL, galat subnet</td><td>Dono ends par <code>show ip ospf interface</code></td></tr>
<tr><td>INIT</td><td>Hellos sirf ek taraf se aa rahe hain: dusre router par inbound filter, ya unidirectional link</td><td>ACLs, <code>show interfaces</code> errors</td></tr>
<tr><td>2WAY/DROTHER</td><td>Do DROTHERs ke beech normal; problem sirf tab jab segment par koi DR hi na ho (sab priority 0)</td><td>DR par neighbour table</td></tr>
<tr><td>EXSTART ya EXCHANGE</td><td>MTU mismatch</td><td>Dono ends par <code>show interfaces | include MTU</code></td></tr>
<tr><td>FULL, phir baar baar DOWN</td><td>Change ke baad timer mismatch, ya flapping physical link</td><td>Timer line, interface counters, syslog</td></tr>
</table>

<div class="warn"><p><b>Common galti.</b> Neighbour <code>2WAY/DROTHER</code> dikhane par ticket khol dena. Chaar routers wale shared Ethernet segment par har DROTHER sirf DR aur BDR ke saath FULL hota hai aur baaki DROTHERs ke saath jaan-boojh kar 2-Way par rehta hai. Yeh sahi design hai, fault nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> DR/BDR election <b>2-Way</b> state mein hota hai. Master/slave <b>ExStart</b> mein bade RID se decide hota hai. LSDB synchronisation ExStart, Exchange aur Loading ko cover karta hai. <b>Full</b> ka matlab synchronised, aur yahi akeli state hai jismein link SPF ke liye use hota hai. MTU mismatch EXSTART/EXCHANGE ke roop mein dikhta hai.</p></div>

<div class="scn"><h4>VPN link jo kabhi Full nahi hua</h4><p>Ek company ne do offices ke beech leased line ko internet ke upar GRE tunnel se replace kiya. Tunnel par OSPF enable kiya gaya, lekin <code>show ip ospf neighbor</code> mein door wala router har kuch minute mein <code>EXSTART</code> aur <code>DOWN</code> ke beech ghoom raha tha. Engineer ne dono ends par <code>show interfaces Tunnel0 | include MTU</code> compare kiya: ek side IP MTU 1400 par set thi, dusri abhi bhi default use kar rahi thi. Chhote MTU wali side bade DBD packets reject kar rahi thi. Dono tunnel ends par <code>ip mtu 1400</code> set karte hi adjacency turant FULL ho gayi.</p><p><b>Seekh:</b> EXSTART ya EXCHANGE ka matlab hai "MTU compare karo". Mismatch theek karo; <code>ip ospf mtu-ignore</code> tabhi use karo jab theek na kar sako.</p></div>

<div class="iv"><p class="q">"OSPF neighbour states samjhao, aur adjacency atki ho to pehle kahan dekhoge?"</p><p>Strong answer: Down, Init (Hello mila lekin usmein mera RID nahi), 2-Way (bidirectional, broadcast par DR/BDR election), ExStart (bade RID se master/slave), Exchange (DBDs), Loading (LSR/LSU), Full (databases identical). Phir atki states ko causes se map karo: missing ya Init matlab Hello parameters ya filtering, DROTHERs ke beech 2-Way normal hai, ExStart/Exchange lagbhag hamesha MTU hai, aur baar baar Full se Down matlab timers ya flapping link. Yahi mapping strong candidate ko alag karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>States: Down, Init, 2-Way, ExStart, Exchange, Loading, Full (Attempt sirf NBMA par).</li>
<li>2-Way bidirectional Hellos prove karta hai; DR/BDR election yahin hota hai; DROTHER pairs jaan-boojh kar 2-Way par rehte hain.</li>
<li>ExStart bade RID se master aur slave chunta hai; Exchange DBDs swap karta hai; Loading missing LSAs laata hai.</li>
<li>EXSTART/EXCHANGE mein atakna matlab MTU mismatch.</li>
<li>Ethernet par DR wait timer ki wajah se pehli adjacency lagbhag 40 second le sakti hai.</li>
</ul></div>
`}};export{e as default};