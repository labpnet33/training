var e={id:`ospf-lab`,h:{en:`Configuring OSPF: Lab 2 and the link failure`,hi:`OSPF configure karna: Lab 2 aur link failure`},body:{en:`
<p>Now you will turn theory into a working network. Lab 2 is a triangle of three routers. R1 serves LAN 192.168.1.0/24, R2 serves 192.168.2.0/24, and R3 sits between them as an alternative path. You will enable OSPF on all three, verify the routes, then cut the R1-R2 link and watch OSPF move traffic through R3 on its own.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab 2 OSPF triangle">
<rect x="10" y="30" width="90" height="40" rx="8" fill="#e2e8f0"/><text x="55" y="55" text-anchor="middle" class="svg-ink" font-size="13">PC1 .10</text>
<rect x="160" y="30" width="100" height="40" rx="8" fill="#bae6fd"/><text x="210" y="55" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="380" y="30" width="100" height="40" rx="8" fill="#bae6fd"/><text x="430" y="55" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="540" y="30" width="90" height="40" rx="8" fill="#e2e8f0"/><text x="585" y="55" text-anchor="middle" class="svg-ink" font-size="13">PC2 .10</text>
<rect x="270" y="180" width="100" height="40" rx="8" fill="#bae6fd"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<line x1="100" y1="50" x2="160" y2="50" stroke="#64748b" stroke-width="2"/><line x1="480" y1="50" x2="540" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="50" x2="380" y2="50" stroke="#64748b" stroke-width="3"/>
<line x1="210" y1="70" x2="300" y2="180" stroke="#64748b" stroke-width="2"/><line x1="430" y1="70" x2="340" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.0/30</text>
<text x="175" y="140" class="svg-muted" font-size="12">10.0.13.0/30</text>
<text x="395" y="140" class="svg-muted" font-size="12">10.0.23.0/30</text>
<text x="55" y="95" text-anchor="middle" class="svg-muted" font-size="12">192.168.1.0/24</text>
<text x="585" y="95" text-anchor="middle" class="svg-muted" font-size="12">192.168.2.0/24</text>
<text x="320" y="75" text-anchor="middle" class="svg-accent" font-size="12">cut this link</text>
</svg><p class="cap">All links are GigabitEthernet (cost 1). R1 Gi0/0 faces R2, Gi0/1 faces R3, Gi0/2 is the LAN.</p></div>

<h3>The configuration</h3>
<pre class="code"><span class="c">! identical on R1, R2 and R3</span>
enable
configure terminal
router ospf 1
 network 10.0.0.0 0.255.255.255 area 0
 network 192.168.0.0 0.0.255.255 area 0
end</pre>
<dl class="terms">
<dt>router ospf 1</dt><dd>Starts OSPF process 1. The process ID is local to the router; neighbours do not need the same number (but using the same one everywhere is tidy).</dd>
<dt>network ... wildcard ... area 0</dt><dd>Enables OSPF on every interface whose IP address matches the address and <b>wildcard mask</b>, and puts those interfaces in area 0. A wildcard is the inverse of a subnet mask: 0 bits must match, 1 bits are "don't care". 0.255.255.255 matches any 10.x.x.x address; 0.0.255.255 matches any 192.168.x.x.</dd>
</dl>
<p>The <code>network</code> command does not advertise "the network 10.0.0.0/8". It only selects interfaces; OSPF then advertises each selected interface's real subnet (10.0.12.0/30, 192.168.1.0/24 and so on). On current IOS you can instead enable OSPF per interface with <code>ip ospf 1 area 0</code>. In production you would also set a <code>router-id</code> and make LAN-only interfaces <code>passive-interface</code> so no hellos are sent toward hosts.</p>

<h3>Verification step 1: neighbours</h3>
<pre class="out">R1#show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
192.168.2.1       1   <span class="hl">FULL/DR</span>         00:00:36    10.0.12.2       GigabitEthernet0/0
10.0.23.2         1   <span class="hl">FULL/BDR</span>        00:00:33    10.0.13.2       GigabitEthernet0/1</pre>
<p>Two neighbours, both FULL. The Neighbor ID column shows router IDs (R2 is 192.168.2.1, R3 is 10.0.23.2), while Address shows the neighbour's IP on the shared link. DR/BDR roles depend on router IDs and on which router started first, so your roles may differ; FULL is what matters.</p>

<h3>Verification step 2: routes</h3>
<pre class="out">R1#show ip route ospf
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
O        10.0.23.0/30 [110/2] via 10.0.13.2, 00:00:41, GigabitEthernet0/1
                      [110/2] via 10.0.12.2, 00:00:41, GigabitEthernet0/0
<span class="hl">O     192.168.2.0/24 [110/2] via 10.0.12.2, 00:00:41, GigabitEthernet0/0</span></pre>
<p>R1 learned R2's LAN with AD <b>110</b> and cost <b>2</b>, next hop R2 (10.0.12.2). The R2-R3 link has two equal-cost paths (ECMP). Now PC1 pings PC2:</p>
<pre class="out">PC1&gt; ping 192.168.2.10
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5)</pre>

<h3>The fibre cut</h3>
<p>Simulate the failure by shutting R1's interface toward R2:</p>
<pre class="code"><span class="c">! on R1</span>
configure terminal
interface GigabitEthernet0/0
 shutdown
end</pre>
<pre class="out">%LINK-5-CHANGED: Interface GigabitEthernet0/0, changed state to administratively down
<span class="hl">%OSPF-5-ADJCHG: Process 1, Nbr 192.168.2.1 on GigabitEthernet0/0 from FULL to DOWN, Neighbor Down: Interface down or detached</span></pre>
<p>Because the interface itself went down, OSPF did not wait 40 seconds for the dead timer: it dropped the neighbour at once, flooded a new router LSA, and every router ran SPF again.</p>
<pre class="out">R1#show ip route
      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
C        10.0.13.0/30 is directly connected, GigabitEthernet0/1
L        10.0.13.1/32 is directly connected, GigabitEthernet0/1
O        10.0.23.0/30 [110/2] via 10.0.13.2, 00:00:08, GigabitEthernet0/1
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.1.0/24 is directly connected, GigabitEthernet0/2
L        192.168.1.1/32 is directly connected, GigabitEthernet0/2
<span class="hl">O     192.168.2.0/24 [110/3] via 10.0.13.2, 00:00:08, GigabitEthernet0/1</span></pre>
<p>The answer to the last lab task is the new next hop: <b>10.0.13.2</b> (R3). The cost rose from 2 to 3 because the path now crosses one more link. PC1 still reaches PC2.</p>

<div class="eg"><p><b>Worked example: traceroute before and after.</b> Before the cut, PC1 to 192.168.2.10 shows hops 192.168.1.1 (R1), 10.0.12.2 (R2), then 192.168.2.10. After the cut it shows 192.168.1.1 (R1), 10.0.13.2 (R3), 10.0.23.1 (R2), then 192.168.2.10. One extra hop, zero configuration changes. Bring Gi0/0 back with <code>no shutdown</code> and the cost-2 path returns automatically.</p></div>

<h3>Other useful checks</h3>
<pre class="code">show ip protocols               <span class="c">! router ID, networks, neighbours, AD</span>
show ip ospf interface brief    <span class="c">! which interfaces run OSPF, area, cost, state</span>
show ip ospf database           <span class="c">! the LSDB</span></pre>

<div class="warn"><p><b>Common mistakes.</b> Forgetting the <code>network</code> statement for the LAN (neighbours form, but the LAN is never advertised), using a subnet mask instead of a wildcard (255.0.0.0 instead of 0.255.255.255), putting the two ends of a link in different areas, and configuring OSPF on only two of three routers, which leaves the backup path unusable.</p></div>

<div class="exam"><p><b>Exam trap.</b> The OSPF process ID does not have to match between neighbours; the area does. And the <code>network</code> command matches interfaces, it does not define what is advertised with that exact mask.</p></div>

<div class="scn"><h4>The backup path that was never there</h4><p>A company built a triangle exactly like Lab 2 so that the plant would survive a fibre cut. When a digger cut the fibre, the plant went offline anyway. The engineer found that R3, the backup router, had OSPF configured for its 10.x links in area 1 instead of area 0 because of a typo. R3 never formed neighbours, so R1 had no alternative path in its database. After fixing the area and re-testing with a planned <code>shutdown</code>, the failover took under a second.</p><p><b>Lesson:</b> redundancy you have not tested is only a diagram. Simulate the failure, check the new next hop and the traceroute.</p></div>

<div class="iv"><p class="q">"How do you verify OSPF is working, and what do you expect to see after a link fails?"</p><p>Strong answer: <code>show ip ospf neighbor</code> for FULL adjacencies, <code>show ip route ospf</code> for O routes with [110/cost], <code>show ip protocols</code> for router ID and networks, and an end-to-end ping and traceroute. After a failure, the adjacency on that link goes from FULL to DOWN (immediately if the interface drops, after the dead interval otherwise), SPF reruns, and the route moves to the next-best next hop with a higher cost. Quote the Lab 2 numbers: [110/2] via 10.0.12.2 becomes [110/3] via 10.0.13.2.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>router ospf 1</code> plus <code>network address wildcard area 0</code> enables OSPF on matching interfaces.</li>
<li>Wildcard masks are inverted subnet masks; the network command selects interfaces, not advertised prefixes.</li>
<li>Verify with <code>show ip ospf neighbor</code> (FULL), <code>show ip route ospf</code> (O, [110/cost]) and traceroute.</li>
<li>When a link fails, OSPF reconverges automatically onto the next-best path with a higher cost.</li>
<li>Always test failover deliberately before a real failure does it for you.</li>
</ul></div>
`,hi:`
<p>Ab aap theory ko ek chalte hue network mein badloge. Lab 2 teen routers ka triangle hai. R1 LAN 192.168.1.0/24 serve karta hai, R2 192.168.2.0/24 serve karta hai, aur R3 unke beech alternative path ki tarah baitha hai. Aap teeno par OSPF enable karoge, routes verify karoge, phir R1-R2 link kaatoge aur OSPF ko khud traffic R3 ke through le jaate dekhoge.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Lab 2 OSPF triangle">
<rect x="10" y="30" width="90" height="40" rx="8" fill="#e2e8f0"/><text x="55" y="55" text-anchor="middle" class="svg-ink" font-size="13">PC1 .10</text>
<rect x="160" y="30" width="100" height="40" rx="8" fill="#bae6fd"/><text x="210" y="55" text-anchor="middle" class="svg-ink" font-size="14">R1</text>
<rect x="380" y="30" width="100" height="40" rx="8" fill="#bae6fd"/><text x="430" y="55" text-anchor="middle" class="svg-ink" font-size="14">R2</text>
<rect x="540" y="30" width="90" height="40" rx="8" fill="#e2e8f0"/><text x="585" y="55" text-anchor="middle" class="svg-ink" font-size="13">PC2 .10</text>
<rect x="270" y="180" width="100" height="40" rx="8" fill="#bae6fd"/><text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="14">R3</text>
<line x1="100" y1="50" x2="160" y2="50" stroke="#64748b" stroke-width="2"/><line x1="480" y1="50" x2="540" y2="50" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="50" x2="380" y2="50" stroke="#64748b" stroke-width="3"/>
<line x1="210" y1="70" x2="300" y2="180" stroke="#64748b" stroke-width="2"/><line x1="430" y1="70" x2="340" y2="180" stroke="#64748b" stroke-width="2"/>
<text x="320" y="40" text-anchor="middle" class="svg-muted" font-size="12">10.0.12.0/30</text>
<text x="175" y="140" class="svg-muted" font-size="12">10.0.13.0/30</text>
<text x="395" y="140" class="svg-muted" font-size="12">10.0.23.0/30</text>
<text x="55" y="95" text-anchor="middle" class="svg-muted" font-size="12">192.168.1.0/24</text>
<text x="585" y="95" text-anchor="middle" class="svg-muted" font-size="12">192.168.2.0/24</text>
<text x="320" y="75" text-anchor="middle" class="svg-accent" font-size="12">yeh link kaato</text>
</svg><p class="cap">Saare links GigabitEthernet hain (cost 1). R1 Gi0/0 R2 ki taraf, Gi0/1 R3 ki taraf, Gi0/2 LAN hai.</p></div>

<h3>Configuration</h3>
<pre class="code"><span class="c">! R1, R2 aur R3 par same</span>
enable
configure terminal
router ospf 1
 network 10.0.0.0 0.255.255.255 area 0
 network 192.168.0.0 0.0.255.255 area 0
end</pre>
<dl class="terms">
<dt>router ospf 1</dt><dd>OSPF process 1 start karta hai. Process ID router ke liye local hai; neighbours ka same number hona zaroori nahi (lekin har jagah same rakhna saaf-suthra hai).</dd>
<dt>network ... wildcard ... area 0</dt><dd>Har us interface par OSPF enable karta hai jiska IP address, address aur <b>wildcard mask</b> se match kare, aur un interfaces ko area 0 mein daalta hai. Wildcard subnet mask ka ulta hai: 0 bits match hone chahiye, 1 bits "don't care" hain. 0.255.255.255 koi bhi 10.x.x.x address match karta hai; 0.0.255.255 koi bhi 192.168.x.x.</dd>
</dl>
<p><code>network</code> command "network 10.0.0.0/8" advertise nahi karti. Yeh sirf interfaces select karti hai; phir OSPF har selected interface ka asli subnet advertise karta hai (10.0.12.0/30, 192.168.1.0/24 waghairah). Current IOS par aap iske bajaye har interface par <code>ip ospf 1 area 0</code> se OSPF enable kar sakte ho. Production mein aap <code>router-id</code> bhi set karoge aur sirf-LAN wale interfaces ko <code>passive-interface</code> banaoge taaki hosts ki taraf hellos na jaayein.</p>

<h3>Verification step 1: neighbours</h3>
<pre class="out">R1#show ip ospf neighbor

Neighbor ID     Pri   State           Dead Time   Address         Interface
192.168.2.1       1   <span class="hl">FULL/DR</span>         00:00:36    10.0.12.2       GigabitEthernet0/0
10.0.23.2         1   <span class="hl">FULL/BDR</span>        00:00:33    10.0.13.2       GigabitEthernet0/1</pre>
<p>Do neighbours, dono FULL. Neighbor ID column router IDs dikhata hai (R2 192.168.2.1 hai, R3 10.0.23.2), jabki Address shared link par neighbour ka IP dikhata hai. DR/BDR roles router IDs aur is baat par depend karte hain ki kaunsa router pehle start hua, isliye aapke roles alag ho sakte hain; matter FULL karta hai.</p>

<h3>Verification step 2: routes</h3>
<pre class="out">R1#show ip route ospf
      10.0.0.0/8 is variably subnetted, 5 subnets, 2 masks
O        10.0.23.0/30 [110/2] via 10.0.13.2, 00:00:41, GigabitEthernet0/1
                      [110/2] via 10.0.12.2, 00:00:41, GigabitEthernet0/0
<span class="hl">O     192.168.2.0/24 [110/2] via 10.0.12.2, 00:00:41, GigabitEthernet0/0</span></pre>
<p>R1 ne R2 ka LAN AD <b>110</b> aur cost <b>2</b> ke saath seekha, next hop R2 (10.0.12.2). R2-R3 link ke do equal-cost paths hain (ECMP). Ab PC1 PC2 ko ping karta hai:</p>
<pre class="out">PC1&gt; ping 192.168.2.10
<span class="hl">!!!!!</span>
Success rate is 100 percent (5/5)</pre>

<h3>Fibre cut</h3>
<p>R1 ka R2 ki taraf wala interface shut karke failure simulate karo:</p>
<pre class="code"><span class="c">! R1 par</span>
configure terminal
interface GigabitEthernet0/0
 shutdown
end</pre>
<pre class="out">%LINK-5-CHANGED: Interface GigabitEthernet0/0, changed state to administratively down
<span class="hl">%OSPF-5-ADJCHG: Process 1, Nbr 192.168.2.1 on GigabitEthernet0/0 from FULL to DOWN, Neighbor Down: Interface down or detached</span></pre>
<p>Kyunki interface khud down hua, OSPF ne dead timer ke 40 second ka wait nahi kiya: usne neighbour ko turant hataya, naya router LSA flood kiya, aur har router ne SPF dobara chalaya.</p>
<pre class="out">R1#show ip route
      10.0.0.0/8 is variably subnetted, 3 subnets, 2 masks
C        10.0.13.0/30 is directly connected, GigabitEthernet0/1
L        10.0.13.1/32 is directly connected, GigabitEthernet0/1
O        10.0.23.0/30 [110/2] via 10.0.13.2, 00:00:08, GigabitEthernet0/1
      192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
C        192.168.1.0/24 is directly connected, GigabitEthernet0/2
L        192.168.1.1/32 is directly connected, GigabitEthernet0/2
<span class="hl">O     192.168.2.0/24 [110/3] via 10.0.13.2, 00:00:08, GigabitEthernet0/1</span></pre>
<p>Lab ke aakhri task ka jawab naya next hop hai: <b>10.0.13.2</b> (R3). Cost 2 se 3 ho gayi kyunki path ab ek aur link cross karta hai. PC1 ab bhi PC2 tak pahunchta hai.</p>

<div class="eg"><p><b>Worked example: pehle aur baad ka traceroute.</b> Cut se pehle PC1 se 192.168.2.10 tak hops 192.168.1.1 (R1), 10.0.12.2 (R2), phir 192.168.2.10 dikhte hain. Cut ke baad 192.168.1.1 (R1), 10.0.13.2 (R3), 10.0.23.1 (R2), phir 192.168.2.10 dikhte hain. Ek extra hop, zero configuration changes. <code>no shutdown</code> se Gi0/0 wapas laao aur cost-2 path apne aap laut aata hai.</p></div>

<h3>Doosre kaam ke checks</h3>
<pre class="code">show ip protocols               <span class="c">! router ID, networks, neighbours, AD</span>
show ip ospf interface brief    <span class="c">! kaunse interfaces OSPF chalate hain, area, cost, state</span>
show ip ospf database           <span class="c">! LSDB</span></pre>

<div class="warn"><p><b>Common galtiyan.</b> LAN ke liye <code>network</code> statement bhoolna (neighbours bante hain, lekin LAN kabhi advertise nahi hota), wildcard ki jagah subnet mask use karna (0.255.255.255 ki jagah 255.0.0.0), link ke dono ends ko alag areas mein daalna, aur teen mein se sirf do routers par OSPF configure karna, jisse backup path bekaar ho jaata hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Neighbours ke beech OSPF process ID match hona zaroori nahi; area match hona zaroori hai. Aur <code>network</code> command interfaces match karti hai, yeh define nahi karti ki usi exact mask ke saath kya advertise hoga.</p></div>

<div class="scn"><h4>Backup path jo kabhi tha hi nahi</h4><p>Ek company ne bilkul Lab 2 jaisa triangle banaya taaki plant fibre cut jhel sake. Jab ek JCB ne fibre kaata, plant phir bhi offline ho gaya. Engineer ne dekha ki backup router R3 par typo ki wajah se 10.x links ke liye OSPF area 0 ki jagah area 1 mein configure tha. R3 ne kabhi neighbours nahi banaye, isliye R1 ke database mein koi alternative path tha hi nahi. Area theek karne aur planned <code>shutdown</code> se dobara test karne ke baad failover ek second se kam mein hua.</p><p><b>Seekh:</b> jo redundancy test nahi ki woh sirf diagram hai. Failure simulate karo, naya next hop aur traceroute check karo.</p></div>

<div class="iv"><p class="q">"Aap kaise verify karte ho ki OSPF kaam kar raha hai, aur link fail hone ke baad kya dekhne ki ummeed karte ho?"</p><p>Strong answer: FULL adjacencies ke liye <code>show ip ospf neighbor</code>, [110/cost] wale O routes ke liye <code>show ip route ospf</code>, router ID aur networks ke liye <code>show ip protocols</code>, aur end-to-end ping aur traceroute. Failure ke baad us link ki adjacency FULL se DOWN jaati hai (interface girne par turant, warna dead interval ke baad), SPF dobara chalta hai, aur route zyada cost ke saath agle best next hop par chala jaata hai. Lab 2 ke numbers bolo: [110/2] via 10.0.12.2 badal kar [110/3] via 10.0.13.2 ho jaata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>router ospf 1</code> plus <code>network address wildcard area 0</code> matching interfaces par OSPF enable karta hai.</li>
<li>Wildcard masks ulte subnet masks hain; network command interfaces select karti hai, advertised prefixes nahi.</li>
<li><code>show ip ospf neighbor</code> (FULL), <code>show ip route ospf</code> (O, [110/cost]) aur traceroute se verify karo.</li>
<li>Link fail hone par OSPF apne aap zyada cost wale agle best path par reconverge karta hai.</li>
<li>Asli failure se pehle hamesha failover ko jaan-boojh kar test karo.</li>
</ul></div>
`}};export{e as default};