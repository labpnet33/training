var e={id:`stub`,h:{en:`Stub routing: every option, leak-maps and the traps`,hi:`Stub routing: har option, leak-maps aur traps`},body:{en:`
<p>A small village post office only handles letters for its own village. The regional sorting centre knows this, so when a letter goes missing somewhere in the country, it never phones the village office to ask "do you know another route?". The village office would have no answer anyway; it is not on any through road. Telling the network "this branch is a dead end" is what <b>EIGRP stub</b> does. It makes queries smaller and faster, and it stops a branch from ever becoming an accidental transit path. But if you tell a busy crossroads that it is a village, traffic stops. Most stub tickets are about choosing the wrong options or putting a stub where it does not belong.</p>

<h3>What stub really changes</h3>
<ul>
<li>The stub router tells its neighbours, in its Hello, that it is a stub and which route types it will advertise.</li>
<li>Neighbours <b>never send Queries</b> to a stub. This is the main SIA benefit.</li>
<li>The stub advertises <b>only</b> the route types you list and <b>never re-advertises routes learned from another EIGRP neighbour</b>. It still <b>receives</b> every route normally.</li>
<li>Configuring or changing stub settings <b>resets the adjacencies</b> on that router.</li>
</ul>

<h3>The options</h3>
<table class="cmp"><tr><th>Keyword</th><th>Advertises</th><th>Note</th></tr>
<tr><td><code>connected</code></td><td>Connected routes covered by network statements or redistributed connected</td><td>Part of the default</td></tr>
<tr><td><code>summary</code></td><td>Summaries configured on this router</td><td>Part of the default</td></tr>
<tr><td><code>static</code></td><td>Static routes, but only if they are also redistributed</td><td>Needs <code>redistribute static</code> too</td></tr>
<tr><td><code>redistributed</code></td><td>All redistributed routes</td><td>For branches with another protocol</td></tr>
<tr><td><code>receive-only</code></td><td>Nothing at all</td><td>Cannot combine with others; hub needs static routes back</td></tr>
<tr><td><code>leak-map NAME</code></td><td>Extra routes, learned from EIGRP neighbours, allowed by a route map</td><td>For dual-homed branches</td></tr>
</table>
<p><code>eigrp stub</code> with no keywords means <code>eigrp stub connected summary</code>. Keywords can be combined, for example <code>eigrp stub connected static</code>.</p>

<h3>Lab walkthrough and verification</h3>
<p>In the first lab, both branches get <code>eigrp stub connected summary</code> inside the address family. The hub proves it:</p>
<pre class="out">HUB#show eigrp address-family ipv4 neighbors detail
EIGRP-IPv4 VR(NK-WAN) Address-Family Neighbors for AS(10)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
0   10.10.1.2               Gi0/0                    12 00:00:41    3   100  0  9
   Time since Restart 00:00:40
   Version 23.0/2.0, Retrans: 0, Retries: 0, Prefixes: 3
   Topology-ids from peer - 0
   Topologies advertised to peer:   base

<span class="hl">   Stub Peer Advertising (CONNECTED SUMMARY ) Routes</span>
<span class="hl">   Suppressing queries</span></pre>
<p>"Prefixes: 3" is SP1's Loopback0, its /22 summary and the uplink subnet 10.10.1.0/24 (which HUB keeps as a connected route, AD 0). The four store /24s are not counted: the summary suppresses them. On the stub itself, <code>show ip protocols</code> prints the stub state:</p>
<pre class="out">SP1#show ip protocols | include Stub|stub
<span class="hl">    Stub, connected, summary</span></pre>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Dual-homed stub branch">
<rect x="250" y="14" width="140" height="46" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">HUB</text>
<rect x="110" y="130" width="140" height="46" rx="8" fill="#bbf7d0"/><text x="180" y="158" text-anchor="middle" class="svg-ink" font-size="14">BR-A (stub)</text>
<rect x="390" y="130" width="140" height="46" rx="8" fill="#bbf7d0"/><text x="460" y="158" text-anchor="middle" class="svg-ink" font-size="14">BR-B (stub)</text>
<line x1="290" y1="60" x2="180" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/><text x="170" y="95" class="svg-accent" font-size="12">WAN down</text>
<line x1="350" y1="60" x2="460" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="153" x2="390" y2="153" stroke="#64748b" stroke-width="2"/><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">branch LAN link</text>
<text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">Without leak-map: BR-B will not pass HUB routes to BR-A,</text>
<text x="320" y="224" text-anchor="middle" class="svg-ink" font-size="12">nor BR-A's LANs to HUB. BR-A is cut off.</text>
</svg><p class="cap">Two stub routers in one branch: the classic case for a leak-map.</p></div>

<h3>The dual-homed branch and leak-maps</h3>
<p>A branch has two routers, each with its own WAN link, both stubs. If BR-A's WAN link fails, BR-A learns hub routes only through BR-B. But BR-B is a stub: it will not advertise routes it learned from HUB to BR-A, and it will not advertise BR-A's LANs to HUB. BR-A is isolated even though a physical path exists. A <b>leak-map</b> lets BR-B pass selected routes anyway:</p>
<pre class="code">ip prefix-list LEAK seq 5 permit 0.0.0.0/0          <span class="c">! default from HUB</span>
ip prefix-list LEAK seq 10 permit 10.3.0.0/16 le 24  <span class="c">! BR-A's LANs</span>
route-map LEAK-BR permit 10
 match ip address prefix-list LEAK
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  eigrp stub connected summary leak-map LEAK-BR</pre>

<div class="eg"><p><b>Worked example: the static route that never arrives.</b> A branch has a static route to a partner network 172.16.50.0/24 and <code>redistribute static</code> under <code>topology base</code>. The hub never sees it. The branch is <code>eigrp stub</code> (connected summary). Adding <code>static</code> is required: <code>eigrp stub connected summary static</code>. Now the hub receives <code>D EX 172.16.50.0/24</code>. The stub keyword and the redistribution are both needed.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) <code>eigrp stub connected</code> on a router that summarises: the components are suppressed by the summary and the summary is not allowed, so the hub gets neither. (2) Configuring stub on a distribution router that has other routers behind it: their routes are no longer passed on. (3) <code>receive-only</code> without static routes at the hub. (4) Changing stub options in production without expecting the adjacency reset.</p></div>

<div class="exam"><p><b>Exam trap.</b> The default is <b>connected summary</b>. Stub routers still receive all routes. <code>static</code> advertises only redistributed statics. <code>receive-only</code> cannot be combined. The hub shows "Suppressing queries" in <code>show ip eigrp neighbors detail</code>; the stub shows its own state in <code>show ip protocols</code>.</p></div>

<div class="scn"><h4>The stub that became a black hole</h4><p>A network team made all "edge" routers stubs to fix SIA problems. Next morning, three floors of a regional office lost access. The regional office router had been classified as edge, but three floor routers hung off it and learned everything through it. As a stub, the regional router stopped advertising the floor routers' subnets to the core. <code>show ip eigrp neighbors detail</code> on the core showed "Stub Peer Advertising (CONNECTED SUMMARY)", and the floor subnets were in the regional router's table but missing on the core. Removing the stub on that router (and summarising the floors instead) fixed it.</p><p><b>Lesson:</b> only routers that are never transit should be stubs; for everything else, use summarisation to bound queries.</p></div>

<div class="iv"><p class="q">"What does EIGRP stub do, and when would you need a leak-map?"</p><p>Explain that a stub announces itself in its Hellos, neighbours stop querying it, and it advertises only the route types configured (default connected and summary) while never re-advertising routes learned from other neighbours. A leak-map is needed when two stub routers at the same site back each other up: without it, one cannot pass hub routes to the other or the other's LANs to the hub when a WAN link fails.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stubs are never queried and never act as transit; they still receive all routes.</li>
<li>Default is connected summary; options: connected, summary, static, redistributed, receive-only, leak-map.</li>
<li>Stub connected without summary hides summarised LANs completely.</li>
<li>Dual-homed stub branches need a leak-map to back each other up.</li>
<li>Verify on the hub with neighbors detail ("Suppressing queries") and on the stub with show ip protocols.</li>
</ul></div>
`,hi:`
<p>Ek chhote gaon ka post office sirf apne gaon ki chitthiyan sambhaalta hai. Regional sorting centre yeh jaanta hai, isliye jab desh mein kahin koi chitthi kho jaati hai, woh gaon ke office ko phone karke kabhi nahi poochta "kya tumhe koi aur raasta pata hai?". Gaon ke office ke paas waise bhi jawab nahi hota; woh kisi through road par nahi hai. Network ko yeh batana ki "yeh branch dead end hai", yahi <b>EIGRP stub</b> karta hai. Isse queries chhoti aur tez hoti hain, aur branch kabhi galti se transit path nahi banti. Lekin agar aap ek busy chauraahe ko gaon bata do, to traffic ruk jaata hai. Zyada tar stub tickets galat options chunne ya stub ko aisi jagah lagane ke baare mein hote hain jahan woh belong nahi karta.</p>

<h3>Stub sach mein kya badalta hai</h3>
<ul>
<li>Stub router apne Hello mein neighbours ko batata hai ki woh stub hai aur kaunse route types advertise karega.</li>
<li>Neighbours stub ko <b>kabhi Queries nahi bhejte</b>. Yahi main SIA benefit hai.</li>
<li>Stub <b>sirf</b> wahi route types advertise karta hai jo aapne list kiye aur <b>doosre EIGRP neighbour se seekhe routes kabhi re-advertise nahi karta</b>. Woh har route normally <b>receive</b> karta rehta hai.</li>
<li>Stub settings configure ya change karne se us router ki <b>adjacencies reset</b> hoti hain.</li>
</ul>

<h3>Options</h3>
<table class="cmp"><tr><th>Keyword</th><th>Kya advertise karta hai</th><th>Note</th></tr>
<tr><td><code>connected</code></td><td>Network statements se cover hue ya redistributed connected routes</td><td>Default ka hissa</td></tr>
<tr><td><code>summary</code></td><td>Is router par configured summaries</td><td>Default ka hissa</td></tr>
<tr><td><code>static</code></td><td>Static routes, lekin sirf agar woh redistribute bhi hon</td><td><code>redistribute static</code> bhi chahiye</td></tr>
<tr><td><code>redistributed</code></td><td>Saare redistributed routes</td><td>Doosre protocol wali branches ke liye</td></tr>
<tr><td><code>receive-only</code></td><td>Kuch bhi nahi</td><td>Doosron ke saath combine nahi hota; hub ko wapas static routes chahiye</td></tr>
<tr><td><code>leak-map NAME</code></td><td>EIGRP neighbours se seekhe extra routes, jo route map allow kare</td><td>Dual-homed branches ke liye</td></tr>
</table>
<p>Bina keywords ke <code>eigrp stub</code> ka matlab hai <code>eigrp stub connected summary</code>. Keywords combine ho sakte hain, jaise <code>eigrp stub connected static</code>.</p>

<h3>Lab walkthrough aur verification</h3>
<p>Pehle lab mein dono branches ko address family ke andar <code>eigrp stub connected summary</code> milta hai. Hub ise prove karta hai:</p>
<pre class="out">HUB#show eigrp address-family ipv4 neighbors detail
EIGRP-IPv4 VR(NK-WAN) Address-Family Neighbors for AS(10)
H   Address                 Interface              Hold Uptime   SRTT   RTO  Q  Seq
                                                   (sec)         (ms)       Cnt Num
0   10.10.1.2               Gi0/0                    12 00:00:41    3   100  0  9
   Time since Restart 00:00:40
   Version 23.0/2.0, Retrans: 0, Retries: 0, Prefixes: 3
   Topology-ids from peer - 0
   Topologies advertised to peer:   base

<span class="hl">   Stub Peer Advertising (CONNECTED SUMMARY ) Routes</span>
<span class="hl">   Suppressing queries</span></pre>
<p>"Prefixes: 3" SP1 ka Loopback0, uska /22 summary aur uplink subnet 10.10.1.0/24 hai (jise HUB connected route ke roop mein rakhta hai, AD 0). Chaar store /24s count nahi hote: summary unhe suppress karta hai. Stub par khud, <code>show ip protocols</code> stub state print karta hai:</p>
<pre class="out">SP1#show ip protocols | include Stub|stub
<span class="hl">    Stub, connected, summary</span></pre>

<div class="dia"><svg viewBox="0 0 640 240" role="img" aria-label="Dual-homed stub branch">
<rect x="250" y="14" width="140" height="46" rx="8" fill="#bae6fd"/><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="14">HUB</text>
<rect x="110" y="130" width="140" height="46" rx="8" fill="#bbf7d0"/><text x="180" y="158" text-anchor="middle" class="svg-ink" font-size="14">BR-A (stub)</text>
<rect x="390" y="130" width="140" height="46" rx="8" fill="#bbf7d0"/><text x="460" y="158" text-anchor="middle" class="svg-ink" font-size="14">BR-B (stub)</text>
<line x1="290" y1="60" x2="180" y2="130" stroke="#64748b" stroke-width="2" stroke-dasharray="6 5"/><text x="170" y="95" class="svg-accent" font-size="12">WAN down</text>
<line x1="350" y1="60" x2="460" y2="130" stroke="#64748b" stroke-width="2"/>
<line x1="250" y1="153" x2="390" y2="153" stroke="#64748b" stroke-width="2"/><text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">branch LAN link</text>
<text x="320" y="205" text-anchor="middle" class="svg-ink" font-size="12">Leak-map ke bina: BR-B HUB ke routes BR-A ko nahi dega,</text>
<text x="320" y="224" text-anchor="middle" class="svg-ink" font-size="12">na BR-A ke LANs HUB ko. BR-A kat jaata hai.</text>
</svg><p class="cap">Ek branch mein do stub routers: leak-map ka classic case.</p></div>

<h3>Dual-homed branch aur leak-maps</h3>
<p>Ek branch mein do routers hain, har ek ka apna WAN link, dono stubs. Agar BR-A ka WAN link fail hota hai, BR-A hub routes sirf BR-B ke through seekhta hai. Lekin BR-B stub hai: woh HUB se seekhe routes BR-A ko advertise nahi karega, aur BR-A ke LANs HUB ko advertise nahi karega. Physical path hote hue bhi BR-A isolated hai. <b>Leak-map</b> BR-B ko chune hue routes phir bhi pass karne deta hai:</p>
<pre class="code">ip prefix-list LEAK seq 5 permit 0.0.0.0/0          <span class="c">! HUB se default</span>
ip prefix-list LEAK seq 10 permit 10.3.0.0/16 le 24  <span class="c">! BR-A ke LANs</span>
route-map LEAK-BR permit 10
 match ip address prefix-list LEAK
router eigrp NK-WAN
 address-family ipv4 unicast autonomous-system 10
  eigrp stub connected summary leak-map LEAK-BR</pre>

<div class="eg"><p><b>Worked example: static route jo kabhi nahi pahunchta.</b> Ek branch par partner network 172.16.50.0/24 ka static route hai aur <code>topology base</code> ke neeche <code>redistribute static</code> hai. Hub ko yeh kabhi nahi dikhta. Branch <code>eigrp stub</code> (connected summary) hai. <code>static</code> add karna zaroori hai: <code>eigrp stub connected summary static</code>. Ab hub ko <code>D EX 172.16.50.0/24</code> milta hai. Stub keyword aur redistribution dono chahiye.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> (1) Summarise karne wale router par <code>eigrp stub connected</code>: components summary se suppress ho jaate hain aur summary allowed nahi, isliye hub ko dono mein se kuch nahi milta. (2) Aise distribution router par stub configure karna jiske peeche aur routers hain: unke routes ab aage pass nahi hote. (3) Hub par static routes ke bina <code>receive-only</code>. (4) Production mein stub options badalna aur adjacency reset ki umeed na karna.</p></div>

<div class="exam"><p><b>Exam trap.</b> Default <b>connected summary</b> hai. Stub routers ab bhi saare routes receive karte hain. <code>static</code> sirf redistributed statics advertise karta hai. <code>receive-only</code> combine nahi hota. Hub <code>show ip eigrp neighbors detail</code> mein "Suppressing queries" dikhata hai; stub apni state <code>show ip protocols</code> mein dikhata hai.</p></div>

<div class="scn"><h4>Stub jo black hole ban gaya</h4><p>Ek network team ne SIA problems theek karne ke liye saare "edge" routers ko stubs bana diya. Agli subah ek regional office ke teen floors ka access chala gaya. Regional office router ko edge maana gaya tha, lekin uske neeche teen floor routers the jo sab kuch usi ke through seekhte the. Stub bante hi regional router ne floor routers ke subnets core ko advertise karna band kar diya. Core par <code>show ip eigrp neighbors detail</code> ne "Stub Peer Advertising (CONNECTED SUMMARY)" dikhaya, aur floor subnets regional router ki table mein the lekin core par missing the. Us router se stub hatane (aur uski jagah floors ko summarise karne) se problem theek hui.</p><p><b>Seekh:</b> sirf woh routers stub hone chahiye jo kabhi transit nahi hote; baaki sab ke liye queries bound karne ke liye summarisation use karo.</p></div>

<div class="iv"><p class="q">"EIGRP stub kya karta hai, aur leak-map kab chahiye hoga?"</p><p>Samjhao ki stub apne Hellos mein khud ko announce karta hai, neighbours use query karna band kar dete hain, aur woh sirf configured route types advertise karta hai (default connected aur summary) jabki doosre neighbours se seekhe routes kabhi re-advertise nahi karta. Leak-map tab chahiye jab ek hi site ke do stub routers ek dusre ka backup hon: iske bina WAN link fail hone par ek router doosre ko hub routes ya doosre ke LANs hub ko pass nahi kar sakta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Stubs kabhi query nahi hote aur kabhi transit nahi bante; woh ab bhi saare routes receive karte hain.</li>
<li>Default connected summary hai; options: connected, summary, static, redistributed, receive-only, leak-map.</li>
<li>Bina summary ke stub connected summarised LANs ko poori tarah chhupa deta hai.</li>
<li>Dual-homed stub branches ko ek dusre ka backup banne ke liye leak-map chahiye.</li>
<li>Hub par neighbors detail ("Suppressing queries") aur stub par show ip protocols se verify karo.</li>
</ul></div>
`}};export{e as default};