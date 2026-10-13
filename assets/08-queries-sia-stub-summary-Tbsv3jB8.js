var e={id:`queries-stub-summary`,h:{en:`Queries, stuck-in-active, stub routing and summarisation`,hi:`Queries, stuck-in-active, stub routing aur summarisation`},body:{en:`
<p>You lose an important file at work and ask your team, "Does anyone have a copy?" If everybody answers quickly, great. But if one colleague says "let me ask my team", and they ask theirs, the question ripples through the whole company, and you cannot close the matter until the very last person has replied. One colleague on holiday can hold you up for hours. That is exactly how EIGRP <b>Queries</b> work, and why a badly designed network can end up <b>stuck in active</b>.</p>

<h3>Going Active: the diffusing computation</h3>
<p>When a successor is lost and there is no feasible successor, the route changes from <b>Passive</b> to <b>Active</b>. The router sends a <b>Query</b> to every neighbour and must collect a <b>Reply</b> from each one before it can pick a new path. Each neighbour that receives the Query reacts in one of these ways:</p>
<ol>
<li>It has no entry for that prefix: it replies "unreachable" at once.</li>
<li>The querying router is <b>not</b> its successor: it replies with its own current metric at once.</li>
<li>The querying router <b>is</b> its successor and it has an FS: it switches to the FS and replies with the new metric.</li>
<li>The querying router is its successor and it has <b>no</b> FS: it goes Active too and sends its own Queries onward. It answers only after all of its neighbours answer.</li>
</ol>
<p>Case 4 is how a Query "diffuses" across the network. When all Replies are in, the original router chooses the best path (or removes the route), goes Passive again and sends Updates.</p>

<h3>Stuck in active (SIA)</h3>
<p>A router cannot wait forever. The <b>active timer</b> is 3 minutes by default (<code>timers active-time</code>). Modern IOS does not simply give up at that point: at half the active timer it sends an <b>SIA-Query</b> to each neighbour that has not replied. A neighbour that is still busy answers with an <b>SIA-Reply</b> ("still working"), and the wait continues. A neighbour that cannot even answer the SIA-Query is reset. You then see:</p>
<pre class="out"><span class="hl">%DUAL-3-SIA: Route 192.168.50.0/24 stuck-in-active state in IP-EIGRP(0) 100.  Cleaning up</span>
<span class="hl">%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.20.0.9 (Tunnel0) is down: stuck in active</span>

HUB# show ip eigrp topology active
EIGRP-IPv4 Topology Table for AS(100)/ID(10.20.0.1)
A 192.168.50.0/24, 1 successors, FD is Inaccessible, Q
    1 replies, active 00:01:32, query-origin: Local origin
         via 10.20.0.5 (Infinity/Infinity), Tunnel0
      <span class="hl">Remaining replies:
         via 10.20.0.9, r, Tunnel0</span></pre>
<p>The <code>Remaining replies</code> line, marked with a lower-case <code>r</code>, names the neighbour you are still waiting for; that is where you continue troubleshooting. Typical causes: a query domain that is too large, a congested or lossy WAN link, a busy CPU on a remote router, or a one-way link. Detailed SIA troubleshooting continues in the ENARSI EIGRP module; for ENCOR, know the concept and the two cures below.</p>

<h3>Cure 1: stub routing</h3>
<p>A branch router with one or two uplinks is never a sensible transit path. Configuring it as a <b>stub</b> tells its neighbours "do not query me". The hub stops sending Queries to stubs, which shrinks the query domain dramatically.</p>
<pre class="code"><span class="c">! on the branch router (classic mode)</span>
router eigrp 100
 eigrp stub                        <span class="c">! default = connected summary</span>
<span class="c">! other options: receive-only | connected | static | summary | redistributed | leak-map</span>

<span class="c">! named mode</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 100
  eigrp stub connected summary</pre>
<pre class="out">HUB# show ip eigrp neighbors detail
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
0   10.20.0.5               Tu0                      13 00:10:22   40   240  0  25
   Version 23.0/2.0, Retrans: 0, Retries: 0, Prefixes: 2
   Topology-ids from peer - 0
   <span class="hl">Stub Peer Advertising (CONNECTED SUMMARY ) Routes</span>
   <span class="hl">Suppressing queries</span></pre>
<p>A stub router still forms neighbours and receives routes. It advertises only the route types you allow; <code>receive-only</code> advertises nothing at all.</p>

<h3>Cure 2: summarisation</h3>
<p>If a neighbour knows only a summary, it has no entry for a specific failed prefix and replies "unreachable" immediately (case 1 above), so the Query stops there. Summarisation in EIGRP is configured per interface, at any router, not only at area borders as in OSPF.</p>
<pre class="code"><span class="c">! classic mode, on the interface facing the core</span>
interface GigabitEthernet0/0
 ip summary-address eigrp 100 10.1.0.0 255.255.252.0

<span class="c">! named mode</span>
  af-interface GigabitEthernet0/0
   summary-address 10.1.0.0 255.255.252.0</pre>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Queries bounded by stub and summary">
<rect x="250" y="20" width="140" height="46" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">HUB</text>
<rect x="30" y="170" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="95" y="192" text-anchor="middle" class="svg-ink" font-size="13">Branch 1</text><text x="95" y="208" text-anchor="middle" class="svg-muted" font-size="12">stub</text>
<rect x="255" y="170" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">Branch 2</text><text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">stub</text>
<rect x="480" y="170" width="130" height="46" rx="8" fill="#ddd6fe"/><text x="545" y="192" text-anchor="middle" class="svg-ink" font-size="13">Distribution</text><text x="545" y="208" text-anchor="middle" class="svg-muted" font-size="12">sends 10.1.0.0/22</text>
<line x1="270" y1="66" x2="95" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="320" y1="66" x2="320" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="370" y1="66" x2="545" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="150" y="110" class="svg-muted" font-size="12">no queries</text><text x="330" y="125" class="svg-muted" font-size="12">no queries</text>
<text x="470" y="110" class="svg-accent" font-size="12">summary only</text>
<text x="320" y="255" text-anchor="middle" class="svg-ink" font-size="12">A lost 10.1.2.0/24 is never queried beyond the summary</text>
</svg><p class="cap">Stubs are not queried; routers that know only the summary reply "unreachable" at once.</p></div>

<div class="eg"><p><b>Worked example: building the summary.</b> A distribution router has 10.1.0.0/24, 10.1.1.0/24, 10.1.2.0/24 and 10.1.3.0/24. In binary, the third octet runs from 000000<b>00</b> to 000000<b>11</b>: the first 22 bits are common, so the summary is <b>10.1.0.0/22</b> (mask 255.255.252.0). After configuring it, the distribution router installs a local discard route with AD <b>5</b>:</p>
<pre class="out">DIST# show ip route | include Null0
<span class="hl">D        10.1.0.0/22 is a summary, 00:01:12, Null0</span></pre>
<p>The summary's metric is the lowest metric among its components. It stays up as long as at least one component exists; when 10.1.2.0/24 fails, the core still sees 10.1.0.0/22 and never needs to query for the /24.</p></div>

<div class="warn"><p><b>Common mistake.</b> Configuring <code>eigrp stub receive-only</code> on a branch and then wondering why the branch LAN has disappeared from the network. Receive-only advertises nothing. For a normal branch, the default <code>eigrp stub</code> (connected and summary) is what you want.</p></div>

<div class="exam"><p><b>Exam trap.</b> A stub router still forms neighbours and learns routes; only Queries toward it are suppressed. A locally generated EIGRP summary has AD 5 and points to Null0. SIA is usually caused by a neighbour that does not reply, not by the router that logs it.</p></div>

<div class="scn"><h4>One satellite branch, two hundred resets</h4><p>A logistics firm ran EIGRP over DMVPN with 200 branches and no stub configuration. Whenever a branch LAN flapped, the hub queried every other branch. One branch used a slow, lossy satellite link and often could not answer in time. The hub declared routes stuck in active and reset that branch, which in turn triggered more Updates and Queries. Configuring <code>eigrp stub</code> on all branches removed them from the query domain; hub Queries dropped to almost zero and SIA events stopped.</p><p><b>Lesson:</b> in hub-and-spoke networks, make every spoke a stub and summarise wherever you can. Small query domains prevent SIA.</p></div>

<div class="iv"><p class="q">"What is stuck-in-active, and how do you prevent it?"</p><p>Strong answer: when a route loses its successor without a feasible successor, it goes Active and the router Queries its neighbours; it must receive every Reply. If a neighbour does not answer within the active timer (3 minutes), and does not answer the SIA-Query sent at half-time, the route is stuck in active and that neighbour is reset. Prevent it by limiting query scope with stub routers and summarisation, fixing unreliable links, and keeping CPU and memory healthy. Mention <code>show ip eigrp topology active</code> to find the neighbour you are waiting for.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>No FS: route goes Active, Queries go to all neighbours, and every Reply must return.</li>
<li>Active timer 3 minutes; SIA-Query at half-time; a silent neighbour is reset (stuck in active).</li>
<li>Stub routers are not queried; default stub advertises connected and summary routes.</li>
<li>Summaries are configured per interface, install a Null0 route with AD 5, and stop Queries at the summary boundary.</li>
<li><code>show ip eigrp topology active</code> shows which neighbour has not replied.</li>
</ul></div>
`,hi:`
<p>Office mein aapki ek zaroori file kho jaati hai aur aap team se poochte ho, "Kisi ke paas copy hai?" Agar sab jaldi jawab dein, badhiya. Lekin agar ek colleague kahe "main apni team se poochta hoon", aur woh apni team se poochein, to sawaal poori company mein fail jaata hai, aur jab tak aakhri insaan jawab na de, aap matter band nahi kar sakte. Chhutti par gaya ek colleague aapko ghanton rok sakta hai. EIGRP <b>Queries</b> bilkul aise hi kaam karti hain, aur isi wajah se kharab design wala network <b>stuck in active</b> ho sakta hai.</p>

<h3>Active hona: diffusing computation</h3>
<p>Jab successor kho jaata hai aur koi feasible successor nahi hota, route <b>Passive</b> se <b>Active</b> ho jaata hai. Router har neighbour ko <b>Query</b> bhejta hai aur naya path chunne se pehle har ek se <b>Reply</b> collect karna padta hai. Query paane wala har neighbour inme se kisi ek tarike se react karta hai:</p>
<ol>
<li>Uske paas us prefix ki koi entry nahi: turant "unreachable" reply karta hai.</li>
<li>Query karne wala router uska successor <b>nahi</b> hai: turant apne current metric ke saath reply karta hai.</li>
<li>Query karne wala router uska successor <b>hai</b> aur uske paas FS hai: FS par switch karta hai aur naye metric ke saath reply karta hai.</li>
<li>Query karne wala router uska successor hai aur uske paas FS <b>nahi</b> hai: woh bhi Active ho jaata hai aur apni Queries aage bhejta hai. Woh tabhi jawab deta hai jab uske saare neighbours jawab de dein.</li>
</ol>
<p>Case 4 hi wajah hai ki Query network mein "diffuse" hoti hai. Jab saare Replies aa jaate hain, original router best path chunta hai (ya route hata deta hai), phir se Passive hota hai aur Updates bhejta hai.</p>

<h3>Stuck in active (SIA)</h3>
<p>Router hamesha wait nahi kar sakta. <b>Active timer</b> default mein 3 minute hai (<code>timers active-time</code>). Modern IOS us point par seedha haar nahi maanta: active timer ke aadhe par woh har us neighbour ko <b>SIA-Query</b> bhejta hai jisne reply nahi kiya. Jo neighbour abhi bhi busy hai woh <b>SIA-Reply</b> ("abhi kaam chal raha hai") se jawab deta hai, aur wait chalta rehta hai. Jo neighbour SIA-Query ka bhi jawab na de sake, woh reset ho jaata hai. Tab aapko dikhta hai:</p>
<pre class="out"><span class="hl">%DUAL-3-SIA: Route 192.168.50.0/24 stuck-in-active state in IP-EIGRP(0) 100.  Cleaning up</span>
<span class="hl">%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.20.0.9 (Tunnel0) is down: stuck in active</span>

HUB# show ip eigrp topology active
EIGRP-IPv4 Topology Table for AS(100)/ID(10.20.0.1)
A 192.168.50.0/24, 1 successors, FD is Inaccessible, Q
    1 replies, active 00:01:32, query-origin: Local origin
         via 10.20.0.5 (Infinity/Infinity), Tunnel0
      <span class="hl">Remaining replies:
         via 10.20.0.9, r, Tunnel0</span></pre>
<p><code>Remaining replies</code> line, jo chhote <code>r</code> se mark hoti hai, us neighbour ka naam batati hai jiska aap abhi bhi wait kar rahe ho; troubleshooting wahin se aage badhti hai. Aam wajahein: bahut bada query domain, congested ya lossy WAN link, remote router par busy CPU, ya one-way link. Detailed SIA troubleshooting ENARSI EIGRP module mein aage chalti hai; ENCOR ke liye concept aur neeche ke do ilaaj jaano.</p>

<h3>Ilaaj 1: stub routing</h3>
<p>Ek ya do uplinks wala branch router kabhi sensible transit path nahi hota. Use <b>stub</b> configure karna uske neighbours ko batata hai "mujhe query mat karo". Hub stubs ko Queries bhejna band kar deta hai, jisse query domain bahut chhota ho jaata hai.</p>
<pre class="code"><span class="c">! branch router par (classic mode)</span>
router eigrp 100
 eigrp stub                        <span class="c">! default = connected summary</span>
<span class="c">! doosre options: receive-only | connected | static | summary | redistributed | leak-map</span>

<span class="c">! named mode</span>
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 100
  eigrp stub connected summary</pre>
<pre class="out">HUB# show ip eigrp neighbors detail
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
0   10.20.0.5               Tu0                      13 00:10:22   40   240  0  25
   Version 23.0/2.0, Retrans: 0, Retries: 0, Prefixes: 2
   Topology-ids from peer - 0
   <span class="hl">Stub Peer Advertising (CONNECTED SUMMARY ) Routes</span>
   <span class="hl">Suppressing queries</span></pre>
<p>Stub router ab bhi neighbours banata hai aur routes receive karta hai. Yeh sirf wahi route types advertise karta hai jinki aap ijaazat do; <code>receive-only</code> kuch bhi advertise nahi karta.</p>

<h3>Ilaaj 2: summarisation</h3>
<p>Agar neighbour sirf summary jaanta hai, to uske paas fail hue specific prefix ki koi entry nahi hoti aur woh turant "unreachable" reply karta hai (upar wala case 1), isliye Query wahin ruk jaati hai. EIGRP mein summarisation per interface configure hota hai, kisi bhi router par, sirf area borders par nahi jaisa OSPF mein.</p>
<pre class="code"><span class="c">! classic mode, core ki taraf wale interface par</span>
interface GigabitEthernet0/0
 ip summary-address eigrp 100 10.1.0.0 255.255.252.0

<span class="c">! named mode</span>
  af-interface GigabitEthernet0/0
   summary-address 10.1.0.0 255.255.252.0</pre>

<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Stub aur summary se bounded queries">
<rect x="250" y="20" width="140" height="46" rx="8" fill="#bae6fd"/><text x="320" y="48" text-anchor="middle" class="svg-ink" font-size="14">HUB</text>
<rect x="30" y="170" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="95" y="192" text-anchor="middle" class="svg-ink" font-size="13">Branch 1</text><text x="95" y="208" text-anchor="middle" class="svg-muted" font-size="12">stub</text>
<rect x="255" y="170" width="130" height="46" rx="8" fill="#bbf7d0"/><text x="320" y="192" text-anchor="middle" class="svg-ink" font-size="13">Branch 2</text><text x="320" y="208" text-anchor="middle" class="svg-muted" font-size="12">stub</text>
<rect x="480" y="170" width="130" height="46" rx="8" fill="#ddd6fe"/><text x="545" y="192" text-anchor="middle" class="svg-ink" font-size="13">Distribution</text><text x="545" y="208" text-anchor="middle" class="svg-muted" font-size="12">10.1.0.0/22 bhejta</text>
<line x1="270" y1="66" x2="95" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="320" y1="66" x2="320" y2="170" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><line x1="370" y1="66" x2="545" y2="170" stroke="#64748b" stroke-width="2"/>
<text x="150" y="110" class="svg-muted" font-size="12">queries nahi</text><text x="330" y="125" class="svg-muted" font-size="12">queries nahi</text>
<text x="470" y="110" class="svg-accent" font-size="12">sirf summary</text>
<text x="320" y="255" text-anchor="middle" class="svg-ink" font-size="12">Khoye 10.1.2.0/24 ki query summary ke aage kabhi nahi jaati</text>
</svg><p class="cap">Stubs ko query nahi kiya jaata; jo routers sirf summary jaante hain woh turant "unreachable" reply karte hain.</p></div>

<div class="eg"><p><b>Worked example: summary banana.</b> Ek distribution router ke paas 10.1.0.0/24, 10.1.1.0/24, 10.1.2.0/24 aur 10.1.3.0/24 hain. Binary mein third octet 000000<b>00</b> se 000000<b>11</b> tak jaata hai: pehle 22 bits common hain, isliye summary <b>10.1.0.0/22</b> hai (mask 255.255.252.0). Configure karne ke baad distribution router AD <b>5</b> ke saath ek local discard route install karta hai:</p>
<pre class="out">DIST# show ip route | include Null0
<span class="hl">D        10.1.0.0/22 is a summary, 00:01:12, Null0</span></pre>
<p>Summary ka metric uske components mein sabse kam metric hota hai. Jab tak kam se kam ek component exist kare, summary up rehta hai; jab 10.1.2.0/24 fail hota hai, core ko ab bhi 10.1.0.0/22 dikhta hai aur use /24 ke liye query karne ki zaroorat hi nahi padti.</p></div>

<div class="warn"><p><b>Common galti.</b> Branch par <code>eigrp stub receive-only</code> configure karna aur phir sochna ki branch LAN network se gaayab kyun ho gaya. Receive-only kuch advertise nahi karta. Normal branch ke liye default <code>eigrp stub</code> (connected aur summary) hi chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> Stub router ab bhi neighbours banata hai aur routes seekhta hai; sirf uski taraf Queries band hoti hain. Locally generated EIGRP summary ka AD 5 hai aur yeh Null0 ki taraf point karta hai. SIA aam taur par us neighbour ki wajah se hota hai jo reply nahi karta, us router ki wajah se nahi jo log karta hai.</p></div>

<div class="scn"><h4>Ek satellite branch, do sau resets</h4><p>Ek logistics firm DMVPN par 200 branches ke saath bina stub configuration ke EIGRP chala rahi thi. Jab bhi kisi branch ka LAN flap hota, hub har doosri branch ko query karta. Ek branch slow, lossy satellite link use karti thi aur aksar time par jawab nahi de paati thi. Hub routes ko stuck in active declare karta aur us branch ko reset kar deta, jisse aur Updates aur Queries trigger hoti. Saari branches par <code>eigrp stub</code> configure karne se woh query domain se bahar ho gayi; hub ki Queries lagbhag zero ho gayi aur SIA events band ho gaye.</p><p><b>Seekh:</b> hub-and-spoke networks mein har spoke ko stub banao aur jahan ho sake summarise karo. Chhote query domains SIA se bachate hain.</p></div>

<div class="iv"><p class="q">"Stuck-in-active kya hai, aur aap ise kaise rokte ho?"</p><p>Strong answer: jab kisi route ka successor bina feasible successor ke kho jaata hai, woh Active hota hai aur router apne neighbours ko Query karta hai; use har Reply milna chahiye. Agar koi neighbour active timer (3 minute) ke andar jawab na de, aur aadhe time par bheji gayi SIA-Query ka bhi jawab na de, to route stuck in active hai aur woh neighbour reset hota hai. Ise stub routers aur summarisation se query scope limit karke, unreliable links theek karke, aur CPU aur memory healthy rakhkar roko. Jis neighbour ka wait ho raha hai use dhoondhne ke liye <code>show ip eigrp topology active</code> zaroor bolo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>FS nahi: route Active hota hai, Queries saare neighbours ko jaati hain, aur har Reply wapas aana chahiye.</li>
<li>Active timer 3 minute; aadhe time par SIA-Query; chup neighbour reset hota hai (stuck in active).</li>
<li>Stub routers ko query nahi kiya jaata; default stub connected aur summary routes advertise karta hai.</li>
<li>Summaries per interface configure hote hain, AD 5 ke saath Null0 route install karte hain, aur summary boundary par Queries rok dete hain.</li>
<li><code>show ip eigrp topology active</code> dikhata hai ki kis neighbour ne reply nahi kiya.</li>
</ul></div>
`}};export{e as default};