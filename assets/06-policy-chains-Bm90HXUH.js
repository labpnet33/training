var e={id:`policy-chains`,h:{en:`Policy chains, order and the default action`,hi:`Policy chains, order aur default action`},body:{en:`
<p>One policy rarely does everything. Real routers apply several small policies in a row: one that blocks a management network, one that tags routes, one that accepts statics. Applying several policies together is called a <b>policy chain</b>. This chapter explains how a chain is read and how to get its order right.</p>

<h3>Analogy: an airport with three checkpoints</h3>
<p>A passenger passes security, then a passport check, then the boarding gate. At any checkpoint an officer can stop the passenger (reject) or wave them straight on to the plane (accept). If the passenger passes all checkpoints without anyone deciding, the airline default applies. A policy chain is the same: policies are checkpoints evaluated left to right.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Policy chain evaluation">
<rect x="20" y="70" width="90" height="50" rx="6" fill="#e2e8f0"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">Route</text>
<rect x="140" y="55" width="130" height="80" rx="6" fill="#fecaca"/><text x="205" y="85" text-anchor="middle" class="svg-ink" font-size="13">1. NO-MGMT</text><text x="205" y="105" text-anchor="middle" class="svg-muted" font-size="12">reject mgmt net</text>
<rect x="300" y="55" width="130" height="80" rx="6" fill="#fde68a"/><text x="365" y="85" text-anchor="middle" class="svg-ink" font-size="13">2. SET-TAG</text><text x="365" y="105" text-anchor="middle" class="svg-muted" font-size="12">tag 300, no decision</text>
<rect x="460" y="55" width="130" height="80" rx="6" fill="#bbf7d0"/><text x="525" y="85" text-anchor="middle" class="svg-ink" font-size="13">3. STATICS</text><text x="525" y="105" text-anchor="middle" class="svg-muted" font-size="12">accept statics</text>
<line x1="110" y1="95" x2="140" y2="95" stroke="#64748b" stroke-width="2"/><line x1="270" y1="95" x2="300" y2="95" stroke="#64748b" stroke-width="2"/><line x1="430" y1="95" x2="460" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">first terminating action wins; if none, the protocol default decides</text>
</svg><p class="cap">Chain: set protocols ospf export [ NO-MGMT SET-TAG STATICS ].</p></div>

<h3>Rules of a chain</h3>
<ul>
<li>Policies are evaluated <b>left to right</b> in the order in the brackets.</li>
<li>The <b>first terminating action wins</b>. If NO-MGMT rejects a route, STATICS never sees it. If a policy accepts a route, later policies never run for that route.</li>
<li>Modifying actions from earlier policies stay on the route while the chain continues. A tag set by SET-TAG is still there when STATICS accepts.</li>
<li>If the whole chain ends with no decision, the <b>protocol default policy</b> decides: OSPF export rejects, BGP export accepts active BGP routes.</li>
<li>The keyword <code>next policy</code> inside a term means "I am not deciding, hand the route to the next policy in the chain".</li>
</ul>

<h3>Configuring and reordering a chain</h3>
<pre class="code"><span class="c">! build the three policies first</span>
set policy-options policy-statement NO-MGMT term MGMT from route-filter 192.168.99.0/24 exact
set policy-options policy-statement NO-MGMT term MGMT then reject
set policy-options policy-statement SET-TAG term TAG then tag 300
<span class="c">! apply as a chain, in the order you want</span>
set protocols ospf export [ NO-MGMT SET-TAG STATICS ]</pre>
<p>When you <code>set</code> an export on a protocol that already has policies, Junos <b>appends</b> the new name at the end of the list. It never inserts in the middle. To put a policy first you either use <code>insert</code> or delete the list and set it again:</p>
<pre class="code">[edit]
lab@R1# delete protocols ospf export
lab@R1# set protocols ospf export [ NO-MGMT SET-TAG STATICS ]
lab@R1# show protocols ospf | match export
<span class="hl">export [ NO-MGMT SET-TAG STATICS ];</span></pre>
<p>Also valid is <code>insert protocols ospf export policy NO-MGMT before policy STATICS</code>. Either way the displayed order is the execution order, so read it left to right.</p>

<h3>Why the order mattered in the lab</h3>
<p>R1 starts with <code>export STATICS</code> only, and STATICS accepts every static route, including the vendor network 192.168.99.0/24. If you simply add NO-MGMT with <code>set</code>, the chain becomes <code>[ STATICS NO-MGMT ]</code>. STATICS accepts 192.168.99.0/24 first, NO-MGMT never runs, and the management network is still advertised. The commit succeeds with no error, which is what makes this mistake dangerous.</p>
<div class="eg"><p><b>Worked example.</b> Chain [ NO-MGMT SET-TAG STATICS ] and four static routes.</p>
<table class="cmp"><tr><th>Route</th><th>NO-MGMT</th><th>SET-TAG</th><th>STATICS</th><th>Result</th></tr>
<tr><td>172.21.1.0/24</td><td>no match</td><td>tag 300, no decision</td><td>accept</td><td>exported with tag 300</td></tr>
<tr><td>172.21.2.0/24</td><td>no match</td><td>tag 300</td><td>accept</td><td>exported with tag 300</td></tr>
<tr><td>192.168.99.0/24</td><td><b>reject</b></td><td>not reached</td><td>not reached</td><td>not exported</td></tr>
<tr><td>10.52.12.0/30 (direct)</td><td>no match</td><td>tag 300</td><td>no match (not static)</td><td>protocol default: reject</td></tr></table></div>

<h3>Verifying a chain</h3>
<pre class="out">lab@R1&gt; show protocols ospf | display set | match export
set protocols ospf export NO-MGMT
set protocols ospf export SET-TAG
set protocols ospf export STATICS

lab@R2&gt; show route 172.21.1.0/24 detail

172.21.1.0/24 (1 entry, 1 announced)
        *OSPF   Preference: 150
                Next hop type: Router, Next hop index: 580
                Next-hop reference count: 4
                Source: 10.52.12.1
                State: &lt;Active Int Ext&gt;
                Age: 1:12      Metric: 0
                <span class="hl">Tag: 300</span></pre>

<div class="warn"><p><b>Common mistake.</b> Adding a "block" policy at the end of a chain after a policy that already accepts everything. The block never runs. Put reject policies first, modifying policies second and accepting policies last.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam may show <code>export [ A B ]</code> where A accepts a route that B rejects. The route is accepted, because the first terminating action wins. Reject-wins is not a Junos rule.</p></div>

<div class="scn"><h4>The block that never ran</h4><p>Security asked a network engineer to hide the vendor management network. He wrote policy NO-MGMT, ran <code>set protocols ospf export NO-MGMT</code>, committed, and closed the ticket. A week later the audit tool still found 192.168.99.0/24 on a partner router. <code>show protocols ospf</code> showed <code>export [ STATICS NO-MGMT ]</code>. The old STATICS policy accepted everything first. He deleted the export list and re-applied it as [ NO-MGMT STATICS ]. The route vanished from the partner within a minute.</p><p><b>Lesson:</b> after adding a policy, always read the chain order and verify on the neighbour.</p></div>

<div class="iv"><p class="q">"Two policies are applied to OSPF export. The first accepts a route, the second rejects it. What happens?"</p><p>Strong answer: the route is exported. Policy chains are evaluated left to right and the first terminating action (accept or reject) ends evaluation, so the second policy never sees it. To make the reject effective, put the rejecting policy first. If no policy decides, the protocol default applies, which is reject for OSPF export.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A policy chain is a list of policies evaluated left to right.</li>
<li>The first terminating action wins; later policies do not run for that route.</li>
<li>Modifying actions such as tag persist while the chain continues.</li>
<li>If nothing decides, the protocol default policy applies.</li>
<li>set appends to the list; delete and re-set (or insert) to change the order.</li>
</ul></div>
`,hi:`
<p>Ek policy shayad hi sab kuch karti hai. Real routers kai chhoti policies ek ke baad ek apply karte hain: ek management network block kare, ek routes tag kare, ek statics accept kare. Kai policies saath apply karna <b>policy chain</b> kehlata hai. Yeh chapter samjhata hai ki chain kaise padhi jaati hai aur uska order sahi kaise rakhein.</p>

<h3>Analogy: teen checkpoints wala airport</h3>
<p>Passenger pehle security se, phir passport check se, phir boarding gate se guzarta hai. Kisi bhi checkpoint par officer passenger ko rok sakta hai (reject) ya seedha plane ki taraf bhej sakta hai (accept). Agar passenger sab checkpoints se bina kisi decision ke nikal jaaye to airline ka default lagta hai. Policy chain bhi aisi hi hai: policies checkpoints hain jo left se right evaluate hote hain.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Policy chain evaluation">
<rect x="20" y="70" width="90" height="50" rx="6" fill="#e2e8f0"/><text x="65" y="100" text-anchor="middle" class="svg-ink" font-size="13">Route</text>
<rect x="140" y="55" width="130" height="80" rx="6" fill="#fecaca"/><text x="205" y="85" text-anchor="middle" class="svg-ink" font-size="13">1. NO-MGMT</text><text x="205" y="105" text-anchor="middle" class="svg-muted" font-size="12">mgmt net reject</text>
<rect x="300" y="55" width="130" height="80" rx="6" fill="#fde68a"/><text x="365" y="85" text-anchor="middle" class="svg-ink" font-size="13">2. SET-TAG</text><text x="365" y="105" text-anchor="middle" class="svg-muted" font-size="12">tag 300, decision nahi</text>
<rect x="460" y="55" width="130" height="80" rx="6" fill="#bbf7d0"/><text x="525" y="85" text-anchor="middle" class="svg-ink" font-size="13">3. STATICS</text><text x="525" y="105" text-anchor="middle" class="svg-muted" font-size="12">statics accept</text>
<line x1="110" y1="95" x2="140" y2="95" stroke="#64748b" stroke-width="2"/><line x1="270" y1="95" x2="300" y2="95" stroke="#64748b" stroke-width="2"/><line x1="430" y1="95" x2="460" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="320" y="170" text-anchor="middle" class="svg-muted" font-size="12">pehla terminating action jeet-ta hai; na ho to protocol default decide karta hai</text>
</svg><p class="cap">Chain: set protocols ospf export [ NO-MGMT SET-TAG STATICS ].</p></div>

<h3>Chain ke rules</h3>
<ul>
<li>Policies brackets ke order mein <b>left se right</b> evaluate hoti hain.</li>
<li><b>Pehla terminating action jeet-ta hai</b>. Agar NO-MGMT kisi route ko reject kare to STATICS use dekhti hi nahi. Agar koi policy route accept kar de to baad ki policies us route ke liye chalti hi nahi.</li>
<li>Pehle ki policies ke modifying actions chain chalte waqt route par bane rehte hain. SET-TAG ka lagaya tag tab bhi rehta hai jab STATICS accept karti hai.</li>
<li>Agar poori chain bina decision ke khatam ho jaaye to <b>protocol default policy</b> decide karti hai: OSPF export reject, BGP export active BGP routes accept.</li>
<li>Term ke andar <code>next policy</code> ka matlab hai "main decide nahi kar raha, route chain ki agli policy ko do".</li>
</ul>

<h3>Chain configure aur reorder karna</h3>
<pre class="code"><span class="c">! pehle teeno policies banao</span>
set policy-options policy-statement NO-MGMT term MGMT from route-filter 192.168.99.0/24 exact
set policy-options policy-statement NO-MGMT term MGMT then reject
set policy-options policy-statement SET-TAG term TAG then tag 300
<span class="c">! chain ke roop mein apply karo, jo order chahiye</span>
set protocols ospf export [ NO-MGMT SET-TAG STATICS ]</pre>
<p>Jis protocol par pehle se policies hon, wahan <code>set</code> export karne par Junos naya naam list ke <b>end mein</b> jodta hai. Beech mein insert nahi karta. Kisi policy ko pehle rakhne ke liye ya to <code>insert</code> use karo ya list delete karke dobara set karo:</p>
<pre class="code">[edit]
lab@R1# delete protocols ospf export
lab@R1# set protocols ospf export [ NO-MGMT SET-TAG STATICS ]
lab@R1# show protocols ospf | match export
<span class="hl">export [ NO-MGMT SET-TAG STATICS ];</span></pre>
<p><code>insert protocols ospf export policy NO-MGMT before policy STATICS</code> bhi valid hai. Dono tareeke mein dikhne wala order hi execution order hai, isliye left se right padho.</p>

<h3>Lab mein order kyun zaroori tha</h3>
<p>R1 par shuru mein sirf <code>export STATICS</code> hai, aur STATICS har static route accept karti hai, vendor network 192.168.99.0/24 bhi. Agar aap seedha <code>set</code> se NO-MGMT jodo to chain <code>[ STATICS NO-MGMT ]</code> ban jaati hai. STATICS pehle 192.168.99.0/24 accept kar leti hai, NO-MGMT kabhi chalti nahi, aur management network phir bhi advertise hota hai. Commit bina error ke ho jaata hai, isi wajah se yeh galti khatarnak hai.</p>
<div class="eg"><p><b>Worked example.</b> Chain [ NO-MGMT SET-TAG STATICS ] aur chaar static routes.</p>
<table class="cmp"><tr><th>Route</th><th>NO-MGMT</th><th>SET-TAG</th><th>STATICS</th><th>Result</th></tr>
<tr><td>172.21.1.0/24</td><td>match nahi</td><td>tag 300, decision nahi</td><td>accept</td><td>tag 300 ke saath export</td></tr>
<tr><td>172.21.2.0/24</td><td>match nahi</td><td>tag 300</td><td>accept</td><td>tag 300 ke saath export</td></tr>
<tr><td>192.168.99.0/24</td><td><b>reject</b></td><td>pahunchi hi nahi</td><td>pahunchi hi nahi</td><td>export nahi</td></tr>
<tr><td>10.52.12.0/30 (direct)</td><td>match nahi</td><td>tag 300</td><td>match nahi (static nahi)</td><td>protocol default: reject</td></tr></table></div>

<h3>Chain verify karna</h3>
<pre class="out">lab@R1&gt; show protocols ospf | display set | match export
set protocols ospf export NO-MGMT
set protocols ospf export SET-TAG
set protocols ospf export STATICS

lab@R2&gt; show route 172.21.1.0/24 detail

172.21.1.0/24 (1 entry, 1 announced)
        *OSPF   Preference: 150
                Next hop type: Router, Next hop index: 580
                Next-hop reference count: 4
                Source: 10.52.12.1
                State: &lt;Active Int Ext&gt;
                Age: 1:12      Metric: 0
                <span class="hl">Tag: 300</span></pre>

<div class="warn"><p><b>Common mistake.</b> "Block" policy ko chain ke end mein jodna, aisi policy ke baad jo pehle se sab accept kar rahi hai. Block kabhi chalta hi nahi. Reject policies pehle, modifying policies beech mein aur accepting policies aakhir mein rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam <code>export [ A B ]</code> dikha sakta hai jahan A ek route accept karti hai jo B reject karti hai. Route accept hota hai, kyunki pehla terminating action jeet-ta hai. "Reject-wins" Junos ka rule nahi hai.</p></div>

<div class="scn"><h4>Jo block kabhi chala hi nahi</h4><p>Security ne network engineer se vendor management network chhupane ko kaha. Usne policy NO-MGMT likhi, <code>set protocols ospf export NO-MGMT</code> chalaya, commit kiya aur ticket close kar diya. Ek hafte baad audit tool ko phir bhi partner router par 192.168.99.0/24 mila. <code>show protocols ospf</code> mein <code>export [ STATICS NO-MGMT ]</code> tha. Purani STATICS policy pehle sab accept kar rahi thi. Usne export list delete ki aur [ NO-MGMT STATICS ] ke roop mein dobara apply ki. Route ek minute mein partner se gayab ho gaya.</p><p><b>Lesson:</b> policy jodne ke baad chain ka order padho aur neighbour par verify karo.</p></div>

<div class="iv"><p class="q">"OSPF export par do policies lagi hain. Pehli ek route accept karti hai, doosri reject. Kya hoga?"</p><p>Strong answer: route export hoga. Policy chains left se right evaluate hoti hain aur pehla terminating action (accept ya reject) evaluation khatam kar deta hai, isliye doosri policy use dekhti hi nahi. Reject ko effective banane ke liye rejecting policy ko pehle rakho. Agar koi policy decide na kare to protocol default lagta hai, jo OSPF export ke liye reject hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Policy chain policies ki list hai jo left se right evaluate hoti hai.</li>
<li>Pehla terminating action jeet-ta hai; baad ki policies us route ke liye nahi chalti.</li>
<li>Tag jaise modifying actions chain chalte waqt bane rehte hain.</li>
<li>Kuch decide na kare to protocol default policy lagti hai.</li>
<li>set list ke end mein jodta hai; order badalne ke liye delete aur re-set (ya insert) karo.</li>
</ul></div>
`}};export{e as default};