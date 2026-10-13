var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>You have walked from route preference to static, aggregate and generated routes, then export policy, verification and troubleshooting. This last chapter pulls everything into one page you can revise the night before the JN0-351 exam.</p>

<h3>The big picture</h3>
<p>Junos builds one routing table (inet.0) from many sources. Each source gives its routes a <b>preference</b>; the lowest wins as the active route. The active route is copied to the forwarding table, and packets are forwarded by <b>longest prefix match</b>, which always beats preference. Everything in this module is a variation of those two rules.</p>

<h3>Default preference values</h3>
<table class="cmp"><tr><th>Source</th><th>Preference</th></tr>
<tr><td>Direct</td><td>0</td></tr>
<tr><td>Local</td><td>0</td></tr>
<tr><td>Static</td><td>5</td></tr>
<tr><td>OSPF internal</td><td>10</td></tr>
<tr><td>IS-IS Level 1 internal</td><td>15</td></tr>
<tr><td>IS-IS Level 2 internal</td><td>18</td></tr>
<tr><td>RIP</td><td>100</td></tr>
<tr><td>Aggregate</td><td>130</td></tr>
<tr><td>OSPF external</td><td>150</td></tr>
<tr><td>BGP (internal and external)</td><td>170</td></tr></table>

<h3>Route types at a glance</h3>
<table class="cmp"><tr><th>Type</th><th>Purpose</th><th>Becomes active when</th></tr>
<tr><td>Static</td><td>Manual route to a next hop</td><td>next hop is reachable on a connected subnet</td></tr>
<tr><td>Qualified next hop</td><td>Floating backup with its own preference</td><td>better route is absent</td></tr>
<tr><td>Discard</td><td>Silently drop matching traffic</td><td>always (it has no next hop to resolve)</td></tr>
<tr><td>Reject</td><td>Drop and send ICMP unreachable</td><td>always</td></tr>
<tr><td>Aggregate</td><td>Summary built from more specific routes</td><td>at least one contributing route is active</td></tr>
<tr><td>Generated</td><td>Summary with a real forwarding next hop</td><td>at least one contributing route is active</td></tr></table>

<h3>Aggregate versus generated</h3>
<ul>
<li>An aggregate usually points to discard, so traffic for a missing more-specific is dropped. A generated route takes the next hop of its primary contributing route.</li>
<li>Both exist only while a contributor is active. This is what makes the generated default in the lab vanish when BGP fails.</li>
<li>Neither is advertised automatically. A routing policy exported into the protocol is needed.</li>
</ul>

<h3>Commands to know cold</h3>
<pre class="code">show route
show route PREFIX exact
show route PREFIX longer
show route protocol static
show route 0.0.0.0/0 exact detail
show route forwarding-table destination ADDRESS
show configuration routing-options
show interfaces terse
show | compare
commit confirmed 5
commit comment "text"</pre>

