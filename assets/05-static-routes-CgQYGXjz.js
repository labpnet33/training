var e={id:`static-routes`,h:{en:`Static and default routes on Junos`,hi:`Junos par static aur default routes`},body:{en:`
<p>A <b>static route</b> is a route you type by hand. It never changes unless you change it, and it needs no protocol. That makes it simple, predictable and cheap on CPU, which is why it is used for small branches, stub networks and as a safety net. It does not adapt to failures, which is why large networks use dynamic protocols such as OSPF.</p>

<h3>Analogy: a printed road sign</h3>
<p>A static route is a printed road sign: "Hospital, turn left". It is always right as long as the road does not change. If the road is closed, the sign still points there. A dynamic protocol is a navigation app that reroutes when the road closes.</p>

<h3>Syntax</h3>
<p>Static routes live under <code>routing-options static</code>. In the hierarchy view and as set commands:</p>
<pre class="code">[edit routing-options static]
route 172.16.30.0/24 next-hop 10.1.23.2;
route 0.0.0.0/0 next-hop 10.1.12.2;

<span class="c">! the same as set commands</span>
set routing-options static route 172.16.30.0/24 next-hop 10.1.23.2
set routing-options static route 0.0.0.0/0 next-hop 10.1.12.2</pre>
<p>Reading the line: <code>route</code> is the destination prefix, <code>next-hop</code> is the IP address of the neighbour that should receive the packet. The next hop must be on a <b>directly connected subnet</b> (for example 10.1.12.2 is on R1's link 10.1.12.0/30). If it is not, the route stays hidden unless you add <code>resolve</code>, which makes Junos look up the next hop recursively.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Nagpur static routes">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="75" text-anchor="middle" class="svg-ink" font-size="13">R1 branch</text><text x="65" y="94" text-anchor="middle" class="svg-muted" font-size="11">192.168.10.0/24</text>
<rect x="265" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="13">R2 core</text><text x="320" y="94" text-anchor="middle" class="svg-muted" font-size="11">two specifics</text>
<rect x="520" y="50" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="75" text-anchor="middle" class="svg-ink" font-size="13">R3 data centre</text><text x="575" y="94" text-anchor="middle" class="svg-muted" font-size="11">172.16.30.0/24</text>
<line x1="120" y1="80" x2="265" y2="80" stroke="#64748b" stroke-width="2"/><line x1="375" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="192" y="70" text-anchor="middle" class="svg-muted" font-size="11">10.1.12.0/30</text><text x="447" y="70" text-anchor="middle" class="svg-muted" font-size="11">10.1.23.0/30</text>
<text x="192" y="104" text-anchor="middle" class="svg-accent" font-size="11">R1: 0/0 via .2</text><text x="447" y="104" text-anchor="middle" class="svg-accent" font-size="11">R3: 0/0 via .1</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">R2: 192.168.10.0/24 via 10.1.12.1, 172.16.30.0/24 via 10.1.23.2</text>
</svg><p class="cap">Stub routers use a default; the middle router needs a specific route per LAN.</p></div>

<h3>Default routes</h3>
<p>The <b>default route</b>, 0.0.0.0/0, matches every destination with the shortest possible length, so it is used only when nothing more specific exists. It is called the "gateway of last resort". Stub routers, which have only one way out (R1 and R3 in the Nagpur lab), need nothing more than a default route.</p>

<h3>Worked example: the Nagpur lab</h3>
<pre class="code"><span class="c">! R1 branch: everything unknown goes to the core</span>
set routing-options static route 0.0.0.0/0 next-hop 10.1.12.2

<span class="c">! R2 core: a specific route for each LAN</span>
set routing-options static route 192.168.10.0/24 next-hop 10.1.12.1
set routing-options static route 172.16.30.0/24 next-hop 10.1.23.2

<span class="c">! R3 data centre: everything unknown goes to the core</span>
set routing-options static route 0.0.0.0/0 next-hop 10.1.23.1</pre>
<pre class="out">lab@R2-CORE&gt; show route protocol static

inet.0: 8 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.30.0/24     *[Static/5] 00:01:48
                    &gt;  to 10.1.23.2 via ge-0/0/1.0
192.168.10.0/24    *[Static/5] 00:01:48
                    &gt;  to 10.1.12.1 via ge-0/0/0.0
</pre>
<p>Check from the PC: <code>ping 172.16.30.10</code> from PC1 must succeed, and the server must reach <code>192.168.10.10</code> as well. If the ping fails, run <code>show route</code> on each router in each direction.</p>

<h3>Useful practical commands</h3>
<ul>
<li><code>show configuration routing-options</code> shows what is configured.</li>
<li><code>show | compare</code> in configuration mode shows pending changes before commit.</li>
<li><code>commit confirmed 5</code> applies a change and rolls back after five minutes unless you commit again. It saves you from locking yourself out of a remote router with a wrong default route.</li>
<li><code>delete routing-options static route 0.0.0.0/0</code> removes a route.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> A next hop that is the router's own address, or an address on a subnet the router does not have. The route will not become active. Another one: pointing at the wrong end of the /30. On 10.1.12.0/30 R1 is .1 and R2 is .2, so R1's next hop is .2.</p></div>
<div class="exam"><p><b>Exam trap.</b> Static routes need no protocol and have preference 5. They are not removed when the far router fails, unless the next hop interface itself goes down. They are not automatically redistributed: a static route lives on one router only.</p></div>

<div class="scn"><h4>Locked out by a default route</h4><p>An engineer changed the default route on a remote branch router from the old link to a new one, but typed the wrong next hop. The session froze and the branch went offline. The next time she used <code>commit confirmed 5</code>: when the typo cut her off, the router rolled back by itself after five minutes and she could log in again and correct it.</p><p><b>Lesson:</b> use commit confirmed for risky routing changes on remote devices.</p></div>

<div class="iv"><p class="q">"When would you use static routes instead of a routing protocol?"</p><p>For stub networks with one exit (a default route is enough), small sites, predictable paths, as backups with higher preference, and for black-hole routes. They use no CPU or bandwidth for updates but do not adapt to failures and become hard to maintain as the network grows, which is where OSPF or BGP is better.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static routes are configured under routing-options static with next-hop.</li>
<li>The next hop must be directly connected unless resolve is used.</li>
<li>0.0.0.0/0 is the default route; stub routers need only that.</li>
<li>The middle router needs specific routes to every LAN behind it.</li>
<li>Use commit confirmed for risky changes on remote routers.</li>
</ul></div>
`,hi:`
<p><b>Static route</b> woh route hai jo aap haath se type karte ho. Yeh tab tak nahi badalta jab tak aap na badlo, aur ise kisi protocol ki zaroorat nahi. Isliye yeh simple, predictable aur CPU par halka hai, aur chhote branches, stub networks aur safety net ke roop mein use hota hai. Yeh failures ke saath adapt nahi karta, isliye bade networks OSPF jaise dynamic protocols use karte hain.</p>

<h3>Analogy: chhapa hua road sign</h3>
<p>Static route ek chhapa hua road sign hai: "Hospital, left mudo". Jab tak sadak nahi badalti yeh hamesha sahi hai. Sadak band ho to bhi sign wahin point karta hai. Dynamic protocol navigation app hai jo sadak band hone par raasta badal deti hai.</p>

<h3>Syntax</h3>
<p>Static routes <code>routing-options static</code> ke neeche rehte hain. Hierarchy view mein aur set commands ke roop mein:</p>
<pre class="code">[edit routing-options static]
route 172.16.30.0/24 next-hop 10.1.23.2;
route 0.0.0.0/0 next-hop 10.1.12.2;

<span class="c">! wahi set commands ke roop mein</span>
set routing-options static route 172.16.30.0/24 next-hop 10.1.23.2
set routing-options static route 0.0.0.0/0 next-hop 10.1.12.2</pre>
<p>Line padhna: <code>route</code> destination prefix hai, <code>next-hop</code> us padosi ka IP address hai jise packet milna chahiye. Next hop <b>directly connected subnet</b> par hona chahiye (jaise 10.1.12.2 R1 ke link 10.1.12.0/30 par hai). Nahi hai to route hidden rehta hai jab tak <code>resolve</code> na lagao, jo Junos ko next hop recursively dhoondhne deta hai.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Nagpur static routes">
<rect x="10" y="50" width="110" height="60" rx="8" fill="#bae6fd"/><text x="65" y="75" text-anchor="middle" class="svg-ink" font-size="13">R1 branch</text><text x="65" y="94" text-anchor="middle" class="svg-muted" font-size="11">192.168.10.0/24</text>
<rect x="265" y="50" width="110" height="60" rx="8" fill="#ddd6fe"/><text x="320" y="75" text-anchor="middle" class="svg-ink" font-size="13">R2 core</text><text x="320" y="94" text-anchor="middle" class="svg-muted" font-size="11">do specifics</text>
<rect x="520" y="50" width="110" height="60" rx="8" fill="#bbf7d0"/><text x="575" y="75" text-anchor="middle" class="svg-ink" font-size="13">R3 data centre</text><text x="575" y="94" text-anchor="middle" class="svg-muted" font-size="11">172.16.30.0/24</text>
<line x1="120" y1="80" x2="265" y2="80" stroke="#64748b" stroke-width="2"/><line x1="375" y1="80" x2="520" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="192" y="70" text-anchor="middle" class="svg-muted" font-size="11">10.1.12.0/30</text><text x="447" y="70" text-anchor="middle" class="svg-muted" font-size="11">10.1.23.0/30</text>
<text x="192" y="104" text-anchor="middle" class="svg-accent" font-size="11">R1: 0/0 via .2</text><text x="447" y="104" text-anchor="middle" class="svg-accent" font-size="11">R3: 0/0 via .1</text>
<text x="320" y="140" text-anchor="middle" class="svg-accent" font-size="12">R2: 192.168.10.0/24 via 10.1.12.1, 172.16.30.0/24 via 10.1.23.2</text>
</svg><p class="cap">Stub routers default use karte hain; beech ke router ko har LAN ka specific route chahiye.</p></div>

<h3>Default routes</h3>
<p><b>Default route</b>, 0.0.0.0/0, sabse chhoti length ke saath har destination se match karta hai, isliye tabhi use hota hai jab aur kuch specific na ho. Ise "gateway of last resort" kehte hain. Stub routers, jinka bahar jaane ka ek hi raasta hota hai (Nagpur lab mein R1 aur R3), unhe default route ke alawa kuch nahi chahiye.</p>

<h3>Worked example: Nagpur lab</h3>
<pre class="code"><span class="c">! R1 branch: jo nahi pata woh core ko</span>
set routing-options static route 0.0.0.0/0 next-hop 10.1.12.2

<span class="c">! R2 core: har LAN ka specific route</span>
set routing-options static route 192.168.10.0/24 next-hop 10.1.12.1
set routing-options static route 172.16.30.0/24 next-hop 10.1.23.2

<span class="c">! R3 data centre: jo nahi pata woh core ko</span>
set routing-options static route 0.0.0.0/0 next-hop 10.1.23.1</pre>
<pre class="out">lab@R2-CORE&gt; show route protocol static

inet.0: 8 destinations, 8 routes (8 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

172.16.30.0/24     *[Static/5] 00:01:48
                    &gt;  to 10.1.23.2 via ge-0/0/1.0
192.168.10.0/24    *[Static/5] 00:01:48
                    &gt;  to 10.1.12.1 via ge-0/0/0.0
</pre>
<p>PC se check karo: PC1 se <code>ping 172.16.30.10</code> succeed hona chahiye, aur server <code>192.168.10.10</code> tak bhi pahunchna chahiye. Ping fail ho to har router par har direction ke liye <code>show route</code> chalao.</p>

<h3>Kaam ke practical commands</h3>
<ul>
<li><code>show configuration routing-options</code> dikhata hai kya configured hai.</li>
<li>Configuration mode mein <code>show | compare</code> commit se pehle pending changes dikhata hai.</li>
<li><code>commit confirmed 5</code> change lagata hai aur paanch minute baad rollback kar deta hai jab tak aap dobara commit na karo. Remote router par galat default route se khud ko lock out hone se bachata hai.</li>
<li><code>delete routing-options static route 0.0.0.0/0</code> route hata deta hai.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Aisa next hop jo router ka apna address ho, ya aisi subnet ka address jo router ke paas nahi. Route active nahi hoga. Ek aur: /30 ke galat end ko point karna. 10.1.12.0/30 par R1 .1 hai aur R2 .2, isliye R1 ka next hop .2 hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Static routes ko protocol nahi chahiye aur unki preference 5 hai. Far router fail ho to bhi woh hatate nahi, jab tak next hop interface khud down na ho. Woh automatically redistribute nahi hote: static route sirf ek router par rehta hai.</p></div>

<div class="scn"><h4>Default route ne lock out kar diya</h4><p>Ek engineer ne remote branch router ka default route purane link se naye link par badla, lekin galat next hop type kar diya. Session freeze ho gaya aur branch offline ho gayi. Agli baar usne <code>commit confirmed 5</code> use kiya: typo se cut off hone par router paanch minute baad khud rollback ho gaya aur woh dobara login karke theek kar paayi.</p><p><b>Lesson:</b> remote devices par risky routing changes ke liye commit confirmed use karo.</p></div>

<div class="iv"><p class="q">"Routing protocol ki jagah static routes kab use karoge?"</p><p>Ek exit wale stub networks ke liye (default route kaafi hai), chhote sites, predictable paths, zyada preference ke saath backup ke roop mein, aur black-hole routes ke liye. Yeh updates par CPU ya bandwidth nahi lete lekin failures ke saath adapt nahi karte aur network bada hone par maintain karna mushkil hota hai, jahan OSPF ya BGP behtar hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static routes routing-options static ke neeche next-hop ke saath configure hote hain.</li>
<li>Next hop directly connected hona chahiye jab tak resolve use na ho.</li>
<li>0.0.0.0/0 default route hai; stub routers ko bas wahi chahiye.</li>
<li>Beech ke router ko apne peeche ke har LAN ka specific route chahiye.</li>
<li>Remote routers par risky changes ke liye commit confirmed use karo.</li>
</ul></div>
`}};export{e as default};