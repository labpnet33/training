var e={id:`igp-core`,h:{en:`The IGP: how the core finds every loopback`,hi:`IGP: core har loopback kaise dhoondhta hai`},body:{en:`
<p>Before MPLS, VPNs or BGP can work, every router in the core must be able to reach every other router. That is the job of the <b>IGP</b> (Interior Gateway Protocol). In a provider the IGP has a narrow task: carry <b>loopback addresses</b> and the <b>links between routers</b>, nothing else. You already know OSPF from CCNA and ENARSI. Providers often choose <b>IS-IS</b> instead, and SPCOR tests both.</p>

<h3>Why loopbacks are the centre of everything</h3>
<p>A loopback interface never goes down unless the router does. BGP sessions, LDP sessions and VPN next hops are all built between loopbacks, so they survive the failure of a single link as long as another path exists. A typical numbering plan gives every router a /32 loopback, for example PE1 10.0.255.1, P1 10.0.255.2.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="IGP carries loopbacks">
<circle cx="90" cy="100" r="34" fill="#bbf7d0"/><text x="90" y="96" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="90" y="112" text-anchor="middle" class="svg-muted" font-size="11">lo 10.0.255.1</text>
<circle cx="260" cy="100" r="34" fill="#fde68a"/><text x="260" y="96" text-anchor="middle" class="svg-ink" font-size="13">P1</text><text x="260" y="112" text-anchor="middle" class="svg-muted" font-size="11">lo 10.0.255.2</text>
<circle cx="430" cy="100" r="34" fill="#fde68a"/><text x="430" y="96" text-anchor="middle" class="svg-ink" font-size="13">P2</text><text x="430" y="112" text-anchor="middle" class="svg-muted" font-size="11">lo 10.0.255.3</text>
<circle cx="580" cy="100" r="34" fill="#bbf7d0"/><text x="580" y="96" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><text x="580" y="112" text-anchor="middle" class="svg-muted" font-size="11">lo 10.0.255.4</text>
<g stroke="#64748b" stroke-width="2"><line x1="124" y1="100" x2="226" y2="100"/><line x1="294" y1="100" x2="396" y2="100"/><line x1="464" y1="100" x2="546" y2="100"/></g>
<text x="175" y="90" text-anchor="middle" class="svg-muted" font-size="11">10.0.12.0/24</text><text x="345" y="90" text-anchor="middle" class="svg-muted" font-size="11">10.0.23.0/24</text><text x="505" y="90" text-anchor="middle" class="svg-muted" font-size="11">10.0.34.0/24</text>
<text x="320" y="175" text-anchor="middle" class="svg-accent" font-size="12">IGP carries loopbacks and core links only; customer LANs stay out</text>
</svg><p class="cap">The IGP table of a core router is just loopbacks and point-to-point links.</p></div>

<h3>IS-IS and OSPF side by side</h3>
<table class="cmp"><tr><th>Feature</th><th>OSPF</th><th>IS-IS</th></tr>
<tr><td>Runs over</td><td>IP (protocol 89)</td><td>Directly on the data link (CLNS)</td></tr>
<tr><td>Router identity</td><td>Router ID (IPv4 style)</td><td>NET: area plus system ID</td></tr>
<tr><td>Area border</td><td>Inside the router (ABR)</td><td>On the link between routers</td></tr>
<tr><td>Extensibility</td><td>New LSA types</td><td>New TLVs in the same PDUs</td></tr>
<tr><td>Default metric on IOS</td><td>Bandwidth-based cost</td><td>10 per link</td></tr></table>
<p>Providers like IS-IS because it is easy to extend (IPv6, traffic engineering and segment routing arrive as TLVs), it does not depend on IP addressing to form adjacencies, and large single-level cores are a well-known design. The next two modules in this course take IS-IS from zero to design depth.</p>

<h3>What a working core IGP looks like</h3>
<p>This is real output from the lab in the spcor-isis module: four routers, R1 and R4 in different areas, R2 and R3 as border routers. Neighbours on R2:</p>
<pre class="out">R2# show isis neighbors
Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id
R1              L1   Gi0/0         10.1.12.1       <span class="hl">UP</span>    27       00
R3              L2   Gi0/1         10.1.23.3       <span class="hl">UP</span>    27       00</pre>
<p>And the routes R3 has learned, each marked with the protocol code and level, the administrative distance 115, and the metric:</p>
<pre class="out">R3# show ip route isis
...
      1.0.0.0/32 is subnetted, 1 subnets
i L2     1.1.1.1 [<span class="hl">115/20</span>] via 10.1.23.2, 00:00:28, GigabitEthernet0/1
      2.0.0.0/32 is subnetted, 1 subnets
i L2     2.2.2.2 [115/10] via 10.1.23.2, 00:00:28, GigabitEthernet0/1
      4.0.0.0/32 is subnetted, 1 subnets
i L1     4.4.4.4 [115/10] via 10.1.34.4, 00:00:28, GigabitEthernet0/0</pre>
<p>Read it left to right: <code>i</code> means IS-IS, <code>L1</code>/<code>L2</code> the level, <code>115</code> the administrative distance, <code>20</code> the total metric (two links of 10).</p>

<div class="eg"><p><b>Worked example.</b> PE1 wants to reach PE2's loopback 10.0.255.4. The IGP has three links of metric 10 along the only path, so the cost is 30 and the router installs a route with next hop P1. If a second path existed with the same cost, both next hops would be installed: this is <b>ECMP</b>, equal-cost multipath, which providers rely on to use all their fibre.</p></div>

<div class="warn"><p><b>Common mistake.</b> Running the IGP on customer-facing interfaces. Use <code>passive-interface</code> (or advertise the prefix without forming adjacencies) so that a customer cannot start a routing adjacency with your core.</p></div>
<div class="exam"><p><b>Exam trap.</b> The IGP is not the place for customer routes or for the whole internet table. If a question describes thousands of customer prefixes in the IGP, the answer is to move them to BGP.</p></div>

<div class="scn"><h4>The loopback that was not advertised</h4><p>A new PE came up and its BGP session to the route reflector stayed Idle. The interface was up and the physical link was fine. The engineer ran <code>show ip route</code> for the reflector's loopback and found no route: Loopback0 was not enabled in the IGP, so nobody knew how to reach it. After adding <code>ip router isis</code> under Loopback0, the session established within seconds.</p><p><b>Lesson:</b> IGP reachability of loopbacks is the foundation. When BGP or LDP will not come up, check the IGP route to the peer loopback first.</p></div>

<div class="iv"><p class="q">"Why do service providers often prefer IS-IS to OSPF in the core?"</p><p>IS-IS runs directly over layer 2, so adjacency does not depend on IP addressing, it extends easily through TLVs (IPv6, TE, SR), it is not tied to a special backbone area, and it scales well in a single level. Be fair: OSPF is also used widely, and the real answer is often legacy and team skill.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The core IGP carries only loopbacks and infrastructure links.</li>
<li>BGP, LDP and VPN next hops are built between loopbacks.</li>
<li>IS-IS runs on layer 2 and uses TLVs, which makes it very extensible.</li>
<li>IOS gives IS-IS interfaces a default metric of 10 and a distance of 115.</li>
<li>ECMP installs several equal-cost next hops and uses all links.</li>
</ul></div>
`,hi:`
<p>MPLS, VPNs ya BGP kaam kar sakein, usse pehle core ka har router doosre har router tak pahunch paana chahiye. Yeh <b>IGP</b> (Interior Gateway Protocol) ka kaam hai. Provider mein IGP ka task chhota hota hai: <b>loopback addresses</b> aur <b>routers ke beech links</b> le jaana, aur kuch nahi. CCNA aur ENARSI se aap OSPF jaante ho. Providers aksar uski jagah <b>IS-IS</b> chunte hain, aur SPCOR dono test karta hai.</p>

<h3>Loopbacks sab kuch ke centre mein kyun hain</h3>
<p>Loopback interface tab tak down nahi hota jab tak router khud down na ho. BGP sessions, LDP sessions aur VPN next hops sab loopbacks ke beech bante hain, isliye jab tak doosra path hai ek link ke fail hone par bhi woh bache rehte hain. Aam numbering plan har router ko /32 loopback deta hai, jaise PE1 10.0.255.1, P1 10.0.255.2.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="IGP loopbacks le jaata hai">
<circle cx="90" cy="100" r="34" fill="#bbf7d0"/><text x="90" y="96" text-anchor="middle" class="svg-ink" font-size="13">PE1</text><text x="90" y="112" text-anchor="middle" class="svg-muted" font-size="11">lo 10.0.255.1</text>
<circle cx="260" cy="100" r="34" fill="#fde68a"/><text x="260" y="96" text-anchor="middle" class="svg-ink" font-size="13">P1</text><text x="260" y="112" text-anchor="middle" class="svg-muted" font-size="11">lo 10.0.255.2</text>
<circle cx="430" cy="100" r="34" fill="#fde68a"/><text x="430" y="96" text-anchor="middle" class="svg-ink" font-size="13">P2</text><text x="430" y="112" text-anchor="middle" class="svg-muted" font-size="11">lo 10.0.255.3</text>
<circle cx="580" cy="100" r="34" fill="#bbf7d0"/><text x="580" y="96" text-anchor="middle" class="svg-ink" font-size="13">PE2</text><text x="580" y="112" text-anchor="middle" class="svg-muted" font-size="11">lo 10.0.255.4</text>
<g stroke="#64748b" stroke-width="2"><line x1="124" y1="100" x2="226" y2="100"/><line x1="294" y1="100" x2="396" y2="100"/><line x1="464" y1="100" x2="546" y2="100"/></g>
<text x="175" y="90" text-anchor="middle" class="svg-muted" font-size="11">10.0.12.0/24</text><text x="345" y="90" text-anchor="middle" class="svg-muted" font-size="11">10.0.23.0/24</text><text x="505" y="90" text-anchor="middle" class="svg-muted" font-size="11">10.0.34.0/24</text>
<text x="320" y="175" text-anchor="middle" class="svg-accent" font-size="12">IGP sirf loopbacks aur core links le jaata hai; customer LANs bahar</text>
</svg><p class="cap">Core router ki IGP table sirf loopbacks aur point-to-point links hoti hai.</p></div>

<h3>IS-IS aur OSPF saath-saath</h3>
<table class="cmp"><tr><th>Feature</th><th>OSPF</th><th>IS-IS</th></tr>
<tr><td>Kis par chalta hai</td><td>IP (protocol 89)</td><td>Seedha data link par (CLNS)</td></tr>
<tr><td>Router identity</td><td>Router ID (IPv4 style)</td><td>NET: area plus system ID</td></tr>
<tr><td>Area border</td><td>Router ke andar (ABR)</td><td>Routers ke beech link par</td></tr>
<tr><td>Extensibility</td><td>Naye LSA types</td><td>Wahi PDUs mein naye TLVs</td></tr>
<tr><td>IOS par default metric</td><td>Bandwidth-based cost</td><td>Har link 10</td></tr></table>
<p>Providers IS-IS isliye pasand karte hain kyunki use extend karna aasaan hai (IPv6, traffic engineering aur segment routing TLVs ki tarah aate hain), adjacency banane ke liye woh IP addressing par depend nahi karta, aur bade single-level cores ek jaana-pehchana design hain. Is course ke agle do modules IS-IS ko zero se design depth tak le jaate hain.</p>

<h3>Kaam karta hua core IGP kaisa dikhta hai</h3>
<p>Yeh spcor-isis module ke lab ka real output hai: chaar routers, R1 aur R4 alag areas mein, R2 aur R3 border routers. R2 par neighbours:</p>
<pre class="out">R2# show isis neighbors
Tag null:
System Id       Type Interface     IP Address      State Holdtime Circuit Id
R1              L1   Gi0/0         10.1.12.1       <span class="hl">UP</span>    27       00
R3              L2   Gi0/1         10.1.23.3       <span class="hl">UP</span>    27       00</pre>
<p>Aur R3 ne jo routes seekhe, har ek protocol code aur level, administrative distance 115 aur metric ke saath:</p>
<pre class="out">R3# show ip route isis
...
      1.0.0.0/32 is subnetted, 1 subnets
i L2     1.1.1.1 [<span class="hl">115/20</span>] via 10.1.23.2, 00:00:28, GigabitEthernet0/1
      2.0.0.0/32 is subnetted, 1 subnets
i L2     2.2.2.2 [115/10] via 10.1.23.2, 00:00:28, GigabitEthernet0/1
      4.0.0.0/32 is subnetted, 1 subnets
i L1     4.4.4.4 [115/10] via 10.1.34.4, 00:00:28, GigabitEthernet0/0</pre>
<p>Left se right padho: <code>i</code> matlab IS-IS, <code>L1</code>/<code>L2</code> level, <code>115</code> administrative distance, <code>20</code> total metric (10 ke do links).</p>

<div class="eg"><p><b>Worked example.</b> PE1 ko PE2 ke loopback 10.0.255.4 tak pahunchna hai. IGP mein akele path par metric 10 ke teen links hain, isliye cost 30 hai aur router next hop P1 ke saath route install karta hai. Agar same cost ka doosra path hota to dono next hops install hote: yeh <b>ECMP</b> hai, equal-cost multipath, jis par providers apna saara fibre use karne ke liye depend karte hain.</p></div>

<div class="warn"><p><b>Common mistake.</b> IGP ko customer-facing interfaces par chalana. <code>passive-interface</code> use karo (ya prefix adjacency banaye bina advertise karo) taaki customer aapke core ke saath routing adjacency shuru na kar sake.</p></div>
<div class="exam"><p><b>Exam trap.</b> IGP customer routes ya poori internet table ki jagah nahi hai. Agar sawal mein hazaron customer prefixes IGP mein hain, to jawab hai unhe BGP mein le jaana.</p></div>

<div class="scn"><h4>Woh loopback jo advertise nahi hua</h4><p>Naya PE up hua aur route reflector ke saath uska BGP session Idle hi raha. Interface up tha aur physical link theek tha. Engineer ne reflector ke loopback ke liye <code>show ip route</code> chalaya aur koi route nahi mila: Loopback0 IGP mein enable nahi tha, isliye kisi ko use tak pahunchne ka tareeka nahi pata tha. Loopback0 par <code>ip router isis</code> lagane ke baad session kuch seconds mein establish ho gaya.</p><p><b>Lesson:</b> loopbacks ki IGP reachability buniyaad hai. BGP ya LDP up na ho to sabse pehle peer loopback ka IGP route check karo.</p></div>

<div class="iv"><p class="q">"Service providers core mein aksar OSPF ki jagah IS-IS kyun pasand karte hain?"</p><p>IS-IS seedha layer 2 par chalta hai, isliye adjacency IP addressing par depend nahi karti, TLVs se aasaani se extend hota hai (IPv6, TE, SR), kisi special backbone area se bandha nahi hai, aur single level mein achha scale karta hai. Fair raho: OSPF bhi bahut use hota hai, aur asli jawab aksar legacy aur team ki skill hota hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Core IGP sirf loopbacks aur infrastructure links le jaata hai.</li>
<li>BGP, LDP aur VPN next hops loopbacks ke beech bante hain.</li>
<li>IS-IS layer 2 par chalta hai aur TLVs use karta hai, isliye bahut extensible hai.</li>
<li>IOS IS-IS interfaces ko default metric 10 aur distance 115 deta hai.</li>
<li>ECMP kai equal-cost next hops install karta hai aur saare links use karta hai.</li>
</ul></div>
`}};export{e as default};