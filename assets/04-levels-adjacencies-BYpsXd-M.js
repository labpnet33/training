var e={id:`levels-adjacencies`,h:{en:`Levels, router types and adjacency rules`,hi:`Levels, router types aur adjacency rules`},body:{en:`
<p>Think of a university. Each department (an area) has its own staff who know every room in their building: that is <b>level 1</b>. The administration offices form a campus-wide network that links departments: that is <b>level 2</b>. A staff member who works in both a department and the administration is a <b>level 1/2</b> person. If a department member needs something in another department, they ask a level 1/2 colleague, who knows the way.</p>

<h3>Three router types</h3>
<table class="cmp"><tr><th>Type</th><th>Junos configuration</th><th>What it does</th></tr>
<tr><td>Level 1 router</td><td><code>set protocols isis level 2 disable</code></td><td>forms L1 adjacencies only; knows its own area; uses a default route to leave it</td></tr>
<tr><td>Level 2 router</td><td><code>set protocols isis level 1 disable</code></td><td>forms L2 adjacencies; backbone router; any area ID</td></tr>
<tr><td>Level 1/2 router</td><td>default on Junos</td><td>keeps both databases; connects an area to the backbone</td></tr></table>
<p>The Junos default is <b>L1/L2 on every IS-IS interface</b>, which is convenient but means that adjacencies of both levels try to form everywhere. You can turn a level off globally with <code>level 1 disable</code> or for a single interface, for example <code>set protocols isis interface ge-0/0/1.0 level 2 disable</code>.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Which levels form between router types">
<circle cx="70" cy="80" r="26" fill="#bae6fd" stroke="#64748b"/><text x="70" y="84" text-anchor="middle" class="svg-ink" font-size="12">L1 R1</text>
<circle cx="220" cy="80" r="26" fill="#fed7aa" stroke="#64748b"/><text x="220" y="84" text-anchor="middle" class="svg-ink" font-size="12">L1/2 R2</text>
<circle cx="370" cy="80" r="26" fill="#ddd6fe" stroke="#64748b"/><text x="370" y="84" text-anchor="middle" class="svg-ink" font-size="12">L2 R3</text>
<circle cx="540" cy="80" r="26" fill="#fed7aa" stroke="#64748b"/><text x="540" y="84" text-anchor="middle" class="svg-ink" font-size="12">L1/2 R4</text>
<line x1="96" y1="80" x2="194" y2="80" stroke="#64748b" stroke-width="2"/><text x="145" y="70" text-anchor="middle" class="svg-accent" font-size="12">L1 (same area)</text>
<line x1="246" y1="80" x2="344" y2="80" stroke="#64748b" stroke-width="2"/><text x="295" y="70" text-anchor="middle" class="svg-accent" font-size="12">L2</text>
<line x1="396" y1="80" x2="514" y2="80" stroke="#64748b" stroke-width="2"/><text x="455" y="70" text-anchor="middle" class="svg-accent" font-size="12">L2</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">L1 needs the same area address; L2 does not check the area</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Two L1-only routers in different areas form no adjacency at all</text>
</svg><p class="cap">The levels in common decide which adjacency forms.</p></div>

<h3>The adjacency rules</h3>
<table class="cmp"><tr><th>Check</th><th>Level 1</th><th>Level 2</th></tr>
<tr><td>family iso on both ends</td><td>required</td><td>required</td></tr>
<tr><td>level enabled on both ends</td><td>required</td><td>required</td></tr>
<tr><td>common area address</td><td><b>required</b></td><td>not checked</td></tr>
<tr><td>hello authentication</td><td>must match</td><td>must match</td></tr>
<tr><td>interface type (LAN vs point-to-point)</td><td>must match</td><td>must match</td></tr>
<tr><td>hello and hold timers</td><td>may differ</td><td>may differ</td></tr>
<tr><td>unique system ID</td><td>required</td><td>required</td></tr></table>
<p>The consequence: two routers in <b>different areas</b> on one link form only an <b>L2</b> adjacency, and an L1-only router in a different area gets nothing at all. The adjacency <code>L</code> column shows 1, 2, or 3. On a point-to-point link one adjacency covers both levels (3); on a LAN you get a separate L1 and L2 adjacency for each neighbour. The next output is from the Chennai lab: R1 has a LAN link (ge-0/0/0.0, two lines per neighbour) and a point-to-point link to R4 (one line, L 3):</p>
<pre class="out">lab@R1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R2             1 Up                   26  52:54:f:4:50:1
ge-0/0/0.0            R3             1 Up                   21  52:54:e:4:4e:1
ge-0/0/0.0            R2             2 Up                   27  52:54:f:4:50:1
ge-0/0/0.0            R3             2 Up                   20  52:54:e:4:4e:1
ge-0/0/1.0            R4             <span class="hl">3</span> Up                   23</pre>
<p>On a LAN the SNPA column shows the neighbour's MAC address (subnetwork point of attachment). On a point-to-point link it is empty. <code>show isis adjacency detail</code> adds the neighbour's area address, IP addresses and the circuit type.</p>

<h3>Hello timing</h3>
<p>The default hello interval is 9 seconds and the hold time is three times that, 27 seconds, so a dead neighbour is noticed after up to half a minute. Timers do not need to match. Use <code>clear isis adjacency</code> to restart adjacencies, and BFD to detect failures faster.</p>

<h3>Walking the broken adjacency lab</h3>
<p>In the Pune lab R1 is an L1-only router with NET 49.0010..., R2 is the L1/L2 border router with NET 49.0001... R1 shows no adjacency. The overview of R1 gives the answer:</p>
<pre class="out">lab@R1&gt; show isis overview
  Hostname: R1
  Sysid: 0100.3025.5001
  Areaid: <span class="hl">49.0010</span>
  Level 1
    Internal route preference: 15
  Level 2
    Disabled</pre>
<p>R1's area is 49.0010, but R2 is in 49.0001, so the level 1 check fails. R1 cannot use level 2 because it is disabled. The fix is to change the area part of R1's NET and keep its system ID:</p>
<pre class="code">delete interfaces lo0 unit 0 family iso address 49.0010.0100.3025.5001.00
set interfaces lo0 unit 0 family iso address 49.0001.0100.3025.5001.00</pre>
<pre class="out">lab@R1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R2             1 Up                   23</pre>
<p>The same lab has a second fault on R2 and R3 (level 2 hello authentication) that we study in chapter 7.</p>

<div class="eg"><p><b>Worked example.</b> R-A (L1/L2, area 49.0001) is connected to R-B (L1/L2, area 49.0002) and R-C (L1-only, area 49.0001). R-A and R-B form L2 only because the areas differ. R-A and R-C form L1 only because R-C has L2 disabled. R-B and R-C are not connected, so no adjacency exists. The ATT bit story in chapter 6 explains how R-C reaches area 49.0002.</p></div>

<div class="warn"><p><b>Common mistake.</b> Assuming that two routers on the same link always form an adjacency. If both are L1-only in different areas, or one is L1 and the other is L2-only, nothing forms and no error is logged. Another trap: changing only one end to point-to-point.</p></div>
<div class="exam"><p><b>Exam trap.</b> Level 1 adjacencies require a common area address; level 2 adjacencies do not. Hello and hold timers may differ. Authentication, interface type and system ID uniqueness matter. A Junos router defaults to L1/L2.</p></div>

<div class="scn"><h4>The area that was one digit off</h4><p>A new branch router in a new building was given the NET from a template with area 49.0010, but the rest of the branch was area 49.0001. The link came up and the interface showed IS-IS enabled, yet there was no adjacency and no log message. A senior engineer compared <code>show isis overview</code> on both routers, saw the different Areaid, and corrected one digit.</p><p><b>Lesson:</b> when nothing forms, compare area address, enabled levels and interface types on both ends, in that order.</p></div>

<div class="iv"><p class="q">"Two routers in different areas are connected. What adjacency forms?"</p><p>Only a level 2 adjacency, if both have L2 enabled. Level 1 needs a common area address, and level 2 does not check the area. If one router is L1-only, no adjacency forms. Mention that Junos routers are L1/L2 by default and that on point-to-point links you see a single L 3 adjacency covering both levels.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos is L1/L2 by default; disable a level globally or per interface.</li>
<li>L1 requires a common area; L2 does not check area; timers may differ.</li>
<li>On a point-to-point link one adjacency shows L 3; on a LAN you see separate L1 and L2 lines.</li>
<li>Default hello 9 s, hold 27 s.</li>
<li>Use <code>show isis overview</code> and <code>show isis adjacency detail</code> to compare both ends.</li>
</ul></div>
`,hi:`
<p>Ek university socho. Har department (area) ke apne staff hote hain jo apni building ka har kamra jaante hain: yeh <b>level 1</b> hai. Administration offices ek campus-wide network banate hain jo departments ko jodta hai: yeh <b>level 2</b> hai. Jo staff member department aur administration dono mein kaam karta hai wo <b>level 1/2</b> insaan hai. Department ke member ko kisi doosre department mein kuch chahiye, to wo level 1/2 colleague se poochta hai, jo raasta jaanta hai.</p>

<h3>Teen router types</h3>
<table class="cmp"><tr><th>Type</th><th>Junos configuration</th><th>Kya karta hai</th></tr>
<tr><td>Level 1 router</td><td><code>set protocols isis level 2 disable</code></td><td>sirf L1 adjacencies; apna area jaanta hai; bahar jaane ke liye default route</td></tr>
<tr><td>Level 2 router</td><td><code>set protocols isis level 1 disable</code></td><td>L2 adjacencies; backbone router; koi bhi area ID</td></tr>
<tr><td>Level 1/2 router</td><td>Junos par default</td><td>dono databases rakhta hai; area ko backbone se jodta hai</td></tr></table>
<p>Junos ka default <b>har IS-IS interface par L1/L2</b> hai, jo convenient hai par iska matlab dono levels ki adjacencies har jagah banane ki koshish karti hain. Aap level ko globally <code>level 1 disable</code> se ya ek interface ke liye band kar sakte ho, jaise <code>set protocols isis interface ge-0/0/1.0 level 2 disable</code>.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Router types ke beech kaun se levels bante hain">
<circle cx="70" cy="80" r="26" fill="#bae6fd" stroke="#64748b"/><text x="70" y="84" text-anchor="middle" class="svg-ink" font-size="12">L1 R1</text>
<circle cx="220" cy="80" r="26" fill="#fed7aa" stroke="#64748b"/><text x="220" y="84" text-anchor="middle" class="svg-ink" font-size="12">L1/2 R2</text>
<circle cx="370" cy="80" r="26" fill="#ddd6fe" stroke="#64748b"/><text x="370" y="84" text-anchor="middle" class="svg-ink" font-size="12">L2 R3</text>
<circle cx="540" cy="80" r="26" fill="#fed7aa" stroke="#64748b"/><text x="540" y="84" text-anchor="middle" class="svg-ink" font-size="12">L1/2 R4</text>
<line x1="96" y1="80" x2="194" y2="80" stroke="#64748b" stroke-width="2"/><text x="145" y="70" text-anchor="middle" class="svg-accent" font-size="12">L1 (same area)</text>
<line x1="246" y1="80" x2="344" y2="80" stroke="#64748b" stroke-width="2"/><text x="295" y="70" text-anchor="middle" class="svg-accent" font-size="12">L2</text>
<line x1="396" y1="80" x2="514" y2="80" stroke="#64748b" stroke-width="2"/><text x="455" y="70" text-anchor="middle" class="svg-accent" font-size="12">L2</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">L1 ko same area address chahiye; L2 area check nahi karta</text>
<text x="320" y="165" text-anchor="middle" class="svg-muted" font-size="12">Alag areas ke do L1-only routers mein koi adjacency nahi banti</text>
</svg><p class="cap">Common levels tay karte hain ki kaun si adjacency banti hai.</p></div>

<h3>Adjacency rules</h3>
<table class="cmp"><tr><th>Check</th><th>Level 1</th><th>Level 2</th></tr>
<tr><td>dono ends par family iso</td><td>zaroori</td><td>zaroori</td></tr>
<tr><td>dono ends par level enabled</td><td>zaroori</td><td>zaroori</td></tr>
<tr><td>common area address</td><td><b>zaroori</b></td><td>check nahi hota</td></tr>
<tr><td>hello authentication</td><td>match karna chahiye</td><td>match karna chahiye</td></tr>
<tr><td>interface type (LAN vs point-to-point)</td><td>match karna chahiye</td><td>match karna chahiye</td></tr>
<tr><td>hello aur hold timers</td><td>alag ho sakte hain</td><td>alag ho sakte hain</td></tr>
<tr><td>unique system ID</td><td>zaroori</td><td>zaroori</td></tr></table>
<p>Nateeja: ek link par <b>alag areas</b> ke do routers sirf <b>L2</b> adjacency banate hain, aur alag area ka L1-only router kuch nahi paata. Adjacency ka <code>L</code> column 1, 2 ya 3 dikhata hai. Point-to-point link par ek adjacency dono levels cover karti hai (3); LAN par har neighbour ke liye alag L1 aur L2 adjacency milti hai. Agla output Chennai lab ka hai: R1 ka ek LAN link (ge-0/0/0.0, har neighbour ki do lines) aur R4 ka point-to-point link (ek line, L 3):</p>
<pre class="out">lab@R1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R2             1 Up                   26  52:54:f:4:50:1
ge-0/0/0.0            R3             1 Up                   21  52:54:e:4:4e:1
ge-0/0/0.0            R2             2 Up                   27  52:54:f:4:50:1
ge-0/0/0.0            R3             2 Up                   20  52:54:e:4:4e:1
ge-0/0/1.0            R4             <span class="hl">3</span> Up                   23</pre>
<p>LAN par SNPA column neighbour ka MAC address dikhata hai (subnetwork point of attachment). Point-to-point link par ye khaali hota hai. <code>show isis adjacency detail</code> neighbour ka area address, IP addresses aur circuit type jodta hai.</p>

<h3>Hello timing</h3>
<p>Default hello interval 9 seconds aur hold time uska teen guna, 27 seconds, hai, isliye mara hua neighbour aadhe minute tak mein notice hota hai. Timers ka match hona zaroori nahi. Adjacencies restart karne ke liye <code>clear isis adjacency</code> aur failures tezi se pakadne ke liye BFD use karo.</p>

<h3>Toote hue adjacency lab ko dekhna</h3>
<p>Pune lab mein R1 NET 49.0010... wala L1-only router hai, R2 NET 49.0001... wala L1/L2 border router hai. R1 koi adjacency nahi dikhata. R1 ka overview jawab deta hai:</p>
<pre class="out">lab@R1&gt; show isis overview
  Hostname: R1
  Sysid: 0100.3025.5001
  Areaid: <span class="hl">49.0010</span>
  Level 1
    Internal route preference: 15
  Level 2
    Disabled</pre>
<p>R1 ka area 49.0010 hai, par R2 49.0001 mein hai, isliye level 1 check fail hota hai. R1 level 2 use nahi kar sakta kyunki wo disabled hai. Fix hai R1 ke NET ka area part badalna aur system ID rakhna:</p>
<pre class="code">delete interfaces lo0 unit 0 family iso address 49.0010.0100.3025.5001.00
set interfaces lo0 unit 0 family iso address 49.0001.0100.3025.5001.00</pre>
<pre class="out">lab@R1&gt; show isis adjacency
Interface             System         L State        Hold (secs) SNPA
ge-0/0/0.0            R2             1 Up                   23</pre>
<p>Isi lab mein R2 aur R3 par doosra fault (level 2 hello authentication) hai jise hum chapter 7 mein padhenge.</p>

<div class="eg"><p><b>Worked example.</b> R-A (L1/L2, area 49.0001) R-B (L1/L2, area 49.0002) aur R-C (L1-only, area 49.0001) se juda hai. R-A aur R-B sirf L2 banate hain kyunki areas alag hain. R-A aur R-C sirf L1 banate hain kyunki R-C par L2 disabled hai. R-B aur R-C juday nahi hain, isliye koi adjacency nahi. Chapter 6 ki ATT bit kahani batati hai ki R-C area 49.0002 tak kaise pahunchta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Ye maan lena ki ek link ke do routers hamesha adjacency banate hain. Dono alag areas ke L1-only hon, ya ek L1 aur doosra L2-only, to kuch nahi banta aur koi error log nahi hota. Ek aur jaal: sirf ek end ko point-to-point karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Level 1 adjacency ko common area address chahiye; level 2 ko nahi. Hello aur hold timers alag ho sakte hain. Authentication, interface type aur system ID uniqueness maayne rakhte hain. Junos router ka default L1/L2 hai.</p></div>

<div class="scn"><h4>Area jo ek digit galat tha</h4><p>Nayi building ke naye branch router ko area 49.0010 wale template ka NET mila, jabki baaki branch area 49.0001 tha. Link up hua aur interface par IS-IS enabled dikha, phir bhi koi adjacency nahi aur koi log message nahi. Senior engineer ne dono routers par <code>show isis overview</code> compare kiya, alag Areaid dekha, aur ek digit theek kiya.</p><p><b>Lesson:</b> jab kuch na bane, dono ends par area address, enabled levels aur interface types is kram mein compare karo.</p></div>

<div class="iv"><p class="q">"Do alag areas ke routers juday hain. Kaun si adjacency banti hai?"</p><p>Sirf level 2 adjacency, agar dono par L2 enabled hai. Level 1 ko common area address chahiye, aur level 2 area check nahi karta. Ek router L1-only ho to koi adjacency nahi banti. Batao ki Junos routers default L1/L2 hote hain aur point-to-point links par ek hi L 3 adjacency dono levels cover karti hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Junos default L1/L2 hai; level ko globally ya interface par disable karo.</li>
<li>L1 ko common area chahiye; L2 area check nahi karta; timers alag ho sakte hain.</li>
<li>Point-to-point link par ek adjacency L 3 dikhati hai; LAN par alag L1 aur L2 lines.</li>
<li>Default hello 9 s, hold 27 s.</li>
<li>Dono ends compare karne ke liye <code>show isis overview</code> aur <code>show isis adjacency detail</code> use karo.</li>
</ul></div>
`}};export{e as default};