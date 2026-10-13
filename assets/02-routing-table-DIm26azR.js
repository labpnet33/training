var e={id:`routing-table`,h:{en:`Reading the routing table line by line`,hi:`Routing table ko line by line padhna`},body:{en:`
<p>A routing table looks scary the first time: a legend of letters, brackets full of numbers and strange headings like "variably subnetted". In reality every line answers the same four questions: <b>where did this route come from, which destination does it cover, how trustworthy and how good is it, and where do I send the packet?</b> Once you can answer those four, you can read the table of any router from any vendor.</p>

<h3>The sources of routes</h3>
<p>A router fills its table (also called the <b>RIB</b>, routing information base) from three kinds of sources:</p>
<ul>
<li><b>Connected (C) and local (L).</b> Created automatically when an interface has an IP address and is up/up. C is the whole subnet (10.1.1.0/24); L is a /32 for the router's own address (10.1.1.1/32), meaning "this packet is for me".</li>
<li><b>Static (S).</b> Typed by an administrator with <code>ip route</code>. <b>S*</b> means a static route that is also the candidate default.</li>
<li><b>Dynamic.</b> Learned from a routing protocol: <b>O</b> for OSPF, <b>D</b> for EIGRP, <b>B</b> for BGP, <b>R</b> for RIP.</li>
</ul>

<h3>HQ's table after Lab 1</h3>
<p>Here is the HQ router from Lab 1 once you have added the branch route and the default route. Read it slowly from the top.</p>
<pre class="out">HQ#show ip route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       (rest of legend trimmed)

<span class="hl">Gateway of last resort is 203.0.113.1 to network 0.0.0.0</span>

<span class="hl">S*    0.0.0.0/0 [1/0] via 203.0.113.1</span>
      10.0.0.0/8 is variably subnetted, 5 subnets, 3 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/1
L        10.0.12.1/32 is directly connected, GigabitEthernet0/1
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0
<span class="hl">S        10.2.2.0/24 [1/0] via 10.0.12.2</span>
      203.0.113.0/24 is variably subnetted, 2 subnets, 2 masks
C        203.0.113.0/30 is directly connected, GigabitEthernet0/2
L        203.0.113.2/32 is directly connected, GigabitEthernet0/2</pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Anatomy of one route line">
<rect x="10" y="20" width="620" height="44" rx="8" fill="#e2e8f0"/>
<text x="30" y="48" class="svg-ink" font-size="14">S</text>
<text x="80" y="48" class="svg-ink" font-size="14">10.2.2.0/24</text>
<text x="230" y="48" class="svg-ink" font-size="14">[1/0]</text>
<text x="330" y="48" class="svg-ink" font-size="14">via 10.0.12.2</text>
<text x="490" y="48" class="svg-ink" font-size="14">(Gi0/1)</text>
<line x1="34" y1="64" x2="34" y2="95" stroke="#64748b"/><text x="20" y="112" class="svg-accent" font-size="12">source</text>
<line x1="120" y1="64" x2="120" y2="95" stroke="#64748b"/><text x="92" y="112" class="svg-accent" font-size="12">prefix</text>
<line x1="245" y1="64" x2="245" y2="95" stroke="#64748b"/><text x="200" y="112" class="svg-accent" font-size="12">AD / metric</text>
<line x1="380" y1="64" x2="380" y2="95" stroke="#64748b"/><text x="345" y="112" class="svg-accent" font-size="12">next hop</text>
<line x1="520" y1="64" x2="520" y2="95" stroke="#64748b"/><text x="470" y="112" class="svg-accent" font-size="12">exit interface</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">A dynamic route also shows its age, for example 00:02:11</text>
</svg><p class="cap">Every route line answers: who told me, which destination, how trusted and how good, and where to send it.</p></div>

<h3>Decoding each part</h3>
<dl class="terms">
<dt>Code (S, C, L, O...)</dt><dd>The source of the route. It tells you whether a human, the interface or a protocol created it.</dd>
<dt>Prefix and length</dt><dd>The destination network, 10.2.2.0/24. The /24 is the prefix length: how many leading bits must match.</dd>
<dt>[AD/metric]</dt><dd>Two numbers in brackets. The first is the <b>administrative distance</b>, how much the router trusts the source (lower is more trusted). The second is the <b>metric</b>, how good this path is within that source (lower is better). A static route shows [1/0].</dd>
<dt>via next hop</dt><dd>The IP address of the neighbouring router to hand the packet to. It must be on a connected subnet (or resolvable through another route).</dd>
<dt>Exit interface</dt><dd>The local interface the packet leaves through. Connected routes and dynamic routes print it; next-hop static routes find it by looking up the next hop.</dd>
<dt>Gateway of last resort</dt><dd>The next hop of the default route 0.0.0.0/0, used when nothing more specific matches. "Not set" means packets to unknown destinations are dropped.</dd>
<dt>"variably subnetted"</dt><dd>Just a heading. IOS groups subnets under their classful network (10.0.0.0/8) and tells you how many subnets and different masks it holds. It is not a route itself.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Look at the line <code>S 10.2.2.0/24 [1/0] via 10.0.12.2</code>. Source: static, typed by you. Destination: the branch LAN 10.2.2.0/24. AD 1, metric 0: the default values for a static route. Next hop: BR's address on the HQ-BR link. To find the exit interface, HQ looks up 10.0.12.2, which matches <code>C 10.0.12.0/30 ... GigabitEthernet0/1</code>, so the packet leaves Gi0/1. This two-step lookup is called <b>recursive lookup</b>.</p></div>

<h3>Useful ways to look at the table</h3>
<pre class="code"><span class="c">! whole table</span>
show ip route
<span class="c">! only one source</span>
show ip route static
show ip route ospf
show ip route connected
<span class="c">! which route would be used for one destination</span>
show ip route 10.2.2.10
<span class="c">! interface status and addresses (connected routes need up/up)</span>
show ip interface brief</pre>
<p>Asking for a single address is the fastest troubleshooting habit you can build. The router answers with the one route it would actually use:</p>
<pre class="out">HQ#show ip route 10.2.2.10
Routing entry for 10.2.2.0/24
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  <span class="hl">* 10.0.12.2</span>
      Route metric is 0, traffic share count is 1</pre>
<p>On other platforms the words differ but the ideas are identical. A Linux host shows <code>ip route</code> with "default via" and "proto static"; a Juniper router shows <code>show route</code> with preference values instead of AD. If you understand source, prefix, AD/metric and next hop, you can read all of them.</p>

<div class="warn"><p><b>Common mistake.</b> Expecting a connected route for an interface that is down. If a cable is unplugged or the interface is shut, its C and L routes disappear, and every static route whose next hop was on that subnet also disappears. When a route is "missing", check <code>show ip interface brief</code> first.</p></div>

<div class="exam"><p><b>Exam trap.</b> In [110/2], 110 is the administrative distance and 2 is the metric, never the other way round. Questions love to ask "what is the metric of this route?" and offer the AD as a distractor.</p></div>

<div class="scn"><h4>The route that was there yesterday</h4><p>A NOC engineer got a ticket: HQ could not reach the branch. <code>show ip route</code> on HQ had no S route for 10.2.2.0/24 at all, although the configuration still contained the <code>ip route</code> command. The engineer checked <code>show ip interface brief</code> and saw Gi0/1 "down/down" after a patch-panel move. With the interface down, the connected route to 10.0.12.0/30 vanished, the next hop 10.0.12.2 became unreachable, and IOS withdrew the static route. Re-patching the cable brought everything back without touching the config.</p><p><b>Lesson:</b> a static route is only installed while its next hop is reachable. Read the table, not just the config.</p></div>

<div class="iv"><p class="q">"Walk me through this routing table entry: O 192.168.2.0/24 [110/2] via 10.0.12.2, 00:00:41, GigabitEthernet0/0."</p><p>Strong answer: learned by OSPF, destination 192.168.2.0/24, administrative distance 110, OSPF cost 2, next hop 10.0.12.2, learned 41 seconds ago, leaving Gi0/0. Then add something extra: "If a static route for the same prefix existed it would win because AD 1 beats 110, and if a /25 inside that range existed, the /25 would be used for its addresses because longest prefix wins first."</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Every route line shows source code, prefix/length, [AD/metric], next hop and usually the exit interface.</li>
<li>C and L routes appear automatically for up/up interfaces; S is static; O, D, B, R are dynamic.</li>
<li>Gateway of last resort is the default route's next hop; "not set" means unknown destinations are dropped.</li>
<li><code>show ip route &lt;address&gt;</code> tells you exactly which route a destination will use.</li>
<li>A static route disappears when its next hop becomes unreachable.</li>
</ul></div>
`,hi:`
<p>Routing table pehli baar mein darawna lagta hai: letters ka legend, numbers se bhare brackets aur "variably subnetted" jaise ajeeb headings. Asal mein har line wahi chaar sawaal ka jawab deti hai: <b>yeh route kahan se aaya, kaunsa destination cover karta hai, kitna trustworthy aur kitna achha hai, aur packet kahan bhejun?</b> Jab aap yeh chaar jawab de paoge, to kisi bhi vendor ke kisi bhi router ki table padh paoge.</p>

<h3>Routes ke sources</h3>
<p>Router apni table (jise <b>RIB</b>, routing information base bhi kehte hain) teen tarah ke sources se bharta hai:</p>
<ul>
<li><b>Connected (C) aur local (L).</b> Jab interface par IP address ho aur woh up/up ho to apne aap bante hain. C poora subnet hai (10.1.1.0/24); L router ke apne address ka /32 hai (10.1.1.1/32), matlab "yeh packet mere liye hai".</li>
<li><b>Static (S).</b> Administrator <code>ip route</code> se type karta hai. <b>S*</b> ka matlab hai static route jo candidate default bhi hai.</li>
<li><b>Dynamic.</b> Routing protocol se seekhe gaye: OSPF ke liye <b>O</b>, EIGRP ke liye <b>D</b>, BGP ke liye <b>B</b>, RIP ke liye <b>R</b>.</li>
</ul>

<h3>Lab 1 ke baad HQ ki table</h3>
<p>Yeh Lab 1 ka HQ router hai jab aap branch route aur default route add kar chuke ho. Ise upar se dheere dheere padho.</p>
<pre class="out">HQ#show ip route
Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       (rest of legend trimmed)

<span class="hl">Gateway of last resort is 203.0.113.1 to network 0.0.0.0</span>

<span class="hl">S*    0.0.0.0/0 [1/0] via 203.0.113.1</span>
      10.0.0.0/8 is variably subnetted, 5 subnets, 3 masks
C        10.0.12.0/30 is directly connected, GigabitEthernet0/1
L        10.0.12.1/32 is directly connected, GigabitEthernet0/1
C        10.1.1.0/24 is directly connected, GigabitEthernet0/0
L        10.1.1.1/32 is directly connected, GigabitEthernet0/0
<span class="hl">S        10.2.2.0/24 [1/0] via 10.0.12.2</span>
      203.0.113.0/24 is variably subnetted, 2 subnets, 2 masks
C        203.0.113.0/30 is directly connected, GigabitEthernet0/2
L        203.0.113.2/32 is directly connected, GigabitEthernet0/2</pre>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Ek route line ki anatomy">
<rect x="10" y="20" width="620" height="44" rx="8" fill="#e2e8f0"/>
<text x="30" y="48" class="svg-ink" font-size="14">S</text>
<text x="80" y="48" class="svg-ink" font-size="14">10.2.2.0/24</text>
<text x="230" y="48" class="svg-ink" font-size="14">[1/0]</text>
<text x="330" y="48" class="svg-ink" font-size="14">via 10.0.12.2</text>
<text x="490" y="48" class="svg-ink" font-size="14">(Gi0/1)</text>
<line x1="34" y1="64" x2="34" y2="95" stroke="#64748b"/><text x="20" y="112" class="svg-accent" font-size="12">source</text>
<line x1="120" y1="64" x2="120" y2="95" stroke="#64748b"/><text x="92" y="112" class="svg-accent" font-size="12">prefix</text>
<line x1="245" y1="64" x2="245" y2="95" stroke="#64748b"/><text x="200" y="112" class="svg-accent" font-size="12">AD / metric</text>
<line x1="380" y1="64" x2="380" y2="95" stroke="#64748b"/><text x="345" y="112" class="svg-accent" font-size="12">next hop</text>
<line x1="520" y1="64" x2="520" y2="95" stroke="#64748b"/><text x="470" y="112" class="svg-accent" font-size="12">exit interface</text>
<text x="320" y="140" text-anchor="middle" class="svg-muted" font-size="12">Dynamic route apni age bhi dikhata hai, jaise 00:02:11</text>
</svg><p class="cap">Har route line batati hai: kisne bataya, kaunsa destination, kitna trusted aur kitna achha, aur kahan bhejna hai.</p></div>

<h3>Har hissa decode karna</h3>
<dl class="terms">
<dt>Code (S, C, L, O...)</dt><dd>Route ka source. Batata hai ki use insaan ne, interface ne ya protocol ne banaya.</dd>
<dt>Prefix aur length</dt><dd>Destination network, 10.2.2.0/24. /24 prefix length hai: shuru ke kitne bits match hone chahiye.</dd>
<dt>[AD/metric]</dt><dd>Brackets mein do numbers. Pehla <b>administrative distance</b> hai, router source par kitna bharosa karta hai (kam matlab zyada trusted). Doosra <b>metric</b> hai, us source ke andar yeh path kitna achha hai (kam matlab behtar). Static route [1/0] dikhata hai.</dd>
<dt>via next hop</dt><dd>Padosi router ka IP address jise packet dena hai. Yeh connected subnet par hona chahiye (ya kisi aur route se resolve hona chahiye).</dd>
<dt>Exit interface</dt><dd>Local interface jisse packet bahar jaata hai. Connected aur dynamic routes ise print karte hain; next-hop static routes ise next hop lookup karke dhoondhte hain.</dd>
<dt>Gateway of last resort</dt><dd>Default route 0.0.0.0/0 ka next hop, jab kuch aur specific match na ho tab use hota hai. "Not set" ka matlab hai unknown destinations ke packets drop hote hain.</dd>
<dt>"variably subnetted"</dt><dd>Sirf ek heading. IOS subnets ko unke classful network (10.0.0.0/8) ke neeche group karta hai aur batata hai ki usmein kitne subnets aur kitne alag masks hain. Yeh khud route nahi hai.</dd>
</dl>

<div class="eg"><p><b>Worked example.</b> Line <code>S 10.2.2.0/24 [1/0] via 10.0.12.2</code> dekho. Source: static, aapne type kiya. Destination: branch LAN 10.2.2.0/24. AD 1, metric 0: static route ki default values. Next hop: HQ-BR link par BR ka address. Exit interface dhoondhne ke liye HQ 10.0.12.2 lookup karta hai, jo <code>C 10.0.12.0/30 ... GigabitEthernet0/1</code> se match hota hai, isliye packet Gi0/1 se nikalta hai. Is do-step lookup ko <b>recursive lookup</b> kehte hain.</p></div>

<h3>Table dekhne ke kaam ke tareeke</h3>
<pre class="code"><span class="c">! poori table</span>
show ip route
<span class="c">! sirf ek source</span>
show ip route static
show ip route ospf
show ip route connected
<span class="c">! ek destination ke liye kaunsa route use hoga</span>
show ip route 10.2.2.10
<span class="c">! interface status aur addresses (connected routes ko up/up chahiye)</span>
show ip interface brief</pre>
<p>Ek single address poochna sabse tez troubleshooting habit hai jo aap bana sakte ho. Router wahi ek route batata hai jo woh asal mein use karega:</p>
<pre class="out">HQ#show ip route 10.2.2.10
Routing entry for 10.2.2.0/24
  Known via "static", distance 1, metric 0
  Routing Descriptor Blocks:
  <span class="hl">* 10.0.12.2</span>
      Route metric is 0, traffic share count is 1</pre>
<p>Doosre platforms par shabd alag hote hain lekin ideas bilkul same. Linux host <code>ip route</code> mein "default via" aur "proto static" dikhata hai; Juniper router <code>show route</code> mein AD ki jagah preference values dikhata hai. Agar aap source, prefix, AD/metric aur next hop samajhte ho, to sab padh sakte ho.</p>

<div class="warn"><p><b>Common galti.</b> Down interface ke liye connected route expect karna. Agar cable nikli hai ya interface shut hai, to uske C aur L routes gayab ho jaate hain, aur har woh static route bhi gayab ho jaata hai jiska next hop us subnet par tha. Jab route "missing" ho, pehle <code>show ip interface brief</code> check karo.</p></div>

<div class="exam"><p><b>Exam trap.</b> [110/2] mein 110 administrative distance hai aur 2 metric, kabhi ulta nahi. Questions ko "is route ka metric kya hai?" poochna aur AD ko distractor ki tarah dena bahut pasand hai.</p></div>

<div class="scn"><h4>Woh route jo kal tak tha</h4><p>Ek NOC engineer ko ticket mila: HQ branch tak nahi pahunch paa raha. HQ par <code>show ip route</code> mein 10.2.2.0/24 ka koi S route tha hi nahi, jabki configuration mein <code>ip route</code> command abhi bhi thi. Engineer ne <code>show ip interface brief</code> check kiya aur patch-panel move ke baad Gi0/1 "down/down" dekha. Interface down hone se 10.0.12.0/30 ka connected route gayab ho gaya, next hop 10.0.12.2 unreachable ho gaya, aur IOS ne static route withdraw kar diya. Cable dobara patch karte hi config chhue bina sab wapas aa gaya.</p><p><b>Seekh:</b> static route tabhi install rehta hai jab tak uska next hop reachable ho. Sirf config nahi, table padho.</p></div>

<div class="iv"><p class="q">"Is routing table entry ko samjhao: O 192.168.2.0/24 [110/2] via 10.0.12.2, 00:00:41, GigabitEthernet0/0."</p><p>Strong answer: OSPF se seekha, destination 192.168.2.0/24, administrative distance 110, OSPF cost 2, next hop 10.0.12.2, 41 second pehle seekha, Gi0/0 se bahar jaata hai. Phir kuch extra jodo: "Agar same prefix ka static route hota to woh jeetta kyunki AD 1, 110 ko beat karta hai, aur agar us range ke andar ek /25 hota, to uske addresses ke liye /25 use hota kyunki longest prefix pehle jeetta hai."</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har route line source code, prefix/length, [AD/metric], next hop aur aam taur par exit interface dikhati hai.</li>
<li>C aur L routes up/up interfaces ke liye apne aap aate hain; S static hai; O, D, B, R dynamic hain.</li>
<li>Gateway of last resort default route ka next hop hai; "not set" matlab unknown destinations drop hote hain.</li>
<li><code>show ip route &lt;address&gt;</code> exactly batata hai ki destination kaunsa route use karega.</li>
<li>Static route tab gayab ho jaata hai jab uska next hop unreachable ho jaata hai.</li>
</ul></div>
`}};export{e as default};