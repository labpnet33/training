var e=e=>`<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="iBGP split horizon"><rect x="20" y="50" width="110" height="46" rx="8" fill="#fde68a"/><text x="75" y="78" text-anchor="middle" class="svg-ink" font-size="13">CE1 eBGP</text><rect x="200" y="50" width="100" height="46" rx="8" fill="#bae6fd"/><text x="250" y="78" text-anchor="middle" class="svg-ink" font-size="14">PE1</text><rect x="370" y="50" width="100" height="46" rx="8" fill="#bae6fd"/><text x="420" y="78" text-anchor="middle" class="svg-ink" font-size="14">PE2</text><rect x="540" y="50" width="80" height="46" rx="8" fill="#bbf7d0"/><text x="580" y="78" text-anchor="middle" class="svg-ink" font-size="14">PE3</text><line x1="130" y1="73" x2="200" y2="73" stroke="#64748b" stroke-width="2"/><line x1="300" y1="73" x2="370" y2="73" stroke="#64748b" stroke-width="2"/><line x1="470" y1="73" x2="540" y2="73" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><text x="335" y="66" text-anchor="middle" class="svg-accent" font-size="12">iBGP</text><text x="505" y="66" text-anchor="middle" class="svg-muted" font-size="12">blocked</text><text x="320" y="130" text-anchor="middle" class="svg-ink" font-size="12">PE2 learned the route from an iBGP peer, so it does NOT pass it to PE3</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">Fix: full mesh PE1-PE3, or a route reflector</text></svg><p class="cap">`+e+`</p></div>`,t={id:`ibgp-loopbacks-next-hop`,h:{en:`iBGP between loopbacks, update-source and next-hop-self`,hi:`Loopbacks ke beech iBGP, update-source aur next-hop-self`},body:{en:`
<p>An iBGP session is a TCP connection to port 179. TCP only needs the two addresses to reach each other. In a provider core you want that to keep working as long as <i>any</i> path exists between the routers. A link address does not give you that: if the link goes down, the address goes with it. A <b>loopback</b> never goes down while the router is alive, so the session survives any single link failure as long as the IGP reroutes to the loopback.</p>

<h3>The two commands that make it work</h3>
<pre class="code"><span class="c">! PE1 (reference configuration)</span>
router bgp 65000
 neighbor 10.20.255.2 remote-as 65000
 neighbor 10.20.255.2 update-source Loopback0
 neighbor 10.20.255.2 next-hop-self</pre>
<ul>
<li><b>remote-as 65000</b> equals our own AS, so Cisco IOS treats this as iBGP automatically.</li>
<li><b>update-source Loopback0</b> makes our packets leave with source 10.20.255.1. Without it, the router uses the outgoing interface address (10.20.1.1). The RR is configured to expect a neighbour at 10.20.255.1, does not recognise 10.20.1.1, and never completes the session.</li>
<li><b>next-hop-self</b> is explained below.</li>
</ul>
<p>Both sides need matching configuration: each neighbour statement points at the <i>other</i> router's loopback, and each side sources from its own loopback.</p>

<h3>What a stuck session looks like</h3>
<p>In the troubleshooting lab, PE2 was configured to peer with the RR link address 10.20.2.2 instead of the loopback. The RR expects 10.20.255.3. This is real output from that lab:</p>
<pre class="out">PE2# show ip bgp summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">10.20.2.2       4        65000       0       0        0    0    0 never   Active</span>
198.51.100.2    4        65102       3       2        2    0    0 00:00:30         1

PE2# show ip route 10.20.255.2
Routing entry for 10.20.255.2/32
  Known via "isis", distance 115, metric 10</pre>
<p>The state <b>Active</b> with counters at zero means "I am trying to open TCP and failing". The IGP route to the loopback is fine, so the fault is in the BGP neighbour statement, not in IS-IS. Remember: <b>Idle</b> means no attempt yet (for example no route to the peer), <b>Active</b> means attempts are failing, a number in the last column means <b>Established</b>.</p>

<h3>iBGP split horizon and the full mesh</h3>
<p>To stop loops inside one AS, iBGP uses a simple rule: a route learned from an iBGP peer is <b>never sent to another iBGP peer</b>. (There is no AS_PATH change to catch a loop, so the rule replaces it.) The consequence is that every iBGP router must peer with every other: <code>n(n-1)/2</code> sessions. Ten routers need 45; twenty need 190; a hundred need 4950. Each router also keeps n-1 sessions. This is why we need route reflectors in the next chapter.</p>

@@D@@

<h3>next-hop-self: why the customer address is useless in the core</h3>
<p>When CE1 advertises 172.16.1.0/24 to PE1, the next hop is 192.0.2.2. PE1 passes the route to the RR over iBGP and, by rule, <b>iBGP does not change the next hop</b>. PE2 receives next hop 192.0.2.2, a customer link that the IGP never carried. PE2 cannot resolve it, so the route is marked inaccessible and is not used. The RR has the same problem. This is real output from the RR in the lab before the fix:</p>
<pre class="out">RR# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
   i 172.16.1.0/24    <span class="hl">192.0.2.2</span>                0    100      0 65101 i</pre>
<p>There is no <code>*&gt;</code> in front of the route. Without the <code>&gt;</code> it is not the best path, because the next hop is unreachable. After <code>neighbor 10.20.255.2 next-hop-self</code> on PE1, PE1 rewrites the next hop to its own loopback, which IS-IS carries everywhere:</p>
<pre class="out">PE2# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;i 172.16.1.0/24    <span class="hl">10.20.255.1</span>              0    100      0 65101 i
 *&gt;  172.16.2.0/24    198.51.100.2             0             0 65102 i</pre>
<p>The alternative is to put the customer link into the IGP as a passive interface, or redistribute connected routes. SPs usually prefer next-hop-self because it keeps customer subnets out of the IGP and gives every next hop a stable loopback address.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Peering to link addresses instead of loopbacks. (2) Forgetting update-source on <i>one</i> side only; both sides need it. (3) Putting next-hop-self on the RR instead of the PEs: the RR does not change the next hop of reflected routes, so the PEs must set it when they send their own routes.</p></div>
<div class="exam"><p><b>Exam trap.</b> next-hop-self changes the next hop of routes sent <i>to that neighbour</i> only, and it affects routes learned from eBGP. For iBGP-learned routes, a plain iBGP peer never changes the next hop.</p></div>

<div class="scn"><h4>A route in the table but not in use</h4><p>PE2 listed 172.16.1.0/24 in <code>show ip bgp</code> but the PC behind CE2 could not ping the other site. The line had no <code>&gt;</code> and the next hop was 192.0.2.2. The engineer added next-hop-self on PE1 toward the RR, and the next hop became 10.20.255.1 with the best-path marker.</p><p><b>Lesson:</b> when a BGP route is present but unused, look at the next hop first and ask "can I reach it through the IGP?"</p></div>

<div class="iv"><p class="q">"Why do you source iBGP from loopbacks, and why next-hop-self?"</p><p>Loopbacks stay up as long as the router lives, so the session survives link failures when the IGP reroutes. update-source makes the TCP source match what the peer expects. iBGP does not change the next hop, so the PE sets next-hop-self so remote routers see a loopback that the IGP can resolve rather than an external customer address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>iBGP runs between loopbacks with <code>update-source Loopback0</code> on both sides.</li>
<li>Active with zero counters means the TCP session is failing; check the neighbour address.</li>
<li>iBGP split horizon forces a full mesh of n(n-1)/2 sessions.</li>
<li>iBGP keeps the eBGP next hop, so PEs set next-hop-self.</li>
<li>A route without <code>&gt;</code> often has an unreachable next hop.</li>
</ul></div>
`.replace(`@@D@@`,e(`Split horizon: PE2 does not re-advertise iBGP routes to PE3.`)),hi:`
<p>iBGP session port 179 par TCP connection hai. TCP ko bas itna chahiye ki dono addresses ek doosre tak pahunch sakein. Provider core mein aap chahte ho ki yeh tab tak chalta rahe jab tak routers ke beech <i>koi bhi</i> path ho. Link address yeh nahi deta: link gira to address bhi gaya. <b>Loopback</b> router zinda hone tak kabhi down nahi hota, isliye IGP loopback tak reroute kare to session kisi bhi ek link failure se bach jaata hai.</p>

<h3>Do commands jo isse kaam karwate hain</h3>
<pre class="code"><span class="c">! PE1 (reference configuration)</span>
router bgp 65000
 neighbor 10.20.255.2 remote-as 65000
 neighbor 10.20.255.2 update-source Loopback0
 neighbor 10.20.255.2 next-hop-self</pre>
<ul>
<li><b>remote-as 65000</b> hamare apne AS ke barabar hai, isliye Cisco IOS ise automatically iBGP maanta hai.</li>
<li><b>update-source Loopback0</b> hamare packets ko source 10.20.255.1 ke saath bhejta hai. Iske bina router outgoing interface address (10.20.1.1) use karta hai. RR 10.20.255.1 par neighbour ki ummeed rakhta hai, 10.20.1.1 ko pehchanta nahi, aur session kabhi poora nahi hota.</li>
<li><b>next-hop-self</b> neeche samjhaya hai.</li>
</ul>
<p>Dono sides par matching configuration chahiye: har neighbour statement <i>doosre</i> router ke loopback ko point karta hai, aur har side apne loopback se source karti hai.</p>

<h3>Atka hua session kaisa dikhta hai</h3>
<p>Troubleshooting lab mein PE2 ko RR ke loopback ki jagah link address 10.20.2.2 se peer karne ke liye configure kiya gaya tha. RR 10.20.255.3 ki ummeed rakhta hai. Yeh us lab ka real output hai:</p>
<pre class="out">PE2# show ip bgp summary
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
<span class="hl">10.20.2.2       4        65000       0       0        0    0    0 never   Active</span>
198.51.100.2    4        65102       3       2        2    0    0 00:00:30         1

PE2# show ip route 10.20.255.2
Routing entry for 10.20.255.2/32
  Known via "isis", distance 115, metric 10</pre>
<p>Counters zero ke saath state <b>Active</b> ka matlab hai "main TCP kholne ki koshish kar raha hoon aur fail ho raha hoon". Loopback ka IGP route theek hai, isliye fault BGP neighbour statement mein hai, IS-IS mein nahi. Yaad rakho: <b>Idle</b> matlab abhi koshish nahi hui (jaise peer ka route nahi), <b>Active</b> matlab koshishein fail ho rahi hain, aakhri column mein number matlab <b>Established</b>.</p>

<h3>iBGP split horizon aur full mesh</h3>
<p>Ek AS ke andar loops rokne ke liye iBGP ka simple rule hai: iBGP peer se seekha route <b>kisi doosre iBGP peer ko kabhi nahi bheja jaata</b>. (Loop pakadne ke liye AS_PATH change nahi hota, isliye rule uski jagah leta hai.) Natija: har iBGP router ko har doosre se peer karna padta hai: <code>n(n-1)/2</code> sessions. Das routers ko 45; bees ko 190; sau ko 4950. Har router n-1 sessions bhi rakhta hai. Isiliye agle chapter mein route reflectors chahiye.</p>

@@D@@

<h3>next-hop-self: core mein customer address bekaar kyun hai</h3>
<p>Jab CE1 172.16.1.0/24 PE1 ko advertise karta hai, next hop 192.0.2.2 hota hai. PE1 route RR ko iBGP par deta hai aur rule ke hisaab se <b>iBGP next hop nahi badalta</b>. PE2 ko next hop 192.0.2.2 milta hai, jo customer link hai aur IGP ne kabhi carry nahi kiya. PE2 use resolve nahi kar sakta, isliye route inaccessible mark hota hai aur use nahi hota. RR ke saath bhi yahi problem hai. Fix se pehle RR ka real output:</p>
<pre class="out">RR# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
   i 172.16.1.0/24    <span class="hl">192.0.2.2</span>                0    100      0 65101 i</pre>
<p>Route ke aage <code>*&gt;</code> nahi hai. <code>&gt;</code> ke bina yeh best path nahi hai, kyunki next hop unreachable hai. PE1 par <code>neighbor 10.20.255.2 next-hop-self</code> ke baad PE1 next hop ko apne loopback se badal deta hai, jise IS-IS har jagah le jaata hai:</p>
<pre class="out">PE2# show ip bgp
     Network          Next Hop            Metric LocPrf Weight Path
 *&gt;i 172.16.1.0/24    <span class="hl">10.20.255.1</span>              0    100      0 65101 i
 *&gt;  172.16.2.0/24    198.51.100.2             0             0 65102 i</pre>
<p>Alternative: customer link ko IGP mein passive interface ki tarah daalna, ya connected routes redistribute karna. SPs aam taur par next-hop-self pasand karte hain kyunki customer subnets IGP se bahar rehte hain aur har next hop ko stable loopback address milta hai.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Loopbacks ki jagah link addresses se peer karna. (2) update-source sirf <i>ek</i> side par bhoolna; dono sides ko chahiye. (3) next-hop-self RR par lagana: RR reflected routes ka next hop nahi badalta, isliye PEs ko apne routes bhejte waqt lagana padta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> next-hop-self sirf <i>us neighbour ko</i> bheje routes ka next hop badalta hai, aur yeh eBGP se seekhe routes par asar karta hai. iBGP se seekhe routes ke liye plain iBGP peer next hop kabhi nahi badalta.</p></div>

<div class="scn"><h4>Table mein route hai par use nahi ho raha</h4><p>PE2 ne <code>show ip bgp</code> mein 172.16.1.0/24 dikhaya par CE2 ke peeche PC doosri site ko ping nahi kar paya. Line mein <code>&gt;</code> nahi tha aur next hop 192.0.2.2 tha. Engineer ne PE1 par RR ki taraf next-hop-self lagaya, aur next hop 10.20.255.1 ho gaya best-path marker ke saath.</p><p><b>Lesson:</b> jab BGP route maujood ho par use na ho, pehle next hop dekho aur poochho "kya main ise IGP se reach kar sakta hoon?"</p></div>

<div class="iv"><p class="q">"iBGP loopbacks se kyun source karte ho, aur next-hop-self kyun?"</p><p>Loopbacks router zinda hone tak up rehte hain, isliye IGP reroute kare to session link failures se bach jaata hai. update-source TCP source ko peer ki ummeed se match karta hai. iBGP next hop nahi badalta, isliye PE next-hop-self lagata hai taaki remote routers ko external customer address ki jagah aisa loopback dikhe jo IGP resolve kar sake.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>iBGP loopbacks ke beech chalta hai, dono sides par <code>update-source Loopback0</code> ke saath.</li>
<li>Zero counters ke saath Active matlab TCP session fail ho raha hai; neighbour address check karo.</li>
<li>iBGP split horizon n(n-1)/2 sessions ka full mesh maangta hai.</li>
<li>iBGP eBGP next hop rakhta hai, isliye PEs next-hop-self lagate hain.</li>
<li><code>&gt;</code> ke bina route aksar unreachable next hop wala hota hai.</li>
</ul></div>
`.replace(`@@D@@`,e(`Split horizon: PE2 iBGP routes ko PE3 ko re-advertise nahi karta.`))}};export{t as default};