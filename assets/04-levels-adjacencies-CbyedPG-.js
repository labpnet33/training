var e={id:`levels-adjacencies`,h:{en:`Levels, router types and adjacency rules`,hi:`Levels, router types aur adjacency rules`},body:{en:`
<p>In the analogy of chapter 1 each district has its own street map (level 1) and the districts share a ring-road map (level 2). Now we turn the analogy into rules. Every IS-IS router has a <b>router type</b> and every interface has a <b>circuit type</b>. Together they decide which adjacencies come up.</p>

<h3>The three router types</h3>
<table class="cmp"><tr><th>Type</th><th>IOS command</th><th>What it does</th></tr>
<tr><td>Level-1</td><td><code>is-type level-1</code></td><td>Forms L1 adjacencies only. Knows its own area. Uses a default route toward the nearest attached router to leave the area.</td></tr>
<tr><td>Level-2</td><td><code>is-type level-2-only</code></td><td>Forms L2 adjacencies only. Part of the backbone. The area ID does not have to match its neighbours'.</td></tr>
<tr><td>Level-1-2</td><td><code>is-type level-1-2</code> (default)</td><td>Keeps both databases. Connects an area to the backbone. Sets the ATT bit when it can reach other areas.</td></tr></table>
<p>The circuit type narrows things further per interface: <code>isis circuit-type level-1</code>, <code>level-2-only</code> or <code>level-1-2</code> (the default follows the router type). Use it to stop level-1 hellos on a core link, for instance.</p>

<h3>Who forms an adjacency with whom</h3>
<table class="cmp"><tr><th>Neighbour A</th><th>Neighbour B</th><th>Result</th></tr>
<tr><td>L1</td><td>L1, same area</td><td>L1 adjacency</td></tr>
<tr><td>L1</td><td>L1, different area</td><td><b>None</b></td></tr>
<tr><td>L2</td><td>L2, any area</td><td>L2 adjacency</td></tr>
<tr><td>L1-2</td><td>L1-2, same area</td><td>L1 and L2 adjacencies (two)</td></tr>
<tr><td>L1-2</td><td>L1-2, different area</td><td>L2 only</td></tr>
<tr><td>L1</td><td>L2-only</td><td><b>None</b></td></tr>
<tr><td>L1-2</td><td>L1 (same area)</td><td>L1 adjacency</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Adjacency by level">
<rect x="20" y="30" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="60" text-anchor="middle" class="svg-ink" font-size="13">R1 (L1) 49.0001</text>
<rect x="255" y="30" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">R2 (L1-2) 49.0001</text>
<rect x="490" y="30" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="13">R3 (L1-2) 49.0002</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="55" x2="255" y2="55"/><line x1="385" y1="55" x2="490" y2="55"/></g>
<text x="202" y="45" text-anchor="middle" class="svg-ink" font-size="12">L1</text><text x="437" y="45" text-anchor="middle" class="svg-accent" font-size="12">L2</text>
<rect x="255" y="130" width="130" height="50" rx="8" fill="#fecaca"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">RX (L2-only)</text>
<line x1="85" y1="80" x2="255" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="150" y="130" text-anchor="middle" class="svg-muted" font-size="12">no adjacency</text>
</svg><p class="cap">An L1 router cannot form an adjacency with an L2-only router; L1-2 routers in different areas form L2 only.</p></div>

<h3>What else must match</h3>
<p>Matching levels and areas are not enough. The two ends must also agree on:</p>
<ul>
<li><b>Network type.</b> Both ends broadcast, or both ends point-to-point (<code>isis network point-to-point</code>). Mismatch: hellos fly in both directions of different formats and no adjacency forms (chapter 5).</li>
<li><b>MTU.</b> IS-IS pads hellos to the full interface MTU by default. A neighbour that cannot receive a hello of that size never sees it. IOS shows the MTU in <code>show clns interface</code> (the lab shows 1497).</li>
<li><b>Authentication</b> on the hello (chapter 7) and the same <b>system-ID uniqueness</b> (chapter 2).</li>
<li><b>Layer 3 on LANs.</b> Neighbours on a LAN need IP addresses in the same subnet; point-to-point links do not strictly, but the same subnet is good practice for IPv4 next hops on Ethernet.</li>
</ul>
<p>On point-to-point links IS-IS uses a <b>three-way handshake</b> (RFC 5303) so each side knows the other sees its hello, a feature that avoids one-way adjacencies.</p>

<h3>Seeing the levels in the lab</h3>
<p>R2 holds both levels. The Type column of <code>show isis neighbors</code> shows what was negotiated on each link:</p>
<pre class="out">R2# show isis neighbors
System Id       Type Interface     IP Address      State Holdtime Circuit Id
R1              <span class="hl">L1</span>   Gi0/0         10.1.12.1       UP    27       00
R3              <span class="hl">L2</span>   Gi0/1         10.1.23.3       UP    27       00</pre>
<p>R2 and R3 are in different areas, so only level 2 forms, even though both are level-1-2. Now look at what the circuit type does. On R3 the interface towards R4 had been set to <code>isis circuit-type level-2-only</code> in the troubleshooting lab, while R4 is a level-1 router:</p>
<pre class="out">R3# show clns interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  Checksums enabled, MTU 1497, Encapsulation SAP
  Routing Protocol: IS-IS
    <span class="hl">Circuit Type: level-2</span>
    Level-2 Metric: 10, Priority: 64, Circuit ID: R3.01
    Number of active level-2 adjacencies: 0</pre>
<p>Only level-2 hellos leave this interface, R4 wants level 1, so no adjacency. After <code>no isis circuit-type</code> the same command prints <code>Circuit Type: level-1-2</code> and "Number of active level-1 adjacencies: 1".</p>

<div class="eg"><p><b>Worked example.</b> You have R5 in area 49.0003 configured as default (level-1-2) connected to R2 (49.0001, level-1-2). What forms? Different areas, so L1 cannot form; both are level-1-2 so L2 forms. If R5 were <code>is-type level-1</code>, nothing would form (different areas), and if R5 were <code>level-2-only</code> an L2 adjacency would form regardless of area.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving every router at level-1-2 in a design that wants a single level-2 core. Each router then keeps two identical databases and runs SPF twice. If you only need level 2, set <code>is-type level-2-only</code> everywhere.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Two level-1 routers in different areas are connected. What forms?" Nothing. And "two level-1-2 routers in different areas": only level 2. Level-1 adjacency needs a matching area; level-2 does not.</p></div>

<div class="scn"><h4>The access router that never saw its upstream</h4><p>A new access router R4 in area 49.0002 was configured level-1 and cabled to R3. It showed no neighbour. The engineer found <code>isis circuit-type level-2-only</code> on R3's interface, copied from a core-link template. Removing it brought up the level-1 adjacency, the attached bit made R4 install a default route and traffic flowed.</p><p><b>Lesson:</b> compare router type and circuit type on both ends of a silent link.</p></div>

<div class="iv"><p class="q">"What adjacencies form between two level-1-2 routers in the same area?"</p><p>Two adjacencies: one level-1 and one level-2, because they share an area and both run both levels. Show you also know that on a LAN each level elects its own DIS and that you can limit levels per interface with circuit-type.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router types: level-1, level-2-only, level-1-2 (IOS default).</li>
<li>L1 adjacencies need the same area; L2 adjacencies do not.</li>
<li>L1-2 routers in different areas form L2 only.</li>
<li>Circuit-type per interface can restrict levels and can silently stop an adjacency.</li>
<li>Network type, MTU, authentication and unique system IDs must also be consistent.</li>
</ul></div>
`,hi:`
<p>Chapter 1 ki analogy mein har district ka apna street map (level 1) hai aur districts ek ring-road map (level 2) share karte hain. Ab hum analogy ko rules mein badalte hain. Har IS-IS router ka ek <b>router type</b> aur har interface ka ek <b>circuit type</b> hota hai. Dono milkar tay karte hain ki kaunsi adjacencies up hongi.</p>

<h3>Teen router types</h3>
<table class="cmp"><tr><th>Type</th><th>IOS command</th><th>Kya karta hai</th></tr>
<tr><td>Level-1</td><td><code>is-type level-1</code></td><td>Sirf L1 adjacencies banata hai. Apna area jaanta hai. Area se bahar jaane ke liye sabse paas ke attached router ki taraf default route use karta hai.</td></tr>
<tr><td>Level-2</td><td><code>is-type level-2-only</code></td><td>Sirf L2 adjacencies banata hai. Backbone ka hissa. Area ID ka neighbours se match karna zaroori nahi.</td></tr>
<tr><td>Level-1-2</td><td><code>is-type level-1-2</code> (default)</td><td>Dono databases rakhta hai. Area ko backbone se jodta hai. Doosre areas tak pahunch sake to ATT bit set karta hai.</td></tr></table>
<p>Circuit type har interface par aur narrow karta hai: <code>isis circuit-type level-1</code>, <code>level-2-only</code> ya <code>level-1-2</code> (default router type ko follow karta hai). Isse, jaise, core link par level-1 hellos rok sakte ho.</p>

<h3>Kaun kiske saath adjacency banata hai</h3>
<table class="cmp"><tr><th>Neighbour A</th><th>Neighbour B</th><th>Result</th></tr>
<tr><td>L1</td><td>L1, same area</td><td>L1 adjacency</td></tr>
<tr><td>L1</td><td>L1, alag area</td><td><b>Koi nahi</b></td></tr>
<tr><td>L2</td><td>L2, koi bhi area</td><td>L2 adjacency</td></tr>
<tr><td>L1-2</td><td>L1-2, same area</td><td>L1 aur L2 adjacencies (do)</td></tr>
<tr><td>L1-2</td><td>L1-2, alag area</td><td>Sirf L2</td></tr>
<tr><td>L1</td><td>L2-only</td><td><b>Koi nahi</b></td></tr>
<tr><td>L1-2</td><td>L1 (same area)</td><td>L1 adjacency</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Level ke hisaab se adjacency">
<rect x="20" y="30" width="130" height="50" rx="8" fill="#bae6fd"/><text x="85" y="60" text-anchor="middle" class="svg-ink" font-size="13">R1 (L1) 49.0001</text>
<rect x="255" y="30" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="13">R2 (L1-2) 49.0001</text>
<rect x="490" y="30" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="555" y="60" text-anchor="middle" class="svg-ink" font-size="13">R3 (L1-2) 49.0002</text>
<g stroke="#64748b" stroke-width="2"><line x1="150" y1="55" x2="255" y2="55"/><line x1="385" y1="55" x2="490" y2="55"/></g>
<text x="202" y="45" text-anchor="middle" class="svg-ink" font-size="12">L1</text><text x="437" y="45" text-anchor="middle" class="svg-accent" font-size="12">L2</text>
<rect x="255" y="130" width="130" height="50" rx="8" fill="#fecaca"/><text x="320" y="160" text-anchor="middle" class="svg-ink" font-size="13">RX (L2-only)</text>
<line x1="85" y1="80" x2="255" y2="150" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="150" y="130" text-anchor="middle" class="svg-muted" font-size="12">adjacency nahi</text>
</svg><p class="cap">L1 router L2-only router se adjacency nahi bana sakta; alag areas ke L1-2 routers sirf L2 banate hain.</p></div>

<h3>Aur kya match karna chahiye</h3>
<p>Levels aur areas ka match hona kaafi nahi. Dono ends ko in par bhi agree karna padta hai:</p>
<ul>
<li><b>Network type.</b> Dono ends broadcast, ya dono point-to-point (<code>isis network point-to-point</code>). Mismatch: hellos dono directions mein alag formats ke saath udte hain aur adjacency nahi banti (chapter 5).</li>
<li><b>MTU.</b> IS-IS default mein hellos ko poore interface MTU tak pad karta hai. Jo neighbour itne bade hello ko receive nahi kar sakta woh use kabhi nahi dekhta. IOS MTU ko <code>show clns interface</code> mein dikhata hai (lab 1497 dikhata hai).</li>
<li>Hello par <b>authentication</b> (chapter 7) aur wahi <b>system-ID uniqueness</b> (chapter 2).</li>
<li><b>LANs par layer 3.</b> LAN par neighbours ko same subnet ke IP addresses chahiye; point-to-point links ko strictly nahi, par Ethernet par IPv4 next hops ke liye same subnet achhi practice hai.</li>
</ul>
<p>Point-to-point links par IS-IS <b>three-way handshake</b> (RFC 5303) use karta hai taaki har side ko pata chale ki doosri side uska hello dekh rahi hai, jo one-way adjacencies se bachata hai.</p>

<h3>Lab mein levels dekhna</h3>
<p>R2 dono levels rakhta hai. <code>show isis neighbors</code> ka Type column dikhata hai ki har link par kya negotiate hua:</p>
<pre class="out">R2# show isis neighbors
System Id       Type Interface     IP Address      State Holdtime Circuit Id
R1              <span class="hl">L1</span>   Gi0/0         10.1.12.1       UP    27       00
R3              <span class="hl">L2</span>   Gi0/1         10.1.23.3       UP    27       00</pre>
<p>R2 aur R3 alag areas mein hain, isliye sirf level 2 banta hai, bhale hi dono level-1-2 hain. Ab dekho circuit type kya karta hai. Troubleshooting lab mein R3 ke R4 ki taraf wale interface par <code>isis circuit-type level-2-only</code> set tha, jabki R4 level-1 router hai:</p>
<pre class="out">R3# show clns interface g0/0
GigabitEthernet0/0 is up, line protocol is up
  Checksums enabled, MTU 1497, Encapsulation SAP
  Routing Protocol: IS-IS
    <span class="hl">Circuit Type: level-2</span>
    Level-2 Metric: 10, Priority: 64, Circuit ID: R3.01
    Number of active level-2 adjacencies: 0</pre>
<p>Is interface se sirf level-2 hellos nikalte hain, R4 level 1 chahta hai, isliye adjacency nahi. <code>no isis circuit-type</code> ke baad wahi command <code>Circuit Type: level-1-2</code> aur "Number of active level-1 adjacencies: 1" print karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Aapke paas area 49.0003 ka R5 hai jo default (level-1-2) configured hai aur R2 (49.0001, level-1-2) se juda hai. Kya banega? Areas alag hain, isliye L1 nahi banega; dono level-1-2 hain isliye L2 banega. Agar R5 <code>is-type level-1</code> hota to kuch nahi banta (alag areas), aur agar R5 <code>level-2-only</code> hota to area chahe jo ho L2 adjacency banti.</p></div>

<div class="warn"><p><b>Common mistake.</b> Aise design mein jo single level-2 core chahta hai, har router ko level-1-2 chhod dena. Har router tab do ek jaise databases rakhta hai aur SPF do baar chalata hai. Sirf level 2 chahiye to sab jagah <code>is-type level-2-only</code> lagao.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Alag areas ke do level-1 routers jude hain. Kya banega?" Kuch nahi. Aur "alag areas ke do level-1-2 routers": sirf level 2. Level-1 adjacency ko matching area chahiye; level-2 ko nahi.</p></div>

<div class="scn"><h4>Access router jisne apna upstream kabhi nahi dekha</h4><p>Area 49.0002 ka naya access router R4 level-1 configure hua aur R3 se cable hua. Use koi neighbour nahi dikha. Engineer ko R3 ke interface par <code>isis circuit-type level-2-only</code> mila, jo core-link template se copy hua tha. Use hatane se level-1 adjacency up hui, attached bit se R4 ne default route install kiya aur traffic chala.</p><p><b>Lesson:</b> chup link ke dono ends par router type aur circuit type compare karo.</p></div>

<div class="iv"><p class="q">"Same area ke do level-1-2 routers ke beech kaunsi adjacencies banti hain?"</p><p>Do adjacencies: ek level-1 aur ek level-2, kyunki dono ek area share karte hain aur dono levels chalate hain. Dikhao ki aap yeh bhi jaante ho ki LAN par har level apna DIS chunta hai aur circuit-type se har interface par levels limit kar sakte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Router types: level-1, level-2-only, level-1-2 (IOS default).</li>
<li>L1 adjacencies ko same area chahiye; L2 ko nahi.</li>
<li>Alag areas ke L1-2 routers sirf L2 banate hain.</li>
<li>Per-interface circuit-type levels restrict kar sakta hai aur adjacency chupchap rok sakta hai.</li>
<li>Network type, MTU, authentication aur unique system IDs bhi consistent honi chahiye.</li>
</ul></div>
`}};export{e as default};