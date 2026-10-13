var e={id:`static-routes`,h:{en:`Static routes: next hops, backups, discard and reject`,hi:`Static routes: next hops, backups, discard aur reject`},body:{en:`
<p><b>What a static route is.</b> A static route is a line that you write yourself: "to reach this prefix, send packets to that neighbour." It does not change by itself, it is not exchanged with anyone, and it needs no protocol. It is perfect for small, predictable parts of the network: a branch with one uplink, a default route to an ISP, a server subnet behind a firewall. Its weakness is also its strength: it never reacts to failures unless you design the reaction (a backup route).</p>

<h3>The basic statement</h3>
<pre class="code"><span class="c">! under [edit routing-options static]</span>
set routing-options static route 172.30.0.0/16 next-hop 10.60.1.2
set routing-options static route 0.0.0.0/0 next-hop 10.0.1.2          <span class="c">! default route</span></pre>
<p>The <b>next hop</b> is the IP address of the neighbour router. Junos requires that this address is reachable on a <i>directly connected</i> subnet. If there is no connected network that contains the next hop, the route cannot be made active. On a plain static route Junos does not look up the next hop in other routes (unless you add <code>resolve</code>, described below). In the branch lab the original config used 10.60.1.6 as the primary next hop although the link is 10.60.1.0/30 (hosts .1 and .2): 10.60.1.6 is not on any connected subnet, so the route never became active and traffic fell back to the backup.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Primary and floating static routes">
<rect x="20" y="85" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="75" y="115" text-anchor="middle" class="svg-ink" font-size="13">PC</text>
<rect x="190" y="75" width="120" height="70" rx="10" fill="#bae6fd"/><text x="250" y="105" text-anchor="middle" class="svg-ink" font-size="14">BR1</text><text x="250" y="125" text-anchor="middle" class="svg-muted" font-size="12">static routes</text>
<rect x="480" y="75" width="120" height="70" rx="10" fill="#bbf7d0"/><text x="540" y="105" text-anchor="middle" class="svg-ink" font-size="14">HQ</text><text x="540" y="125" text-anchor="middle" class="svg-muted" font-size="12">172.30.0.0/16</text>
<line x1="310" y1="90" x2="480" y2="90" stroke="#64748b" stroke-width="3"/><text x="395" y="80" text-anchor="middle" class="svg-accent" font-size="12">primary 10.60.1.2 (pref 5)</text>
<line x1="310" y1="130" x2="480" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/><text x="395" y="150" text-anchor="middle" class="svg-muted" font-size="12">backup 10.60.2.2 (pref 20)</text>
<line x1="130" y1="110" x2="190" y2="110" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The floating static route stays inactive until the primary disappears.</p></div>

<h3>Backup next hops</h3>
<p>There are two ways to give one prefix more than one next hop.</p>
<pre class="code">set routing-options static route 172.30.0.0/16 next-hop 10.60.1.2
set routing-options static route 172.30.0.0/16 qualified-next-hop 10.60.2.2 preference 20</pre>
<ul>
<li>Two plain <code>next-hop</code> values under the same route form <b>equal-cost</b> next hops: both are active (but see load balancing in the Instances module).</li>
<li>A <code>qualified-next-hop</code> carries its own preference (and metric). With preference 20 it is a <b>floating backup</b>: inactive while the primary exists, active when it disappears.</li>
</ul>
<p>The router decides based on whether the next hop is <i>usable</i>. If the primary link goes down, its connected route disappears, the next hop is unreachable, the primary static is withdrawn, and the qualified next hop becomes active. A static route does not know about a failure in the middle of the path; for that, add BFD or use a dynamic protocol.</p>

<h3>discard and reject</h3>
<pre class="code">set routing-options static route 10.99.0.0/16 discard
set routing-options static route 10.98.0.0/16 reject</pre>
<table class="cmp"><tr><th>Action</th><th>Packet</th><th>Sender gets</th></tr>
<tr><td><code>discard</code></td><td>silently dropped</td><td>nothing</td></tr>
<tr><td><code>reject</code></td><td>dropped</td><td>ICMP destination unreachable</td></tr></table>
<p>These are <b>null routes</b>. They are useful to blackhole unused address space, to give an aggregate something to summarise, and as a defence in security designs. Real output:</p>
<pre class="out">lab@BR1&gt; show route 10.99.1.1
10.99.0.0/16       *[Static/5] 00:00:00
                       Discard

lab@BR1&gt; show route forwarding-table destination 10.99.1.1
Destination        Type RtRef Next hop           Type Index    NhRef Netif
10.99.0.0/16       user     0                    <span class="hl">dscd</span>    724     2</pre>
<p>The forwarding table type <code>dscd</code> means discard; <code>rjct</code> means reject; <code>ucst</code> means unicast to a next hop.</p>

<h3>resolve, metric and other options</h3>
<ul>
<li><code>resolve</code>: lets the next hop be found through other routes in the table (recursive lookup) instead of requiring a connected subnet. Needed for next hops reached through a dynamic protocol.</li>
<li><code>preference</code> and <code>metric</code>: tune the route against other sources and against other statics. Use <code>static defaults</code> to change them for all static routes.</li>
<li><code>no-readvertise</code>: prevents the route from being exported by a protocol policy that matches statics.</li>
<li><code>install</code> and <code>retain</code> control whether the route is kept in the forwarding table after a failure; use only when you know why.</li>
</ul>

<h3>Black holes caused by statics</h3>
<p>The most common static-route fault is a <b>more specific route that points to the wrong place</b>. Longest prefix match always wins, regardless of preference. In the lab BR1 has 172.30.0.0/16 for HQ but also a forgotten 172.30.5.0/24 with <code>reject</code>:</p>
<pre class="out">lab@BR1&gt; show route 172.30.5.10
172.30.5.0/24      *[Static/5] 00:00:40
                       Reject</pre>
<p>Even though the /16 exists, packets to the HR server 172.30.5.10 are rejected because the /24 is more specific. Delete the /24 and the /16 handles the traffic again.</p>

<div class="eg"><p><b>Worked example.</b> A branch has a primary 10 Mbps link (next hop 10.60.1.2) and a backup 4G link (next hop 10.60.2.2). You configure the default route twice: next-hop on the fibre link with the default preference 5, and a qualified-next-hop on the 4G link with preference 20. When the fibre is up only the first route is active. When the fibre goes down its connected subnet disappears, the first route becomes unusable and the 4G route takes over in under a second.</p></div>

<div class="warn"><p><b>Common mistake.</b> Typing a next hop that is not in a connected subnet, for example 10.60.1.6 on a /30 with .1 and .2. The route silently stays out of the active table. Always check <code>show route PREFIX exact</code> after a commit and confirm the star and the next hop.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>discard</code> sends no ICMP and <code>reject</code> does; aggregate routes default to reject. Also, <code>qualified-next-hop</code> is the way to give an individual next hop a different preference.</p></div>

<div class="scn"><h4>HR could not reach the server</h4><p>HR users at a branch could not reach their server 172.30.5.10 while everything else at HQ worked. A forgotten test route 172.30.5.0/24 with reject had been left by a previous engineer. After <code>delete routing-options static route 172.30.5.0/24</code> and a commit, the packets followed the /16 to HQ. At the same time the engineer noticed that the primary next hop was mistyped; fixing it put traffic on the fast link again.</p><p><b>Lesson:</b> always check for a more specific route before blaming the next hop.</p></div>
<div class="iv"><p class="q">"How do you build a backup static route on Junos?"</p><p>Configure the primary with a normal next-hop (preference 5) and the backup with <code>qualified-next-hop</code> and a higher preference such as 20. The backup stays inactive until the primary's next hop becomes unreachable. Mention BFD for faster detection of failures that are not on a directly connected link.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static next hops must be on a connected subnet unless <code>resolve</code> is used.</li>
<li><code>qualified-next-hop ... preference 20</code> creates a floating backup.</li>
<li><code>discard</code> drops silently; <code>reject</code> sends ICMP unreachable.</li>
<li>Forwarding table types: ucst, dscd, rjct.</li>
<li>A more specific static route (even a reject) overrides the covering route.</li>
</ul></div>
`,hi:`
<p><b>Static route kya hai.</b> Static route ek line hai jo aap khud likhte ho: "is prefix tak pahunchne ke liye packets us neighbour ko bhejo." Yeh khud nahi badalti, kisi ke saath exchange nahi hoti aur koi protocol nahi chahiye. Yeh network ke chhote, predictable hisson ke liye perfect hai: ek uplink wala branch, ISP ka default route, firewall ke peeche server subnet. Iski kamzori hi iski taakat hai: jab tak aap reaction design nahi karte (backup route) yeh failures par react nahi karti.</p>

<h3>Basic statement</h3>
<pre class="code"><span class="c">! [edit routing-options static] ke neeche</span>
set routing-options static route 172.30.0.0/16 next-hop 10.60.1.2
set routing-options static route 0.0.0.0/0 next-hop 10.0.1.2          <span class="c">! default route</span></pre>
<p><b>Next hop</b> neighbour router ka IP address hai. Junos ko chahiye ki yeh address <i>directly connected</i> subnet par ho. Agar koi connected network next hop ko contain nahi karta to route active nahi ho sakta. Plain static route par Junos next hop ko doosre routes mein nahi dhoondhta (jab tak aap <code>resolve</code> na lagao, neeche dekho). Branch lab mein original config primary next hop 10.60.1.6 use karta tha jabki link 10.60.1.0/30 hai (hosts .1 aur .2): 10.60.1.6 kisi connected subnet par nahi hai, isliye route kabhi active nahi hua aur traffic backup par gaya.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Primary aur floating static routes">
<rect x="20" y="85" width="110" height="50" rx="8" fill="#e2e8f0"/><text x="75" y="115" text-anchor="middle" class="svg-ink" font-size="13">PC</text>
<rect x="190" y="75" width="120" height="70" rx="10" fill="#bae6fd"/><text x="250" y="105" text-anchor="middle" class="svg-ink" font-size="14">BR1</text><text x="250" y="125" text-anchor="middle" class="svg-muted" font-size="12">static routes</text>
<rect x="480" y="75" width="120" height="70" rx="10" fill="#bbf7d0"/><text x="540" y="105" text-anchor="middle" class="svg-ink" font-size="14">HQ</text><text x="540" y="125" text-anchor="middle" class="svg-muted" font-size="12">172.30.0.0/16</text>
<line x1="310" y1="90" x2="480" y2="90" stroke="#64748b" stroke-width="3"/><text x="395" y="80" text-anchor="middle" class="svg-accent" font-size="12">primary 10.60.1.2 (pref 5)</text>
<line x1="310" y1="130" x2="480" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/><text x="395" y="150" text-anchor="middle" class="svg-muted" font-size="12">backup 10.60.2.2 (pref 20)</text>
<line x1="130" y1="110" x2="190" y2="110" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Floating static route primary ke jaane tak inactive rehta hai.</p></div>

<h3>Backup next hops</h3>
<p>Ek prefix ko ek se zyada next hop dene ke do tareeke hain.</p>
<pre class="code">set routing-options static route 172.30.0.0/16 next-hop 10.60.1.2
set routing-options static route 172.30.0.0/16 qualified-next-hop 10.60.2.2 preference 20</pre>
<ul>
<li>Ek hi route ke neeche do plain <code>next-hop</code> values <b>equal-cost</b> next hops banate hain: dono active (lekin load balancing ke liye Instances module dekho).</li>
<li><code>qualified-next-hop</code> ki apni preference (aur metric) hoti hai. Preference 20 ke saath yeh <b>floating backup</b> hai: primary ke rehte inactive, jaate hi active.</li>
</ul>
<p>Router is baat par faisla karta hai ki next hop <i>usable</i> hai ya nahi. Primary link gir jaaye to uska connected route gayab hota hai, next hop unreachable ho jaata hai, primary static withdraw hota hai, aur qualified next hop active ho jaata hai. Static route ko path ke beech ke failure ka pata nahi chalta; uske liye BFD jodo ya dynamic protocol use karo.</p>

<h3>discard aur reject</h3>
<pre class="code">set routing-options static route 10.99.0.0/16 discard
set routing-options static route 10.98.0.0/16 reject</pre>
<table class="cmp"><tr><th>Action</th><th>Packet</th><th>Sender ko milta hai</th></tr>
<tr><td><code>discard</code></td><td>chupchaap drop</td><td>kuch nahi</td></tr>
<tr><td><code>reject</code></td><td>drop</td><td>ICMP destination unreachable</td></tr></table>
<p>Yeh <b>null routes</b> hain. Unused address space blackhole karne, aggregate ko summarise karne ke liye kuch dene, aur security designs mein defence ke liye kaam aate hain. Real output:</p>
<pre class="out">lab@BR1&gt; show route 10.99.1.1
10.99.0.0/16       *[Static/5] 00:00:00
                       Discard

lab@BR1&gt; show route forwarding-table destination 10.99.1.1
Destination        Type RtRef Next hop           Type Index    NhRef Netif
10.99.0.0/16       user     0                    <span class="hl">dscd</span>    724     2</pre>
<p>Forwarding table type <code>dscd</code> matlab discard; <code>rjct</code> matlab reject; <code>ucst</code> matlab next hop ko unicast.</p>

<h3>resolve, metric aur doosre options</h3>
<ul>
<li><code>resolve</code>: next hop ko connected subnet ki jagah table ke doosre routes se (recursive lookup) dhoondhne deta hai. Dynamic protocol se pahunche jaane wale next hops ke liye chahiye.</li>
<li><code>preference</code> aur <code>metric</code>: route ko doosre sources aur doosre statics ke against tune karte hain. Saare static routes ke liye <code>static defaults</code> use karo.</li>
<li><code>no-readvertise</code>: route ko static match karne wali protocol policy se export hone se rokta hai.</li>
<li><code>install</code> aur <code>retain</code> tay karte hain ki failure ke baad route forwarding table mein rahe ya nahi; tabhi use karo jab wajah pata ho.</li>
</ul>

<h3>Static se bane black holes</h3>
<p>Static-route ki sabse common galti hai <b>more specific route jo galat jagah point karta hai</b>. Longest prefix match hamesha jeetta hai, preference kuch bhi ho. Lab mein BR1 ke paas HQ ke liye 172.30.0.0/16 hai lekin ek bhoola hua 172.30.5.0/24 bhi <code>reject</code> ke saath:</p>
<pre class="out">lab@BR1&gt; show route 172.30.5.10
172.30.5.0/24      *[Static/5] 00:00:40
                       Reject</pre>
<p>/16 hone ke bawajood HR server 172.30.5.10 ke packets reject hote hain kyunki /24 zyada specific hai. /24 delete karo to /16 traffic dobara sambhalta hai.</p>

<div class="eg"><p><b>Worked example.</b> Branch ke paas primary 10 Mbps link (next hop 10.60.1.2) aur backup 4G link (next hop 10.60.2.2) hai. Aap default route do baar configure karte ho: fibre link par next-hop default preference 5 ke saath, aur 4G link par qualified-next-hop preference 20 ke saath. Fibre up ho to sirf pehla route active. Fibre gire to uska connected subnet gayab, pehla route unusable aur 4G route ek second se kam mein sambhal leta hai.</p></div>

<div class="warn"><p><b>Common mistake.</b> Aisa next hop type karna jo connected subnet mein nahi hai, jaise .1 aur .2 wale /30 par 10.60.1.6. Route chupchaap active table se bahar rehta hai. Commit ke baad hamesha <code>show route PREFIX exact</code> dekho aur star aur next hop confirm karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>discard</code> ICMP nahi bhejta aur <code>reject</code> bhejta hai; aggregate routes default mein reject karte hain. Yeh bhi: kisi ek next hop ko alag preference dene ka tareeka <code>qualified-next-hop</code> hai.</p></div>

<div class="scn"><h4>HR server tak nahi pahunch paaye</h4><p>Branch ke HR users apne server 172.30.5.10 tak nahi pahunch pa rahe the jabki HQ ka baaki sab chal raha tha. Pichle engineer ka chhoda hua test route 172.30.5.0/24 reject ke saath maujood tha. <code>delete routing-options static route 172.30.5.0/24</code> aur commit ke baad packets /16 follow karke HQ gaye. Saath hi engineer ne dekha ki primary next hop galat type hua tha; theek karne se traffic phir fast link par aaya.</p><p><b>Lesson:</b> next hop ko doshi thahrane se pehle hamesha more specific route dekho.</p></div>
<div class="iv"><p class="q">"Junos par backup static route kaise banate ho?"</p><p>Primary ko normal next-hop (preference 5) se aur backup ko <code>qualified-next-hop</code> aur zyada preference jaise 20 se configure karo. Primary ka next hop unreachable hone tak backup inactive rehta hai. Directly connected link ke alawa failures ko jaldi pakadne ke liye BFD ka zikr karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Static next hops connected subnet par hone chahiye jab tak <code>resolve</code> use na ho.</li>
<li><code>qualified-next-hop ... preference 20</code> floating backup banata hai.</li>
<li><code>discard</code> chupchaap drop karta hai; <code>reject</code> ICMP unreachable bhejta hai.</li>
<li>Forwarding table types: ucst, dscd, rjct.</li>
<li>More specific static route (reject bhi) covering route ko override karta hai.</li>
</ul></div>
`}};export{e as default};