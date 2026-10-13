var e=(e,t)=>`<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="Troubleshooting order"><rect x="10" y="30" width="110" height="50" rx="8" fill="#bae6fd"/><text x="65" y="60" text-anchor="middle" class="svg-ink" font-size="12">1 Session</text><rect x="135" y="30" width="110" height="50" rx="8" fill="#bbf7d0"/><text x="190" y="60" text-anchor="middle" class="svg-ink" font-size="12">2 Origin PE</text><rect x="260" y="30" width="110" height="50" rx="8" fill="#ddd6fe"/><text x="315" y="60" text-anchor="middle" class="svg-ink" font-size="12">3 RR reflects</text><rect x="385" y="30" width="110" height="50" rx="8" fill="#fde68a"/><text x="440" y="60" text-anchor="middle" class="svg-ink" font-size="12">4 Next hop</text><rect x="510" y="30" width="120" height="50" rx="8" fill="#fed7aa"/><text x="570" y="60" text-anchor="middle" class="svg-ink" font-size="12">5 Data plane</text><line x1="120" y1="55" x2="135" y2="55" stroke="#64748b" stroke-width="2"/><line x1="245" y1="55" x2="260" y2="55" stroke="#64748b" stroke-width="2"/><line x1="370" y1="55" x2="385" y2="55" stroke="#64748b" stroke-width="2"/><line x1="495" y1="55" x2="510" y2="55" stroke="#64748b" stroke-width="2"/><text x="320" y="108" text-anchor="middle" class="svg-muted" font-size="12">`+t+`</text></svg><p class="cap">`+e+`</p></div>`,t={id:`troubleshooting-workflow`,h:{en:`Troubleshooting workflow: the reflector that reflects nothing`,hi:`Troubleshooting workflow: kuch reflect na karne wala reflector`},body:{en:`
<p>Most BGP faults in an SP core fall into five buckets, and they come in a fixed order along the path of a route. Work along the path from the origin to the destination and stop at the first thing that is wrong. This chapter walks the lab ticket "the reflector that reflects nothing" with real simulator output from the broken network.</p>

@@D@@

<h3>The five checks</h3>
<ol>
<li><b>Session</b>: <code>show ip bgp summary</code>. Is every iBGP neighbour Established (a number in the last column)? Idle or Active with zero counters means the TCP session fails.</li>
<li><b>Origin</b>: does the originating PE actually have and advertise the route? <code>show ip bgp neighbors X advertised-routes</code>.</li>
<li><b>Reflection</b>: does the RR hold it, and is the source marked as client where needed? <code>show ip bgp neighbors X</code> shows "Route-Reflector Client".</li>
<li><b>Next hop</b>: <code>show ip bgp PREFIX</code>. Is there a <code>&gt;</code> best marker and a next hop reachable through IS-IS?</li>
<li><b>Data plane</b>: both directions. A route that exists in only one direction still breaks every ping.</li>
</ol>

<h3>Fault 1: the session that never comes up</h3>
<pre class="out">PE2# show ip bgp summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">10.20.2.2       4        65000       0       0        0    0    0 never   Active</span>
198.51.100.2    4        65102       3       2        2    0    0 00:00:30         1

RR# show ip bgp summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.20.255.1     4        65000       3       2        1    0    0 00:00:30         1
<span class="hl">10.20.255.3     4        65000       0       0        0    0    0 never   Active</span></pre>
<p>Both sides are Active: PE2 points at 10.20.2.2, but the RR is configured for a neighbour at 10.20.255.3 (a loopback). PE1 also uses a loopback and works. Compare working and broken peers. Fix: remove the link-address neighbour and use the RR's loopback with update-source and next-hop-self:</p>
<pre class="code">PE2(config)# router bgp 65000
PE2(config-router)# no neighbor 10.20.2.2
PE2(config-router)# neighbor 10.20.255.2 remote-as 65000
PE2(config-router)# neighbor 10.20.255.2 update-source Loopback0
PE2(config-router)# neighbor 10.20.255.2 next-hop-self</pre>

<h3>Fault 2: the route is at the RR, but not reflected</h3>
<p>In the lab the RR has PE1's route, but PE2 never learns it, and the RR table shows:</p>
<pre class="out">RR# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
   i 172.16.1.0/24    <span class="hl">192.0.2.2</span>                0    100      0 65101 i</pre>
<p>Two clues. First, the status column has no <code>*&gt;</code>: the RR does not consider this a usable best path. Second, the next hop is the customer address. And <code>show ip bgp neighbors</code> on the RR shows that only PE2 is a client. The lab solution marks both PE1 and PE2 as clients, so the route is reflected in the intended way:</p>
<pre class="code">RR(config)# router bgp 65000
RR(config-router)# neighbor 10.20.255.1 route-reflector-client</pre>
<div class="note"><p>Why check both things? In real IOS a route from a non-client is allowed to go to clients, but only if the RR first accepts it as best, and that needs a reachable next hop. Do not guess which of the two is guilty: read the outputs, fix one, re-check, fix the next.</p></div>

<h3>Fault 3: the next hop</h3>
<p>After the first two fixes, PE2 may hold the route, but the next hop is still unusable, or the two PCs cannot reach each other. Verify with the prefix detail:</p>
<pre class="out">PE2# show ip bgp 172.16.1.0
  65101
    <span class="hl">10.20.255.1 (metric 20)</span> from 10.20.255.2 (10.20.255.2)
      Origin IGP, metric 0, localpref 100, weight 0, valid, internal, best
      Originator: 10.20.255.1, Cluster list: 10.20.255.2</pre>
<p>The next hop must be PE1's loopback 10.20.255.1 (not 192.0.2.2). If it is still the customer address, PE1 lacks <code>neighbor 10.20.255.2 next-hop-self</code>. Because PE1 is the router originating the routes, the fix goes on <b>PE1</b>, not on the RR or PE2:</p>
<pre class="code">PE1(config)# router bgp 65000
PE1(config-router)# neighbor 10.20.255.2 next-hop-self</pre>
<p>Final proof, from the lab after all fixes:</p>
<pre class="out">PC1&gt; ping 172.16.2.10
84 bytes from 172.16.2.10 icmp_seq=1 ttl=59 time=0.500 ms
84 bytes from 172.16.2.10 icmp_seq=2 ttl=59 time=0.600 ms</pre>

<div class="eg"><p><b>Worked example: which side to fix?</b> A symptom "PE2 has no route to 172.16.1.0/24" can have causes on PE1 (not advertising), on the RR (not reflecting) or on PE2 (not accepting). Walk the path: PE1 <code>advertised-routes</code> shows the route going out; RR <code>show ip bgp</code> shows it with <code>*&gt;</code>; RR <code>advertised-routes</code> to PE2 lists it; PE2 <code>show ip bgp</code> shows it. The first place the route is missing marks the fault.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing many things at once so you cannot tell which fixed it. Looking only at the router that complains instead of walking the path. Forgetting the reverse direction: both customers need routes.</p></div>
<div class="exam"><p><b>Exam trap.</b> Read the symptom precisely: Idle/Active (session), "0 prefixes received" (policy or no advertisement), route without <code>&gt;</code> (next hop unreachable), route present but traffic fails (data plane or return path).</p></div>

<div class="scn"><h4>Three faults, one ticket</h4><p>After a rushed migration the ticket read "site 2 cannot reach site 1". A colleague fixed the session, saw the prefix appear on PE2, and closed the ticket. The next morning the same customer called again: the next hop was still a customer address on the return route. Walking all five checks in both directions found the last missing next-hop-self.</p><p><b>Lesson:</b> a ticket is closed when traffic passes in both directions, not when one route appears.</p></div>

<div class="iv"><p class="q">"BGP route is not showing up on a remote PE. How do you troubleshoot?"</p><p>I follow the path: session state on the iBGP neighbours, whether the origin PE advertises the route, whether the RR holds it as best and reflects it (client flag, next-hop reachability), then the remote PE table and next hop, and finally ping in both directions. I use summary, advertised-routes, and the per-prefix detail to prove each stage before changing anything.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Walk the route from origin to destination and stop at the first fault.</li>
<li>Active with zero counters: look at the neighbour address and update-source.</li>
<li>No <code>&gt;</code>: next hop unreachable; fix next-hop-self on the originating PE.</li>
<li>Client flags are set on the RR only.</li>
<li>Test both directions before closing the ticket.</li>
</ul></div>
`.replace(`@@D@@`,e(`Check in the order the route travels.`,`summary - advertised-routes - neighbors (client) - ip bgp PREFIX - ping`)),hi:`
<p>SP core ke zyadatar BGP faults paanch buckets mein aate hain, aur woh route ke path ke saath ek fixed order mein aate hain. Origin se destination tak path par chalo aur pehli galat cheez par ruk jao. Is chapter mein lab ticket "kuch reflect na karne wala reflector" ko toote network ke real simulator output ke saath chalaya gaya hai.</p>

@@D@@

<h3>Paanch checks</h3>
<ol>
<li><b>Session</b>: <code>show ip bgp summary</code>. Kya har iBGP neighbour Established hai (aakhri column mein number)? Zero counters ke saath Idle ya Active matlab TCP session fail ho raha hai.</li>
<li><b>Origin</b>: kya originating PE ke paas route sach mein hai aur woh advertise karta hai? <code>show ip bgp neighbors X advertised-routes</code>.</li>
<li><b>Reflection</b>: kya RR ke paas hai, aur jahan zaroori ho source client mark hai? <code>show ip bgp neighbors X</code> "Route-Reflector Client" dikhata hai.</li>
<li><b>Next hop</b>: <code>show ip bgp PREFIX</code>. Kya <code>&gt;</code> best marker hai aur next hop IS-IS se reachable hai?</li>
<li><b>Data plane</b>: dono directions. Jo route sirf ek direction mein hai woh phir bhi har ping tod deta hai.</li>
</ol>

<h3>Fault 1: session jo kabhi up nahi hota</h3>
<pre class="out">PE2# show ip bgp summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">10.20.2.2       4        65000       0       0        0    0    0 never   Active</span>
198.51.100.2    4        65102       3       2        2    0    0 00:00:30         1

RR# show ip bgp summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.20.255.1     4        65000       3       2        1    0    0 00:00:30         1
<span class="hl">10.20.255.3     4        65000       0       0        0    0    0 never   Active</span></pre>
<p>Dono sides Active hain: PE2 10.20.2.2 ko point karta hai, lekin RR 10.20.255.3 (loopback) par neighbour ke liye configured hai. PE1 bhi loopback use karta hai aur chalta hai. Working aur broken peers ko compare karo. Fix: link-address wala neighbour hatao aur RR ka loopback update-source aur next-hop-self ke saath use karo:</p>
<pre class="code">PE2(config)# router bgp 65000
PE2(config-router)# no neighbor 10.20.2.2
PE2(config-router)# neighbor 10.20.255.2 remote-as 65000
PE2(config-router)# neighbor 10.20.255.2 update-source Loopback0
PE2(config-router)# neighbor 10.20.255.2 next-hop-self</pre>

<h3>Fault 2: route RR par hai, par reflect nahi hota</h3>
<p>Lab mein RR ke paas PE1 ka route hai, par PE2 use kabhi nahi seekhta, aur RR table dikhati hai:</p>
<pre class="out">RR# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
   i 172.16.1.0/24    <span class="hl">192.0.2.2</span>                0    100      0 65101 i</pre>
<p>Do clue. Pehla, status column mein <code>*&gt;</code> nahi: RR ise usable best path nahi maanta. Doosra, next hop customer address hai. Aur RR par <code>show ip bgp neighbors</code> dikhata hai ki sirf PE2 client hai. Lab solution PE1 aur PE2 dono ko client mark karta hai, taaki route intended tareeke se reflect ho:</p>
<pre class="code">RR(config)# router bgp 65000
RR(config-router)# neighbor 10.20.255.1 route-reflector-client</pre>
<div class="note"><p>Dono cheezein kyun check karo? Real IOS mein non-client ka route clients ko ja sakta hai, lekin tabhi jab RR use pehle best maane, aur uske liye reachable next hop chahiye. Andaza mat lagao ki dono mein se kaun doshi hai: outputs padho, ek fix karo, dobara check karo, phir agla fix karo.</p></div>

<h3>Fault 3: next hop</h3>
<p>Pehle do fixes ke baad PE2 ke paas route ho sakta hai, par next hop ab bhi unusable hai, ya dono PCs ek doosre tak nahi pahunchte. Prefix detail se verify karo:</p>
<pre class="out">PE2# show ip bgp 172.16.1.0
  65101
    <span class="hl">10.20.255.1 (metric 20)</span> from 10.20.255.2 (10.20.255.2)
      Origin IGP, metric 0, localpref 100, weight 0, valid, internal, best
      Originator: 10.20.255.1, Cluster list: 10.20.255.2</pre>
<p>Next hop PE1 ka loopback 10.20.255.1 hona chahiye (192.0.2.2 nahi). Agar ab bhi customer address hai to PE1 par <code>neighbor 10.20.255.2 next-hop-self</code> missing hai. Kyunki PE1 woh router hai jo routes originate karta hai, fix <b>PE1</b> par jaata hai, RR ya PE2 par nahi:</p>
<pre class="code">PE1(config)# router bgp 65000
PE1(config-router)# neighbor 10.20.255.2 next-hop-self</pre>
<p>Final proof, saare fixes ke baad lab se:</p>
<pre class="out">PC1&gt; ping 172.16.2.10
84 bytes from 172.16.2.10 icmp_seq=1 ttl=59 time=0.500 ms
84 bytes from 172.16.2.10 icmp_seq=2 ttl=59 time=0.600 ms</pre>

<div class="eg"><p><b>Worked example: kis side ko fix karein?</b> Symptom "PE2 ke paas 172.16.1.0/24 ka route nahi" ke kaaran PE1 par (advertise nahi kar raha), RR par (reflect nahi kar raha) ya PE2 par (accept nahi kar raha) ho sakte hain. Path chalo: PE1 <code>advertised-routes</code> route ko jaata dikhata hai; RR <code>show ip bgp</code> use <code>*&gt;</code> ke saath dikhata hai; RR se PE2 ko <code>advertised-routes</code> mein woh listed hai; PE2 <code>show ip bgp</code> use dikhata hai. Jahan route pehli baar missing ho wahi fault hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek saath bahut cheezein badalna taaki pata na chale kisne fix kiya. Sirf shikayat karne wale router ko dekhna, path nahi chalna. Reverse direction bhoolna: dono customers ko routes chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Symptom precisely padho: Idle/Active (session), "0 prefixes received" (policy ya advertisement nahi), <code>&gt;</code> ke bina route (next hop unreachable), route hai par traffic fail (data plane ya return path).</p></div>

<div class="scn"><h4>Teen faults, ek ticket</h4><p>Jaldbaazi ki migration ke baad ticket likha tha "site 2 site 1 tak nahi pahunch sakta". Ek colleague ne session fix kiya, PE2 par prefix aata dekha, aur ticket band kar diya. Agli subah wahi customer ne phir call kiya: return route par next hop ab bhi customer address tha. Dono directions mein paanchon checks chalane se aakhri missing next-hop-self mila.</p><p><b>Lesson:</b> ticket tab band hota hai jab traffic dono directions mein jaye, tab nahi jab ek route dikh jaye.</p></div>

<div class="iv"><p class="q">"BGP route remote PE par nahi dikh raha. Troubleshoot kaise karoge?"</p><p>Main path follow karta hoon: iBGP neighbours ki session state, kya origin PE route advertise karta hai, kya RR use best ki tarah rakhta aur reflect karta hai (client flag, next-hop reachability), phir remote PE ki table aur next hop, aur aakhir mein dono directions mein ping. Kuch badalne se pehle har stage ko summary, advertised-routes aur per-prefix detail se prove karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Route ko origin se destination tak chalo aur pehle fault par ruko.</li>
<li>Zero counters ke saath Active: neighbour address aur update-source dekho.</li>
<li><code>&gt;</code> nahi: next hop unreachable; originating PE par next-hop-self fix karo.</li>
<li>Client flags sirf RR par set hote hain.</li>
<li>Ticket band karne se pehle dono directions test karo.</li>
</ul></div>
`.replace(`@@D@@`,e(`Us order mein check karo jis order mein route chalta hai.`,`summary - advertised-routes - neighbors (client) - ip bgp PREFIX - ping`))}};export{t as default};