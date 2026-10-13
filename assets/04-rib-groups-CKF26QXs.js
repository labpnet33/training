var e={id:`rib-groups`,h:{en:`Sharing routes: RIB groups and next-table`,hi:`Routes share karna: RIB groups aur next-table`},body:{en:`
<p>Instances separate routing tables, but real designs often need a <i>controlled</i> exchange. Guests may need the master's default route to reach the Internet. A forwarding instance needs the connected subnets of the master so that next hops resolve. Junos gives you three tools: <b>RIB groups</b>, <b>import and export policies</b> and <b>next-table</b> routes. This chapter covers the first and the last, which are the ones JN0-351 stresses.</p>

<h3>What is a RIB group?</h3>
<p>A <b>RIB group</b> is a named list of routing tables. When a source (a protocol or the interface routes) is told to use the group, every route it learns is installed in <b>all</b> tables in the list. The first table is the <b>primary</b>; the others are secondary copies.</p>
<pre class="code">set routing-options rib-groups MASTER-TO-GUEST import-rib [ inet.0 GUEST.inet.0 ]
set routing-options interface-routes rib-group inet MASTER-TO-GUEST</pre>
<ul>
<li><code>import-rib</code> lists the tables. <b>The primary table must be first.</b> The first table is the one the route source belongs to; listing a different table first is a classic configuration error.</li>
<li><code>interface-routes rib-group inet NAME</code> copies Direct and Local routes of the interfaces. Without it only the table of the interface owner gets those routes.</li>
<li>A protocol can use a group too, for example <code>set protocols ospf rib-group NAME</code>, and static routes use <code>set routing-options static rib-group NAME</code>.</li>
<li>An optional <code>import-policy</code> in the RIB group filters what is copied into the secondary tables.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="RIB group copies routes">
<rect x="30" y="60" width="150" height="70" rx="10" fill="#bae6fd"/><text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="13">inet.0 (primary)</text><text x="105" y="112" text-anchor="middle" class="svg-muted" font-size="11">interface routes</text>
<rect x="450" y="60" width="160" height="70" rx="10" fill="#bbf7d0"/><text x="530" y="90" text-anchor="middle" class="svg-ink" font-size="13">ISP-B.inet.0</text><text x="530" y="112" text-anchor="middle" class="svg-muted" font-size="11">secondary copy</text>
<rect x="240" y="20" width="160" height="40" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">rib-group FBF-RG</text>
<line x1="180" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="3"/>
<polygon points="450,95 438,89 438,101" fill="#64748b"/>
<text x="315" y="120" text-anchor="middle" class="svg-accent" font-size="11">Direct and Local routes copied</text>
</svg><p class="cap">The RIB group installs each route in both tables.</p></div>

<h3>Seeing it work</h3>
<p>In the ISP lab, the forwarding instance ISP-B holds only a default route. Its next hop 10.0.2.2 cannot resolve because ISP-B has no connected subnets, so the table is empty:</p>
<pre class="out">lab@R1# run show route table ISP-B.inet.0
ISP-B.inet.0: 0 destinations, 0 routes (0 active, 0 holddown, 0 hidden)</pre>
<p>After the RIB group is added and committed, the interface routes are copied and the default route becomes active:</p>
<pre class="code">set routing-options rib-groups FBF-RG import-rib [ inet.0 ISP-B.inet.0 ]
set routing-options interface-routes rib-group inet FBF-RG</pre>
<pre class="out">lab@R1# run show route table ISP-B.inet.0
ISP-B.inet.0: 9 destinations, 9 routes (9 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

0.0.0.0/0          *[Static/5] 00:00:00
                    &gt;  to 10.0.2.2 via ge-0/0/1.0
10.0.1.0/30        *[Direct/0] 00:00:00
                    &gt;  via ge-0/0/0.0
10.0.1.1/32        *[Local/0] 00:00:00
                       Local via ge-0/0/0.0</pre>
<p>The output is cut here; the table continues with the other three interfaces. Nine routes in total: one static, four Direct and four Local.</p>

<h3>RIB groups work in one direction</h3>
<p>A group copies from the table that owns the source into the listed tables. It does not make routes flow back. If two instances must see each other's connected routes, you need <b>two</b> groups, one in each direction:</p>
<pre class="code">set routing-options rib-groups MASTER-TO-GUEST import-rib [ inet.0 GUEST.inet.0 ]
set routing-options interface-routes rib-group inet MASTER-TO-GUEST
set routing-options rib-groups GUEST-TO-MASTER import-rib [ GUEST.inet.0 inet.0 ]
set routing-instances GUEST routing-options interface-routes rib-group inet GUEST-TO-MASTER</pre>
<p>Notice the second group is applied <i>inside</i> the instance, because the interface routes of GUEST belong to GUEST.</p>

<h3>The next-table static route</h3>
<p>Sometimes you do not want to copy anything. A static route with <code>next-table</code> says "for this prefix, look it up in another table":</p>
<pre class="code">set routing-instances GUEST routing-options static route 0.0.0.0/0 next-table inet.0</pre>
<p>Now guests send everything unknown to the master, and the master's table decides. This is simple and has less state than a RIB group, but it also means the guest instance sees the whole master table for lookups of that route. Use a firewall filter or a policy if that is too open.</p>

<table class="cmp"><tr><th>Tool</th><th>Direction</th><th>Copies routes</th><th>Best for</th></tr>
<tr><td>RIB group</td><td>from owner to listed tables</td><td>Yes</td><td>Connected subnets, specific routes</td></tr>
<tr><td>next-table</td><td>per static route</td><td>No, lookup moves</td><td>Default route to the master</td></tr>
<tr><td>Export policy</td><td>between protocols/instances</td><td>Selected routes</td><td>Fine control with match conditions</td></tr></table>

<div class="eg"><p><b>Worked example.</b> A forwarding instance ISP-B has a default route to 10.0.2.2. Without the connected subnet 10.0.2.0/30 in its table, the next hop cannot resolve. With <code>FBF-RG</code> the table gets 10.0.2.0/30 as a Direct route and the default turns active. The 9/0/0 counts in <code>show route instance</code> confirm that.</p></div>
<div class="warn"><p><b>Common mistake.</b> Putting the secondary table first in <code>import-rib</code>. The primary table decides where the routes really live, and the other tables get copies. Always write the owning table first.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam asks which command makes the connected subnets of the master visible in an instance. The answer is <code>interface-routes rib-group inet NAME</code> together with a rib-group; not <code>static rib-group</code>, which copies static routes only.</p></div>
<div class="scn"><h4>Half a design</h4><p>A branch team added a RIB group to give a guest instance the master's connected subnets and tested from the master side, where all worked. Guests still could not reach the staff DNS server, because the return routes were missing: no group copied GUEST's routes back. They added the second group and the traffic flowed.</p><p><b>Lesson:</b> think about both directions of every flow.</p></div>
<div class="iv"><p class="q">"What is a RIB group?"</p><p>It is a list of routing tables used as the install target for a route source. When a protocol or interface routes use it, each route is installed in all listed tables. The first table is primary. I use it to share connected or static routes between instances, for example to make next hops resolve in a forwarding instance.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A RIB group copies routes into several tables; primary first.</li>
<li><code>interface-routes rib-group inet</code> shares Direct and Local routes.</li>
<li>A group is one-way; build two for two-way sharing.</li>
<li><code>next-table</code> redirects a lookup without copying routes.</li>
</ul></div>
`,hi:`
<p>Instances routing tables alag karte hain, lekin real designs mein aksar <i>niyantrit</i> exchange chahiye hota hai. Guests ko Internet tak jaane ke liye master ka default route chahiye ho sakta hai. Forwarding instance ko master ke connected subnets chahiye taaki next hops resolve ho sakein. Junos teen tools deta hai: <b>RIB groups</b>, <b>import aur export policies</b> aur <b>next-table</b> routes. Yeh chapter pehle aur aakhri ko cover karta hai, jin par JN0-351 zor deta hai.</p>

<h3>RIB group kya hai?</h3>
<p><b>RIB group</b> routing tables ki naamit list hai. Jab kisi source (protocol ya interface routes) ko group use karne ko kaha jaata hai, to woh jo bhi route seekhta hai woh list ke <b>sab</b> tables mein install hota hai. Pehla table <b>primary</b> hai; baaki secondary copies.</p>
<pre class="code">set routing-options rib-groups MASTER-TO-GUEST import-rib [ inet.0 GUEST.inet.0 ]
set routing-options interface-routes rib-group inet MASTER-TO-GUEST</pre>
<ul>
<li><code>import-rib</code> tables ki list deta hai. <b>Primary table pehle likhna hai.</b> Route source jis table ka hai wahi pehle aata hai; kisi aur table ko pehle likhna classic configuration error hai.</li>
<li><code>interface-routes rib-group inet NAME</code> interfaces ke Direct aur Local routes copy karta hai. Iske bina sirf interface ke maalik table ko woh routes milte hain.</li>
<li>Protocol bhi group use kar sakta hai, jaise <code>set protocols ospf rib-group NAME</code>, aur static routes ke liye <code>set routing-options static rib-group NAME</code>.</li>
<li>RIB group mein optional <code>import-policy</code> secondary tables mein kya copy ho yeh filter karti hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="RIB group routes copy karta hai">
<rect x="30" y="60" width="150" height="70" rx="10" fill="#bae6fd"/><text x="105" y="90" text-anchor="middle" class="svg-ink" font-size="13">inet.0 (primary)</text><text x="105" y="112" text-anchor="middle" class="svg-muted" font-size="11">interface routes</text>
<rect x="450" y="60" width="160" height="70" rx="10" fill="#bbf7d0"/><text x="530" y="90" text-anchor="middle" class="svg-ink" font-size="13">ISP-B.inet.0</text><text x="530" y="112" text-anchor="middle" class="svg-muted" font-size="11">secondary copy</text>
<rect x="240" y="20" width="160" height="40" rx="8" fill="#fde68a"/><text x="320" y="45" text-anchor="middle" class="svg-ink" font-size="12">rib-group FBF-RG</text>
<line x1="180" y1="95" x2="450" y2="95" stroke="#64748b" stroke-width="3"/>
<polygon points="450,95 438,89 438,101" fill="#64748b"/>
<text x="315" y="120" text-anchor="middle" class="svg-accent" font-size="11">Direct aur Local routes copy</text>
</svg><p class="cap">RIB group har route dono tables mein install karta hai.</p></div>

<h3>Kaam karte dekhna</h3>
<p>ISP lab mein forwarding instance ISP-B ke paas sirf default route hai. Uska next hop 10.0.2.2 resolve nahi hota kyunki ISP-B ke paas connected subnets nahi hain, isliye table khali hai:</p>
<pre class="out">lab@R1# run show route table ISP-B.inet.0
ISP-B.inet.0: 0 destinations, 0 routes (0 active, 0 holddown, 0 hidden)</pre>
<p>RIB group jodkar commit karne ke baad interface routes copy ho jaate hain aur default route active ho jaata hai:</p>
<pre class="code">set routing-options rib-groups FBF-RG import-rib [ inet.0 ISP-B.inet.0 ]
set routing-options interface-routes rib-group inet FBF-RG</pre>
<pre class="out">lab@R1# run show route table ISP-B.inet.0
ISP-B.inet.0: 9 destinations, 9 routes (9 active, 0 holddown, 0 hidden)
+ = Active Route, - = Last Active, * = Both

0.0.0.0/0          *[Static/5] 00:00:00
                    &gt;  to 10.0.2.2 via ge-0/0/1.0
10.0.1.0/30        *[Direct/0] 00:00:00
                    &gt;  via ge-0/0/0.0
10.0.1.1/32        *[Local/0] 00:00:00
                       Local via ge-0/0/0.0</pre>
<p>Output yahan kaata gaya hai; table baaki teen interfaces ke saath chalti hai. Kul nau routes: ek static, chaar Direct aur chaar Local.</p>

<h3>RIB groups ek disha mein kaam karte hain</h3>
<p>Group us table se copy karta hai jo source ka maalik hai, listed tables mein. Woh routes ko wapas nahi bahata. Do instances ko ek doosre ke connected routes dekhne hon to <b>do</b> groups chahiye, har disha mein ek:</p>
<pre class="code">set routing-options rib-groups MASTER-TO-GUEST import-rib [ inet.0 GUEST.inet.0 ]
set routing-options interface-routes rib-group inet MASTER-TO-GUEST
set routing-options rib-groups GUEST-TO-MASTER import-rib [ GUEST.inet.0 inet.0 ]
set routing-instances GUEST routing-options interface-routes rib-group inet GUEST-TO-MASTER</pre>
<p>Dhyan do doosra group instance ke <i>andar</i> lagta hai, kyunki GUEST ke interface routes GUEST ke hain.</p>

<h3>next-table static route</h3>
<p>Kabhi kuch copy nahi karna hota. <code>next-table</code> wala static route kehta hai "is prefix ko doosre table mein dhoondo":</p>
<pre class="code">set routing-instances GUEST routing-options static route 0.0.0.0/0 next-table inet.0</pre>
<p>Ab guests har anjaan cheez master ko bhejte hain aur master ka table faisla karta hai. Yeh simple hai aur RIB group se kam state rakhta hai, lekin iska matlab yeh bhi hai ki us route ke lookup ke liye guest instance ko poora master table dikhta hai. Yeh zyada khula lage to firewall filter ya policy lagao.</p>

<table class="cmp"><tr><th>Tool</th><th>Disha</th><th>Routes copy karta hai</th><th>Sabse achha kab</th></tr>
<tr><td>RIB group</td><td>maalik se listed tables tak</td><td>Haan</td><td>Connected subnets, specific routes</td></tr>
<tr><td>next-table</td><td>har static route ke liye</td><td>Nahi, lookup move hota hai</td><td>Master ka default route</td></tr>
<tr><td>Export policy</td><td>protocols/instances ke beech</td><td>Chune hue routes</td><td>Match conditions ke saath fine control</td></tr></table>

<div class="eg"><p><b>Worked example.</b> Forwarding instance ISP-B ke paas 10.0.2.2 ka default route hai. Connected subnet 10.0.2.0/30 table mein na ho to next hop resolve nahi hota. <code>FBF-RG</code> ke saath table ko 10.0.2.0/30 Direct route milta hai aur default active ho jaata hai. <code>show route instance</code> mein 9/0/0 counts yahi confirm karte hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> <code>import-rib</code> mein secondary table ko pehle rakhna. Primary table tay karta hai ki routes asal mein kahan rehte hain, aur baaki tables ko copies milti hain. Maalik table hamesha pehle likho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam poochta hai kaunsa command master ke connected subnets ko instance mein dikhata hai. Jawab hai rib-group ke saath <code>interface-routes rib-group inet NAME</code>; <code>static rib-group</code> nahi, jo sirf static routes copy karta hai.</p></div>
<div class="scn"><h4>Adha design</h4><p>Ek branch team ne guest instance ko master ke connected subnets dene ke liye RIB group lagaya aur master side se test kiya, jahan sab chala. Guests phir bhi staff DNS server tak nahi pahunch paaye, kyunki return routes missing the: koi group GUEST ke routes wapas copy nahi karta tha. Doosra group jodne par traffic chal pada.</p><p><b>Lesson:</b> har flow ki dono dishayein socho.</p></div>
<div class="iv"><p class="q">"RIB group kya hai?"</p><p>Yeh routing tables ki list hai jo route source ke install target ke roop mein use hoti hai. Jab protocol ya interface routes ise use karte hain, har route listed sab tables mein install hota hai. Pehla table primary hai. Main ise instances ke beech connected ya static routes share karne ke liye use karta hoon, jaise forwarding instance mein next hops resolve karane ke liye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RIB group routes ko kai tables mein copy karta hai; primary pehle.</li>
<li><code>interface-routes rib-group inet</code> Direct aur Local routes share karta hai.</li>
<li>Group ek-tarfa hai; do-tarfa sharing ke liye do banao.</li>
<li><code>next-table</code> routes copy kiye bina lookup redirect karta hai.</li>
</ul></div>
`}};export{e as default};