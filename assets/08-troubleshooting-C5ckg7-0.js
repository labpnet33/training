var e={id:`troubleshooting`,h:{en:`Troubleshooting instances, RIB groups and FBF`,hi:`Instances, RIB groups aur FBF ka troubleshooting`},body:{en:`
<p>Faults in this module have a common root: <b>the router looked in a different table than you expected</b>. Troubleshooting is therefore a matter of asking three questions in order. Which instance owns the interface? Which table holds the route? Which table does the packet actually use? Once you ask them, most tickets solve themselves.</p>

<h3>The three-question method</h3>
<ol>
<li><b>Which instance?</b> <code>show route instance</code> lists instances and the route counts of each table. Then <code>show configuration routing-instances</code> shows which interfaces belong to which.</li>
<li><b>Which table has the route?</b> <code>show route table NAME.inet.0 PREFIX</code>. An empty table, or 0 active routes, is a clue.</li>
<li><b>Which table does the packet use?</b> For FBF check the input filter on the interface: <code>show interfaces ge-0/0/3.0 | match filter</code>.</li>
</ol>
<pre class="out">lab@R1&gt; show interfaces ge-0/0/3.0 | match filter
      Input Filters: STEER-LAB</pre>
<p>That line proves the filter is attached. If it is missing, the filter is only configured, not applied.</p>

<h3>Fault patterns</h3>
<table class="cmp"><tr><th>Symptom</th><th>Cause</th><th>Check and fix</th></tr>
<tr><td>Forwarding instance has 0 routes; steered traffic is dropped</td><td>Interface routes were never copied: RIB group missing or <code>interface-routes</code> not set</td><td><code>show route table ISP-B.inet.0</code>. Add the RIB group and the interface-routes line.</td></tr>
<tr><td>Static default in the instance is configured but not active</td><td>Next hop does not resolve in that table</td><td>Look for the connected subnet in the instance table.</td></tr>
<tr><td>Ping from the router fails, hosts work</td><td>Test used the master table</td><td>Add <code>routing-instance NAME</code> to ping and traceroute.</td></tr>
<tr><td>Instance OSPF neighbour never forms</td><td>OSPF configured globally, not in the instance; interface not in the instance</td><td><code>show ospf neighbor instance NAME</code>; fix the hierarchy.</td></tr>
<tr><td>Traffic works one way only</td><td>RIB group copies in one direction; return routes are missing</td><td>Add the second group, or a route on the far side.</td></tr>
<tr><td>Everyone on the FBF interface lost connectivity</td><td>No final accept term; implicit discard</td><td>Add <code>term REST then accept</code> as the last term.</td></tr>
<tr><td>Lab traffic still uses ISPA</td><td>Filter not attached as input, or source match wrong</td><td>Check the interface and the term.</td></tr>
<tr><td>Two equal paths, one link busy</td><td>No forwarding-table export policy</td><td>Look for a ulst in the forwarding table.</td></tr></table>

<h3>Worked ticket: the empty forwarding instance</h3>
<p>The lab team says "we configured FBF but lab traffic times out". You run:</p>
<pre class="out">lab@R1# run show route table ISP-B.inet.0
ISP-B.inet.0: 0 destinations, 0 routes (0 active, 0 holddown, 0 hidden)</pre>
<p>The instance table is empty, so packets that match the filter find no route and are dropped. The static default is there in the configuration, but it has no way to resolve. The fix is the RIB group with interface routes. After commit the table holds nine routes and the default via 10.0.2.2 is active.</p>

<h3>Worked ticket: the guest ping that "fails"</h3>
<p>A guest server looks down from the router:</p>
<pre class="out">lab@R1&gt; ping 198.18.0.10 count 3
3 packets transmitted, 0 packets received, 100% packet loss</pre>
<p>The same test with the instance proves the path is fine:</p>
<pre class="out">lab@R1&gt; ping 198.18.0.10 routing-instance GUEST count 3
3 packets transmitted, 3 packets received, 0% packet loss</pre>
<p>No fault; the test used the wrong table. Document this in your runbook, because it is the most common false alarm.</p>

<h3>Worked ticket: the load that never balanced</h3>
<p>Both next hops are in <code>show route</code>, but only one arrow is present and the forwarding table has one ucst. The policy-statement exists but is not applied. The two lines in the load balancing chapter fix it, and a ulst with two ucst members confirms it.</p>

<h3>Safe change habits</h3>
<ul>
<li>Use <code>commit confirmed 5</code> when changing the filter on a live interface.</li>
<li>Build the whole filter (all terms) before you attach it.</li>
<li>After each change run the same three verification commands and compare.</li>
<li>Keep traceroutes from a host in each subnet as evidence.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> After applying FBF, staff say Internet is fine and the lab says nothing works. Question 1: ge-0/0/3.0 is in the master. Question 2: ISP-B.inet.0 has nine active routes. Question 3: the filter is attached as input and has term LAB with source 10.1.2.0/24. All good, so the next suspect is the return path: ISPB must know 10.1.2.0/24. A static route on ISPB fixes it.</p></div>
<div class="warn"><p><b>Common mistake.</b> Debugging the filter when the instance table is empty. Always verify the table first; the filter can only choose a table, not make it work.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question gives a correct filter and an empty instance table. The missing piece is the RIB group, not another filter term.</p></div>
<div class="scn"><h4>Friday evening, ISPB route missing</h4><p>After a Friday change, the lab lost Internet. The on-call engineer checked the filter, which was perfect, then the instance table, which had zero routes. A colleague had deleted the RIB group while tidying up unused configuration. Restoring the two RIB group lines recovered service in two minutes.</p><p><b>Lesson:</b> a RIB group looks unused until you see what depends on it.</p></div>
<div class="iv"><p class="q">"Lab traffic that should use ISP-B is dropped. How do you troubleshoot?"</p><p>I check that the instance table has an active default route with <code>show route table ISP-B.inet.0</code>. If empty I look for the RIB group copying interface routes. Then I confirm the input filter is attached and that the last term accepts. Finally I verify the return path at the ISP.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ask: which instance, which table, which table does the packet use?</li>
<li>Empty forwarding instance means missing RIB group or interface routes.</li>
<li>A plain ping uses the master table; add the instance name.</li>
<li>No final accept term means implicit discard.</li>
<li>Check the forwarding table for a ulst when balancing fails.</li>
</ul></div>
`,hi:`
<p>Is module ke faults ki ek hi jad hai: <b>router ne aapki umeed se alag table mein dekha</b>. Isliye troubleshooting teen sawal kram se poochne ka kaam hai. Interface ka maalik kaunsa instance hai? Route kaunse table mein hai? Packet asal mein kaunsa table use karta hai? Yeh poochte hi zyadatar tickets khud solve ho jaate hain.</p>

<h3>Teen-sawal method</h3>
<ol>
<li><b>Kaunsa instance?</b> <code>show route instance</code> instances aur har table ke route counts dikhata hai. Phir <code>show configuration routing-instances</code> dikhata hai kaunsa interface kiska hai.</li>
<li><b>Route kaunse table mein hai?</b> <code>show route table NAME.inet.0 PREFIX</code>. Khali table ya 0 active routes ek clue hain.</li>
<li><b>Packet kaunsa table use karta hai?</b> FBF ke liye interface ka input filter dekho: <code>show interfaces ge-0/0/3.0 | match filter</code>.</li>
</ol>
<pre class="out">lab@R1&gt; show interfaces ge-0/0/3.0 | match filter
      Input Filters: STEER-LAB</pre>
<p>Yeh line saabit karti hai ki filter attach hai. Yeh na ho to filter sirf configured hai, applied nahi.</p>

<h3>Fault patterns</h3>
<table class="cmp"><tr><th>Symptom</th><th>Wajah</th><th>Check aur fix</th></tr>
<tr><td>Forwarding instance mein 0 routes; steer kiya traffic drop</td><td>Interface routes kabhi copy nahi hue: RIB group nahi ya <code>interface-routes</code> set nahi</td><td><code>show route table ISP-B.inet.0</code>. RIB group aur interface-routes line jodo.</td></tr>
<tr><td>Instance mein static default configured par active nahi</td><td>Us table mein next hop resolve nahi hota</td><td>Instance table mein connected subnet dhoondo.</td></tr>
<tr><td>Router se ping fail, hosts chalte hain</td><td>Test ne master table use kiya</td><td>Ping aur traceroute mein <code>routing-instance NAME</code> jodo.</td></tr>
<tr><td>Instance OSPF neighbour nahi banta</td><td>OSPF global mein hai, instance mein nahi; interface instance mein nahi</td><td><code>show ospf neighbor instance NAME</code>; hierarchy theek karo.</td></tr>
<tr><td>Traffic sirf ek taraf chalta hai</td><td>RIB group ek disha mein copy karta hai; return routes missing</td><td>Doosra group jodo, ya door ke side par route.</td></tr>
<tr><td>FBF interface par sab ki connectivity gayi</td><td>Aakhri accept term nahi; implicit discard</td><td>Aakhri term ke roop mein <code>term REST then accept</code> jodo.</td></tr>
<tr><td>Lab traffic ab bhi ISPA use karta hai</td><td>Filter input ki tarah attach nahi, ya source match galat</td><td>Interface aur term check karo.</td></tr>
<tr><td>Do barabar paths, ek link busy</td><td>Forwarding-table export policy nahi</td><td>Forwarding table mein ulst dhoondo.</td></tr></table>

<h3>Worked ticket: khali forwarding instance</h3>
<p>Lab team kehti hai "FBF configure kiya par lab traffic timeout ho raha hai". Aap chalate ho:</p>
<pre class="out">lab@R1# run show route table ISP-B.inet.0
ISP-B.inet.0: 0 destinations, 0 routes (0 active, 0 holddown, 0 hidden)</pre>
<p>Instance table khali hai, isliye filter se match hone wale packets ko route nahi milta aur woh drop ho jaate hain. Static default configuration mein hai, par use resolve hone ka raasta nahi. Fix: interface routes wala RIB group. Commit ke baad table mein nau routes hain aur 10.0.2.2 wala default active hai.</p>

<h3>Worked ticket: guest ping jo "fail" hota hai</h3>
<p>Router se guest server down dikhta hai:</p>
<pre class="out">lab@R1&gt; ping 198.18.0.10 count 3
3 packets transmitted, 0 packets received, 100% packet loss</pre>
<p>Instance ke saath wahi test saabit karta hai ki path theek hai:</p>
<pre class="out">lab@R1&gt; ping 198.18.0.10 routing-instance GUEST count 3
3 packets transmitted, 3 packets received, 0% packet loss</pre>
<p>Koi fault nahi; test ne galat table use kiya. Isse runbook mein likho, kyunki yeh sabse aam false alarm hai.</p>

<h3>Worked ticket: load jo kabhi balance nahi hua</h3>
<p><code>show route</code> mein dono next hops hain, par sirf ek arrow hai aur forwarding table mein ek ucst hai. Policy-statement maujood hai par apply nahi hua. Load balancing chapter ki do lines ise theek karti hain, aur do ucst members wala ulst confirm karta hai.</p>

<h3>Safe change habits</h3>
<ul>
<li>Live interface par filter badalte waqt <code>commit confirmed 5</code> use karo.</li>
<li>Poora filter (sab terms) banao, phir attach karo.</li>
<li>Har change ke baad wahi teen verification commands chalao aur tulna karo.</li>
<li>Har subnet ke host se traceroute saboot ke roop mein rakho.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> FBF lagane ke baad staff kehte hain Internet theek hai aur lab kehta hai kuch nahi chalta. Sawal 1: ge-0/0/3.0 master mein hai. Sawal 2: ISP-B.inet.0 mein nau active routes hain. Sawal 3: filter input ki tarah attach hai aur term LAB mein source 10.1.2.0/24 hai. Sab theek, to agla shak return path par hai: ISPB ko 10.1.2.0/24 pata hona chahiye. ISPB par ek static route ise theek karta hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> Instance table khali ho aur filter ko debug karna. Pehle table verify karo; filter sirf table chun sakta hai, use kaam karne layak nahi bana sakta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal sahi filter aur khali instance table deta hai. Missing cheez RIB group hai, aur filter term nahi.</p></div>
<div class="scn"><h4>Friday shaam, ISPB route gayab</h4><p>Friday ke change ke baad lab ka Internet gaya. On-call engineer ne pehle filter dekha, jo bilkul theek tha, phir instance table, jisme zero routes the. Ek colleague ne unused configuration saaf karte waqt RIB group delete kar diya tha. RIB group ki do lines wapas laane se do minute mein service wapas aayi.</p><p><b>Lesson:</b> RIB group tab tak unused lagta hai jab tak pata na chale ki kya uspar nirbhar hai.</p></div>
<div class="iv"><p class="q">"ISP-B se jaane wala lab traffic drop ho raha hai. Troubleshoot kaise karoge?"</p><p>Main <code>show route table ISP-B.inet.0</code> se dekhta hoon ki instance table mein active default route hai ya nahi. Khali ho to interface routes copy karne wala RIB group dhoondta hoon. Phir confirm karta hoon ki input filter attach hai aur aakhri term accept karta hai. Aakhir mein ISP par return path verify karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Poochho: kaunsa instance, kaunsa table, packet kaunsa table use karta hai?</li>
<li>Khali forwarding instance matlab RIB group ya interface routes missing.</li>
<li>Plain ping master table use karta hai; instance ka naam jodo.</li>
<li>Aakhri accept term na ho to implicit discard.</li>
<li>Balancing fail ho to forwarding table mein ulst dekho.</li>
</ul></div>
`}};export{e as default};