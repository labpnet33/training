var e={id:`summary`,h:{en:`Summary and exam checklist`,hi:`Summary aur exam checklist`},body:{en:`
<p>This chapter collects what you must be able to do, the vocabulary, the facts that are tested most often and a command cheat sheet. Read it the day before an interview, a lab exam or a change window.</p>

<h3>Can-do checklist</h3>
<ul>
<li>Explain the RPF check with a simple story, and say why multicast needs it and unicast does not.</li>
<li>State where the RPF interface comes from (unicast table plus static multicast routes, longest prefix then administrative distance) and what happens with equal-cost paths.</li>
<li>Write an <code>ip mroute</code> that changes only the RPF lookup, and say what it does not do.</li>
<li>Read every part of a <code>show ip mroute</code> entry: key, flags, RP, incoming interface, RPF neighbour, OIL, timers.</li>
<li>Apply the six-layer method from the receiver toward the source and name the command at each layer.</li>
<li>Recognise the eight catalogue faults from their symptom and evidence.</li>
<li>Describe how a WAN, an Internet circuit and a backup link can silently move RPF.</li>
<li>Name the Junos equivalents of the main show commands.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>RPF check</dt><dd>Accept a multicast packet only if it arrives on the interface the router would use to reach its source (or the RP on the shared tree).</dd>
<dt>RPF interface and neighbour</dt><dd>The interface and upstream PIM neighbour toward the source or RP, shown by show ip rpf.</dd>
<dt>Static multicast route</dt><dd>An ip mroute entry that changes only the RPF lookup.</dd>
<dt>Incoming interface</dt><dd>The one interface where an mroute entry accepts packets.</dd>
<dt>OIL</dt><dd>Outgoing interface list: where copies are sent.</dd>
<dt>(*,G) and (S,G)</dt><dd>Shared-tree and source-tree entries.</dd>
<dt>First-hop and last-hop router</dt><dd>The routers next to the source and next to the receivers.</dd>
<dt>Multicast boundary</dt><dd>An interface filter that stops a range of groups at a site edge.</dd>
</dl>

<h3>Most tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Remember</th></tr>
<tr><td>What RPF compares</td><td>The arrival interface with the route back toward the source (or RP)</td></tr>
<tr><td>Source of RPF data</td><td>Unicast table plus static multicast routes, not a multicast protocol</td></tr>
<tr><td>Static mroute default distance</td><td>0, so it beats the same-length unicast route</td></tr>
<tr><td>Equal-cost paths</td><td>One RPF interface: highest next-hop address by default</td></tr>
<tr><td>Incoming interface Null away from the source</td><td>No usable RPF path: check show ip rpf</td></tr>
<tr><td>Flags J and T</td><td>J on (*,G) joined the SPT; T on (S,G) data flows on the SPT</td></tr>
<tr><td>Flag F</td><td>First-hop router with a local source</td></tr>
<tr><td>TTL 1</td><td>Never leaves the LAN</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">show ip igmp groups                  <span class="c">! layer 1: receivers on this router</span>
show ip pim interface                <span class="c">! layer 2: PIM-enabled interfaces</span>
show ip pim neighbor                 <span class="c">! layer 2: adjacencies</span>
show ip pim rp mapping               <span class="c">! layer 3: which RP is used</span>
show ip mroute 239.88.1.1            <span class="c">! layers 4 and 5: entries, flags, incoming interface</span>
show ip rpf 10.1.255.1               <span class="c">! why the RPF interface is what it is</span>
ip mroute 203.0.113.0 255.255.255.0 10.9.9.2   <span class="c">! pin RPF toward a PIM neighbour</span>
<span class="c">! host shell on a PC: join G | mcast G 10 [ttl T] | show mcast</span></pre>

<h3>Exam-day traps</h3>
<div class="exam"><p><b>Trap 1.</b> An ip mroute pointing at a neighbour on an interface without PIM does not repair anything. <b>Trap 2.</b> Fixing the RPF for the RP but not for the source. <b>Trap 3.</b> Believing that the group in IGMP output proves the tree is built.</p></div>
<div class="warn"><p><b>Common mistakes to avoid.</b> Changing unicast routing to fix multicast when a static multicast route would do, and closing a ticket after one receiver works.</p></div>

<div class="scn"><h4>The handover note</h4><p>A senior engineer leaving for leave wrote one page for her team: the six layers, the RP address, which circuits carry PIM and the three static multicast routes in the branches. During her leave a circuit failed over and a stream stopped; the junior on call followed the page and restored it in ten minutes.</p><p><b>Lesson:</b> a short, accurate map of the multicast design is as valuable as any command.</p></div>

<div class="iv"><p class="q">"Summarise in one minute how you would handle a multicast outage."</p><p>Prove the source is sending, test layers from the receiver, stop at the first failure, use show ip rpf and show ip mroute as the main evidence, repair with the smallest change (PIM on the path, correct the RP, or a static multicast route), then re-test all receivers and document the change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RPF ties multicast to unicast: check RPF first after any unicast change.</li>
<li>show ip rpf and show ip mroute are your two main commands.</li>
<li>The six layers and eight faults give a repeatable method.</li>
<li>Static multicast routes are the safe repair when the unicast path belongs to someone else.</li>
<li>Prove every receiver, then write down the change.</li>
</ul></div>
`,hi:`
<p>Yeh chapter woh sab ikattha karta hai jo aapko aana chahiye: kya kar sakna hai, vocabulary, sabse zyada pooche jaane wale facts aur command cheat sheet. Ise interview, lab exam ya change window se ek din pehle padho.</p>

<h3>Can-do checklist</h3>
<ul>
<li>RPF check ko simple kahani se samjhao, aur batao multicast ko iski zaroorat kyun hai aur unicast ko kyun nahi.</li>
<li>Batao RPF interface kahan se aata hai (unicast table plus static multicast routes, longest prefix phir administrative distance) aur equal-cost paths mein kya hota hai.</li>
<li>Aisa <code>ip mroute</code> likho jo sirf RPF lookup badle, aur batao woh kya nahi karta.</li>
<li><code>show ip mroute</code> entry ka har hissa padho: key, flags, RP, incoming interface, RPF neighbour, OIL, timers.</li>
<li>Receiver se source ki taraf chhe-layer method lagao aur har layer ka command batao.</li>
<li>Aath catalogue faults ko unke symptom aur evidence se pehchano.</li>
<li>Batao WAN, Internet circuit aur backup link kaise chupke se RPF hila sakte hain.</li>
<li>Mukhya show commands ke Junos equivalents batao.</li>
</ul>

<h3>Mini glossary</h3>
<dl class="terms">
<dt>RPF check</dt><dd>Multicast packet tabhi accept karo jab woh us interface par aaye jisse router uske source (ya shared tree par RP) tak jaata.</dd>
<dt>RPF interface aur neighbour</dt><dd>Source ya RP ki taraf interface aur upstream PIM neighbour, show ip rpf se dikhta hai.</dd>
<dt>Static multicast route</dt><dd>Ip mroute entry jo sirf RPF lookup badalti hai.</dd>
<dt>Incoming interface</dt><dd>Woh ek interface jahan mroute entry packets accept karti hai.</dd>
<dt>OIL</dt><dd>Outgoing interface list: copies kahan jaati hain.</dd>
<dt>(*,G) aur (S,G)</dt><dd>Shared-tree aur source-tree entries.</dd>
<dt>First-hop aur last-hop router</dt><dd>Source ke paas aur receivers ke paas wale routers.</dd>
<dt>Multicast boundary</dt><dd>Interface filter jo site edge par groups ki range rokta hai.</dd>
</dl>

<h3>Sabse zyada tested facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Yaad rakho</th></tr>
<tr><td>RPF kya compare karta hai</td><td>Aane wala interface aur source (ya RP) ki taraf wapas jaane wala route</td></tr>
<tr><td>RPF data ka source</td><td>Unicast table plus static multicast routes, koi multicast protocol nahi</td></tr>
<tr><td>Static mroute ki default distance</td><td>0, isliye same-length unicast route ko haraata hai</td></tr>
<tr><td>Equal-cost paths</td><td>Ek RPF interface: default mein sabse bada next-hop address</td></tr>
<tr><td>Source se door Incoming interface Null</td><td>Koi usable RPF path nahi: show ip rpf check karo</td></tr>
<tr><td>Flags J aur T</td><td>(*,G) par J SPT join; (S,G) par T SPT par data flow</td></tr>
<tr><td>Flag F</td><td>Local source wala first-hop router</td></tr>
<tr><td>TTL 1</td><td>LAN se kabhi bahar nahi jaata</td></tr></table>

<h3>Command cheat sheet</h3>
<pre class="code">show ip igmp groups                  <span class="c">! layer 1: is router par receivers</span>
show ip pim interface                <span class="c">! layer 2: PIM-enabled interfaces</span>
show ip pim neighbor                 <span class="c">! layer 2: adjacencies</span>
show ip pim rp mapping               <span class="c">! layer 3: kaunsa RP use ho raha hai</span>
show ip mroute 239.88.1.1            <span class="c">! layers 4 aur 5: entries, flags, incoming interface</span>
show ip rpf 10.1.255.1               <span class="c">! RPF interface aisa kyun hai</span>
ip mroute 203.0.113.0 255.255.255.0 10.9.9.2   <span class="c">! PIM neighbour ki taraf RPF pin karo</span>
<span class="c">! PC par host shell: join G | mcast G 10 [ttl T] | show mcast</span></pre>

<h3>Exam-day traps</h3>
<div class="exam"><p><b>Trap 1.</b> Aise neighbour par point karta ip mroute jiske interface par PIM nahi, kuch theek nahi karta. <b>Trap 2.</b> RP ke liye RPF theek karna par source ke liye nahi. <b>Trap 3.</b> Yeh maanna ki IGMP output mein group dikhne se tree ban gaya.</p></div>
<div class="warn"><p><b>Bachne wali aam galtiyan.</b> Multicast theek karne ke liye unicast routing badalna jab static multicast route kaafi tha, aur ek receiver chalne par ticket band kar dena.</p></div>

<div class="scn"><h4>Handover note</h4><p>Chhutti par ja rahi ek senior engineer ne apni team ke liye ek page likha: chhe layers, RP address, kaunse circuits PIM le jaate hain aur branches ke teen static multicast routes. Uski chhutti ke dauran ek circuit failover hua aur stream ruk gayi; on-call junior ne page follow karke das minute mein bahal kar di.</p><p><b>Lesson:</b> multicast design ka chhota, sahi map kisi bhi command jitna keemti hai.</p></div>

<div class="iv"><p class="q">"Ek minute mein batao multicast outage ko kaise handle karoge."</p><p>Prove karo source bhej raha hai, receiver se layers test karo, pehli failure par ruko, show ip rpf aur show ip mroute ko mukhya evidence banao, sabse chhote change se repair karo (path par PIM, RP theek karo, ya static multicast route), phir saare receivers re-test karo aur change document karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RPF multicast ko unicast se baandhta hai: kisi bhi unicast change ke baad pehle RPF check karo.</li>
<li>show ip rpf aur show ip mroute aapke do mukhya commands hain.</li>
<li>Chhe layers aur aath faults dohraya ja sakne wala method dete hain.</li>
<li>Jab unicast path kisi aur ka ho to static multicast routes safe repair hain.</li>
<li>Har receiver prove karo, phir change likho.</li>
</ul></div>
`}};export{e as default};