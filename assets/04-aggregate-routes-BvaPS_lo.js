var e={id:`aggregate-routes`,h:{en:`Aggregate routes: one summary for many prefixes`,hi:`Aggregate routes: bahut prefixes ke liye ek summary`},body:{en:`
<p><b>The idea.</b> A city has hundreds of streets, but the postal service needs only one line to route mail to the city: "everything in this city goes to the central sorting office". An <b>aggregate route</b> does the same for IP prefixes. Instead of telling the whole network about 10.40.1.0/24, 10.40.2.0/24 and 10.40.255.0/30 separately, you create one summary 10.40.0.0/16. This is also called route summarisation. Fewer routes mean smaller tables, faster convergence and less churn: a change inside the summary does not need to be advertised outside.</p>

<h3>How an aggregate behaves</h3>
<ul>
<li>The more specific routes that fall inside the summary are the <b>contributing routes</b>.</li>
<li>The aggregate is <b>active only while at least one contributing route is active</b>. If every contributor disappears, the aggregate disappears too. This prevents you from advertising a summary for a network that no longer exists.</li>
<li>Its default route preference is <b>130</b>.</li>
<li>It never forwards packets by itself. The next hop is <b>reject</b> (default) or <b>discard</b>. Packets for a known more specific prefix still follow that more specific route, so the aggregate only catches addresses inside the summary that nobody owns.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Aggregate route and contributors">
<rect x="200" y="15" width="240" height="45" rx="10" fill="#fde68a"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="14">10.40.0.0/16 Aggregate/130 (Reject)</text>
<rect x="30" y="130" width="160" height="45" rx="8" fill="#bae6fd"/><text x="110" y="158" text-anchor="middle" class="svg-ink" font-size="13">10.40.1.0/24 Static</text>
<rect x="240" y="130" width="160" height="45" rx="8" fill="#bae6fd"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="13">10.40.2.0/24 Static</text>
<rect x="450" y="130" width="170" height="45" rx="8" fill="#bae6fd"/><text x="535" y="158" text-anchor="middle" class="svg-ink" font-size="13">10.40.255.0/30 Direct</text>
<line x1="110" y1="130" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="320" y1="130" x2="320" y2="60" stroke="#64748b" stroke-width="2"/><line x1="535" y1="130" x2="380" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">contributing routes (any one active keeps the aggregate active)</text>
</svg><p class="cap">Three contributors, one summary.</p></div>

<h3>Configuration</h3>
<pre class="code">set routing-options aggregate route 10.40.0.0/16
set routing-options aggregate route 10.40.0.0/16 discard          <span class="c">! drop silently instead of ICMP</span>
set routing-options aggregate route 10.40.0.0/16 policy ONLY-LANS <span class="c">! limit which routes may contribute</span></pre>
<p>Verify with the detail view. This is real output from the campus lab (EDGE router):</p>
<pre class="out">lab@EDGE&gt; show route 10.40.0.0/16 exact detail
10.40.0.0/16 (1 entry, 1 announced)
        *Aggregate Preference: 130
                Next hop type: Reject
                State: &lt;Active Int Ext&gt;
                Age: 0:00 	Metric: 0
                Contributing Routes (3):
                        10.40.1.0/24 proto Static
                        10.40.2.0/24 proto Static
                        10.40.255.0/30 proto Direct
                Task: RT</pre>
<p>The line <b>Contributing Routes (3)</b> is the evidence that the summary is built from three prefixes. Notice that a <i>Direct</i> route also contributes: any active route inside the summary counts, not only statics.</p>
<pre class="out">lab@EDGE&gt; show route protocol aggregate
10.40.0.0/16       *[Aggregate/130] 00:00:00, metric 0
                       Reject</pre>
<p>After you add <code>discard</code>, the same prefix shows <code>Discard</code> and the forwarding table entry has type <code>dscd</code>:</p>
<pre class="out">lab@EDGE&gt; show route forwarding-table destination 10.40.9.9
10.40.0.0/16       user     0                    <span class="hl">dscd</span>    500     2
lab@EDGE&gt; show route forwarding-table destination 10.40.1.5
10.40.1.0/24       user     0 10.40.255.2        ucst    756     2 ge-0/0/1.0</pre>
<p>10.40.9.9 does not belong to any campus LAN, so it falls into the aggregate and is dropped. 10.40.1.5 belongs to the more specific static route, so it is forwarded normally. This shows that the aggregate never overrides real routes.</p>

<h3>Choosing reject or discard</h3>
<table class="cmp"><tr><th>Next hop</th><th>Effect for unowned addresses</th><th>When</th></tr>
<tr><td>reject (default)</td><td>dropped and ICMP unreachable returned</td><td>internal networks where fast failure feedback helps</td></tr>
<tr><td>discard</td><td>dropped silently</td><td>edge or security designs where you do not want to reveal anything</td></tr></table>

<h3>Advertising the aggregate</h3>
<p>An aggregate is a local route. Neighbours will not learn it until a policy exports it. In the lab EDGE first exports <i>every</i> static route into OSPF; the core team wants only the summary. The export policy matches protocol <code>aggregate</code>:</p>
<pre class="code">set policy-options policy-statement AGG-OUT term 1 from protocol aggregate
set policy-options policy-statement AGG-OUT term 1 from route-filter 10.40.0.0/16 exact
set policy-options policy-statement AGG-OUT term 1 then accept
delete protocols ospf export                       <span class="c">! remove the old STATICS-OUT export first</span>
set protocols ospf export AGG-OUT
commit</pre>
<pre class="out">lab@CORE&gt; show route 10.40.0.0/16
10.40.0.0/16       *[OSPF/150] 00:00:25, metric 0
                    &gt;  to 10.0.40.1 via ge-0/0/0.0</pre>
<p>CORE learns the /16 as an OSPF external route (preference 150) and no longer sees 10.40.1.0/24 or 10.40.2.0/24. Traffic from the server SRV (172.20.0.10) still reaches the campus PCs: CORE follows the /16 to EDGE, and EDGE still has the more specific static routes toward ACC. Longest match does the rest.</p>

<div class="eg"><p><b>Worked example.</b> A campus uses 10.40.1.0/24 to 10.40.8.0/24 for buildings. One /16 covers 65,536 addresses but the buildings only use eight /24s. Packets to 10.40.200.5 (unused) are rejected at EDGE instead of travelling through the core and being dropped later. Add <code>discard</code> if you would rather not send ICMP.</p></div>

<div class="warn"><p><b>Common mistake.</b> Exporting the aggregate with a policy that says <code>from protocol static</code>. An aggregate is protocol <code>aggregate</code>, so the policy matches nothing and the core never learns it. Also, forgetting to delete the old <code>ospf export</code> keeps every static in the core in addition to the summary.</p></div>
<div class="exam"><p><b>Exam trap.</b> Aggregates are inactive when there is no active contributor, always have preference 130, and default to reject. A summary that is too wide can <i>attract</i> traffic that you do not own: it black-holes unused parts of the range.</p></div>

<div class="scn"><h4>Summary too wide, traffic black-holed</h4><p>An ISP aggregated 192.0.2.0/24 and a neighbour's customer started sending traffic for an unused part. The aggregate rejected it and the customer's monitoring showed ICMP unreachable messages from the ISP. The ISP used <code>discard</code> on that router and added a more specific static for the one legitimate server. Complaints stopped and the ISP had a simple, auditable summary.</p><p><b>Lesson:</b> an aggregate always owns the whole range on paper; choose reject or discard knowingly.</p></div>
<div class="iv"><p class="q">"What is an aggregate route and what are contributing routes?"</p><p>An aggregate summarises many more specific prefixes into one. Contributing routes are the active more specific routes inside it. The aggregate is active only while at least one contributor is active; its next hop is reject or discard, and it needs an export policy (protocol aggregate) to be advertised.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Aggregate = local summary route, preference 130, next hop reject (default) or discard.</li>
<li>Active only while at least one contributing route is active.</li>
<li><code>show route PREFIX exact detail</code> lists the contributing routes.</li>
<li>Export with a policy matching <code>from protocol aggregate</code>.</li>
<li>More specific routes still win for real destinations.</li>
</ul></div>
`,hi:`
<p><b>Idea.</b> Ek sheher mein sau-sau streets hoti hain, lekin dak vibhag ko sheher tak dak bhejne ke liye sirf ek line chahiye: "is sheher ka sab kuch central sorting office jaayega". <b>Aggregate route</b> IP prefixes ke liye yahi karta hai. 10.40.1.0/24, 10.40.2.0/24 aur 10.40.255.0/30 ke baare mein poore network ko alag-alag batane ke bajay aap ek summary 10.40.0.0/16 banate ho. Ise route summarisation bhi kehte hain. Kam routes matlab chhote tables, tez convergence aur kam churn: summary ke andar ka change bahar advertise karne ki zaroorat nahi.</p>

<h3>Aggregate ka behaviour</h3>
<ul>
<li>Summary ke andar girne wale more specific routes <b>contributing routes</b> hain.</li>
<li>Aggregate <b>tabhi tak active hai jab tak kam se kam ek contributing route active ho</b>. Saare contributors gayab hon to aggregate bhi gayab. Isse aap aise network ka summary advertise nahi karte jo ab hai hi nahi.</li>
<li>Iski default route preference <b>130</b> hai.</li>
<li>Yeh khud kabhi packets forward nahi karta. Next hop <b>reject</b> (default) ya <b>discard</b> hota hai. Known more specific prefix ke packets phir bhi usi more specific route ko follow karte hain, isliye aggregate sirf summary ke un addresses ko pakadta hai jinka koi maalik nahi.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Aggregate route aur contributors">
<rect x="200" y="15" width="240" height="45" rx="10" fill="#fde68a"/><text x="320" y="43" text-anchor="middle" class="svg-ink" font-size="14">10.40.0.0/16 Aggregate/130 (Reject)</text>
<rect x="30" y="130" width="160" height="45" rx="8" fill="#bae6fd"/><text x="110" y="158" text-anchor="middle" class="svg-ink" font-size="13">10.40.1.0/24 Static</text>
<rect x="240" y="130" width="160" height="45" rx="8" fill="#bae6fd"/><text x="320" y="158" text-anchor="middle" class="svg-ink" font-size="13">10.40.2.0/24 Static</text>
<rect x="450" y="130" width="170" height="45" rx="8" fill="#bae6fd"/><text x="535" y="158" text-anchor="middle" class="svg-ink" font-size="13">10.40.255.0/30 Direct</text>
<line x1="110" y1="130" x2="260" y2="60" stroke="#64748b" stroke-width="2"/><line x1="320" y1="130" x2="320" y2="60" stroke="#64748b" stroke-width="2"/><line x1="535" y1="130" x2="380" y2="60" stroke="#64748b" stroke-width="2"/>
<text x="320" y="210" text-anchor="middle" class="svg-muted" font-size="12">contributing routes (koi ek active ho to aggregate active rehta hai)</text>
</svg><p class="cap">Teen contributors, ek summary.</p></div>

<h3>Configuration</h3>
<pre class="code">set routing-options aggregate route 10.40.0.0/16
set routing-options aggregate route 10.40.0.0/16 discard          <span class="c">! ICMP ki jagah chupchaap drop</span>
set routing-options aggregate route 10.40.0.0/16 policy ONLY-LANS <span class="c">! kaun se routes contribute kar sakte hain</span></pre>
<p>Detail view se verify karo. Yeh campus lab (EDGE router) ka real output hai:</p>
<pre class="out">lab@EDGE&gt; show route 10.40.0.0/16 exact detail
10.40.0.0/16 (1 entry, 1 announced)
        *Aggregate Preference: 130
                Next hop type: Reject
                State: &lt;Active Int Ext&gt;
                Age: 0:00 	Metric: 0
                Contributing Routes (3):
                        10.40.1.0/24 proto Static
                        10.40.2.0/24 proto Static
                        10.40.255.0/30 proto Direct
                Task: RT</pre>
<p><b>Contributing Routes (3)</b> wali line saboot hai ki summary teen prefixes se bana hai. Dhyan do <i>Direct</i> route bhi contribute karta hai: summary ke andar ka koi bhi active route ginta hai, sirf statics nahi.</p>
<pre class="out">lab@EDGE&gt; show route protocol aggregate
10.40.0.0/16       *[Aggregate/130] 00:00:00, metric 0
                       Reject</pre>
<p><code>discard</code> jodne ke baad wahi prefix <code>Discard</code> dikhata hai aur forwarding table entry ka type <code>dscd</code> hota hai:</p>
<pre class="out">lab@EDGE&gt; show route forwarding-table destination 10.40.9.9
10.40.0.0/16       user     0                    <span class="hl">dscd</span>    500     2
lab@EDGE&gt; show route forwarding-table destination 10.40.1.5
10.40.1.0/24       user     0 10.40.255.2        ucst    756     2 ge-0/0/1.0</pre>
<p>10.40.9.9 kisi campus LAN ka nahi hai, isliye aggregate mein girta hai aur drop hota hai. 10.40.1.5 more specific static route ka hai, isliye normal forward hota hai. Isse dikhta hai ki aggregate asli routes ko kabhi override nahi karta.</p>

<h3>Reject ya discard chunna</h3>
<table class="cmp"><tr><th>Next hop</th><th>Bina maalik ke addresses par asar</th><th>Kab</th></tr>
<tr><td>reject (default)</td><td>drop aur ICMP unreachable wapas</td><td>internal networks jahan jaldi failure feedback kaam aata hai</td></tr>
<tr><td>discard</td><td>chupchaap drop</td><td>edge ya security designs jahan kuch reveal nahi karna</td></tr></table>

<h3>Aggregate ko advertise karna</h3>
<p>Aggregate local route hai. Jab tak policy use export na kare neighbours use nahi seekhte. Lab mein EDGE pehle <i>har</i> static route OSPF mein export karta hai; core team sirf summary chahti hai. Export policy protocol <code>aggregate</code> match karti hai:</p>
<pre class="code">set policy-options policy-statement AGG-OUT term 1 from protocol aggregate
set policy-options policy-statement AGG-OUT term 1 from route-filter 10.40.0.0/16 exact
set policy-options policy-statement AGG-OUT term 1 then accept
delete protocols ospf export                       <span class="c">! pehle purana STATICS-OUT export hatao</span>
set protocols ospf export AGG-OUT
commit</pre>
<pre class="out">lab@CORE&gt; show route 10.40.0.0/16
10.40.0.0/16       *[OSPF/150] 00:00:25, metric 0
                    &gt;  to 10.0.40.1 via ge-0/0/0.0</pre>
<p>CORE /16 ko OSPF external route (preference 150) ke roop mein seekhta hai aur 10.40.1.0/24 ya 10.40.2.0/24 ab nahi dikhte. Server SRV (172.20.0.10) ka traffic ab bhi campus PCs tak pahunchta hai: CORE /16 follow karke EDGE tak aata hai, aur EDGE ke paas ACC ki taraf ke more specific static routes ab bhi hain. Baaki kaam longest match karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Campus buildings ke liye 10.40.1.0/24 se 10.40.8.0/24 use karta hai. Ek /16 65,536 addresses cover karta hai lekin buildings sirf aath /24 use karte hain. 10.40.200.5 (unused) ke packets core se guzarkar baad mein drop hone ke bajay EDGE par hi reject ho jaate hain. ICMP na bhejna ho to <code>discard</code> jodo.</p></div>

<div class="warn"><p><b>Common mistake.</b> Aggregate ko <code>from protocol static</code> wali policy se export karna. Aggregate ka protocol <code>aggregate</code> hai, isliye policy kuch match nahi karti aur core use kabhi nahi seekhta. Aur purana <code>ospf export</code> delete karna bhool gaye to summary ke saath har static bhi core mein rehta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Active contributor na ho to aggregates inactive hote hain, preference hamesha 130, aur default reject. Bahut chaudi summary aise traffic ko <i>attract</i> kar sakti hai jo aapka nahi: range ke unused hisse black-hole ho jaate hain.</p></div>

<div class="scn"><h4>Summary bahut chaudi, traffic black-hole</h4><p>Ek ISP ne 192.0.2.0/24 aggregate kiya aur ek neighbour ke customer ne uske unused hisse ka traffic bhejna shuru kiya. Aggregate ne use reject kiya aur customer ki monitoring mein ISP se ICMP unreachable messages dikhe. ISP ne us router par <code>discard</code> use kiya aur ek legitimate server ke liye more specific static jodi. Shikayatein band huin aur ISP ke paas simple, auditable summary thi.</p><p><b>Lesson:</b> aggregate kaagaz par poori range ka maalik hota hai; reject ya discard soch samajhkar chuno.</p></div>
<div class="iv"><p class="q">"Aggregate route kya hai aur contributing routes kya hote hain?"</p><p>Aggregate bahut saare more specific prefixes ko ek mein summarise karta hai. Contributing routes uske andar ke active more specific routes hain. Aggregate tabhi tak active hai jab tak kam se kam ek contributor active ho; uska next hop reject ya discard hai, aur advertise hone ke liye export policy (protocol aggregate) chahiye.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Aggregate = local summary route, preference 130, next hop reject (default) ya discard.</li>
<li>Kam se kam ek contributing route active ho tabhi tak active.</li>
<li><code>show route PREFIX exact detail</code> contributing routes list karta hai.</li>
<li><code>from protocol aggregate</code> match karne wali policy se export karo.</li>
<li>Asli destinations ke liye more specific routes ab bhi jeette hain.</li>
</ul></div>
`}};export{e as default};