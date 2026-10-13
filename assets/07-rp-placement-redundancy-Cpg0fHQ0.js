var e={id:`rp-placement-redundancy`,h:{en:`RP placement, redundancy and failure behaviour`,hi:`RP placement, redundancy aur failure behaviour`},body:{en:`
<p>You now know four ways to tell routers where the RP is. This chapter is about the design questions that come before the commands: <i>where</i> should the RP live, <i>how many</i> do you need, and <i>what exactly happens</i> to a live stream when an RP fails? Engineers who can answer these three questions are the ones who get called when the CEO's town-hall video freezes.</p>

<h3>Where to place the RP</h3>
<p>The RP does not forward the whole stream forever: after the switchover to the shortest-path tree, the data takes the direct path and the RP only handles the control work (registers, joins, state). So the RP does not need to be a big router in the data path. It needs to be <b>reachable, stable and central</b>.</p>
<ul>
<li><b>Use a loopback.</b> A loopback does not go down with a cable. Advertise it in the IGP as a /32 and enable <code>ip pim sparse-mode</code> on it.</li>
<li><b>Put it in the core, or at a data center, not at a branch.</b> Every first-hop router sends registers to it and every receiver sends joins to it. A branch RP behind a slow WAN link makes every new stream start slowly.</li>
<li><b>Keep it away from hosts' LANs.</b> A router with hundreds of connected LANs has more reasons to reload than a dedicated core router.</li>
<li><b>Never use an interface address of a physical link.</b> If that link goes down, the RP address disappears even though the router is healthy.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Sahyadri University has a main campus in Pune (two core routers) and 15 small campuses. Putting the RP on a branch router in Nagpur means that a first-hop router in Pune sends registers over a 20 Mbps WAN link to Nagpur and back. Putting two anycast RPs on the Pune core routers keeps all control traffic inside the data center. The branches reach them over the same WAN links they already use for everything else.</p></div>

<h3>How many RPs?</h3>
<p>One RP is enough for the lab. For production, at least two, built in a way that matches your method:</p>
<table class="cmp"><tr><th>Method</th><th>Redundancy design</th><th>Failover speed</th></tr>
<tr><td>Static</td><td>Anycast RP (two RPs, same address, MSDP)</td><td>IGP convergence</td></tr>
<tr><td>Auto-RP</td><td>Two candidate RPs, two mapping agents (the higher address wins, the other waits)</td><td>Holdtime of the mapping (minutes)</td></tr>
<tr><td>BSR</td><td>Two C-BSRs (priority decides), two or more C-RPs (priority and hash)</td><td>C-RP holdtime, 150 s by default</td></tr>
<tr><td>Anycast RP</td><td>Built in: any number of RPs in an MSDP mesh</td><td>IGP convergence</td></tr>
</table>
<p>A useful belt-and-braces trick with a dynamic method: add one plain static line, <code>ip pim rp-address 9.9.9.9</code>, on each router. While the dynamic mapping works, it wins; if the mapping disappears (the mapping agent dies), the static line becomes the fallback and the group still has an RP. In the lab environment this is exactly what you observe: only routers with the static fallback keep an RP when the mapping agent is cut off.</p>

<h3>What happens when the RP fails?</h3>
<p>Think about the three kinds of traffic:</p>
<ol>
<li><b>Streams already on the shortest-path tree.</b> They keep flowing. Their <code>(S,G)</code> entries do not depend on the RP any more and live as long as packets keep arriving (about three minutes after the last packet).</li>
<li><b>New receivers joining a group.</b> They send <code>(*,G)</code> joins towards a dead RP and get nothing, unless the group is already flowing on an SPT that reaches them by a direct join. A new receiver in a new part of the network has no tree to attach to.</li>
<li><b>New sources.</b> A new source's registers go to the dead RP, so the stream cannot start.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="RP failure effect on streams">
<rect x="20" y="20" width="600" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">Running streams on SPT: keep flowing until their state expires</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">they do not need the RP any more</text>
<rect x="20" y="80" width="600" height="50" rx="8" fill="#fde68a"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">New joins and new sources: stuck until the RP or its replacement answers</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">anycast: seconds, Auto-RP and BSR: holdtime</text>
<rect x="20" y="140" width="600" height="50" rx="8" fill="#fed7aa"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="13">Wrong or missing RP on one router: only its receivers fail</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">the hardest fault to notice</text>
</svg><p class="cap">An RP failure hurts the beginning of a stream, not an established one.</p></div>
<p>Because of this, the symptom after an RP failure is often confusing: "the channel that was already playing is fine, but nobody can start a new one".</p>

<h3>Scoping groups by site or business</h3>
<p>With the ACL technique of chapter 2 or a <code>group-list</code> you can give each region or business its own RP. That also contains the damage: if the Deccan Broadcast RP fails, Sahyadri classes on a different RP keep starting. In the lab <b>mq-rp-acl-ranges</b> you built this on purpose.</p>

<h3>Verification of failover</h3>
<pre class="out">R1#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s): 224.0.0.0/4, Static
    RP: 10.255.255.100 (?)

R1#show ip mroute 239.10.1.1
<span class="c">... after shutting Loopback1 on R2 ...</span>
(10.101.0.10, 239.10.1.1), 00:00:36/00:02:24, flags: FT
  Incoming interface: GigabitEthernet0/0, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/1, Forward/Sparse, 00:00:36/00:02:54</pre>
<p>The mapping still says 10.255.255.100, because to the routers nothing changed in the configuration. What changed is where that address leads in the routing table. This is why you always check <code>show ip route 10.255.255.100</code> too.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) One RP, no fallback, and a "test" on a Friday. (2) An RP on a physical interface address. (3) Two Auto-RP agents where nobody knows which one is active. (4) Relying on the RP being "just a control function" and then putting it on a branch.</p></div>
<div class="exam"><p><b>Exam trap.</b> The simulator and many exam questions treat the effect of an RP failure as immediate. Real networks have holdtimes (Auto-RP and BSR mappings expire after their holdtime; <code>(S,G)</code> state after about three minutes), so on a real router the change may take minutes to show. Know both views.</p></div>

<div class="scn"><h4>Friday-evening RP test</h4><p>A bank's network team tested "what if the RP dies" at 6 p.m. on a Friday by shutting the RP's loopback. The running trading-floor video stayed up, so they thought the test passed. At 6:10 a new analyst turned on a screen for a group that was not yet active: nothing appeared. Their design had one static RP and no fallback. They moved to two anycast RPs on the core and repeated the test: after the shutdown, new streams started in about the time OSPF needed to re-converge.</p><p><b>Lesson:</b> test failover with a <i>new</i> source and a <i>new</i> receiver, not only with a running stream.</p></div>

<div class="iv"><p class="q">"What happens to active multicast streams if the RP fails?"</p><p>Strong answer: streams already switched to the shortest-path tree continue until their state expires, because the RP is no longer on the data path. New receivers and new sources cannot start, because joins and registers go to the dead RP. Then explain how you avoid the problem: anycast RP with MSDP, or two C-RPs / two agents, plus a static fallback line.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Place the RP on a loopback in the core or data center, advertised as a /32 with PIM on it.</li>
<li>Production needs at least two RPs; the redundancy design depends on the method.</li>
<li>After an RP failure running SPT streams survive; new joins and new sources fail.</li>
<li>A plain static line behind a dynamic method works as a fallback.</li>
<li>Test failover with new sources and new receivers, and check the unicast route to the RP.</li>
</ul></div>
`,hi:`
<p>Ab aap routers ko RP batane ke chaar tareeke jaante ho. Yeh chapter un design sawaalon ke baare mein hai jo commands se pehle aate hain: RP <i>kahan</i> rahe, <i>kitne</i> chahiye, aur RP fail hone par live stream ke saath <i>exactly kya</i> hota hai? Jo engineers in teen sawaalon ka jawab de sakte hain unhi ko bulaya jaata hai jab CEO ke town-hall ka video freeze ho jaye.</p>

<h3>RP kahan rakhein</h3>
<p>RP poori stream ko hamesha forward nahi karta: shortest-path tree par switchover ke baad data seedha path leta hai aur RP sirf control ka kaam (registers, joins, state) sambhalta hai. Isliye RP ko data path mein bada router hona zaroori nahi. Use <b>reachable, stable aur central</b> hona chahiye.</p>
<ul>
<li><b>Loopback use karo.</b> Loopback cable ke saath down nahi hota. Use IGP mein /32 ki tarah advertise karo aur us par <code>ip pim sparse-mode</code> lagao.</li>
<li><b>Core mein ya data center mein rakho, branch mein nahi.</b> Har first-hop router use registers bhejta hai aur har receiver joins. Slow WAN link ke peeche branch RP har naye stream ko dheere shuru karwata hai.</li>
<li><b>Hosts ke LANs se door rakho.</b> Jis router par saikdon LANs judte hain uske reload hone ke zyada kaaran hote hain, dedicated core router ke muqable.</li>
<li><b>Kabhi physical link ka interface address mat use karo.</b> Woh link down ho to RP address gayab ho jaata hai chahe router theek ho.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Sahyadri University ka main campus Pune mein hai (do core routers) aur 15 chhote campuses. RP ko Nagpur ke branch router par rakhne ka matlab hai ki Pune ka first-hop router 20 Mbps WAN link par registers Nagpur bhejta hai aur wapas. Do anycast RPs ko Pune core routers par rakhne se saara control traffic data center ke andar rehta hai. Branches unhe usi WAN links se pahunchte hain jo woh baaki sab ke liye pehle se use karte hain.</p></div>

<h3>Kitne RPs?</h3>
<p>Lab ke liye ek RP kaafi hai. Production ke liye kam se kam do, aise banaye ki aapke method se match karein:</p>
<table class="cmp"><tr><th>Method</th><th>Redundancy design</th><th>Failover speed</th></tr>
<tr><td>Static</td><td>Anycast RP (do RPs, same address, MSDP)</td><td>IGP convergence</td></tr>
<tr><td>Auto-RP</td><td>Do candidate RPs, do mapping agents (higher address jeetta hai, dusra wait karta hai)</td><td>Mapping ka holdtime (minutes)</td></tr>
<tr><td>BSR</td><td>Do C-BSRs (priority decide karti hai), do ya zyada C-RPs (priority aur hash)</td><td>C-RP holdtime, default 150 s</td></tr>
<tr><td>Anycast RP</td><td>Built in: MSDP mesh mein kitne bhi RPs</td><td>IGP convergence</td></tr>
</table>
<p>Dynamic method ke saath ek kaam ki trick: har router par ek plain static line jodo, <code>ip pim rp-address 9.9.9.9</code>. Jab tak dynamic mapping kaam kare, woh jeetti hai; agar mapping gayab ho jaye (mapping agent mar jaye), to static line fallback ban jaati hai aur group ka phir bhi RP rehta hai. Lab environment mein aap yahi dekhte ho: jab mapping agent kat jaata hai tab sirf static fallback wale routers ke paas RP rehta hai.</p>

<h3>RP fail hone par kya hota hai?</h3>
<p>Teen tarah ke traffic ke baare mein socho:</p>
<ol>
<li><b>Jo streams pehle se shortest-path tree par hain.</b> Woh chalti rehti hain. Unki <code>(S,G)</code> entries ab RP par depend nahi karti aur tab tak jeeti hain jab tak packets aate rahein (aakhri packet ke lagbhag teen minute baad tak).</li>
<li><b>Group join karne wale naye receivers.</b> Woh mare hue RP ki taraf <code>(*,G)</code> joins bhejte hain aur kuch nahi paate, jab tak group pehle se aise SPT par na chal raha ho jo seedhe join se unhe pahunche. Network ke naye hisse mein naya receiver kisi tree se nahi jud sakta.</li>
<li><b>Naye sources.</b> Naye source ke registers mare hue RP ke paas jaate hain, isliye stream shuru nahi ho sakti.</li>
</ol>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="RP failure ka streams par asar">
<rect x="20" y="20" width="600" height="50" rx="8" fill="#bbf7d0"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">SPT par chalti streams: state expire hone tak chalti rehti hain</text><text x="320" y="60" text-anchor="middle" class="svg-muted" font-size="12">unhe ab RP ki zaroorat nahi</text>
<rect x="20" y="80" width="600" height="50" rx="8" fill="#fde68a"/><text x="320" y="102" text-anchor="middle" class="svg-ink" font-size="13">Naye joins aur naye sources: RP ya uska replacement jawab de tab tak atke</text><text x="320" y="120" text-anchor="middle" class="svg-muted" font-size="12">anycast: seconds, Auto-RP aur BSR: holdtime</text>
<rect x="20" y="140" width="600" height="50" rx="8" fill="#fed7aa"/><text x="320" y="162" text-anchor="middle" class="svg-ink" font-size="13">Ek router par galat ya missing RP: sirf uske receivers fail</text><text x="320" y="180" text-anchor="middle" class="svg-muted" font-size="12">notice karna sabse mushkil fault</text>
</svg><p class="cap">RP failure stream ki shuruaat ko hurt karta hai, established stream ko nahi.</p></div>
<p>Isi wajah se RP failure ke baad symptom aksar confusing hota hai: "jo channel chal raha tha woh theek hai, lekin naya koi shuru nahi kar sakta".</p>

<h3>Site ya business ke hisaab se groups ko scope karna</h3>
<p>Chapter 2 ki ACL technique ya <code>group-list</code> se aap har region ya business ko apna RP de sakte ho. Isse damage bhi contain hota hai: agar Deccan Broadcast ka RP fail ho jaye, to alag RP par Sahyadri classes phir bhi shuru hoti rehti hain. Lab <b>mq-rp-acl-ranges</b> mein aapne yeh jaanboojh kar banaya tha.</p>

<h3>Failover ka verification</h3>
<pre class="out">R1#show ip pim rp mapping
PIM Group-to-RP Mappings

Group(s): 224.0.0.0/4, Static
    RP: 10.255.255.100 (?)

R1#show ip mroute 239.10.1.1
<span class="c">... R2 par Loopback1 shut karne ke baad ...</span>
(10.101.0.10, 239.10.1.1), 00:00:36/00:02:24, flags: FT
  Incoming interface: GigabitEthernet0/0, RPF nbr 0.0.0.0
  Outgoing interface list:
    GigabitEthernet0/1, Forward/Sparse, 00:00:36/00:02:54</pre>
<p>Mapping ab bhi 10.255.255.100 hi kehta hai, kyunki routers ke liye configuration mein kuch nahi badla. Jo badla woh yeh hai ki woh address routing table mein kahan le jaata hai. Isiliye aap hamesha <code>show ip route 10.255.255.100</code> bhi check karte ho.</p>

<div class="warn"><p><b>Common galtiyan.</b> (1) Ek RP, koi fallback nahi, aur Friday ko "test". (2) Physical interface address par RP. (3) Do Auto-RP agents jahan koi nahi jaanta ki kaunsa active hai. (4) Is par bharosa karna ki RP "sirf control function hai" aur phir use branch par rakh dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Simulator aur kai exam questions RP failure ka asar turant maanti hain. Real networks mein holdtimes hote hain (Auto-RP aur BSR mappings holdtime ke baad expire hote hain; <code>(S,G)</code> state lagbhag teen minute baad), isliye real router par change dikhne mein minutes lag sakte hain. Dono views jaano.</p></div>

<div class="scn"><h4>Friday shaam ka RP test</h4><p>Ek bank ki network team ne Friday shaam 6 baje RP ka loopback shut karke test kiya ki "agar RP mar jaye to kya". Chalta hua trading-floor video up raha, to unhone socha test pass ho gaya. 6:10 par ek naye analyst ne aise group ke liye screen on ki jo abhi active nahi tha: kuch nahi dikha. Unke design mein ek static RP tha aur koi fallback nahi. Unhone core par do anycast RPs par move kiya aur test dohraya: shutdown ke baad naye streams lagbhag utne time mein shuru hui jitna OSPF ko re-converge hone mein laga.</p><p><b>Seekh:</b> failover ko <i>naye</i> source aur <i>naye</i> receiver se test karo, sirf chalti stream se nahi.</p></div>

<div class="iv"><p class="q">"RP fail ho jaye to active multicast streams ke saath kya hota hai?"</p><p>Strong answer: jo streams shortest-path tree par switch ho chuki hain woh state expire hone tak chalti rehti hain, kyunki RP ab data path mein nahi hai. Naye receivers aur naye sources shuru nahi ho sakte, kyunki joins aur registers mare hue RP ke paas jaate hain. Phir batao ki problem se kaise bachte ho: MSDP ke saath anycast RP, ya do C-RPs / do agents, aur ek static fallback line.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>RP ko core ya data center ke loopback par rakho, /32 ki tarah advertise karo aur us par PIM lagao.</li>
<li>Production ko kam se kam do RPs chahiye; redundancy design method par depend karta hai.</li>
<li>RP failure ke baad chalti SPT streams bachti hain; naye joins aur naye sources fail hote hain.</li>
<li>Dynamic method ke peeche plain static line fallback ka kaam karti hai.</li>
<li>Failover ko naye sources aur naye receivers se test karo, aur RP ka unicast route check karo.</li>
</ul></div>
`}};export{e as default};