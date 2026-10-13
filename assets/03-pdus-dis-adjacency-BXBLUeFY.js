var e={id:`pdus-dis-adjacency`,h:{en:`PDUs, the DIS and how adjacencies form`,hi:`PDUs, DIS aur adjacencies kaise banti hain`},body:{en:`
<p>IS-IS talks with a small set of messages called PDUs. If you know what each one does, a missing neighbour or a stale database becomes much easier to explain. This chapter is mostly theory, backed by what the lab devices show on their interfaces.</p>

<h3>The four PDU families</h3>
<table class="cmp"><tr><th>PDU</th><th>Purpose</th><th>Sent when</th></tr>
<tr><td>IIH (IS-IS Hello)</td><td>Discover neighbours, carry area, system ID, level, hold time, DIS priority</td><td>Every few seconds on each interface</td></tr>
<tr><td>LSP (link-state PDU)</td><td>Carry neighbours and prefixes; a database record</td><td>On change, and when refreshed before the lifetime ends</td></tr>
<tr><td>CSNP (complete sequence number PDU)</td><td>A summary of the whole database, for sync</td><td>Periodically by the DIS on LANs; once on a new p2p link</td></tr>
<tr><td>PSNP (partial sequence number PDU)</td><td>Acknowledge LSPs or request missing ones</td><td>On demand</td></tr></table>
<p>Hellos are separate for each level. A Level 1/Level 2 router sends L1 hellos with its area and L2 hellos on the same link. Adjacency problems therefore always belong to a specific level. The hold time travels in the hello, which is why the Hold column in <code>show isis adjacency</code> counts down and resets: when it hits zero the neighbour is declared down. In the lab logs this shows as <code>reason: Hold Time Expired</code>.</p>

<h3>Point-to-point and broadcast links</h3>
<p>On a broadcast network (Ethernet default) all routers on the segment share a link, and one of them is elected the <b>DIS</b> (designated intermediate system). The DIS creates a <b>pseudonode</b>, a fake router that represents the LAN, and floods a pseudonode LSP such as <code>R2.01-00</code> that lists every attached router. It also sends the periodic CSNP that keeps the segment in sync. The DIS is chosen by the highest priority (default 64), with the highest MAC address breaking ties, and unlike an OSPF DR it <b>pre-empts</b>: a better router that appears takes over. There is also no backup DIS.</p>
<p>On a point-to-point link there is no DIS and no pseudonode. The routers exchange hellos, confirm each other in a three-way handshake, send one CSNP, and then acknowledge with PSNPs. Configure it with <code>point-to-point</code> under the interface. It converges faster and keeps the database smaller, which is why most core links, including every lab link here, use it.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Broadcast LAN with pseudonode versus point to point">
<text x="150" y="22" text-anchor="middle" class="svg-ink" font-size="13">Broadcast LAN</text>
<ellipse cx="150" cy="110" rx="62" ry="28" fill="#ddd6fe" stroke="#64748b"/><text x="150" y="107" text-anchor="middle" class="svg-ink" font-size="12">pseudonode</text><text x="150" y="122" text-anchor="middle" class="svg-muted" font-size="11">R2.01-00</text>
<circle cx="60" cy="190" r="20" fill="#bbf7d0" stroke="#64748b"/><text x="60" y="194" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<circle cx="150" cy="190" r="20" fill="#fde68a" stroke="#64748b"/><text x="150" y="194" text-anchor="middle" class="svg-ink" font-size="12">R2</text><text x="150" y="222" text-anchor="middle" class="svg-muted" font-size="11">DIS</text>
<circle cx="240" cy="190" r="20" fill="#bbf7d0" stroke="#64748b"/><text x="240" y="194" text-anchor="middle" class="svg-ink" font-size="12">R3</text>
<line x1="70" y1="172" x2="115" y2="128" stroke="#64748b" stroke-width="2"/><line x1="150" y1="170" x2="150" y2="138" stroke="#64748b" stroke-width="2"/><line x1="230" y1="172" x2="188" y2="128" stroke="#64748b" stroke-width="2"/>
<text x="470" y="22" text-anchor="middle" class="svg-ink" font-size="13">Point to point</text>
<circle cx="390" cy="120" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="390" y="124" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<circle cx="550" cy="120" r="22" fill="#fde68a" stroke="#64748b"/><text x="550" y="124" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<line x1="412" y1="120" x2="528" y2="120" stroke="#64748b" stroke-width="2"/><text x="470" y="108" text-anchor="middle" class="svg-muted" font-size="11">no DIS</text>
</svg><p class="cap">A LAN needs a pseudonode and a DIS; a point-to-point link does not.</p></div>

<h3>How the database stays in sync</h3>
<p>Each LSP has an ID (system ID, pseudonode number, fragment number, so <code>R1.00-00</code>), a <b>sequence number</b>, a <b>checksum</b> and a <b>lifetime</b>. A higher sequence number is newer. Routers refresh their own LSPs before the lifetime (the overview shows LSP life time: 1200 seconds) runs out. A router that receives an LSP floods it to all other interfaces on that level, and a PSNP or CSNP tells the sender what the receiver already holds. You can read these values in the database:</p>
<pre class="out">lab@R1&gt; show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         <span class="hl">0x1</span>   0x3bc9     1140 L1
R2.00-00                         0x1   0xff60     1140 L1 L2 Attached
R3.00-00                         0x1   0x2f8c     1140 L1 L2 Attached
  3 LSPs</pre>
<p>After the leaking policy was committed on R2 and R3 in the lab, their sequence numbers went to <code>0x2</code> because they re-originated their LSPs with new prefix TLVs. A rising sequence number means the router changed something. A sequence number climbing every few seconds means a flap somewhere.</p>

<h3>Checking adjacency health</h3>
<p>Besides the Hold column, <code>show isis interface</code> tells you the circuit type and metric:</p>
<pre class="out">lab@R1&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            2   0x1 Disabled          Point to Point    10/10
ge-0/0/1.0            2   0x2 Disabled          Point to Point    10/30
lo0.0                 0   0x7 Disabled          Passive           0/0</pre>
<p>That output is from R1 in the Jaipur lab, a Level 2-only router. The Level 1 DR column says Disabled and the Level 2 column says Point to Point, so neither side elects a DIS.</p>

<div class="eg"><p><b>Worked example.</b> Three routers share a campus LAN: R1 priority 64, R2 priority 100, R3 priority 64. R2 becomes DIS at Level 1 and Level 2 separately because DIS election is per level. If you bring up R4 with priority 120, it takes over at once. For an uplink to the core you would instead set <code>point-to-point</code> and avoid the whole question.</p></div>

<div class="warn"><p><b>Common mistake.</b> Setting <code>point-to-point</code> on only one end of a link. One side sends p2p hellos and the other sends LAN hellos, and the adjacency does not come up cleanly. Match both ends.</p></div>
<div class="exam"><p><b>Exam trap.</b> The IS-IS DIS pre-empts and has no backup, the opposite of an OSPF DR. The DIS also floods CSNPs every few seconds, whereas on a p2p link a CSNP is sent once.</p></div>

<div class="scn"><h4>The flapping LAN adjacency</h4><p>On a data-centre LAN a lab switch with a lower MAC and the same priority kept winning and losing the DIS role whenever a neighbour rebooted. Every change meant a new pseudonode LSP and a full SPF everywhere. The team set <code>point-to-point</code> on the router-to-router links and a fixed higher priority on the intended DIS, and the churn stopped.</p><p><b>Lesson:</b> use point-to-point wherever only two routers share a link.</p></div>

<div class="iv"><p class="q">"What is a pseudonode and why does IS-IS need it?"</p><p>A pseudonode is a virtual node created by the DIS to represent a broadcast LAN. Instead of every router listing every other router on the LAN, each lists only the pseudonode, which keeps LSPs small and the topology graph simple.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PDUs: IIH hellos, LSP records, CSNP summaries, PSNP acks and requests.</li>
<li>Hellos are per level; the hold time inside them drives Hold Time Expired.</li>
<li>Broadcast links elect a pre-empting DIS with a pseudonode; p2p links do not.</li>
<li>Sequence number, checksum and lifetime decide which LSP is newest.</li>
<li>Match point-to-point on both ends.</li>
</ul></div>
`,hi:`
<p>IS-IS chhote se messages ke set se baat karta hai jinhe PDUs kehte hain. Agar aap jaante ho ki har ek kya karta hai, to missing neighbour ya stale database samjhana bahut aasan ho jata hai. Yeh chapter zyadatar theory hai, jise lab devices ke interfaces par dikhne wale output se support kiya gaya hai.</p>

<h3>Chaar PDU families</h3>
<table class="cmp"><tr><th>PDU</th><th>Kaam</th><th>Kab bhejta hai</th></tr>
<tr><td>IIH (IS-IS Hello)</td><td>Neighbours dhoondhna; area, system ID, level, hold time, DIS priority le jana</td><td>Har interface par kuch seconds mein</td></tr>
<tr><td>LSP (link-state PDU)</td><td>Neighbours aur prefixes le jana; database record</td><td>Change par, aur lifetime khatam hone se pehle refresh par</td></tr>
<tr><td>CSNP (complete sequence number PDU)</td><td>Poore database ka summary, sync ke liye</td><td>LAN par DIS periodically; naye p2p link par ek baar</td></tr>
<tr><td>PSNP (partial sequence number PDU)</td><td>LSPs ko acknowledge karna ya missing maangna</td><td>Zaroorat par</td></tr></table>
<p>Hellos har level ke alag hote hain. Level 1/Level 2 router L1 hellos apne area ke saath aur L2 hellos same link par bhejta hai. Isliye adjacency problems hamesha kisi specific level ki hoti hain. Hold time hello ke andar jata hai, isliye <code>show isis adjacency</code> ka Hold column ginti kam karta hai aur reset hota hai: zero hone par neighbour down mana jata hai. Lab logs mein yeh <code>reason: Hold Time Expired</code> ke roop mein dikhta hai.</p>

<h3>Point-to-point aur broadcast links</h3>
<p>Broadcast network (Ethernet ka default) par segment ke saare routers ek link share karte hain, aur unmein se ek <b>DIS</b> (designated intermediate system) chuna jata hai. DIS ek <b>pseudonode</b> banata hai, ek nakli router jo LAN ko represent karta hai, aur <code>R2.01-00</code> jaisa pseudonode LSP flood karta hai jo har attached router ko list karta hai. Woh periodic CSNP bhi bhejta hai jo segment ko sync rakhta hai. DIS sabse ucchi priority (default 64) se chuna jata hai, tie hone par sabse bada MAC address, aur OSPF DR ke ulat yeh <b>pre-empt</b> karta hai: behtar router aate hi kabza le leta hai. Backup DIS bhi nahi hota.</p>
<p>Point-to-point link par DIS aur pseudonode nahi hote. Routers hellos exchange karte hain, three-way handshake se ek doosre ko confirm karte hain, ek CSNP bhejte hain, aur phir PSNPs se acknowledge karte hain. Ise interface ke neeche <code>point-to-point</code> se configure karte ho. Yeh tez converge karta hai aur database chhota rakhta hai, isliye zyadatar core links, yahan ke saare lab links samet, ise use karte hain.</p>
<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Broadcast LAN with pseudonode versus point to point">
<text x="150" y="22" text-anchor="middle" class="svg-ink" font-size="13">Broadcast LAN</text>
<ellipse cx="150" cy="110" rx="62" ry="28" fill="#ddd6fe" stroke="#64748b"/><text x="150" y="107" text-anchor="middle" class="svg-ink" font-size="12">pseudonode</text><text x="150" y="122" text-anchor="middle" class="svg-muted" font-size="11">R2.01-00</text>
<circle cx="60" cy="190" r="20" fill="#bbf7d0" stroke="#64748b"/><text x="60" y="194" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<circle cx="150" cy="190" r="20" fill="#fde68a" stroke="#64748b"/><text x="150" y="194" text-anchor="middle" class="svg-ink" font-size="12">R2</text><text x="150" y="222" text-anchor="middle" class="svg-muted" font-size="11">DIS</text>
<circle cx="240" cy="190" r="20" fill="#bbf7d0" stroke="#64748b"/><text x="240" y="194" text-anchor="middle" class="svg-ink" font-size="12">R3</text>
<line x1="70" y1="172" x2="115" y2="128" stroke="#64748b" stroke-width="2"/><line x1="150" y1="170" x2="150" y2="138" stroke="#64748b" stroke-width="2"/><line x1="230" y1="172" x2="188" y2="128" stroke="#64748b" stroke-width="2"/>
<text x="470" y="22" text-anchor="middle" class="svg-ink" font-size="13">Point to point</text>
<circle cx="390" cy="120" r="22" fill="#bbf7d0" stroke="#64748b"/><text x="390" y="124" text-anchor="middle" class="svg-ink" font-size="12">R1</text>
<circle cx="550" cy="120" r="22" fill="#fde68a" stroke="#64748b"/><text x="550" y="124" text-anchor="middle" class="svg-ink" font-size="12">R2</text>
<line x1="412" y1="120" x2="528" y2="120" stroke="#64748b" stroke-width="2"/><text x="470" y="108" text-anchor="middle" class="svg-muted" font-size="11">DIS nahi</text>
</svg><p class="cap">LAN ko pseudonode aur DIS chahiye; point-to-point link ko nahi.</p></div>

<h3>Database sync kaise rehta hai</h3>
<p>Har LSP ka ek ID hota hai (system ID, pseudonode number, fragment number, jaise <code>R1.00-00</code>), ek <b>sequence number</b>, ek <b>checksum</b> aur ek <b>lifetime</b>. Ucha sequence number naya hota hai. Routers apne LSPs ko lifetime (overview mein LSP life time: 1200 seconds) khatam hone se pehle refresh karte hain. LSP milne par router use us level ke baaki interfaces par flood karta hai, aur PSNP ya CSNP sender ko batata hai ki receiver ke paas pehle se kya hai. Yeh values database mein padh sakte ho:</p>
<pre class="out">lab@R1&gt; show isis database
IS-IS level 1 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
R1.00-00                         <span class="hl">0x1</span>   0x3bc9     1140 L1
R2.00-00                         0x1   0xff60     1140 L1 L2 Attached
R3.00-00                         0x1   0x2f8c     1140 L1 L2 Attached
  3 LSPs</pre>
<p>Lab mein R2 aur R3 par leaking policy commit karne ke baad unke sequence numbers <code>0x2</code> ho gaye kyunki unhone naye prefix TLVs ke saath apne LSPs dobara banaye. Badhta sequence number matlab router ne kuch badla. Har kuch seconds mein chadhta sequence number matlab kahin flap hai.</p>

<h3>Adjacency health check</h3>
<p>Hold column ke alawa <code>show isis interface</code> circuit type aur metric batata hai:</p>
<pre class="out">lab@R1&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            2   0x1 Disabled          Point to Point    10/10
ge-0/0/1.0            2   0x2 Disabled          Point to Point    10/30
lo0.0                 0   0x7 Disabled          Passive           0/0</pre>
<p>Yeh output Jaipur lab ke R1 ka hai, jo Level 2-only router hai. Level 1 DR column Disabled aur Level 2 column Point to Point kehta hai, isliye kisi taraf DIS nahi chuna jata.</p>

<div class="eg"><p><b>Worked example.</b> Teen routers campus LAN share karte hain: R1 priority 64, R2 priority 100, R3 priority 64. R2 Level 1 aur Level 2 par alag-alag DIS banta hai kyunki DIS election per level hota hai. R4 ko priority 120 ke saath laoge to woh turant kabza le lega. Core uplink ke liye aap <code>point-to-point</code> set karoge aur poora sawal hi khatam.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>point-to-point</code> sirf ek end par set karna. Ek side p2p hellos aur doosri LAN hellos bhejti hai, aur adjacency saaf tarah se up nahi hoti. Dono ends match karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> IS-IS DIS pre-empt karta hai aur uska backup nahi hota, OSPF DR ke bilkul ulat. DIS har kuch seconds mein CSNP bhi flood karta hai, jabki p2p link par CSNP ek baar bheja jata hai.</p></div>

<div class="scn"><h4>Flap karti LAN adjacency</h4><p>Data-centre LAN par kam MAC aur same priority wala lab switch har baar jab koi neighbour reboot hota tha DIS role jeet-haar raha tha. Har badlav ka matlab naya pseudonode LSP aur sab jagah full SPF. Team ne router-to-router links par <code>point-to-point</code> aur intended DIS par fixed ucchi priority set ki, aur churn ruk gaya.</p><p><b>Lesson:</b> jahan sirf do routers link share karte hain wahan point-to-point use karo.</p></div>

<div class="iv"><p class="q">"Pseudonode kya hai aur IS-IS ko iski zaroorat kyun hai?"</p><p>Pseudonode ek virtual node hai jo DIS broadcast LAN ko represent karne ke liye banata hai. LAN ke har router ko doosre har router ko list karne ke bajay sirf pseudonode ko list karna padta hai, jisse LSPs chhote aur topology graph simple rehta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>PDUs: IIH hellos, LSP records, CSNP summaries, PSNP acks aur requests.</li>
<li>Hellos per level hote hain; unka hold time Hold Time Expired chalata hai.</li>
<li>Broadcast links pre-empting DIS aur pseudonode chunte hain; p2p links nahi.</li>
<li>Sequence number, checksum aur lifetime tay karte hain ki kaunsa LSP naya hai.</li>
<li>Point-to-point dono ends par match karo.</li>
</ul></div>
`}};export{e as default};