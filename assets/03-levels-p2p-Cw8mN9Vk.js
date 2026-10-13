var e={id:`levels-p2p`,h:{en:`Levels, point-to-point links and the level-2 core`,hi:`Levels, point-to-point links aur level-2 core`},body:{en:`
<p><b>Two levels in one minute.</b> IS-IS has two levels. <b>Level 1</b> routers know only their own area and use the nearest level-2 router to leave it. <b>Level 2</b> routers form the backbone between areas. A router can do both. Enterprises use both levels to build a hierarchy. A carrier core usually uses <b>only level 2</b>: it is simpler, and one flat database means every router sees every PE loopback directly.</p>
<p>Junos by default runs <b>both</b> levels on every IS-IS interface. In a level-2-only core that wastes effort: the router tries to form level-1 adjacencies and keeps level-1 databases. The carrier way is to switch level 1 off explicitly:</p>
<pre class="code">set protocols isis level 1 disable</pre>
<p>With level 1 disabled, the interface output in the simulator shows it plainly. This is real output from JR1:</p>
<pre class="out">JR1&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            2   0x1 <span class="hl">Disabled</span>          <span class="hl">Point to Point</span>           10/10
ge-0/0/1.0            2   0x2 Disabled          Point to Point           10/10
lo0.0                 0   0x7 Disabled          Passive                    0/0</pre>
<ul><li>The <b>L</b> column says 2: the interface runs level 2 only.</li>
<li><b>Level 1 DR Disabled</b>: nothing happens at level 1.</li>
<li><b>Level 2 DR Point to Point</b>: no DIS election on this link.</li>
<li><b>Metric 10/10</b>: the default Junos cost per level; <b>lo0.0 is Passive</b> with metric 0/0.</li></ul>
<h3>Why point-to-point matters</h3>
<p>Ethernet interfaces are <b>broadcast</b> by default for IS-IS. On a broadcast segment the routers elect a <b>Designated Intermediate System (DIS)</b> that creates a pseudonode and floods the segment's topology. That is needed when many routers share one LAN. A carrier core link has two routers, so a DIS is pure overhead: extra LSPs, extra CSNP floods and a slower adjacency. Configuring <code>point-to-point</code> makes the two routers use a simple three-way handshake, no pseudonode and no election.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="285" height="60" rx="10" fill="#bae6fd"/><text x="162.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Broadcast</text><text x="162.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">DIS + pseudonode</text><line x1="305" y1="55" x2="335" y2="55" stroke="#64748b" stroke-width="2"/><rect x="335" y="25" width="285" height="60" rx="10" fill="#bbf7d0"/><text x="477.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Point-to-point</text><text x="477.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">two routers, no DIS</text></svg><p class="cap">A core link between two routers should be point-to-point.</p></div>
<p><b>Both ends must agree.</b> In the lab R1 (IOS) is configured with <code>isis network point-to-point</code> on the interface facing JR1 and JR1 uses <code>point-to-point</code> in Junos. If one side were broadcast and the other point-to-point, IS-IS hellos would not match and the adjacency would be unreliable or never form.</p>
<h3>The level-2 database</h3>
<p>With level 1 disabled there is only one database. Real output from JR1 after all three routers formed adjacencies:</p>
<pre class="out">JR1&gt; show isis database
IS-IS level 2 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
JR1.00-00                        0x3   0x38a3     1175 L1 L2
JR2.00-00                        0x2   0x65ae     1175 L1 L2
R1.00-00                         0x2   0xc22d     1176 L1 L2
  3 LSPs</pre>
<p>Three LSPs for three routers: <b>-00</b> is the router's own LSP (fragment 0). No pseudonode LSPs (such as R1.01-00) appear because all links are point-to-point.</p>
<div class="warn"><p><b>Common mistake.</b> Leaving the IOS neighbour as default broadcast, or forgetting <code>point-to-point</code> on the Junos side. The result is a DIS election you did not plan, or an adjacency stuck in initialising. Also do not disable level 1 on one router while another still runs it; the level-1 adjacencies simply disappear and the routers rely only on level 2.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the Junos default: both levels, broadcast on Ethernet, metric 10. The level-2-only core needs <code>level 1 disable</code>. A point-to-point link has no DIS and no pseudonode LSP.</p></div>
<div class="scn"><h4>The DIS nobody planned</h4><p>A new core link between a Junos and an IOS router was left at broadcast. A DIS was elected and pseudonode LSPs appeared in the database, inflating it slightly and delaying convergence. Setting point-to-point on both ends removed the pseudonode and cleaned up the database to one LSP per router.</p><p><b>Lesson:</b> Two-router links should always be point-to-point.</p></div>
<div class="iv"><p class="q">"Why configure point-to-point on core links?"</p><p>Because there are only two routers on the link. Point-to-point skips the DIS election and pseudonode, uses a simple three-way handshake, produces a smaller database and converges faster. Both ends must be configured the same way.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A carrier core normally runs level 2 only; disable level 1 on Junos.</li>
<li>Junos defaults to both levels and metric 10.</li>
<li>Point-to-point removes the DIS and the pseudonode LSP.</li>
<li>Both ends of a link must use the same network type.</li>
<li>show isis interface and show isis database confirm the design.</li></ul></div>
`,hi:`
<p><b>Do levels ek minute mein.</b> IS-IS ke do levels hain. <b>Level 1</b> routers sirf apna area jaante hain aur bahar jaane ke liye sabse paas ke level-2 router use karte hain. <b>Level 2</b> routers areas ke beech backbone banate hain. Router dono kar sakta hai. Enterprises hierarchy banane ke liye dono levels use karte hain. Carrier core aam taur par <b>sirf level 2</b> use karta hai: yeh simple hai, aur ek flat database ka matlab har router har PE loopback ko seedha dekhta hai.</p>
<p>Junos default mein har IS-IS interface par <b>dono</b> levels chalata hai. Level-2-only core mein yeh mehnat waste hai: router level-1 adjacencies banane ki koshish karta hai aur level-1 databases rakhta hai. Carrier tareeka hai level 1 ko explicitly band karna:</p>
<pre class="code">set protocols isis level 1 disable</pre>
<p>Level 1 disabled hone par simulator mein interface output saaf dikhata hai. Yeh JR1 ka real output hai:</p>
<pre class="out">JR1&gt; show isis interface
IS-IS interface database:
Interface             L CirID Level 1 DR        Level 2 DR        L1/L2 Metric
ge-0/0/0.0            2   0x1 <span class="hl">Disabled</span>          <span class="hl">Point to Point</span>           10/10
ge-0/0/1.0            2   0x2 Disabled          Point to Point           10/10
lo0.0                 0   0x7 Disabled          Passive                    0/0</pre>
<ul><li><b>L</b> column 2 kehta hai: interface sirf level 2 chalata hai.</li>
<li><b>Level 1 DR Disabled</b>: level 1 par kuch nahi hota.</li>
<li><b>Level 2 DR Point to Point</b>: is link par DIS election nahi.</li>
<li><b>Metric 10/10</b>: har level ke liye default Junos cost; <b>lo0.0 Passive</b> hai metric 0/0 ke saath.</li></ul>
<h3>Point-to-point kyun zaroori hai</h3>
<p>Ethernet interfaces IS-IS ke liye default mein <b>broadcast</b> hote hain. Broadcast segment par routers ek <b>Designated Intermediate System (DIS)</b> elect karte hain jo pseudonode banata hai aur segment ki topology flood karta hai. Yeh tab chahiye jab ek LAN par kai routers hon. Carrier core link par do routers hote hain, isliye DIS sirf overhead hai: extra LSPs, extra CSNP floods aur slow adjacency. <code>point-to-point</code> configure karne se do routers simple three-way handshake use karte hain, na pseudonode na election.</p>
<div class="dia"><svg viewBox="0 0 640 110" role="img" aria-label="diagram"><rect x="20" y="25" width="285" height="60" rx="10" fill="#bae6fd"/><text x="162.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Broadcast</text><text x="162.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">DIS + pseudonode</text><line x1="305" y1="55" x2="335" y2="55" stroke="#64748b" stroke-width="2"/><rect x="335" y="25" width="285" height="60" rx="10" fill="#bbf7d0"/><text x="477.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">Point-to-point</text><text x="477.5" y="68" text-anchor="middle" class="svg-muted" font-size="12">do routers, no DIS</text></svg><p class="cap">Do routers ke beech core link point-to-point hona chahiye.</p></div>
<p><b>Dono ends ko agree karna hoga.</b> Lab mein R1 (IOS) JR1 ki taraf wale interface par <code>isis network point-to-point</code> se configured hai aur JR1 Junos mein <code>point-to-point</code> use karta hai. Ek side broadcast aur doosri point-to-point hoti to IS-IS hellos match nahi karte aur adjacency unreliable hoti ya kabhi nahi banti.</p>
<h3>Level-2 database</h3>
<p>Level 1 disabled hone par sirf ek database hai. Teeno routers ki adjacencies banne ke baad JR1 ka real output:</p>
<pre class="out">JR1&gt; show isis database
IS-IS level 2 link-state database:
LSP ID                      Sequence Checksum Lifetime Attributes
JR1.00-00                        0x3   0x38a3     1175 L1 L2
JR2.00-00                        0x2   0x65ae     1175 L1 L2
R1.00-00                         0x2   0xc22d     1176 L1 L2
  3 LSPs</pre>
<p>Teen routers ke liye teen LSPs: <b>-00</b> router ka apna LSP (fragment 0) hai. Pseudonode LSPs (jaise R1.01-00) nahi dikhte kyunki saare links point-to-point hain.</p>
<div class="warn"><p><b>Common mistake.</b> IOS neighbour ko default broadcast chhod dena, ya Junos side par <code>point-to-point</code> bhool jaana. Result hota hai aisa DIS election jo aapne plan nahi kiya, ya initialising mein atki adjacency. Saath hi ek router par level 1 disable mat karo jabki doosra abhi chalata ho; level-1 adjacencies bas gayab ho jaati hain aur routers sirf level 2 par depend karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> Junos default yaad rakho: dono levels, Ethernet par broadcast, metric 10. Level-2-only core ko <code>level 1 disable</code> chahiye. Point-to-point link par DIS aur pseudonode LSP nahi hota.</p></div>
<div class="scn"><h4>DIS jise kisi ne plan nahi kiya</h4><p>Junos aur IOS router ke beech naya core link broadcast par chhod diya gaya. DIS elect hua aur database mein pseudonode LSPs aa gaye, jisse database thoda bada hua aur convergence slow hua. Dono ends par point-to-point set karne se pseudonode hat gaya aur database har router ka ek LSP reh gaya.</p><p><b>Lesson:</b> Do-router links hamesha point-to-point hone chahiye.</p></div>
<div class="iv"><p class="q">"Core links par point-to-point kyun configure karte ho?"</p><p>Kyunki link par sirf do routers hain. Point-to-point DIS election aur pseudonode skip karta hai, simple three-way handshake use karta hai, chhota database banata hai aur tez converge karta hai. Dono ends same tarah configure hone chahiye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Carrier core aam taur par sirf level 2 chalata hai; Junos par level 1 disable karo.</li>
<li>Junos default mein dono levels aur metric 10 rakhta hai.</li>
<li>Point-to-point DIS aur pseudonode LSP hata deta hai.</li>
<li>Link ke dono ends ka network type same hona chahiye.</li>
<li>show isis interface aur show isis database design confirm karte hain.</li></ul></div>
`}};export{e as default};