<h3>Exam checklist</h3>
<ul>
<li>I can list the default preference of direct, static, OSPF, IS-IS, RIP, aggregate and BGP.</li>
<li>I can explain why a /24 reject route beats a /16 static route.</li>
<li>I can write a floating static route with <code>qualified-next-hop</code> and a preference value.</li>
<li>I know the difference between <code>discard</code> and <code>reject</code>.</li>
<li>I know that a static route with an unreachable next hop is not active.</li>
<li>I can configure an aggregate and a generated route and read the contributing routes.</li>
<li>I can write an export policy that advertises them into OSPF and know the resulting route is OSPF/150.</li>
<li>I can read the star, the plus sign and the minus sign in <code>show route</code>.</li>
<li>I can use <code>show route</code> and the forwarding table to prove which path a packet takes.</li>
<li>I can follow the troubleshooting workflow: reproduce, ask about the address, check the prefix family, check the next hop, fix one thing, verify.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Routes to 10.1.1.5: a static 10.1.0.0/16 (preference 5), an OSPF 10.1.1.0/24 (preference 10) and an aggregate 10.0.0.0/8 (preference 130). Traffic uses the OSPF /24, because it is the longest match. Preference only decides between routes for the <i>same</i> prefix.</p></div>
<div class="warn"><p><b>Common mistake.</b> Believing the exam wants "which protocol is better". It asks which route is <i>active</i> and why. Check prefix length first, preference second, metric last.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question lists a route marked with a minus sign or no star and asks why it is not used. Possible answers are a lower preference, a longer match elsewhere, or an unusable next hop. Read the output before choosing.</p></div>
<div class="scn"><h4>Before the maintenance window</h4><p>A team prepares to change a branch's static routes. They save the plan: a <code>show route</code> baseline, the exact set and delete lines, <code>commit confirmed 5</code>, then the same show commands for comparison. The change fails after the first commit, the confirm timer expires and the router rolls back by itself. Service never stays broken. Planning the verification before the change is what made the rollback painless.</p></div>
<div class="iv"><p class="q">"Summarise how Junos chooses a route."</p><p>Longest prefix match decides first. For equal prefixes, the lowest preference from the source wins; for the same protocol, the protocol metric and tie-breakers decide. The winner is the active route, marked with a star, and is copied to the forwarding table.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Longest prefix match beats preference; preference beats metric.</li>
<li>Static is 5, OSPF internal 10, aggregate 130, OSPF external 150, BGP 170.</li>
<li>Aggregate and generated routes need an active contributor and an export policy to be shared.</li>
<li>Verify with the routing table and the forwarding table.</li>
<li>Change one thing per commit and keep a rollback plan.</li>
</ul></div>
`,hi:`
<p>Aapne route preference se shuru karke static, aggregate aur generated routes, phir export policy, verification aur troubleshooting tak ka safar kiya. Yeh aakhri chapter sab kuch ek page mein samet deta hai jo aap JN0-351 exam se pehle raat ko revise kar sakte hain.</p>

<h3>Badi tasveer</h3>
<p>Junos kai sources se ek routing table (inet.0) banata hai. Har source apne routes ko ek <b>preference</b> deta hai; sabse kam jeet kar active route banta hai. Active route forwarding table mein copy hota hai, aur packets <b>longest prefix match</b> se forward hote hain, jo preference ko hamesha harata hai. Is module ki har cheez in do rules ka hi roop hai.</p>

<h3>Default preference values</h3>
<table class="cmp"><tr><th>Source</th><th>Preference</th></tr>
<tr><td>Direct</td><td>0</td></tr>
<tr><td>Local</td><td>0</td></tr>
<tr><td>Static</td><td>5</td></tr>
<tr><td>OSPF internal</td><td>10</td></tr>
<tr><td>IS-IS Level 1 internal</td><td>15</td></tr>
<tr><td>IS-IS Level 2 internal</td><td>18</td></tr>
<tr><td>RIP</td><td>100</td></tr>
<tr><td>Aggregate</td><td>130</td></tr>
<tr><td>OSPF external</td><td>150</td></tr>
<tr><td>BGP (internal aur external)</td><td>170</td></tr></table>

<h3>Route types ek nazar mein</h3>
<table class="cmp"><tr><th>Type</th><th>Maksad</th><th>Active kab banta hai</th></tr>
<tr><td>Static</td><td>Next hop tak manual route</td><td>next hop connected subnet par reachable ho</td></tr>
<tr><td>Qualified next hop</td><td>Apni preference wala floating backup</td><td>behtar route maujood na ho</td></tr>
<tr><td>Discard</td><td>Match hone wala traffic chupchap drop</td><td>hamesha (resolve karne ko next hop nahi)</td></tr>
<tr><td>Reject</td><td>Drop karo aur ICMP unreachable bhejo</td><td>hamesha</td></tr>
<tr><td>Aggregate</td><td>More specific routes se bana summary</td><td>kam se kam ek contributing route active ho</td></tr>
<tr><td>Generated</td><td>Real forwarding next hop wala summary</td><td>kam se kam ek contributing route active ho</td></tr></table>

