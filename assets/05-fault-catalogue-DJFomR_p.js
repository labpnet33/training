var e={id:`fault-catalogue`,h:{en:`The fault catalogue: symptom, evidence, fix`,hi:`Fault catalogue: symptom, evidence, fix`},body:{en:`
<p>Most multicast outages are one of about eight faults. Learn them as a catalogue: for each one, the <b>symptom</b> you see, the <b>evidence</b> that proves it and the smallest <b>fix</b>. With the catalogue in your head, the layered method of the last chapter becomes fast.</p>

<table class="cmp"><tr><th>#</th><th>Fault</th><th>Symptom and evidence</th><th>Fix</th></tr>
<tr><td>1</td><td>No <code>ip multicast-routing</code></td><td>The router has no PIM neighbours at all; IOS warns that multicast packets will not be forwarded</td><td><code>ip multicast-routing</code> globally</td></tr>
<tr><td>2</td><td>PIM missing on an interface</td><td>Interface absent from <code>show ip pim interface</code>; neighbour count 0 on a link</td><td><code>ip pim sparse-mode</code> on that interface</td></tr>
<tr><td>3</td><td>Wrong or unreachable RP</td><td><code>show ip pim rp mapping</code> lists an address that differs from the rest, or <code>RP 0.0.0.0</code> in the mroute</td><td>Correct the <code>ip pim rp-address</code></td></tr>
<tr><td>4</td><td>RPF failure</td><td>Incoming interface Null; <code>show ip rpf</code> says PIM is not enabled on the RPF interface</td><td>PIM on the unicast path, or <code>ip mroute</code></td></tr>
<tr><td>5</td><td>TTL too small</td><td>Source LAN works, nothing beyond the first router</td><td>Raise the application TTL</td></tr>
<tr><td>6</td><td>ACL or boundary</td><td>Hellos or the group blocked on a link</td><td>Permit PIM (protocol 103) and the group</td></tr>
<tr><td>7</td><td>IGMP version mismatch</td><td>Receiver joins but the router shows no group, or an SSM join is ignored</td><td>Set <code>ip igmp version 3</code> on the LAN</td></tr>
<tr><td>8</td><td>Empty OIL</td><td>Flag P, no Forward lines</td><td>Find why nobody downstream joined</td></tr></table>

<h3>1 and 2: the switches that were never turned on</h3>
<p>These are the cheapest faults and the most common after a new build. Without <code>ip multicast-routing</code> the router ignores PIM completely. Without <code>ip pim sparse-mode</code> on an interface, there is no Hello, no IGMP on a LAN and no join on a WAN link. The capstone's Pune branch is exactly this: its receiver LAN interface was missing from the PIM interface list, so the PC's join was never heard.</p>

<h3>3: wrong or unreachable RP</h3>
<p>One typo in an RP address (10.1.255.9 instead of 10.1.255.1) is enough. The router happily builds a (*,G) toward an address that nobody owns. The symptom is a (*,G) with the right group but an RP that differs from every neighbour. Always compare the RP line across routers, and check that the RP address is reachable in the unicast table.</p>

<h3>4: RPF failure, the subtle one</h3>
<p>This fault has two flavours. <b>PIM is off on the RPF interface</b>: joins cannot leave. <b>RPF points the wrong way</b>: the join leaves, but the data arrives on another interface and is dropped. Either way the router shows <code>Null</code> or a stale entry. The repair is either PIM on the unicast best path or a static multicast route. Prefer the static route when the unicast path belongs to someone else (a carrier backup, an Internet circuit).</p>
<pre class="code"><span class="c">! Branch router: unicast prefers the Internet circuit, multicast must use the MPLS circuit</span>
ip mroute 192.0.2.1 255.255.255.255 10.0.4.1
ip mroute 198.51.100.0 255.255.255.0 10.0.4.1</pre>

<h3>5: TTL 1</h3>
<p>Many applications send multicast with a TTL of 1 by default, which never leaves the LAN. Each router decrements the TTL, so a packet needs a TTL larger than the number of router hops. On the simulator PC the TTL can be set when sending: <code>mcast 239.77.1.1 10 ttl 1</code> reaches only the source LAN, while the default (32) crosses the network.</p>

<h3>6: ACL or boundary</h3>
<p>An interface ACL that denies protocol 103 (PIM) or the group address silently breaks one link. A multicast boundary (<code>ip multicast boundary</code>) is meant to stop groups at a site edge and is also a classic cause of "works inside, not across". The simulator does not model boundaries, but the evidence on a real router is the same: the neighbour is up and the group is simply not forwarded on that interface.</p>

<h3>7: IGMP version</h3>
<p>A receiver speaking IGMPv3 INCLUDE (a source-specific join) to a router configured for version 2 is ignored; SSM needs version 3 on the LAN. Check <code>show ip igmp interface</code>.</p>

<h3>8: empty OIL</h3>
<p>A (*,G) or (S,G) with the P flag and no Forward lines is not a fault in itself but a symptom: nothing downstream asked for the group. Move one hop toward the receiver and repeat.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Applying fix 4 with <code>ip route</code>, which changes unicast too. (2) Pointing the static multicast route at an interface without PIM. (3) Fixing the RPF toward the RP and forgetting the RPF toward the source, so the shared tree works but the source tree never builds.</p></div>
<div class="exam"><p><b>Exam trap.</b> "A static multicast route fixes a missing RP." No. <code>ip mroute</code> changes how RPF is calculated, not which RP the router uses.</p></div>

<div class="scn"><h4>Fault 3 and fault 4 in one tree</h4><p>Two warehouses lost the morning briefing at the same time. At warehouse A the router listed an RP address with a single wrong digit. At warehouse B the RP was correct, but an OSPF cost left over from a cable test made unicast prefer a carrier cable without PIM. The same symptom, two catalogue entries. The engineer fixed A with one line, B with two <code>ip mroute</code> lines, and checked both with <code>show ip mroute</code>.</p><p><b>Lesson:</b> never stop after the first fix. Re-test every receiver.</p></div>

<div class="iv"><p class="q">"A stream works inside the head office but not at any branch. What do you check?"</p><p>First the TTL, because a TTL of 1 is the classic cause; then PIM on the WAN links, the RP, the RPF toward the source on the branch routers, and finally any ACL or multicast boundary at the site edge. Naming TTL first shows experience.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Eight catalogue faults explain most outages: routing off, PIM missing, wrong RP, RPF, TTL, ACL or boundary, IGMP version, empty OIL.</li>
<li>For each, learn the symptom, the one show command that proves it and the smallest fix.</li>
<li>Typos in RP addresses are as common as protocol problems.</li>
<li>Prefer <code>ip mroute</code> when the unicast path is owned by someone else.</li>
<li>After each fix, re-test every receiver: faults come in groups.</li>
</ul></div>
`,hi:`
<p>Zyadatar multicast outages kareeb aath faults mein se ek hote hain. Inhe catalogue ki tarah seekho: har ek ke liye woh <b>symptom</b> jo aap dekhte ho, woh <b>evidence</b> jo use prove karta hai aur sabse chhota <b>fix</b>. Catalogue dimaag mein ho to pichhle chapter ka layered method tez ho jaata hai.</p>

<table class="cmp"><tr><th>#</th><th>Fault</th><th>Symptom aur evidence</th><th>Fix</th></tr>
<tr><td>1</td><td><code>ip multicast-routing</code> nahi</td><td>Router ke paas koi PIM neighbour hi nahi; IOS warn karta hai ki multicast packets forward nahi honge</td><td>Global mein <code>ip multicast-routing</code></td></tr>
<tr><td>2</td><td>Interface par PIM missing</td><td>Interface <code>show ip pim interface</code> mein nahi; link par neighbour count 0</td><td>Us interface par <code>ip pim sparse-mode</code></td></tr>
<tr><td>3</td><td>Galat ya unreachable RP</td><td><code>show ip pim rp mapping</code> mein baaki se alag address, ya mroute mein <code>RP 0.0.0.0</code></td><td><code>ip pim rp-address</code> theek karo</td></tr>
<tr><td>4</td><td>RPF failure</td><td>Incoming interface Null; <code>show ip rpf</code> kehta hai RPF interface par PIM enabled nahi</td><td>Unicast path par PIM, ya <code>ip mroute</code></td></tr>
<tr><td>5</td><td>TTL bahut chhota</td><td>Source LAN chalta hai, pehle router ke aage kuch nahi</td><td>Application ka TTL badhao</td></tr>
<tr><td>6</td><td>ACL ya boundary</td><td>Hellos ya group ek link par blocked</td><td>PIM (protocol 103) aur group permit karo</td></tr>
<tr><td>7</td><td>IGMP version mismatch</td><td>Receiver join karta hai par router ko group nahi dikhta, ya SSM join ignore hota hai</td><td>LAN par <code>ip igmp version 3</code></td></tr>
<tr><td>8</td><td>Khaali OIL</td><td>Flag P, koi Forward line nahi</td><td>Pata karo neeche kisi ne join kyun nahi kiya</td></tr></table>

<h3>1 aur 2: woh switches jo kabhi on hi nahi hue</h3>
<p>Yeh sabse sasti faults hain aur naye build ke baad sabse aam. <code>ip multicast-routing</code> ke bina router PIM ko poori tarah ignore karta hai. Interface par <code>ip pim sparse-mode</code> ke bina Hello nahi, LAN par IGMP nahi aur WAN link par join nahi. Capstone ka Pune branch bilkul yahi hai: uska receiver LAN interface PIM interface list mein missing tha, isliye PC ka join suna hi nahi gaya.</p>

<h3>3: galat ya unreachable RP</h3>
<p>RP address mein ek typo (10.1.255.1 ki jagah 10.1.255.9) kaafi hai. Router khushi se aise address ki taraf (*,G) banata hai jiska koi malik nahi. Symptom hai sahi group wali (*,G) par aisa RP jo har neighbour se alag hai. Hamesha routers ke beech RP line compare karo, aur check karo ki RP address unicast table mein reachable hai.</p>

<h3>4: RPF failure, subtle wala</h3>
<p>Is fault ke do roop hain. <b>RPF interface par PIM off hai</b>: joins nikal nahi sakte. <b>RPF galat taraf point karta hai</b>: join nikalta hai, par data doosre interface par aata hai aur drop hota hai. Dono mein router <code>Null</code> ya stale entry dikhata hai. Repair ya to unicast best path par PIM hai ya static multicast route. Jab unicast path kisi aur ka ho (carrier backup, Internet circuit) to static route ko prefer karo.</p>
<pre class="code"><span class="c">! Branch router: unicast Internet circuit ko pasand karta hai, multicast ko MPLS circuit chahiye</span>
ip mroute 192.0.2.1 255.255.255.255 10.0.4.1
ip mroute 198.51.100.0 255.255.255.0 10.0.4.1</pre>

<h3>5: TTL 1</h3>
<p>Kai applications default mein multicast TTL 1 ke saath bhejti hain, jo LAN se bahar nahi jaata. Har router TTL ghatata hai, isliye packet ko router hops ki ginti se bada TTL chahiye. Simulator PC par bhejte waqt TTL set ho sakta hai: <code>mcast 239.77.1.1 10 ttl 1</code> sirf source LAN tak pahunchta hai, jabki default (32) poore network ko paar karta hai.</p>

<h3>6: ACL ya boundary</h3>
<p>Interface ACL jo protocol 103 (PIM) ya group address deny karta hai, ek link ko chupke se tod deta hai. Multicast boundary (<code>ip multicast boundary</code>) site edge par groups rokne ke liye hai aur "andar chalta hai, paar nahi" ka classic karan bhi. Simulator boundaries model nahi karta, par asli router par evidence wahi hai: neighbour up hai aur group us interface par bas forward nahi hota.</p>

<h3>7: IGMP version</h3>
<p>IGMPv3 INCLUDE (source-specific join) bolne wala receiver version 2 configured router ko ignore hota hai; SSM ko LAN par version 3 chahiye. <code>show ip igmp interface</code> check karo.</p>

<h3>8: khaali OIL</h3>
<p>P flag aur koi Forward line nahi wali (*,G) ya (S,G) khud fault nahi balki symptom hai: neeche kisi ne group nahi maanga. Receiver ki taraf ek hop aage badho aur dobara karo.</p>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Fix 4 ko <code>ip route</code> se lagana, jo unicast bhi badal deta hai. (2) Static multicast route ko aise interface par point karna jahan PIM nahi. (3) RP ki taraf RPF theek karke source ki taraf wala bhool jaana, jisse shared tree chalta hai par source tree kabhi nahi banta.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Static multicast route missing RP theek kar deta hai." Nahi. <code>ip mroute</code> RPF ki ganana badalta hai, yeh nahi ki router kaunsa RP use kare.</p></div>

<div class="scn"><h4>Fault 3 aur fault 4 ek hi tree mein</h4><p>Do warehouses ne ek saath morning briefing kho di. Warehouse A par router ne ek galat digit wala RP address dikhaya. Warehouse B par RP sahi tha, par cable test se bachi OSPF cost ne unicast ko carrier cable ki taraf mod diya jis par PIM nahi tha. Same symptom, catalogue ki do entries. Engineer ne A ko ek line se, B ko do <code>ip mroute</code> lines se theek kiya, aur dono ko <code>show ip mroute</code> se check kiya.</p><p><b>Lesson:</b> pehle fix ke baad kabhi mat ruko. Har receiver dobara test karo.</p></div>

<div class="iv"><p class="q">"Stream head office ke andar chalti hai par kisi branch mein nahi. Aap kya check karte ho?"</p><p>Pehle TTL, kyunki TTL 1 classic karan hai; phir WAN links par PIM, RP, branch routers par source ki taraf RPF, aur aakhir mein site edge par koi ACL ya multicast boundary. TTL pehle bolna experience dikhata hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Aath catalogue faults zyadatar outages samjhate hain: routing off, PIM missing, galat RP, RPF, TTL, ACL ya boundary, IGMP version, khaali OIL.</li>
<li>Har ek ke liye symptom, use prove karne wala ek show command aur sabse chhota fix seekho.</li>
<li>RP addresses mein typos protocol problems jitne hi aam hain.</li>
<li>Jab unicast path kisi aur ka ho to <code>ip mroute</code> prefer karo.</li>
<li>Har fix ke baad har receiver dobara test karo: faults jhund mein aate hain.</li>
</ul></div>
`}};export{e as default};