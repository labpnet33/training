var e={id:`rpf-interface`,h:{en:`How the RPF interface is chosen`,hi:`RPF interface kaise chuna jaata hai`},body:{en:`
<p>Every multicast router answers one question many times a second: <b>"through which interface, and from which neighbour, would I reach this address?"</b> The address is the source for a source tree and the RP for the shared tree. The answer is the <b>RPF interface</b> and the <b>RPF neighbour</b>. This chapter shows where the answer comes from, how you can override it, and how to read it.</p>

<h3>Step 1: the multicast routing information base</h3>
<p>The router builds a lookup table for RPF from several places at once: the normal unicast routing table (connected, static, OSPF, EIGRP, BGP) and any <b>static multicast routes</b> that you typed with <code>ip mroute</code>. For an address, the router finds the best match using the usual order: the <b>longest prefix</b> wins first; if prefix lengths are equal, the lower <b>administrative distance</b> wins. A static multicast route has a default distance of 0, so for the same prefix length it beats OSPF (distance 110).</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="RPF lookup uses unicast table and static mroutes">
<rect x="20" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Unicast RIB (OSPF, static)</text>
<rect x="20" y="130" width="170" height="50" rx="8" fill="#fde68a"/><text x="105" y="160" text-anchor="middle" class="svg-ink" font-size="13">ip mroute (static)</text>
<rect x="260" y="70" width="140" height="70" rx="10" fill="#bae6fd"/><text x="330" y="100" text-anchor="middle" class="svg-ink" font-size="13">RPF lookup</text><text x="330" y="120" text-anchor="middle" class="svg-muted" font-size="12">longest prefix, then AD</text>
<rect x="470" y="70" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="545" y="98" text-anchor="middle" class="svg-ink" font-size="13">RPF interface</text><text x="545" y="118" text-anchor="middle" class="svg-ink" font-size="13">+ RPF neighbour</text>
<line x1="190" y1="45" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><line x1="190" y1="155" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="400" y1="105" x2="470" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Unicast and static multicast routes both feed the RPF lookup. Only the RPF lookup uses the static multicast routes.</p></div>

<h3>Step 2: the static multicast route</h3>
<p>The command is <code>ip mroute &lt;source-prefix&gt; &lt;mask&gt; &lt;rpf-neighbour or interface&gt; [distance]</code>. It says: "for RPF purposes, the way to this prefix is through that neighbour". Two facts are essential:</p>
<ul>
<li>It affects <b>only the RPF check</b>. It does not forward any unicast packet and does not appear in <code>show ip route</code>.</li>
<li>The neighbour you name must be a <b>PIM neighbour on a PIM-enabled interface</b>, otherwise the joins have nowhere to go.</li>
</ul>
<pre class="code"><span class="c">! Example: the unicast table prefers a link where PIM is off, but we want multicast</span>
<span class="c">! for the 203.0.113.0/24 studio network to arrive from PIM neighbour 10.9.9.2</span>
ip mroute 203.0.113.0 255.255.255.0 10.9.9.2
<span class="c">! the RP address needs the same treatment if the unicast path to the RP is wrong</span>
ip mroute 192.0.2.1 255.255.255.255 10.9.9.2</pre>

<h3>Step 3: equal-cost paths</h3>
<p>If unicast has two equal-cost paths toward the source, the router must still choose <b>one</b> RPF interface, otherwise it would accept copies from both and create duplicates. By default IOS XE picks the path whose next hop has the <b>highest IP address</b>. You can change this with <code>ip multicast multipath</code>, which spreads different sources across the paths by a hash, but each (S,G) still uses exactly one interface. Remember this when a stream "works on one router but not on its twin": equal-cost paths can give different routers different choices.</p>

<h3>Reading the answer: show ip rpf</h3>
<p>The simulator prints the output below for a router whose unicast best path goes through an interface without PIM. Read it from the top.</p>
<pre class="out">R3# show ip rpf 2.2.2.2
RPF information for ? (2.2.2.2)
  RPF interface: <span class="hl">GigabitEthernet0/1</span>
  RPF neighbor: ? (10.0.13.1)
  RPF route/mask: 2.2.2.2/32
  RPF type: <span class="hl">unicast (ospf)</span>
  <span class="hl">Note: PIM is not enabled on the RPF interface - RPF check will fail</span>
  Doing distance-preferred lookups across tables
  RPF topology: ipv4 multicast base, originated from ipv4 unicast base</pre>
<p>After a static multicast route is added, the same command shows the changed type, and the neighbour is now one that speaks PIM:</p>
<pre class="out">R-CHE# show ip rpf 10.1.255.1
RPF information for ? (10.1.255.1)
  RPF interface: GigabitEthernet0/1
  RPF neighbor: ? (10.0.4.1)
  RPF route/mask: 10.1.255.1/32
  RPF type: <span class="hl">multicast (static)</span>
  Doing distance-preferred lookups across tables
  RPF topology: ipv4 multicast base, originated from ipv4 unicast base</pre>
<p>The line <b>RPF type</b> is the quickest clue: <code>unicast (ospf)</code> means the unicast table decided; <code>multicast (static)</code> means an <code>ip mroute</code> decided. A question like "who changed my RPF?" is answered by this one line.</p>

<h3>Which address do I check?</h3>
<table class="cmp"><tr><th>Entry you are debugging</th><th>Run show ip rpf for</th></tr>
<tr><td>(*,G) with incoming interface Null</td><td>the RP address</td></tr>
<tr><td>(S,G) with incoming interface Null</td><td>the source address</td></tr>
<tr><td>No entry at all on the first-hop router</td><td>nothing yet: the source must be sending, and the LAN needs PIM</td></tr></table>

<div class="warn"><p><b>Common mistakes.</b> (1) Writing <code>ip route</code> instead of <code>ip mroute</code>: this moves unicast traffic too. (2) Pointing the static multicast route at a neighbour on an interface without PIM. (3) Fixing the source but forgetting the RP: both need a correct RPF.</p></div>
<div class="exam"><p><b>Exam trap.</b> A static multicast route is <b>not</b> propagated by any protocol and does not show in the unicast table. Distance 0 is the default, so it beats the unicast route of the same prefix length, but a longer unicast prefix would still win.</p></div>

<div class="scn"><h4>The twin router that behaved differently</h4><p>Two distribution routers had two equal-cost OSPF paths toward the video encoder. On one router the stream arrived, on the other it did not. <code>show ip rpf</code> on both revealed they had picked different upstream neighbours (the highest next-hop address on each), and only one of those links had PIM.</p><p><b>Lesson:</b> with equal-cost paths the RPF choice is deterministic but may differ per router. Enable PIM on all equal-cost links or pin the path with a static multicast route.</p></div>

<div class="iv"><p class="q">"How does a router pick the RPF interface when there are two equal-cost paths?"</p><p>It picks one, the path with the highest next-hop IP address by default, so only one interface accepts the stream. <code>ip multicast multipath</code> can load-share different sources across the paths, but each source still uses one interface. Add that a static multicast route can pin it.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RPF looks up the source (or the RP) in the unicast table plus static multicast routes: longest prefix, then administrative distance.</li>
<li><code>ip mroute</code> changes only the RPF lookup, never unicast forwarding.</li>
<li>The neighbour named in <code>ip mroute</code> must be a PIM neighbour.</li>
<li>Equal-cost paths: one RPF interface, highest next-hop address by default.</li>
<li><code>show ip rpf</code> shows the interface, the neighbour and whether unicast or a static mroute decided.</li>
</ul></div>
`,hi:`
<p>Har multicast router ek sawaal ka jawab ek second mein kai baar deta hai: <b>"is address tak main kaunse interface se, aur kaunse neighbour se pahunchta?"</b> Source tree ke liye address source hota hai aur shared tree ke liye RP. Jawab hai <b>RPF interface</b> aur <b>RPF neighbour</b>. Yeh chapter dikhata hai jawab kahan se aata hai, use kaise override karein, aur kaise padhein.</p>

<h3>Step 1: multicast routing information base</h3>
<p>Router RPF ke liye lookup table kai jagah se ek saath banata hai: normal unicast routing table (connected, static, OSPF, EIGRP, BGP) aur woh <b>static multicast routes</b> jo aapne <code>ip mroute</code> se likhe. Kisi address ke liye router usual order se best match dhoondhta hai: pehle <b>longest prefix</b> jeetta hai; prefix length barabar ho to kam <b>administrative distance</b> jeetta hai. Static multicast route ki default distance 0 hoti hai, isliye same prefix length par woh OSPF (distance 110) ko haraata hai.</p>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="RPF lookup unicast table aur static mroutes use karta hai">
<rect x="20" y="20" width="170" height="50" rx="8" fill="#bbf7d0"/><text x="105" y="50" text-anchor="middle" class="svg-ink" font-size="13">Unicast RIB (OSPF, static)</text>
<rect x="20" y="130" width="170" height="50" rx="8" fill="#fde68a"/><text x="105" y="160" text-anchor="middle" class="svg-ink" font-size="13">ip mroute (static)</text>
<rect x="260" y="70" width="140" height="70" rx="10" fill="#bae6fd"/><text x="330" y="100" text-anchor="middle" class="svg-ink" font-size="13">RPF lookup</text><text x="330" y="120" text-anchor="middle" class="svg-muted" font-size="12">longest prefix, phir AD</text>
<rect x="470" y="70" width="150" height="70" rx="10" fill="#ddd6fe"/><text x="545" y="98" text-anchor="middle" class="svg-ink" font-size="13">RPF interface</text><text x="545" y="118" text-anchor="middle" class="svg-ink" font-size="13">+ RPF neighbour</text>
<line x1="190" y1="45" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><line x1="190" y1="155" x2="260" y2="115" stroke="#64748b" stroke-width="2"/><line x1="400" y1="105" x2="470" y2="105" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Unicast aur static multicast routes dono RPF lookup ko feed karte hain. Static multicast routes sirf RPF lookup use karta hai.</p></div>

<h3>Step 2: static multicast route</h3>
<p>Command hai <code>ip mroute &lt;source-prefix&gt; &lt;mask&gt; &lt;rpf-neighbour ya interface&gt; [distance]</code>. Yeh kehta hai: "RPF ke liye is prefix ka raasta us neighbour se hai". Do baatein bahut zaroori hain:</p>
<ul>
<li>Yeh <b>sirf RPF check</b> ko badalta hai. Koi unicast packet forward nahi karta aur <code>show ip route</code> mein nahi dikhta.</li>
<li>Jo neighbour aap naam do woh <b>PIM-enabled interface par PIM neighbour</b> hona chahiye, warna joins ke paas jaane ki jagah nahi.</li>
</ul>
<pre class="code"><span class="c">! Example: unicast table aise link ko pasand karta hai jahan PIM off hai, par hume multicast</span>
<span class="c">! 203.0.113.0/24 studio network ke liye PIM neighbour 10.9.9.2 se chahiye</span>
ip mroute 203.0.113.0 255.255.255.0 10.9.9.2
<span class="c">! agar RP tak unicast path galat hai to RP address ko bhi yahi treatment chahiye</span>
ip mroute 192.0.2.1 255.255.255.255 10.9.9.2</pre>

<h3>Step 3: equal-cost paths</h3>
<p>Agar unicast ke paas source ki taraf do equal-cost paths hain, to router ko phir bhi <b>ek</b> RPF interface chunna padta hai, warna dono se copies accept karke duplicates banenge. Default mein IOS XE woh path chunta hai jiska next hop <b>sabse bada IP address</b> hai. <code>ip multicast multipath</code> se ise badal sakte ho, jo alag sources ko hash se paths par baant deta hai, par har (S,G) phir bhi ek hi interface use karta hai. Jab stream "ek router par chalti hai par uske jode par nahi" to yaad rakhna: equal-cost paths alag routers ko alag choice de sakte hain.</p>

<h3>Jawab padhna: show ip rpf</h3>
<p>Simulator neeche ka output aise router ke liye print karta hai jiska unicast best path aise interface se jaata hai jahan PIM nahi. Upar se padho.</p>
<pre class="out">R3# show ip rpf 2.2.2.2
RPF information for ? (2.2.2.2)
  RPF interface: <span class="hl">GigabitEthernet0/1</span>
  RPF neighbor: ? (10.0.13.1)
  RPF route/mask: 2.2.2.2/32
  RPF type: <span class="hl">unicast (ospf)</span>
  <span class="hl">Note: PIM is not enabled on the RPF interface - RPF check will fail</span>
  Doing distance-preferred lookups across tables
  RPF topology: ipv4 multicast base, originated from ipv4 unicast base</pre>
<p>Static multicast route jodne ke baad wahi command badla hua type dikhata hai, aur neighbour ab woh hai jo PIM bolta hai:</p>
<pre class="out">R-CHE# show ip rpf 10.1.255.1
RPF information for ? (10.1.255.1)
  RPF interface: GigabitEthernet0/1
  RPF neighbor: ? (10.0.4.1)
  RPF route/mask: 10.1.255.1/32
  RPF type: <span class="hl">multicast (static)</span>
  Doing distance-preferred lookups across tables
  RPF topology: ipv4 multicast base, originated from ipv4 unicast base</pre>
<p>Line <b>RPF type</b> sabse tez clue hai: <code>unicast (ospf)</code> matlab unicast table ne decide kiya; <code>multicast (static)</code> matlab kisi <code>ip mroute</code> ne decide kiya. "Mera RPF kisne badla?" ka jawab yahi ek line deti hai.</p>

<h3>Kaunsa address check karun?</h3>
<table class="cmp"><tr><th>Jo entry debug kar rahe ho</th><th>show ip rpf kiske liye chalao</th></tr>
<tr><td>(*,G) jiska incoming interface Null hai</td><td>RP address</td></tr>
<tr><td>(S,G) jiska incoming interface Null hai</td><td>source address</td></tr>
<tr><td>First-hop router par koi entry hi nahi</td><td>abhi kuch nahi: source bhej raha ho, aur LAN par PIM chahiye</td></tr></table>

<div class="warn"><p><b>Aam galtiyan.</b> (1) <code>ip mroute</code> ki jagah <code>ip route</code> likhna: isse unicast traffic bhi hil jaata hai. (2) Static multicast route ko aise neighbour par point karna jiske interface par PIM nahi. (3) Source theek karke RP bhool jaana: dono ko sahi RPF chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Static multicast route kisi protocol se propagate <b>nahi</b> hota aur unicast table mein nahi dikhta. Distance 0 default hai, isliye same prefix length ke unicast route ko haraata hai, par lamba unicast prefix phir bhi jeet jaayega.</p></div>

<div class="scn"><h4>Jodi wala router jo alag behave kiya</h4><p>Do distribution routers ke paas video encoder ki taraf do equal-cost OSPF paths the. Ek router par stream aayi, doosre par nahi. Dono par <code>show ip rpf</code> ne dikhaya ki unhone alag upstream neighbours chune (har ek par sabse bada next-hop address), aur sirf ek link par PIM tha.</p><p><b>Lesson:</b> equal-cost paths mein RPF choice deterministic hai par har router par alag ho sakti hai. Sabhi equal-cost links par PIM on karo ya static multicast route se path pin karo.</p></div>

<div class="iv"><p class="q">"Do equal-cost paths hon to router RPF interface kaise chunta hai?"</p><p>Woh ek chunta hai, default mein sabse bade next-hop IP wala path, isliye sirf ek interface stream accept karta hai. <code>ip multicast multipath</code> alag sources ko paths par share kar sakta hai, par har source ek hi interface use karta hai. Yeh jodo ki static multicast route use pin kar sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RPF source (ya RP) ko unicast table aur static multicast routes mein dhoondhta hai: longest prefix, phir administrative distance.</li>
<li><code>ip mroute</code> sirf RPF lookup badalta hai, unicast forwarding kabhi nahi.</li>
<li><code>ip mroute</code> mein naam diya neighbour PIM neighbour hona chahiye.</li>
<li>Equal-cost paths: ek RPF interface, default mein sabse bada next-hop address.</li>
<li><code>show ip rpf</code> interface, neighbour aur yeh dikhata hai ki unicast ne decide kiya ya static mroute ne.</li>
</ul></div>
`}};export{e as default};