<h3>Aggregate versus generated</h3>
<ul>
<li>Aggregate aam taur par discard ki taraf point karta hai, isliye missing more-specific ka traffic drop hota hai. Generated route apne primary contributing route ka next hop leta hai.</li>
<li>Dono sirf tab tak rehte hain jab tak contributor active hai. Isi se lab mein BGP fail hone par generated default gayab ho jaata hai.</li>
<li>Koi bhi apne aap advertise nahi hota. Protocol mein export routing policy zaroori hai.</li>
</ul>

<h3>Jo commands ratne hain</h3>
<pre class="code">show route
show route PREFIX exact
show route PREFIX longer
show route protocol static
show route 0.0.0.0/0 exact detail
show route forwarding-table destination ADDRESS
show configuration routing-options
show interfaces terse
show | compare
commit confirmed 5
commit comment "text"</pre>

<h3>Exam checklist</h3>
<ul>
<li>Main direct, static, OSPF, IS-IS, RIP, aggregate aur BGP ki default preference bata sakta hoon.</li>
<li>Main samjha sakta hoon ki /24 reject route /16 static route ko kyun harata hai.</li>
<li>Main <code>qualified-next-hop</code> aur preference value ke saath floating static route likh sakta hoon.</li>
<li>Main <code>discard</code> aur <code>reject</code> ka fark jaanta hoon.</li>
<li>Main jaanta hoon ki unreachable next hop wala static route active nahi hota.</li>
<li>Main aggregate aur generated route configure kar sakta hoon aur contributing routes padh sakta hoon.</li>
<li>Main aisi export policy likh sakta hoon jo unhe OSPF mein advertise kare aur jaanta hoon ki result OSPF/150 route hota hai.</li>
<li>Main <code>show route</code> mein star, plus aur minus sign padh sakta hoon.</li>
<li>Main routing table aur forwarding table se saabit kar sakta hoon ki packet kaunsa path leta hai.</li>
<li>Main troubleshooting workflow follow kar sakta hoon: reproduce, address poochho, prefix family dekho, next hop check karo, ek cheez theek karo, verify karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> 10.1.1.5 ke routes: static 10.1.0.0/16 (preference 5), OSPF 10.1.1.0/24 (preference 10) aur aggregate 10.0.0.0/8 (preference 130). Traffic OSPF /24 use karta hai, kyunki woh longest match hai. Preference sirf <i>same</i> prefix ke routes ke beech faisla karti hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Yeh maan lena ki exam poochta hai "kaunsa protocol behtar hai". Woh poochta hai kaunsa route <i>active</i> hai aur kyun. Pehle prefix length, phir preference, aakhir mein metric dekho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal ek route list karta hai jis par minus sign ya star nahi hai aur poochta hai woh use kyun nahi ho raha. Sambhavit jawab: kam preference, kahin aur longer match, ya unusable next hop. Chunne se pehle output padho.</p></div>
<div class="scn"><h4>Maintenance window se pehle</h4><p>Ek team branch ke static routes badalne ki taiyari karti hai. Woh plan likhte hain: <code>show route</code> baseline, exact set aur delete lines, <code>commit confirmed 5</code>, phir tulna ke liye wahi show commands. Pehle commit ke baad change fail ho jaata hai, confirm timer khatam hota hai aur router apne aap rollback kar leta hai. Service kabhi toota hua nahi rehta. Change se pehle verification plan karna hi rollback ko aasan banata hai.</p></div>
<div class="iv"><p class="q">"Junos route kaise chunta hai, summary do."</p><p>Pehle longest prefix match faisla karta hai. Barabar prefix ke liye source ki sabse kam preference jeetti hai; same protocol mein protocol metric aur tie-breakers faisla karte hain. Winner active route hai, star se marked, aur forwarding table mein copy hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Longest prefix match preference ko harata hai; preference metric ko.</li>
<li>Static 5, OSPF internal 10, aggregate 130, OSPF external 150, BGP 170.</li>
<li>Aggregate aur generated routes ko share hone ke liye active contributor aur export policy chahiye.</li>
<li>Routing table aur forwarding table se verify karo.</li>
<li>Ek commit mein ek change aur rollback plan rakho.</li>
</ul></div>
`}};export{e as default};