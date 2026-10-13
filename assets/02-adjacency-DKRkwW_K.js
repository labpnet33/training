var e={id:`adjacency`,h:{en:`Packets and the adjacency process in depth`,hi:`Packets aur adjacency process gehraai se`},body:{en:`
<p>Think of two bank branches merging their customer ledgers. First the managers shake hands and check they belong to the same bank (Hello). Then they agree who leads the meeting (master and slave). They swap only the <b>index pages</b> of their ledgers (DBD). Each manager writes down the entries he is missing and asks for them (LSR). The other sends the full pages (LSU) and gets a signed receipt (LSAck). Only when both ledgers are identical are they "fully" merged. OSPF adjacency is exactly this process.</p>

<h3>The five packet types, what each carries</h3>
<p>All OSPFv2 packets ride directly on IP as <b>protocol 89</b>, usually to multicast <code>224.0.0.5</code> (all OSPF routers) or <code>224.0.0.6</code> (DR and BDR only), with TTL 1.</p>
<table class="cmp"><tr><th>Type</th><th>Name</th><th>Job</th></tr>
<tr><td>1</td><td>Hello</td><td>Discover neighbours, check parameters, elect DR/BDR, keepalive</td></tr>
<tr><td>2</td><td>Database Description (DBD)</td><td>Carry LSA <b>headers</b> only: a table of contents of the LSDB</td></tr>
<tr><td>3</td><td>Link State Request (LSR)</td><td>Ask for specific LSAs that are missing or older</td></tr>
<tr><td>4</td><td>Link State Update (LSU)</td><td>Carry one or more full LSAs</td></tr>
<tr><td>5</td><td>Link State Acknowledgment (LSAck)</td><td>Confirm each LSA received; OSPF flooding is reliable</td></tr></table>

<h3>What must match in the Hello</h3>
<p>A Hello lists the router ID, area ID, network mask, Hello and Dead intervals, options (including the stub flag), router priority, DR and BDR addresses, and the router IDs of every neighbour heard on the link. Two routers become neighbours only if these match: <b>area ID</b>, <b>Hello and Dead intervals</b>, <b>subnet and mask</b> (not checked on point-to-point links), <b>authentication</b> type and key, and the <b>stub area flags</b>. Router IDs must be unique. Seeing your own RID listed in the neighbour's Hello moves you to <b>2-Way</b>.</p>
<p>MTU is <b>not</b> in the Hello. That is why an MTU mismatch does not stop the neighbour appearing; it breaks the next step.</p>

<h3>ExStart: electing master and slave</h3>
<p>Once the pair decides to become adjacent (always on point-to-point, or when one of them is DR or BDR on a broadcast link), both move to <b>ExStart</b> and send an empty DBD with three flags set: <b>I</b> (initial), <b>M</b> (more), <b>MS</b> (I am master), plus a random DD sequence number. Each compares router IDs. The router with the <b>higher router ID becomes master</b>. The slave drops its MS flag and adopts the master's sequence number. Master/slave has nothing to do with the DR; it only controls who drives the DBD exchange.</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="DBD exchange sequence">
<rect x="40" y="10" width="140" height="36" rx="8" fill="#bae6fd"/><text x="110" y="33" text-anchor="middle" class="svg-ink" font-size="13">R1 RID 1.1.1.1</text>
<rect x="460" y="10" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="530" y="33" text-anchor="middle" class="svg-ink" font-size="13">ABR1 RID 2.2.2.2</text>
<line x1="110" y1="46" x2="110" y2="320" stroke="#64748b"/><line x1="530" y1="46" x2="530" y2="320" stroke="#64748b"/>
<line x1="110" y1="70" x2="530" y2="80" stroke="#64748b"/><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">DBD I,M,MS seq 5120 (ExStart)</text>
<line x1="530" y1="100" x2="110" y2="110" stroke="#64748b"/><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">DBD I,M,MS seq 9001: higher RID wins</text>
<line x1="110" y1="135" x2="530" y2="145" stroke="#64748b"/><text x="320" y="133" text-anchor="middle" class="svg-accent" font-size="12">DBD M seq 9001 + headers (slave)</text>
<line x1="530" y1="165" x2="110" y2="175" stroke="#64748b"/><text x="320" y="163" text-anchor="middle" class="svg-accent" font-size="12">DBD MS seq 9002 + headers (master)</text>
<line x1="110" y1="200" x2="530" y2="210" stroke="#64748b"/><text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="12">LSR: send me LSA X, Y (Loading)</text>
<line x1="530" y1="230" x2="110" y2="240" stroke="#64748b"/><text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">LSU: full LSAs X, Y</text>
<line x1="110" y1="265" x2="530" y2="275" stroke="#64748b"/><text x="320" y="263" text-anchor="middle" class="svg-muted" font-size="12">LSAck</text>
<text x="320" y="310" text-anchor="middle" class="svg-ink" font-size="13">Both LSDBs identical: FULL</text>
</svg><p class="cap">ExStart picks the master (higher RID), Exchange swaps headers, Loading fetches the missing LSAs.</p></div>

<h3>Exchange, Loading, Full</h3>
<p>In <b>Exchange</b> the master sends DBDs full of LSA headers; the slave answers each one with a DBD that uses the same sequence number (that echo is the acknowledgment) and carries its own headers. The master increments the sequence each round. When a router sees a header for an LSA it does not have, or has an older copy (lower sequence number), it adds it to its request list. In <b>Loading</b> it sends LSRs, receives LSUs, and acknowledges them with LSAcks. When the request list is empty on both sides, the state is <b>Full</b>.</p>

<h3>The MTU check</h3>
<p>Each DBD carries the sender's <b>interface MTU</b>. If the MTU in the neighbour's DBD is <b>larger</b> than the receiving router's own interface MTU, the receiving router rejects that DBD, because it could not accept LSUs of that size without fragmentation. The exchange never completes. The neighbour sits in <b>ExStart or Exchange</b>, retransmits, and eventually drops with "Too many retransmissions", then starts again.</p>

<pre class="out">ABR1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1           1   EXSTART/BDR     00:00:36    10.10.12.1      GigabitEthernet0/0</span>

%OSPF-5-ADJCHG: Process 1, Nbr 1.1.1.1 on GigabitEthernet0/0 from EXSTART to DOWN, Neighbor Down: Too many retransmissions</pre>

<p>The correct fix is to make the IP MTU equal on both ends (<code>ip mtu 1500</code> or <code>mtu</code> on the interface). The workaround <code>ip ospf mtu-ignore</code> hides the check, but large LSUs may still be dropped later.</p>

<pre class="code"><span class="c">! Fix the real problem: equal MTU on both ends</span>
interface GigabitEthernet0/0
 ip mtu 1500
<span class="c">! Workaround only, when you cannot change the MTU</span>
 ip ospf mtu-ignore</pre>

<div class="eg"><p><b>Worked example.</b> R1 Gi0/0 has IP MTU 1500, ABR1 Gi0/0 has IP MTU 1400 (someone copied a tunnel template). R1 sends DBDs saying MTU 1500. ABR1 compares 1500 with its own 1400: larger, so it rejects them. ABR1's DBDs say 1400, which R1 accepts. Result: R1 is stuck in Exchange or ExStart, ABR1 stays in ExStart. <code>debug ip ospf adj</code> on ABR1 shows "Nbr 1.1.1.1 has larger interface MTU". Master/slave is 2.2.2.2 master, 1.1.1.1 slave, but that is irrelevant to the failure.</p></div>

<h3>Stuck states and what they tell you</h3>
<table class="cmp"><tr><th>Stuck in</th><th>Most likely cause</th></tr>
<tr><td>Down / no neighbour</td><td>Area, timers, subnet, auth or stub flag mismatch; ACL blocking protocol 89; passive interface</td></tr>
<tr><td>Init</td><td>Hellos only in one direction (ACL, unicast/multicast issue)</td></tr>
<tr><td>2-Way</td><td>Normal between two DROTHERs; a problem only if both have priority 0</td></tr>
<tr><td>ExStart / Exchange</td><td>MTU mismatch, duplicate RID</td></tr>
<tr><td>Loading</td><td>Corrupted or oversized LSAs, unicast LSU loss</td></tr></table>

<div class="warn"><p><b>Common mistake.</b> Using <code>ip ospf mtu-ignore</code> on every link "to be safe". It hides a real mismatch, and when the LSDB grows and LSUs get large, packets are dropped silently and the adjacency flaps in production.</p></div>

<div class="exam"><p><b>Exam trap.</b> The <b>higher</b> router ID becomes master in ExStart; the DR is chosen by priority first. And MTU is carried in the DBD, not the Hello, so an MTU mismatch never prevents the 2-Way state.</p></div>

<div class="scn"><h4>The new WAN circuit that stayed in EXSTART</h4><p>A branch moved to a provider circuit delivered through a sub-interface with IP MTU 1492 (PPPoE style). The head-end router kept 1500. <code>show ip ospf neighbor</code> flipped between EXSTART and DOWN every two minutes. Pings worked, so the team first blamed the provider. The engineer checked <code>show ip interface Gi0/1 | include MTU</code> on both sides, saw 1500 versus 1492, and set <code>ip mtu 1492</code> on the head-end sub-interface. The adjacency went FULL in seconds.</p><p><b>Lesson:</b> Hellos succeed and pings succeed, but DBD compares MTU. EXSTART or EXCHANGE means check MTU first.</p></div>

<div class="iv"><p class="q">"Walk me through what happens between 2-Way and Full."</p><p>Strong answer: ExStart elects master and slave by higher RID using empty DBDs with I, M and MS bits; Exchange swaps LSA headers with the slave echoing the master's sequence numbers; each router lists what it lacks; Loading uses LSR, LSU and LSAck to fetch those LSAs; Full means identical LSDBs. Mention the MTU check in the DBD and that a router stuck in ExStart/Exchange usually has an MTU mismatch or duplicate RID.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five packets: Hello, DBD, LSR, LSU, LSAck, all IP protocol 89.</li>
<li>Hello must match area, timers, subnet, auth and stub flags; RIDs must be unique.</li>
<li>Higher RID becomes master in ExStart; the slave echoes the master's sequence number.</li>
<li>MTU is checked in the DBD; a mismatch leaves the neighbour stuck in ExStart/Exchange.</li>
<li>Fix MTU properly; <code>ip ospf mtu-ignore</code> is a workaround, not a design.</li>
</ul></div>
`,hi:`
<p>Socho do bank branches apne customer ledgers merge kar rahi hain. Pehle managers haath milate hain aur check karte hain ki dono same bank ke hain (Hello). Phir tay karte hain ki meeting kaun lead karega (master aur slave). Woh apne ledgers ke sirf <b>index pages</b> exchange karte hain (DBD). Har manager jo entries uske paas nahi hain unhe likh leta hai aur maangta hai (LSR). Doosra poore pages bhejta hai (LSU) aur signed receipt leta hai (LSAck). Jab dono ledgers bilkul same ho jaate hain tabhi woh "fully" merge hote hain. OSPF adjacency bilkul yahi process hai.</p>

<h3>Paanch packet types, har ek kya le jaata hai</h3>
<p>Saare OSPFv2 packets seedhe IP par <b>protocol 89</b> ke roop mein chalte hain, aam taur par multicast <code>224.0.0.5</code> (saare OSPF routers) ya <code>224.0.0.6</code> (sirf DR aur BDR) par, TTL 1 ke saath.</p>
<table class="cmp"><tr><th>Type</th><th>Naam</th><th>Kaam</th></tr>
<tr><td>1</td><td>Hello</td><td>Neighbours dhoondhna, parameters check karna, DR/BDR elect karna, keepalive</td></tr>
<tr><td>2</td><td>Database Description (DBD)</td><td>Sirf LSA <b>headers</b> le jaana: LSDB ki table of contents</td></tr>
<tr><td>3</td><td>Link State Request (LSR)</td><td>Missing ya purane specific LSAs maangna</td></tr>
<tr><td>4</td><td>Link State Update (LSU)</td><td>Ek ya zyada poore LSAs le jaana</td></tr>
<tr><td>5</td><td>Link State Acknowledgment (LSAck)</td><td>Har mila LSA confirm karna; OSPF flooding reliable hai</td></tr></table>

<h3>Hello mein kya match hona chahiye</h3>
<p>Hello mein router ID, area ID, network mask, Hello aur Dead intervals, options (stub flag samet), router priority, DR aur BDR addresses, aur link par sune gaye har neighbour ke router IDs hote hain. Do routers tabhi neighbours bante hain jab yeh match karein: <b>area ID</b>, <b>Hello aur Dead intervals</b>, <b>subnet aur mask</b> (point-to-point links par check nahi hota), <b>authentication</b> type aur key, aur <b>stub area flags</b>. Router IDs unique hone chahiye. Neighbour ke Hello mein apna RID dikhna aapko <b>2-Way</b> mein le jaata hai.</p>
<p>MTU Hello mein <b>nahi</b> hota. Isiliye MTU mismatch neighbour dikhne se nahi rokta; woh agla step todta hai.</p>

<h3>ExStart: master aur slave chunna</h3>
<p>Jab pair adjacent banne ka faisla karta hai (point-to-point par hamesha, ya broadcast link par jab dono mein se ek DR ya BDR ho), dono <b>ExStart</b> mein jaate hain aur teen flags ke saath ek khaali DBD bhejte hain: <b>I</b> (initial), <b>M</b> (more), <b>MS</b> (main master hoon), plus ek random DD sequence number. Dono router IDs compare karte hain. <b>Bada router ID wala master banta hai</b>. Slave apna MS flag hata deta hai aur master ka sequence number apna leta hai. Master/slave ka DR se koi lena dena nahi; yeh sirf tay karta hai ki DBD exchange kaun chalayega.</p>

<div class="dia"><svg viewBox="0 0 640 330" role="img" aria-label="DBD exchange sequence">
<rect x="40" y="10" width="140" height="36" rx="8" fill="#bae6fd"/><text x="110" y="33" text-anchor="middle" class="svg-ink" font-size="13">R1 RID 1.1.1.1</text>
<rect x="460" y="10" width="140" height="36" rx="8" fill="#ddd6fe"/><text x="530" y="33" text-anchor="middle" class="svg-ink" font-size="13">ABR1 RID 2.2.2.2</text>
<line x1="110" y1="46" x2="110" y2="320" stroke="#64748b"/><line x1="530" y1="46" x2="530" y2="320" stroke="#64748b"/>
<line x1="110" y1="70" x2="530" y2="80" stroke="#64748b"/><text x="320" y="68" text-anchor="middle" class="svg-muted" font-size="12">DBD I,M,MS seq 5120 (ExStart)</text>
<line x1="530" y1="100" x2="110" y2="110" stroke="#64748b"/><text x="320" y="98" text-anchor="middle" class="svg-muted" font-size="12">DBD I,M,MS seq 9001: bada RID jeeta</text>
<line x1="110" y1="135" x2="530" y2="145" stroke="#64748b"/><text x="320" y="133" text-anchor="middle" class="svg-accent" font-size="12">DBD M seq 9001 + headers (slave)</text>
<line x1="530" y1="165" x2="110" y2="175" stroke="#64748b"/><text x="320" y="163" text-anchor="middle" class="svg-accent" font-size="12">DBD MS seq 9002 + headers (master)</text>
<line x1="110" y1="200" x2="530" y2="210" stroke="#64748b"/><text x="320" y="198" text-anchor="middle" class="svg-muted" font-size="12">LSR: mujhe LSA X, Y bhejo (Loading)</text>
<line x1="530" y1="230" x2="110" y2="240" stroke="#64748b"/><text x="320" y="228" text-anchor="middle" class="svg-muted" font-size="12">LSU: poore LSAs X, Y</text>
<line x1="110" y1="265" x2="530" y2="275" stroke="#64748b"/><text x="320" y="263" text-anchor="middle" class="svg-muted" font-size="12">LSAck</text>
<text x="320" y="310" text-anchor="middle" class="svg-ink" font-size="13">Dono LSDBs same: FULL</text>
</svg><p class="cap">ExStart master chunta hai (bada RID), Exchange headers swap karta hai, Loading missing LSAs laata hai.</p></div>

<h3>Exchange, Loading, Full</h3>
<p><b>Exchange</b> mein master LSA headers se bhare DBDs bhejta hai; slave har ek ka jawab usi sequence number wale DBD se deta hai (yahi echo acknowledgment hai) aur usmein apne headers daalta hai. Master har round mein sequence badhata hai. Jab router ko kisi aise LSA ka header dikhta hai jo uske paas nahi hai, ya purani copy hai (kam sequence number), woh use apni request list mein daal deta hai. <b>Loading</b> mein woh LSRs bhejta hai, LSUs leta hai, aur unhe LSAcks se acknowledge karta hai. Jab dono taraf request list khaali ho jaati hai, state <b>Full</b> hoti hai.</p>

<h3>MTU check</h3>
<p>Har DBD mein sender ka <b>interface MTU</b> hota hai. Agar neighbour ke DBD ka MTU receiving router ke apne interface MTU se <b>bada</b> hai, to receiving router woh DBD reject kar deta hai, kyunki woh utne size ke LSUs bina fragmentation ke accept nahi kar sakta. Exchange kabhi poora nahi hota. Neighbour <b>ExStart ya Exchange</b> mein baitha rehta hai, retransmit karta hai, aur aakhir mein "Too many retransmissions" ke saath drop hota hai, phir se shuru karta hai.</p>

<pre class="out">ABR1# show ip ospf neighbor
Neighbor ID     Pri   State           Dead Time   Address         Interface
<span class="hl">1.1.1.1           1   EXSTART/BDR     00:00:36    10.10.12.1      GigabitEthernet0/0</span>

%OSPF-5-ADJCHG: Process 1, Nbr 1.1.1.1 on GigabitEthernet0/0 from EXSTART to DOWN, Neighbor Down: Too many retransmissions</pre>

<p>Sahi fix hai dono ends par IP MTU barabar karna (interface par <code>ip mtu 1500</code> ya <code>mtu</code>). Workaround <code>ip ospf mtu-ignore</code> check ko chhupa deta hai, par bade LSUs baad mein phir bhi drop ho sakte hain.</p>

<pre class="code"><span class="c">! Asli problem fix karo: dono ends par barabar MTU</span>
interface GigabitEthernet0/0
 ip mtu 1500
<span class="c">! Sirf workaround, jab MTU badal nahi sakte</span>
 ip ospf mtu-ignore</pre>

<div class="eg"><p><b>Worked example.</b> R1 Gi0/0 ka IP MTU 1500 hai, ABR1 Gi0/0 ka IP MTU 1400 (kisi ne tunnel template copy kar diya). R1 DBDs bhejta hai jinmein MTU 1500 likha hai. ABR1 1500 ko apne 1400 se compare karta hai: bada hai, isliye reject. ABR1 ke DBDs mein 1400 hai, jo R1 accept kar leta hai. Result: R1 Exchange ya ExStart mein atka, ABR1 ExStart mein. ABR1 par <code>debug ip ospf adj</code> dikhata hai "Nbr 1.1.1.1 has larger interface MTU". Master/slave mein 2.2.2.2 master aur 1.1.1.1 slave hai, par failure se iska koi lena dena nahi.</p></div>

<h3>Atke hue states aur woh kya batate hain</h3>
<table class="cmp"><tr><th>Kahan atka</th><th>Sabse sambhavit wajah</th></tr>
<tr><td>Down / koi neighbour nahi</td><td>Area, timers, subnet, auth ya stub flag mismatch; ACL protocol 89 block kar raha; passive interface</td></tr>
<tr><td>Init</td><td>Hellos sirf ek direction mein (ACL, unicast/multicast issue)</td></tr>
<tr><td>2-Way</td><td>Do DROTHERs ke beech normal; problem sirf tab jab dono ki priority 0 ho</td></tr>
<tr><td>ExStart / Exchange</td><td>MTU mismatch, duplicate RID</td></tr>
<tr><td>Loading</td><td>Corrupt ya oversized LSAs, unicast LSU loss</td></tr></table>

<div class="warn"><p><b>Common galti.</b> Har link par "safe rehne ke liye" <code>ip ospf mtu-ignore</code> laga dena. Yeh asli mismatch chhupa deta hai, aur jab LSDB badhta hai aur LSUs bade hote hain, packets chupchaap drop hote hain aur production mein adjacency flap karti hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> ExStart mein <b>bada</b> router ID master banta hai; DR pehle priority se chuna jaata hai. Aur MTU DBD mein hota hai, Hello mein nahi, isliye MTU mismatch kabhi 2-Way state ko nahi rokta.</p></div>

<div class="scn"><h4>Naya WAN circuit jo EXSTART mein hi raha</h4><p>Ek branch ek provider circuit par shift hui jo sub-interface ke through IP MTU 1492 (PPPoE style) ke saath aata tha. Head-end router 1500 par tha. <code>show ip ospf neighbor</code> har do minute mein EXSTART aur DOWN ke beech palatta raha. Ping chal raha tha, isliye team ne pehle provider ko blame kiya. Engineer ne dono sides par <code>show ip interface Gi0/1 | include MTU</code> check kiya, 1500 vs 1492 dekha, aur head-end sub-interface par <code>ip mtu 1492</code> set kiya. Adjacency seconds mein FULL ho gayi.</p><p><b>Seekh:</b> Hellos aur pings dono chalte hain, par DBD MTU compare karta hai. EXSTART ya EXCHANGE ka matlab hai pehle MTU check karo.</p></div>

<div class="iv"><p class="q">"2-Way aur Full ke beech kya hota hai, samjhao."</p><p>Strong answer: ExStart I, M aur MS bits wale khaali DBDs se bade RID ke basis par master aur slave chunta hai; Exchange mein LSA headers swap hote hain aur slave master ke sequence numbers echo karta hai; har router list banata hai ki uske paas kya nahi hai; Loading LSR, LSU aur LSAck se woh LSAs laata hai; Full ka matlab identical LSDBs. DBD mein MTU check ka zikr karo aur batao ki ExStart/Exchange mein atke router mein aam taur par MTU mismatch ya duplicate RID hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch packets: Hello, DBD, LSR, LSU, LSAck, sab IP protocol 89.</li>
<li>Hello mein area, timers, subnet, auth aur stub flags match hone chahiye; RIDs unique hone chahiye.</li>
<li>ExStart mein bada RID master banta hai; slave master ka sequence number echo karta hai.</li>
<li>MTU DBD mein check hota hai; mismatch se neighbour ExStart/Exchange mein atak jaata hai.</li>
<li>MTU sahi tarike se fix karo; <code>ip ospf mtu-ignore</code> workaround hai, design nahi.</li>
</ul></div>
`}};export{e as default};