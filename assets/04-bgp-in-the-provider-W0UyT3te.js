var e={id:`bgp-in-the-provider`,h:{en:`BGP in a provider: iBGP, route reflectors and the BGP-free core`,hi:`Provider mein BGP: iBGP, route reflectors aur BGP-free core`},body:{en:`
<p>The IGP finds routers. <b>BGP</b> carries the <i>customers</i>: internet routes, customer prefixes, VPN routes. You learned eBGP between autonomous systems in ENARSI. Inside a provider the important flavour is <b>iBGP</b>, a BGP session between two routers of the same AS (here AS 65000, a private number used for documentation).</p>

<h3>The iBGP rules that shape the design</h3>
<ol>
<li>iBGP does not change the AS path, so it cannot detect loops by AS path. To stay loop-free, <b>a route learned from one iBGP peer is not passed to another iBGP peer</b> (split horizon).</li>
<li>Because of that rule, plain iBGP needs a <b>full mesh</b>: every router peers with every other. The number of sessions is n(n-1)/2, so 10 routers need 45 sessions and 100 routers need 4,950. That does not scale.</li>
<li>iBGP does not change the <b>next hop</b> by default. A route learned from a customer keeps the customer's address as next hop, and other PEs cannot reach it unless the PE sets <code>next-hop-self</code>.</li>
</ol>

<h3>Route reflector: the cure for the full mesh</h3>
<p>A <b>route reflector (RR)</b> is allowed to break rule 1. Routers that peer with it as <b>clients</b> send it their routes and the RR reflects them to the other clients. Every PE needs only one or two sessions (to two RRs for redundancy). The RR adds <code>ORIGINATOR_ID</code> and <code>CLUSTER_LIST</code> so that reflected routes cannot loop.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Full mesh versus route reflector">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="13">Full mesh: 6 sessions for 4 PEs</text>
<circle cx="90" cy="70" r="20" fill="#bbf7d0"/><circle cx="230" cy="70" r="20" fill="#bbf7d0"/><circle cx="90" cy="170" r="20" fill="#bbf7d0"/><circle cx="230" cy="170" r="20" fill="#bbf7d0"/>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="70" x2="210" y2="70"/><line x1="90" y1="90" x2="90" y2="150"/><line x1="230" y1="90" x2="230" y2="150"/><line x1="110" y1="170" x2="210" y2="170"/><line x1="105" y1="85" x2="215" y2="155"/><line x1="215" y1="85" x2="105" y2="155"/></g>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="13">Route reflector: 4 sessions</text>
<circle cx="480" cy="120" r="26" fill="#ddd6fe"/><text x="480" y="124" text-anchor="middle" class="svg-ink" font-size="12">RR</text>
<circle cx="400" cy="60" r="20" fill="#bbf7d0"/><circle cx="560" cy="60" r="20" fill="#bbf7d0"/><circle cx="400" cy="180" r="20" fill="#bbf7d0"/><circle cx="560" cy="180" r="20" fill="#bbf7d0"/>
<g stroke="#64748b" stroke-width="2"><line x1="414" y1="75" x2="463" y2="106"/><line x1="546" y1="75" x2="497" y2="106"/><line x1="414" y1="165" x2="463" y2="134"/><line x1="546" y1="165" x2="497" y2="134"/></g>
</svg><p class="cap">With a route reflector the number of sessions grows with the number of PEs, not with its square.</p></div>

<h3>Seeing it in the lab</h3>
<p>In the spcor-bgp lab Konkan Carrier (AS 65000) has PE1, RR and PE2. The customers CE1 (AS 65101) and CE2 (AS 65102) peer with the PEs over eBGP. The PEs peer with the RR over iBGP between loopbacks. This is real output from PE2 after the lab is built:</p>
<pre class="out">PE2# show ip bgp summary
...
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.20.255.2     4        65000       3       3        3    0    0 00:00:35         <span class="hl">1</span>
198.51.100.2    4        65102       4       4        3    0    0 00:01:10         1

PE2# show ip bgp 172.16.1.0
BGP routing table entry for 172.16.1.0/24, version 3
Paths: (1 available, best #1, table default)
  65101
    10.20.255.1 (metric 20) from 10.20.255.2 (10.20.255.2)
      Origin IGP, metric 0, localpref 100, weight 0, valid, internal, best
      Originator: 10.20.255.1, <span class="hl">Cluster list: 10.20.255.2</span></pre>
<p>Read it: the route 172.16.1.0/24 came from AS 65101 (the customer), arrived via the RR (10.20.255.2) but was originated by PE1 (10.20.255.1), the next hop is PE1's loopback because PE1 used <code>next-hop-self</code>, and the "(metric 20)" is the IGP cost to that next hop. The IGP and BGP work together.</p>

<h3>The BGP-free core</h3>
<p>Here is the key idea of the provider design. The P routers in the middle do not need to run BGP at all. A packet from PE1 to PE2 only needs to reach PE2's loopback, and the IGP knows that. With MPLS (next chapter) the PE puts a label on the packet, and P routers forward on the label without looking at the destination IP. The core holds a few hundred IGP routes and zero BGP routes. This is called a <b>BGP-free core</b>.</p>

<div class="eg"><p><b>Worked example.</b> An ISP has 40 PEs. Full mesh needs 40 x 39 / 2 = 780 iBGP sessions, and every new PE needs a change on all 40 routers. With two route reflectors, each PE has two sessions: 80 in total, and a new PE needs a change on itself and on the two RRs.</p></div>

<div class="warn"><p><b>Common mistake.</b> Forgetting <code>update-source Loopback0</code> and <code>next-hop-self</code>. Without the first the session may flap when a link goes down; without the second the route is present in the table but the next hop is unreachable and traffic is dropped.</p></div>
<div class="exam"><p><b>Exam trap.</b> The reflector reflects the <i>best</i> route only, and the clients do not need to know they are clients. Also, an RR does not need to be in the forwarding path, so a "virtual" RR is a valid design.</p></div>

<div class="scn"><h4>Routes everywhere, pings nowhere</h4><p>After a migration to route reflectors, PE2 showed the customer prefix in <code>show ip bgp</code> but the line had no best-path marker and the ping failed. The next hop was the customer-facing address of PE1, which PE2's IGP did not know. Adding <code>neighbor 10.20.255.2 next-hop-self</code> on PE1 moved the next hop to the loopback, the route became best and the ping worked.</p><p><b>Lesson:</b> a BGP route with an unreachable next hop is ignored. Always check the next hop.</p></div>

<div class="iv"><p class="q">"Why do you need route reflectors, and what attributes prevent loops?"</p><p>iBGP split horizon forces a full mesh, which does not scale. A route reflector reflects routes between clients, so each PE needs one or two sessions. ORIGINATOR_ID stops a route from returning to its originator and CLUSTER_LIST stops it from looping between reflectors. Mention using two RRs with the same cluster ID or different IDs by design.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGP finds routers; BGP carries customer and internet routes.</li>
<li>iBGP needs a full mesh unless you use route reflectors or confederations.</li>
<li>iBGP keeps the next hop, so PEs use next-hop-self toward the RR.</li>
<li>The "(metric N)" in show ip bgp is the IGP cost to the next hop.</li>
<li>A BGP-free core means P routers carry no BGP routes at all.</li>
</ul></div>
`,hi:`
<p>IGP routers ko dhoondhta hai. <b>BGP</b> <i>customers</i> ko le jaata hai: internet routes, customer prefixes, VPN routes. ENARSI mein aapne autonomous systems ke beech eBGP seekha. Provider ke andar zaroori flavour <b>iBGP</b> hai, ek hi AS ke do routers ke beech BGP session (yahan AS 65000, documentation ke liye private number).</p>

<h3>iBGP ke rules jo design ko shape karte hain</h3>
<ol>
<li>iBGP AS path nahi badalta, isliye AS path se loop detect nahi kar sakta. Loop-free rehne ke liye <b>ek iBGP peer se seekha gaya route doosre iBGP peer ko pass nahi hota</b> (split horizon).</li>
<li>Is rule ki wajah se plain iBGP ko <b>full mesh</b> chahiye: har router har doosre router se peer kare. Sessions ki ginti n(n-1)/2 hai, isliye 10 routers ko 45 aur 100 routers ko 4,950 sessions. Yeh scale nahi karta.</li>
<li>iBGP default mein <b>next hop</b> nahi badalta. Customer se seekha route customer ka address next hop rakhta hai, aur doosre PEs us tak pahunch nahi paate jab tak PE <code>next-hop-self</code> na lagaye.</li>
</ol>

<h3>Route reflector: full mesh ka ilaaj</h3>
<p><b>Route reflector (RR)</b> rule 1 todne ke liye allowed hai. Jo routers use <b>clients</b> ki tarah peer karte hain woh apne routes use bhejte hain aur RR unhe baaki clients ko reflect karta hai. Har PE ko sirf ek ya do sessions chahiye (redundancy ke liye do RRs). RR <code>ORIGINATOR_ID</code> aur <code>CLUSTER_LIST</code> jodta hai taaki reflect kiye routes loop na karein.</p>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Full mesh aur route reflector">
<text x="160" y="22" text-anchor="middle" class="svg-ink" font-size="13">Full mesh: 4 PEs ke liye 6 sessions</text>
<circle cx="90" cy="70" r="20" fill="#bbf7d0"/><circle cx="230" cy="70" r="20" fill="#bbf7d0"/><circle cx="90" cy="170" r="20" fill="#bbf7d0"/><circle cx="230" cy="170" r="20" fill="#bbf7d0"/>
<g stroke="#64748b" stroke-width="2"><line x1="110" y1="70" x2="210" y2="70"/><line x1="90" y1="90" x2="90" y2="150"/><line x1="230" y1="90" x2="230" y2="150"/><line x1="110" y1="170" x2="210" y2="170"/><line x1="105" y1="85" x2="215" y2="155"/><line x1="215" y1="85" x2="105" y2="155"/></g>
<text x="480" y="22" text-anchor="middle" class="svg-ink" font-size="13">Route reflector: 4 sessions</text>
<circle cx="480" cy="120" r="26" fill="#ddd6fe"/><text x="480" y="124" text-anchor="middle" class="svg-ink" font-size="12">RR</text>
<circle cx="400" cy="60" r="20" fill="#bbf7d0"/><circle cx="560" cy="60" r="20" fill="#bbf7d0"/><circle cx="400" cy="180" r="20" fill="#bbf7d0"/><circle cx="560" cy="180" r="20" fill="#bbf7d0"/>
<g stroke="#64748b" stroke-width="2"><line x1="414" y1="75" x2="463" y2="106"/><line x1="546" y1="75" x2="497" y2="106"/><line x1="414" y1="165" x2="463" y2="134"/><line x1="546" y1="165" x2="497" y2="134"/></g>
</svg><p class="cap">Route reflector ke saath sessions PEs ki ginti ke saath badhte hain, uske square ke saath nahi.</p></div>

<h3>Lab mein dekhna</h3>
<p>spcor-bgp lab mein Konkan Carrier (AS 65000) ke paas PE1, RR aur PE2 hain. Customers CE1 (AS 65101) aur CE2 (AS 65102) PEs ke saath eBGP peer karte hain. PEs loopbacks ke beech iBGP se RR ke saath peer karte hain. Lab banne ke baad PE2 ka real output yeh hai:</p>
<pre class="out">PE2# show ip bgp summary
...
Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
10.20.255.2     4        65000       3       3        3    0    0 00:00:35         <span class="hl">1</span>
198.51.100.2    4        65102       4       4        3    0    0 00:01:10         1

PE2# show ip bgp 172.16.1.0
BGP routing table entry for 172.16.1.0/24, version 3
Paths: (1 available, best #1, table default)
  65101
    10.20.255.1 (metric 20) from 10.20.255.2 (10.20.255.2)
      Origin IGP, metric 0, localpref 100, weight 0, valid, internal, best
      Originator: 10.20.255.1, <span class="hl">Cluster list: 10.20.255.2</span></pre>
<p>Padho: route 172.16.1.0/24 AS 65101 (customer) se aaya, RR (10.20.255.2) ke through pahuncha par PE1 (10.20.255.1) ne originate kiya, next hop PE1 ka loopback hai kyunki PE1 ne <code>next-hop-self</code> use kiya, aur "(metric 20)" us next hop tak ka IGP cost hai. IGP aur BGP milkar kaam karte hain.</p>

<h3>BGP-free core</h3>
<p>Provider design ka key idea yeh hai. Beech ke P routers ko BGP chalane ki zaroorat hi nahi. PE1 se PE2 ke packet ko sirf PE2 ke loopback tak pahunchna hai, aur IGP yeh jaanta hai. MPLS (agla chapter) ke saath PE packet par label lagata hai, aur P routers destination IP dekhe bina label par forward karte hain. Core ke paas kuch sau IGP routes hain aur zero BGP routes. Ise <b>BGP-free core</b> kehte hain.</p>

<div class="eg"><p><b>Worked example.</b> Ek ISP ke 40 PEs hain. Full mesh ko 40 x 39 / 2 = 780 iBGP sessions chahiye, aur har naye PE ke liye saare 40 routers par change. Do route reflectors ke saath har PE ke do sessions: kul 80, aur naye PE ke liye sirf khud par aur do RRs par change.</p></div>

<div class="warn"><p><b>Common mistake.</b> <code>update-source Loopback0</code> aur <code>next-hop-self</code> bhool jaana. Pehle ke bina link down hone par session flap kar sakta hai; doosre ke bina route table mein dikhta hai par next hop unreachable hota hai aur traffic drop hota hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Reflector sirf <i>best</i> route reflect karta hai, aur clients ko pata hona zaroori nahi ki woh clients hain. Aur RR ka forwarding path mein hona zaroori nahi, isliye "virtual" RR valid design hai.</p></div>

<div class="scn"><h4>Routes har jagah, ping kahin nahi</h4><p>Route reflectors par migration ke baad PE2 par customer prefix <code>show ip bgp</code> mein dikha par line par best-path marker nahi tha aur ping fail ho raha tha. Next hop PE1 ka customer-facing address tha, jo PE2 ke IGP ko pata nahi tha. PE1 par <code>neighbor 10.20.255.2 next-hop-self</code> lagane se next hop loopback par chala gaya, route best bana aur ping chala.</p><p><b>Lesson:</b> unreachable next hop wala BGP route ignore hota hai. Hamesha next hop check karo.</p></div>

<div class="iv"><p class="q">"Route reflectors kyun chahiye, aur kaunse attributes loops rokte hain?"</p><p>iBGP split horizon full mesh force karta hai jo scale nahi karta. Route reflector clients ke beech routes reflect karta hai, isliye har PE ko ek ya do sessions chahiye. ORIGINATOR_ID route ko uske originator ke paas wapas aane se rokta hai aur CLUSTER_LIST reflectors ke beech loop se. Do RRs ka zikr karo, design ke hisaab se same ya alag cluster ID ke saath.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IGP routers dhoondhta hai; BGP customer aur internet routes le jaata hai.</li>
<li>iBGP ko full mesh chahiye jab tak route reflectors ya confederations na hon.</li>
<li>iBGP next hop rakhta hai, isliye PEs RR ki taraf next-hop-self lagate hain.</li>
<li>show ip bgp ka "(metric N)" next hop tak ka IGP cost hai.</li>
<li>BGP-free core ka matlab P routers koi BGP route nahi rakhte.</li>
</ul></div>
`}};export{e as default};