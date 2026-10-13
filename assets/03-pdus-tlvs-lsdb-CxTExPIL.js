var e={id:`pdus-tlvs-lsdb`,h:{en:`PDUs, TLVs and the link-state database`,hi:`PDUs, TLVs aur link-state database`},body:{en:`
<p>IS-IS talks with four kinds of messages, called <b>PDUs</b> (Protocol Data Units). Think of a newsroom. Reporters (routers) write <b>articles</b> (LSPs) about their own links. Editors check that everybody has the same set of articles by sending <b>contents lists</b> (CSNPs) and, when something is missing, ask for it with a <b>request slip</b> (PSNP). Before any of that, neighbours must first say <b>hello</b> (IIH). Every PDU contains <b>TLVs</b>: Type, Length, Value blocks, like labelled boxes. Because the box has a type and a length, a router simply skips a box it does not understand. That is why IS-IS extends so easily.</p>

<h3>The PDU types</h3>
<table class="cmp"><tr><th>PDU</th><th>Name</th><th>Purpose</th></tr>
<tr><td>IIH</td><td>IS-IS Hello</td><td>Finds neighbours and keeps adjacencies alive. Three forms: LAN level-1, LAN level-2, point-to-point</td></tr>
<tr><td>LSP</td><td>Link State PDU</td><td>Describes a router's links and prefixes. Flooded to the whole level</td></tr>
<tr><td>CSNP</td><td>Complete Sequence Number PDU</td><td>A summary of every LSP in the database, used to synchronise</td></tr>
<tr><td>PSNP</td><td>Partial Sequence Number PDU</td><td>Acknowledges an LSP on point-to-point links, or requests a missing LSP</td></tr></table>
<p>The hello carries the system ID, the area address, the supported protocols, the hold time and, on LANs, the priority and the DIS. Two routers form an adjacency only if the parameters in the hello are compatible (chapter 4). The default hello interval is 10 seconds and the hold time is three hellos, 30 seconds. The <code>Holdtime</code> column in <code>show isis neighbors</code> counts down from that value and is refreshed by every hello; in the lab output it is around 27.</p>

<h3>The LSP and its name</h3>
<p>Each router originates one LSP per level, named like <b>R2.00-00</b>: system ID (shown as hostname), a <b>pseudonode ID</b> (00 for the router itself, 01, 02 and so on for LAN pseudonodes, chapter 5) and an <b>LSP fragment number</b> (00 for the first; larger LSPs are split into -01, -02). An LSP also has a <b>sequence number</b> that grows with each new version (a higher number wins), a <b>checksum</b> and a <b>remaining lifetime</b> that counts down from 1200 seconds. The originator refreshes the LSP every 900 seconds. If an LSP expires it is purged from the database.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Flooding and synchronisation">
<rect x="20" y="70" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="100" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="280" y="70" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="540" y="70" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="580" y="100" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<g stroke="#64748b" stroke-width="2"><line x1="100" y1="95" x2="280" y2="95"/><line x1="360" y1="95" x2="540" y2="95"/></g>
<text x="190" y="85" text-anchor="middle" class="svg-accent" font-size="12">LSP R1.00-00</text><text x="450" y="85" text-anchor="middle" class="svg-accent" font-size="12">flooded on</text>
<text x="190" y="140" text-anchor="middle" class="svg-muted" font-size="12">PSNP (ack) on p2p</text><text x="450" y="140" text-anchor="middle" class="svg-muted" font-size="12">every other interface</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">New or changed LSP: flood. DIS or new neighbour: CSNP compares databases.</text>
</svg><p class="cap">An LSP is flooded hop by hop; sequence numbers decide which copy is newest.</p></div>

<h3>Reading the database</h3>
<p>The real database of R2 in the two-area lab, level-1 part first:</p>
<pre class="out">R2# show isis database detail
IS-IS Level-1 Link State Database:
LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime/Rcvd      ATT/P/OL
R1.00-00              0x00000004   0x0AD2        1172/1200              0/0/0
  Area Address: 49.0001
  NLPID:        0xCC
  Hostname: R1
  IP Address:   1.1.1.1
  Metric: 10        IS R2
  Metric: 10        IP 10.1.12.0 255.255.255.0
  Metric: 0         IP 1.1.1.1 255.255.255.255
R2.00-00            * 0x00000009   0x2F1C        1177/*                 <span class="hl">1</span>/0/0
  Area Address: 49.0001
  Hostname: R2
  Metric: 10        IS R1
  Metric: 10        IP 10.1.12.0 255.255.255.0
  Metric: 10        IP 10.1.23.0 255.255.255.0
  Metric: 0         IP 2.2.2.2 255.255.255.255</pre>
<p>How to read this: each block is one LSP. <code>Area Address</code> is TLV 1, <code>NLPID 0xCC</code> (TLV 129, supported protocols) says "IPv4 is routed here", <code>Hostname</code> is TLV 137, <code>IP Address</code> is TLV 132 (an IPv4 interface address of the router). <code>Metric: 10 IS R2</code> is an adjacency (TLV 2, narrow), and <code>IP ...</code> lines are prefixes (TLV 128). The asterisk marks the local router's own LSP. In the <code>LSP Holdtime/Rcvd</code> column "1172/1200" means 1172 seconds of lifetime left and a received lifetime of 1200. The last column is <b>ATT/P/OL</b>: the attached bit, the partition-repair bit and the overload bit. Here R2's level-1 LSP has ATT = 1 (chapter 6).</p>

<h3>Why two databases</h3>
<p>A level-1-2 router such as R2 keeps <b>two separate link-state databases</b>, one for level 1 and one for level 2, runs SPF on each, and installs the best result. This is why <code>show isis database</code> prints two sections, each with its own LSPs.</p>
<pre class="out">R2# show isis database
IS-IS Level-1 Link State Database:
R1.00-00              0x00000004   0x0AD2        1172/1200              0/0/0
R2.00-00            * 0x00000009   0x2F1C        1177/*                 1/0/0

IS-IS Level-2 Link State Database:
R2.00-00            * 0x00000008   0xB5A5        1172/*                 0/0/0
R3.00-00              0x00000008   0xB964        1172/1200              0/0/0</pre>
<p>R2 originates two LSPs of its own (one per level) but R1 appears only in level 1 and R3 only in level 2.</p>

<div class="eg"><p><b>Worked example.</b> R1's LSP has sequence 0x4. A new link comes up, R1 regenerates the LSP with sequence 0x5 and floods it. R2 compares: 0x5 is higher than 0x4, so it replaces its copy, floods it onward and runs a partial or full SPF. Meanwhile an old copy with 0x4 arriving late is simply ignored, because its sequence number is lower.</p></div>

<div class="warn"><p><b>Common mistake.</b> Reading <code>show isis database</code> to prove a route exists. The database proves the router knows about the LSP; it does not prove SPF installed a route. If an LSP is present but the route is not, suspect a metric-style mismatch (see the spcor-isis-design module) or an SPF/ATT rule.</p></div>
<div class="exam"><p><b>Exam trap.</b> Remember the numbers: max LSP lifetime 1200 s, refresh 900 s, hello 10 s with hold 30 s (3.33 s hello and 10 s hold for a DIS). Remember also that IS-IS LSPs are not acknowledged on LANs; the DIS sends CSNPs instead, while point-to-point links use PSNPs as acknowledgements.</p></div>

<div class="scn"><h4>Stale LSP after a router was replaced</h4><p>An engineer replaced a failed router and gave the new box the same NET. The database kept an old LSP of that router with a higher sequence number than the new box was generating, so the network briefly used outdated information. The new router noticed the higher sequence number, jumped above it and re-flooded its LSP within seconds, and everything converged. The engineer learned to expect a short period of confusion in the database when a router is swapped.</p><p><b>Lesson:</b> sequence numbers rule. The newest LSP wins, and a router can overtake its own old LSP.</p></div>

<div class="iv"><p class="q">"What are CSNP and PSNP used for?"</p><p>A CSNP lists all LSPs in the database with their sequence numbers and checksums, so neighbours can compare and find missing or old LSPs. It is sent periodically by the DIS on a LAN and once at the start on a point-to-point link. A PSNP lists some LSPs: on point-to-point links it acknowledges received LSPs, and on any link it requests LSPs that the router found missing in a CSNP.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Four PDUs: IIH, LSP, CSNP, PSNP; all carry TLVs.</li>
<li>LSP ID = system ID + pseudonode ID + fragment; sequence number picks the newest.</li>
<li>LSP lifetime is 1200 s and the originator refreshes it every 900 s.</li>
<li>A level-1-2 router keeps two databases, one per level.</li>
<li>ATT/P/OL column shows attached, partition and overload bits.</li>
</ul></div>
`,hi:`
<p>IS-IS chaar tarah ke messages se baat karta hai, jinhe <b>PDUs</b> (Protocol Data Units) kehte hain. Newsroom ki tarah socho. Reporters (routers) apne links ke baare mein <b>articles</b> (LSPs) likhte hain. Editors <b>contents lists</b> (CSNPs) bhejkar check karte hain ki sab ke paas articles ka same set hai, aur kuch missing ho to <b>request slip</b> (PSNP) se maangte hain. Isse pehle neighbours ko <b>hello</b> (IIH) kehna padta hai. Har PDU mein <b>TLVs</b> hote hain: Type, Length, Value blocks, labelled boxes ki tarah. Box ka type aur length hota hai, isliye router jo box samajhta nahi use chhod deta hai. Isiliye IS-IS aasaani se extend hota hai.</p>

<h3>PDU types</h3>
<table class="cmp"><tr><th>PDU</th><th>Naam</th><th>Kaam</th></tr>
<tr><td>IIH</td><td>IS-IS Hello</td><td>Neighbours dhoondhta hai aur adjacency zinda rakhta hai. Teen forms: LAN level-1, LAN level-2, point-to-point</td></tr>
<tr><td>LSP</td><td>Link State PDU</td><td>Router ke links aur prefixes batata hai. Poore level mein flood hota hai</td></tr>
<tr><td>CSNP</td><td>Complete Sequence Number PDU</td><td>Database ke har LSP ka summary, synchronise karne ke liye</td></tr>
<tr><td>PSNP</td><td>Partial Sequence Number PDU</td><td>Point-to-point links par LSP acknowledge karta hai, ya missing LSP maangta hai</td></tr></table>
<p>Hello mein system ID, area address, supported protocols, hold time aur LANs par priority aur DIS hote hain. Do routers tabhi adjacency banate hain jab hello ke parameters compatible hon (chapter 4). Default hello interval 10 seconds aur hold time teen hellos, 30 seconds. <code>show isis neighbors</code> ka <code>Holdtime</code> column us value se neeche ginta hai aur har hello se refresh hota hai; lab output mein yeh lagbhag 27 hai.</p>

<h3>LSP aur uska naam</h3>
<p>Har router har level ke liye ek LSP originate karta hai, jiska naam <b>R2.00-00</b> jaisa hota hai: system ID (hostname ki tarah dikhti hai), <b>pseudonode ID</b> (router ke liye 00, LAN pseudonodes ke liye 01, 02 aadi, chapter 5) aur <b>LSP fragment number</b> (pehle ke liye 00; bade LSPs -01, -02 mein tutte hain). LSP ka ek <b>sequence number</b> hota hai jo har naye version ke saath badhta hai (bada number jeetta hai), ek <b>checksum</b>, aur <b>remaining lifetime</b> jo 1200 seconds se neeche ginta hai. Originator LSP ko har 900 seconds refresh karta hai. LSP expire ho jaaye to database se purge ho jaata hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Flooding aur synchronisation">
<rect x="20" y="70" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="60" y="100" text-anchor="middle" class="svg-ink" font-size="13">R1</text>
<rect x="280" y="70" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="13">R2</text>
<rect x="540" y="70" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="580" y="100" text-anchor="middle" class="svg-ink" font-size="13">R3</text>
<g stroke="#64748b" stroke-width="2"><line x1="100" y1="95" x2="280" y2="95"/><line x1="360" y1="95" x2="540" y2="95"/></g>
<text x="190" y="85" text-anchor="middle" class="svg-accent" font-size="12">LSP R1.00-00</text><text x="450" y="85" text-anchor="middle" class="svg-accent" font-size="12">flood hota hai</text>
<text x="190" y="140" text-anchor="middle" class="svg-muted" font-size="12">p2p par PSNP (ack)</text><text x="450" y="140" text-anchor="middle" class="svg-muted" font-size="12">baaki har interface par</text>
<text x="320" y="180" text-anchor="middle" class="svg-ink" font-size="12">Naya ya badla LSP: flood. DIS ya naya neighbour: CSNP databases compare karta hai.</text>
</svg><p class="cap">LSP hop-by-hop flood hota hai; sequence numbers tay karte hain ki kaunsi copy sabse nayi hai.</p></div>

<h3>Database padhna</h3>
<p>Two-area lab mein R2 ka real database, pehle level-1 hissa:</p>
<pre class="out">R2# show isis database detail
IS-IS Level-1 Link State Database:
LSPID                 LSP Seq Num  LSP Checksum  LSP Holdtime/Rcvd      ATT/P/OL
R1.00-00              0x00000004   0x0AD2        1172/1200              0/0/0
  Area Address: 49.0001
  NLPID:        0xCC
  Hostname: R1
  IP Address:   1.1.1.1
  Metric: 10        IS R2
  Metric: 10        IP 10.1.12.0 255.255.255.0
  Metric: 0         IP 1.1.1.1 255.255.255.255
R2.00-00            * 0x00000009   0x2F1C        1177/*                 <span class="hl">1</span>/0/0
  Area Address: 49.0001
  Hostname: R2
  Metric: 10        IS R1
  Metric: 10        IP 10.1.12.0 255.255.255.0
  Metric: 10        IP 10.1.23.0 255.255.255.0
  Metric: 0         IP 2.2.2.2 255.255.255.255</pre>
<p>Padhne ka tareeka: har block ek LSP hai. <code>Area Address</code> TLV 1 hai, <code>NLPID 0xCC</code> (TLV 129, supported protocols) kehta hai "yahan IPv4 route hota hai", <code>Hostname</code> TLV 137 hai, <code>IP Address</code> TLV 132 hai (router ka ek IPv4 interface address). <code>Metric: 10 IS R2</code> adjacency hai (TLV 2, narrow), aur <code>IP ...</code> lines prefixes hain (TLV 128). Asterisk local router ke apne LSP ko mark karta hai. <code>LSP Holdtime/Rcvd</code> column mein "1172/1200" ka matlab lifetime ke 1172 seconds bache aur received lifetime 1200 thi. Aakhri column <b>ATT/P/OL</b> hai: attached bit, partition-repair bit aur overload bit. Yahan R2 ke level-1 LSP mein ATT = 1 hai (chapter 6).</p>

<h3>Do databases kyun</h3>
<p>R2 jaise level-1-2 router <b>do alag link-state databases</b> rakhta hai, ek level 1 ke liye aur ek level 2 ke liye, dono par SPF chalata hai, aur sabse achha result install karta hai. Isiliye <code>show isis database</code> do sections print karta hai, har ek ke apne LSPs ke saath.</p>
<pre class="out">R2# show isis database
IS-IS Level-1 Link State Database:
R1.00-00              0x00000004   0x0AD2        1172/1200              0/0/0
R2.00-00            * 0x00000009   0x2F1C        1177/*                 1/0/0

IS-IS Level-2 Link State Database:
R2.00-00            * 0x00000008   0xB5A5        1172/*                 0/0/0
R3.00-00              0x00000008   0xB964        1172/1200              0/0/0</pre>
<p>R2 khud do LSPs originate karta hai (har level ke liye ek) par R1 sirf level 1 mein aur R3 sirf level 2 mein dikhta hai.</p>

<div class="eg"><p><b>Worked example.</b> R1 ke LSP ka sequence 0x4 hai. Naya link up hota hai, R1 LSP ko sequence 0x5 ke saath regenerate karke flood karta hai. R2 compare karta hai: 0x5, 0x4 se bada hai, isliye apni copy replace karta hai, aage flood karta hai aur partial ya full SPF chalata hai. Dauran, der se aayi 0x4 wali purani copy ignore ho jaati hai kyunki uska sequence number kam hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Route ke exist karne ka saboot dene ke liye <code>show isis database</code> padhna. Database sirf yeh prove karta hai ki router ko LSP ka pata hai; yeh prove nahi karta ki SPF ne route install kiya. LSP hai par route nahi, to metric-style mismatch (spcor-isis-design module dekho) ya SPF/ATT rule par shak karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Numbers yaad rakho: max LSP lifetime 1200 s, refresh 900 s, hello 10 s aur hold 30 s (DIS ke liye 3.33 s hello aur 10 s hold). Yeh bhi yaad rakho ki LANs par IS-IS LSPs acknowledge nahi hote; DIS CSNPs bhejta hai, jabki point-to-point links PSNPs ko acknowledgement ki tarah use karte hain.</p></div>

<div class="scn"><h4>Router badalne ke baad stale LSP</h4><p>Ek engineer ne fail hue router ko badla aur naye box ko wahi NET diya. Database mein us router ka purana LSP naye box ke bana rahe LSP se bade sequence number ke saath bacha raha, isliye network ne thodi der purani information use ki. Naye router ne bada sequence number dekha, usse upar kood gaya aur kuch seconds mein apna LSP re-flood kiya, aur sab converge ho gaya. Engineer ne seekha ki router swap hone par database mein thodi der confusion expect karni chahiye.</p><p><b>Lesson:</b> sequence numbers raaj karte hain. Sabse naya LSP jeetta hai, aur router apne purane LSP ko overtake kar sakta hai.</p></div>

<div class="iv"><p class="q">"CSNP aur PSNP kis kaam aate hain?"</p><p>CSNP database ke saare LSPs ko unke sequence numbers aur checksums ke saath list karta hai, taaki neighbours compare karke missing ya purane LSPs dhoondh saken. LAN par DIS ise periodically bhejta hai aur point-to-point link par shuru mein ek baar. PSNP kuch LSPs list karta hai: point-to-point links par yeh received LSPs ko acknowledge karta hai, aur kisi bhi link par woh LSPs maangta hai jo router ko CSNP mein missing mile.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Chaar PDUs: IIH, LSP, CSNP, PSNP; sab TLVs le jaate hain.</li>
<li>LSP ID = system ID + pseudonode ID + fragment; sequence number sabse naya chunta hai.</li>
<li>LSP lifetime 1200 s hai aur originator use har 900 s refresh karta hai.</li>
<li>Level-1-2 router do databases rakhta hai, har level ke liye ek.</li>
<li>ATT/P/OL column attached, partition aur overload bits dikhata hai.</li>
</ul></div>
`}};export{e as default};